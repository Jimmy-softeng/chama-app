# server/models/User.py
from server.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    memberId = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(25), nullable=False)
    lastname = db.Column(db.String(25), nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    phoneno = db.Column(db.String(10), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False, default="member")

    # Keep email_verified so we can mark verified users in DB
    email_verified = db.Column(db.Boolean, default=False)

    # relationships (unchanged)
    share = db.relationship('Shares', uselist=False, back_populates='user')
    payments = db.relationship('Payments', back_populates="user", lazy=True)
    loanapps = db.relationship('Loanapp', back_populates="user", lazy=True)

    # password helpers
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "memberId": self.memberId,
            "firstname": self.firstname,
            "lastname": self.lastname,
            "email": self.email,
            "phoneno": self.phoneno,
            "role": self.role,
            "email_verified": self.email_verified
        }
    
    def __repr__(self):
        return f"<User {self.firstname} {self.lastname} ({self.role})>"
