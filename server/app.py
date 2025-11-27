from flask import Flask
from server.extensions import db, jwt, migrate,cors
from server.config import Config
from flask_restful import Api
from server.extensions import mail
from server.routes.User_auth_route import Register,Login,VerifyEmail,RequestPasswordReset,ResetPassword
from server.routes.User_route import AssignRole,ListUsers,GetSingleUser,DeleteUser,Me,MemberProfile,AdminUsers
from server.routes.Loan_routes import ApplyLoan,MyLoans,AllLoans,UpdateLoan,DeleteLoan
from server.routes.Payments_route import MakePayment,ViewMyPayments,ViewAllPayments,DeletePayment
from server.routes.Shares_routes import MemberShares,AdminShares

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    cors.init_app(app)
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    
    # Set up API
    api = Api(app)
    #login and register
    api.add_resource(Register, "/auth/register")
    api.add_resource(Login, "/auth/login")
    api.add_resource(VerifyEmail, "/auth/verify-email/<string:token>")
    api.add_resource(RequestPasswordReset, "/auth/request-password-reset")
    api.add_resource(ResetPassword, "/auth/reset-password")
    api.add_resource(AssignRole, "/users/<int:user_id>/role")
    api.add_resource(ListUsers, "/users")
    api.add_resource(GetSingleUser, "/users/<int:user_id>")
    api.add_resource(DeleteUser, "/users/<int:user_id>/delete")
    api.add_resource(AdminUsers, "/admin/users")
    api.add_resource(MemberProfile, "/member/profile")
    api.add_resource(Me, "/me")

    # Loan routes
    api.add_resource(ApplyLoan, "/loans/apply")
    api.add_resource(MyLoans, "/loans/me")
    api.add_resource(AllLoans, "/loans")
    api.add_resource(UpdateLoan, "/loans/<int:loan_id>")
    api.add_resource(DeleteLoan, "/loans/<int:loan_id>")
    
    # Member
    api.add_resource(MakePayment, "/payments")
    api.add_resource(ViewMyPayments, "/payments/me")

    # Admin
    api.add_resource(ViewAllPayments, "/payments/all")
    api.add_resource(DeletePayment, "/payments/<int:payment_id>")
    #shares
    api.add_resource(MemberShares, "/shares")  # for logged-in member
    api.add_resource(AdminShares, "/admin/shares", "/admin/shares/<int:member_id>")
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)