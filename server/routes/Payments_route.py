# server/routes/Payments_route.py
from flask_restful import Resource, reqparse
from flask import current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from server.extensions import db
from server.models.Payments import Payments
from server.models.User import User
from server.routes.User_route import role_required
from decimal import Decimal


# ----------------- Parsers -----------------
payment_parser = reqparse.RequestParser()
payment_parser.add_argument("payname", type=str, required=True, help="Payment name is required")
payment_parser.add_argument("amount", type=float, required=True, help="Amount is required")
payment_parser.add_argument("method", type=str, required=True, help="Payment method is required")
payment_parser.add_argument("receipt", type=str, required=True, help="Receipt number is required")
payment_parser.add_argument("memberId", type=int, required=False, help="Member ID (admin only)")

# ----------------- Helpers -----------------
def _validate_amount(val):
    try:
        v = float(val)
    except (TypeError, ValueError):
        return False, "Amount must be a number"
    if v <= 0:
        return False, "Amount must be greater than zero"
    return True, None

# ----------------- Member Routes -----------------
class MakePayment(Resource):
    """Member makes a payment"""
    @jwt_required()
    @role_required("member")
    def post(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return {"msg": "User not found"}, 404

        data = payment_parser.parse_args()
        member_id = user.memberId  # Member cannot specify another memberId

        # Validate amount
        ok, err = _validate_amount(data["amount"])
        if not ok:
            return {"msg": err}, 400

        # Check duplicate receipt
        if Payments.query.filter_by(receipt=data["receipt"]).first():
            return {"msg": "Receipt already exists"}, 400

        payment = Payments(
            memberId=member_id,
            payname=data["payname"],
            amount=data["amount"],
            method=data["method"],
            receipt=data["receipt"]
        )
        db.session.add(payment)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Failed to record payment: %s", e)
            return {"msg": "Failed to record payment"}, 500

        return {"msg": "Payment successful", "payment": payment.to_dict()}, 201


class ViewMyPayments(Resource):
    """Member views their own payments"""
    @jwt_required()
    @role_required("member")
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return {"msg": "User not found"}, 404

        payments = Payments.query.filter_by(memberId=user.memberId).all()
        return {"payments": [p.to_dict() for p in payments]}, 200

# ----------------- Admin Routes -----------------
class ViewAllPayments(Resource):
    @jwt_required()
    @role_required("admin")
    def get(self):
        """Admin views all payments"""

        payments = (
            db.session.query(
                Payments.paymentId,
                Payments.memberId,
                Payments.payname,
                Payments.amount,
                Payments.method,
                Payments.receipt,
                User.firstname
            )
            .join(User, User.memberId == Payments.memberId)
            .order_by(Payments.paymentId.desc())
            .all()
        )

        result = []
        for p in payments:
            amount = float(p.amount) if isinstance(p.amount, Decimal) else p.amount

            result.append({
                "paymentId": p.paymentId,
                "memberId": p.memberId,
                "firstname": p.firstname,
                "payname": p.payname,
                "amount": amount,
                "method": p.method,
                "receipt": p.receipt,
            })

        return {"payments": result}, 200
    
class DeletePayment(Resource):
    """Admin deletes a payment"""
    @jwt_required()
    @role_required("admin")
    def delete(self, payment_id):
        payment = Payments.query.get(payment_id)
        if not payment:
            return {"msg": "Payment not found"}, 404

        payment_data = payment.to_dict()
        try:
            db.session.delete(payment)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Failed to delete payment: %s", e)
            return {"msg": "Failed to delete payment"}, 500

        return {"msg": "Payment deleted", "payment": payment_data}, 200
