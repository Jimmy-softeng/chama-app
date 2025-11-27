# server/routes/User_auth_route.py
from flask_restful import Resource, reqparse
from flask import current_app
from flask_jwt_extended import create_access_token, decode_token
from flask_mail import Message
from server.models.User import User
from server.extensions import db, mail
from datetime import timedelta
from urllib.parse import quote, unquote

# -----------------------------
# Parsers
# -----------------------------
register_parser = reqparse.RequestParser()
register_parser.add_argument("firstname", required=True)
register_parser.add_argument("lastname", required=True)
register_parser.add_argument("email", required=True)
register_parser.add_argument("phoneno", required=True)
register_parser.add_argument("password", required=True)

login_parser = reqparse.RequestParser()
login_parser.add_argument("email", required=True)
login_parser.add_argument("password", required=True)

request_reset_parser = reqparse.RequestParser()
request_reset_parser.add_argument("email", required=True, help="Email is required")

reset_confirm_parser = reqparse.RequestParser()
reset_confirm_parser.add_argument("token", type=str, required=True)
reset_confirm_parser.add_argument("new_password", type=str, required=True)

# -----------------------------
# Helpers
# -----------------------------
def _frontend_base_url():
    """Frontend base URL used in email links."""
    return (current_app.config.get("FRONTEND_URL") or "http://localhost:3000").rstrip("/")

def _create_token_for_user(user, purpose: str, expires_delta):
    """
    Create a JWT for a given user and purpose. Use string identity to avoid
    library errors where 'sub' must be a string.
    """
    return create_access_token(
        identity=str(user.memberId),  # <- IMPORTANT: cast to string
        expires_delta=expires_delta,
        additional_claims={"purpose": purpose},
    )

def _extract_user_id_from_decoded(decoded):
    """
    Safely extract the user id from decoded token. The token's 'sub'
    should be a stringified memberId; convert to int.
    Returns int user_id or None on failure.
    """
    try:
        sub = decoded.get("sub")
        # Some versions/destinations place sub inside `identity` or top-level; try both
        if sub is None:
            sub = decoded.get("identity") or decoded.get("user_id") or decoded.get("sub")
        if sub is None:
            return None
        # ensure it's string then convert to int
        return int(sub)
    except Exception:
        return None

# -----------------------------
# Resources
# -----------------------------
class Register(Resource):
    """Register a new user and send email verification link."""

    def post(self):
        data = register_parser.parse_args()
        email = data["email"].strip().lower()

        if User.query.filter_by(email=email).first():
            return {"msg": "Email already registered"}, 400

        user = User(
            firstname=data["firstname"],
            lastname=data["lastname"],
            email=email,
            phoneno=data["phoneno"],
            role="member",  # default role
            email_verified=False,
        )
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()

        # Create a JWT for email verification (identity as string)
        verify_token = _create_token_for_user(user, purpose="email_verification", expires_delta=timedelta(hours=24))
        safe_token = quote(verify_token)
        verify_url = f"{_frontend_base_url()}/verify-email/{safe_token}"

        try:
            msg = Message(
                subject="Verify Your Email",
                sender=current_app.config.get("MAIL_DEFAULT_SENDER") or "no-reply@example.com",
                recipients=[email],
            )
            msg.body = f"Hi {user.firstname},\n\nPlease verify your email:\n{verify_url}\n\nThis link expires in 24 hours."
            mail.send(msg)
        except Exception as e:
            current_app.logger.exception("Failed to send verification email: %s", e)

        return {"msg": "User registered. Please check your email to verify."}, 201


class VerifyEmail(Resource):
    """Verify email using a JWT token."""

    def get(self, token):
        if not token:
            return {"msg": "No token provided"}, 400

        try:
            token = unquote(token)
            decoded = decode_token(token)
            current_app.logger.debug("VerifyEmail decoded token: %s", decoded)
            claims = decoded.get("claims") or decoded

            if claims.get("purpose") != "email_verification":
                return {"msg": "Invalid verification token"}, 400

            user_id = _extract_user_id_from_decoded(decoded)
            if user_id is None:
                current_app.logger.warning("VerifyEmail: could not extract user id from token: %s", decoded)
                return {"msg": "Invalid verification token"}, 400

            user = User.query.get(user_id)
            if not user:
                return {"msg": "User not found"}, 404

            user.email_verified = True
            db.session.commit()
            return {"msg": "Email verified successfully. You can now login."}, 200

        except Exception as e:
            current_app.logger.exception("Email verification failed: %s", e)
            return {"msg": "Invalid or expired verification link"}, 400


class Login(Resource):
    """Login endpoint."""

    def post(self):
        data = login_parser.parse_args()
        email = data["email"].strip().lower()
        password = data["password"]

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {"msg": "Invalid email or password"}, 401

        if not getattr(user, "email_verified", False):
            return {"msg": "Please verify your email before logging in."}, 403

        # Create access token also with string identity
        access_token = create_access_token(identity=str(user.memberId),
                                           additional_claims={"role": user.role})
        return {
            "msg": "Login successful",
            "access_token": access_token,
            "user": user.to_dict(),
        }, 200


class RequestPasswordReset(Resource):
    """Request a password reset link via email (JWT-based)."""

    def post(self):
        data = request_reset_parser.parse_args()
        email = data["email"].strip().lower()
        user = User.query.filter_by(email=email).first()

        # Always return 200 to prevent email enumeration
        if not user:
            return {"msg": "If that email exists, a reset link has been sent."}, 200

        reset_token = _create_token_for_user(user, purpose="password_reset", expires_delta=timedelta(minutes=15))
        safe_token = quote(reset_token)
        reset_url = f"{_frontend_base_url()}/reset-password/{safe_token}"

        try:
            msg = Message(
                subject="Password Reset Request",
                sender=current_app.config.get("MAIL_DEFAULT_SENDER") or "no-reply@example.com",
                recipients=[email],
            )
            msg.body = (
                f"Hi {user.firstname},\n\n"
                f"Reset your password using the link below (valid for 15 minutes):\n{reset_url}\n\n"
                f"If you didn't request this, you can safely ignore this email."
            )
            mail.send(msg)
        except Exception as e:
            current_app.logger.exception("Failed to send password reset email: %s", e)

        return {"msg": "If that email exists, a reset link has been sent."}, 200


class ResetPassword(Resource):
    """Reset password using a JWT token from email."""

    def post(self):
        data = reset_confirm_parser.parse_args()
        token = data["token"]
        new_password = data["new_password"]

        if not token or "." not in token:
            return {"msg": "Invalid or expired token"}, 400

        try:
            token = unquote(token)
            decoded = decode_token(token)
            current_app.logger.debug("ResetPassword decoded token: %s", decoded)
            claims = decoded.get("claims") or decoded

            if claims.get("purpose") != "password_reset":
                return {"msg": "Invalid token purpose"}, 400

            user_id = _extract_user_id_from_decoded(decoded)
            if user_id is None:
                current_app.logger.warning("ResetPassword: could not extract user id from token: %s", decoded)
                return {"msg": "Invalid or expired token"}, 400

            user = User.query.get(user_id)
            if not user:
                return {"msg": "Invalid or expired token"}, 400

            user.set_password(new_password)
            db.session.commit()
            return {"msg": "Password reset successful"}, 200

        except Exception as e:
            current_app.logger.exception("Password reset failed: %s", e)
            return {"msg": "Invalid or expired token"}, 400
