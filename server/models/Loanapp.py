from server.extensions import db

class Loanapp(db.Model):
    __tablename__='loanapps'

    memberId=db.Column(db.Integer,db.ForeignKey('users.memberId'),primary_key=True)
    amount=db.Column(db.Numeric(9,2), nullable=False)
    interest=db.Column(db.Numeric(4,2), nullable=False, default=0.08)
    year=db.Column(db.Integer, nullable=False)
    monthrepay=db.Column(db.Numeric(10,2), nullable=False)

    #relationship
    user=db.relationship('User',back_populates="loanapps")

    def to_dict(self):
        return{
            "memberId":self.memberId,
            "amount":float(self.amount),
            "interest":float(self.interest),
            "year":self.year,
            "monthrepay":float(self.monthrepay)
        }
    def __repr__(self):
        return f"<Loanapp amount={self.amount} interest={self.interest} monthly_repay={self.monthrepay}>"

