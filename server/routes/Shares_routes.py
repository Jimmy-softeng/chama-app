# server/routes/Shares_routes.py
from flask_restful import Resource, reqparse
from flask import request, current_app
from flask_jwt_extended import get_jwt_identity,jwt_required
from server.models.Shares import Shares
from server.models.User import User
from server.extensions import db
from server.routes.User_route import role_required  # ensure correct import path

# Parser for validating numeric fields
shares_parser = reqparse.RequestParser()
shares_parser.add_argument("shares", type=float, required=True, help="Shares amount is required")
shares_parser.add_argument("dividends", type=float, required=False, default=0.10)
shares_parser.add_argument("penalties", type=float, required=False, default=0.0)


def _validate_currency_value(value_name, value):
    """Helper to validate numeric input"""
    try:
        v = float(value)
    except (TypeError, ValueError):
        return False, f"{value_name} must be a number"
    if v < 0:
        return False, f"{value_name} must be >= 0"
    return True, None


# -------------------- MEMBER ROUTES --------------------
class MemberShares(Resource):
    """Members can view their own shares, dividends, and penalties"""
    @jwt_required()
    @role_required("member")
    def get(self):
        user_id = get_jwt_identity()
        shares = Shares.query.filter_by(memberId=user_id).first()

        if not shares:
            return {"msg": "No shares record found"}, 404

        return {"shares": shares.to_dict()}, 200


# -------------------- ADMIN ROUTES --------------------
class AdminShares(Resource):
    """Admins can create, view, update, and delete shares for any member"""
    @jwt_required()
    @role_required("admin")
    def get(self):
        """Get all shares or filter by memberId"""
        member_id = request.args.get("memberId")
        query = Shares.query
        if member_id:
            try:
                mid = int(member_id)
                query = query.filter_by(memberId=mid)
            except ValueError:
                return {"msg": "memberId must be an integer"}, 400

        shares = query.all()
        return {"shares": [s.to_dict() for s in shares]}, 200
    @jwt_required()
    @role_required("admin")
    def post(self):
        """Create a shares record for a selected member"""
        data = request.json
        member_id = data.get("memberId")
        shares_amount = data.get("shares")
        dividends = data.get("dividends", 0.10)
        penalties = data.get("penalties", 0.0)

        if not member_id:
            return {"msg": "memberId is required"}, 400

        # Validate values
        ok, err = _validate_currency_value("shares", shares_amount)
        if not ok:
            return {"msg": err}, 400
        ok, err = _validate_currency_value("dividends", dividends)
        if not ok:
            return {"msg": err}, 400
        ok, err = _validate_currency_value("penalties", penalties)
        if not ok:
            return {"msg": err}, 400

        # Ensure member exists
        member = User.query.filter_by(memberId=member_id).first()
        if not member:
            return {"msg": "Member not found"}, 404

        # Check if shares record already exists
        existing = Shares.query.filter_by(memberId=member_id).first()
        if existing:
            return {"msg": "Shares record already exists. Use PUT to update."}, 400

        shares = Shares(
            memberId=member_id,
            shares=shares_amount,
            dividends=dividends,
            penalties=penalties
        )
        db.session.add(shares)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Failed to create shares record: %s", e)
            return {"msg": "Failed to create shares record"}, 500

        return {"msg": "Shares record created", "shares": shares.to_dict()}, 201
    @jwt_required()
    @role_required("admin")
    def put(self, member_id):
        """Update shares for a specific member"""
        data = request.json
        shares_amount = data.get("shares")
        dividends = data.get("dividends", 0.10)
        penalties = data.get("penalties", 0.0)

        # Validate values
        ok, err = _validate_currency_value("shares", shares_amount)
        if not ok:
            return {"msg": err}, 400
        ok, err = _validate_currency_value("dividends", dividends)
        if not ok:
            return {"msg": err}, 400
        ok, err = _validate_currency_value("penalties", penalties)
        if not ok:
            return {"msg": err}, 400

        shares = Shares.query.filter_by(memberId=member_id).first()
        if not shares:
            return {"msg": "Shares record not found"}, 404

        shares.shares = shares_amount
        shares.dividends = dividends
        shares.penalties = penalties

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Failed to update shares (admin): %s", e)
            return {"msg": "Failed to update shares"}, 500

        return {"msg": "Shares updated", "shares": shares.to_dict()}, 200
    @jwt_required()
    @role_required("admin")
    def delete(self, member_id):
        """Delete shares for a specific member"""
        shares = Shares.query.filter_by(memberId=member_id).first()
        if not shares:
            return {"msg": "Shares record not found"}, 404

        try:
            db.session.delete(shares)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Failed to delete shares (admin): %s", e)
            return {"msg": "Failed to delete shares"}, 500

        return {"msg": "Shares record deleted"}, 200
