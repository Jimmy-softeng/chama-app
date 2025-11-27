# server/routes/Loan_routes.py
from flask_restful import Resource, reqparse
from flask import request, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required
from server.extensions import db
from server.models.Loanapp import Loanapp
from server.models.User import User
from server.routes.User_route import role_required  # ensure import path/casing matches your project

# Loan input parser
loan_parser = reqparse.RequestParser()
loan_parser.add_argument("amount", type=float, required=True, help="Loan amount is required")
loan_parser.add_argument("interest", type=float, required=False, default=0.08)
loan_parser.add_argument("year", type=int, required=True, help="Loan year is required")
loan_parser.add_argument("monthrepay", type=float, required=True, help="Monthly repayment is required")


class ApplyLoan(Resource):
    @jwt_required()  # ensure user is authenticated
    @role_required("member")   # role_required verifies JWT and role
    def post(self):
        data = loan_parser.parse_args()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return {"msg": "User not found"}, 404

        # Basic validation
        amount = data["amount"]
        interest = data.get("interest", 0.08)
        year = data["year"]
        monthrepay = data["monthrepay"]

        if amount <= 0:
            return {"msg": "Amount must be greater than 0"}, 400
        if not (0 <= interest <= 5):  # adjust upper bound to your business rules
            return {"msg": "Interest value out of range"}, 400
        if year <= 0 or year > 50:
            return {"msg": "Year value out of range"}, 400
        if monthrepay <= 0:
            return {"msg": "Monthly repayment must be > 0"}, 400

        loan = Loanapp(
            memberId=user.memberId,
            amount=amount,
            interest=interest,
            year=year,
            monthrepay=monthrepay
        )

        db.session.add(loan)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Failed to commit loan: %s", e)
            return {"msg": "Failed to submit loan application"}, 500

        return {"msg": "Loan application submitted", "loan": loan.to_dict()}, 201


class MyLoans(Resource):
    @jwt_required()  # ensure user is authenticated
    @role_required("member")
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return {"msg": "User not found"}, 404

        loans = Loanapp.query.filter_by(memberId=user.memberId).all()
        return {"loans": [loan.to_dict() for loan in loans]}, 200


class AllLoans(Resource):
    @jwt_required()
    @role_required("admin")
    def get(self):
        """Admin views all loans with optional pagination"""
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 25))
        except ValueError:
            return {"msg": "Invalid pagination values"}, 400

        paged = Loanapp.query.paginate(page=page, per_page=per_page, error_out=False)

        # include member first name
        loans = []
        for loan in paged.items:
            loans.append({
                "memberId": loan.memberId,
                "firstname": loan.user.firstname if loan.user else "",
                "amount": float(loan.amount),
                "interest": float(loan.interest),
                "year": loan.year,
                "monthrepay": float(loan.monthrepay)
            })

        return {
            "loans": loans,
            "page": page,
            "per_page": per_page,
            "total": paged.total,
            "pages": paged.pages
        }, 200

class UpdateLoan(Resource):
    @jwt_required()  # ensure user is authenticated
    @role_required("admin")
    def put(self, loan_id):
        loan = Loanapp.query.get(loan_id)
        if not loan:
            return {"msg": "Loan not found"}, 404

        data = loan_parser.parse_args()

        # validate
        if data["amount"] <= 0:
            return {"msg": "Amount must be greater than 0"}, 400
        if not (0 <= data.get("interest", 0.08) <= 5):
            return {"msg": "Interest value out of range"}, 400
        if data["year"] <= 0 or data["year"] > 50:
            return {"msg": "Year value out of range"}, 400
        if data["monthrepay"] <= 0:
            return {"msg": "Monthly repayment must be > 0"}, 400

        loan.amount = data["amount"]
        loan.interest = data["interest"]
        loan.year = data["year"]
        loan.monthrepay = data["monthrepay"]

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Failed to update loan: %s", e)
            return {"msg": "Failed to update loan"}, 500

        return {"msg": "Loan updated", "loan": loan.to_dict()}, 200


class DeleteLoan(Resource):
    @jwt_required()  # ensure user is authenticated
    @role_required("admin")
    def delete(self, loan_id):
        loan = Loanapp.query.get(loan_id)
        if not loan:
            return {"msg": "Loan not found"}, 404

        try:
            db.session.delete(loan)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.exception("Failed to delete loan: %s", e)
            return {"msg": "Failed to delete loan"}, 500

        return {"msg": "Loan deleted"}, 200
