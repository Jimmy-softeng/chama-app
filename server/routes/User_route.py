from flask_restful import Resource, reqparse
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from functools import wraps
from server.models.User import User
from server.extensions import db

# Roles in this system
ALLOWED_ROLES = {"member", "admin"}

def role_required(*roles):
    """Decorator to restrict access to certain roles."""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                return {"msg": "User not found or token invalid"}, 401
            if user.role not in roles:
                return {"msg": f"Access denied for role '{user.role}'"}, 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper


# Parser for assigning new roles
role_parser = reqparse.RequestParser()
role_parser.add_argument("role", required=True)


class AssignRole(Resource):
    @jwt_required()
    @role_required("admin")
    def put(self, user_id):
        data = role_parser.parse_args()
        new_role = data["role"]

        if new_role not in ALLOWED_ROLES:
            return {"msg": "Invalid role"}, 400

        user = User.query.get(user_id)
        if not user:
            return {"msg": "User not found"}, 404

        user.role = new_role
        db.session.commit()
        return {
            "msg": f"{user.firstname} {user.lastname}'s role changed to {new_role}",
            "user": user.to_dict()
        }, 200


class ListUsers(Resource):
    @jwt_required()
    @role_required("admin")
    def get(self):
        role = request.args.get("role")
        query = User.query
        if role:
            query = query.filter_by(role=role)
        users = query.all()
        return {"users": [user.to_dict() for user in users]}, 200


class GetSingleUser(Resource):
    @jwt_required()
    @role_required("admin")
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"msg": "User not found"}, 404
        return {"user": user.to_dict()}, 200


class DeleteUser(Resource):
    @jwt_required()
    @role_required("admin")
    def delete(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"msg": "User not found"}, 404

        user_data = user.to_dict()
        db.session.delete(user)
        db.session.commit()
        return {"msg": "User deleted", "user": user_data}, 200


class Me(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return {"msg": "User not found"}, 404

        return {"user": user.to_dict()}, 200
class MemberProfile(Resource):
    @jwt_required()
    @role_required("member")
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return {"msg": "User not found"}, 404

        return {
            "memberId": user.memberId,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "email": user.email,
            "phoneno": user.phoneno,
            "role": user.role
        }, 200
    
class AdminUsers(Resource):
    @jwt_required()
    @role_required("admin")
    def get(self):
        """Return all users with role 'member'"""
        members = User.query.filter_by(role="member").all()

        # Compute fullName dynamically
        members_list = [
            {
                "memberId": m.memberId,
                "fullName": f"{m.firstname or ''} {m.lastname or ''}".strip(),
                "email": m.email,
            }
            for m in members
        ]
        return {"members": members_list}, 200