from server.extensions import db

class Shares(db.Model):
    __tablename__='shares'

    memberId=db.Column(db.Integer,db.ForeignKey('users.memberId'), primary_key=True)
    shares=db.Column(db.Numeric(9,2), nullable=False)
    dividends=db.Column(db.Numeric(9,2), nullable=False,default=0.10)
    penalties = db.Column(db.Numeric(9, 2), nullable=False, default=0)

    #relationship
    user=db.relationship('User',back_populates='share')
    
    def to_dict(self):
        return{
            "memberId":self.memberId,
            "shares":float(self.shares),
            "dividends":float(self.dividends),
            "penalties": float(self.penalties)
        }
    def __repr__(self):
        return f"<Shares memberId={self.memberId} shares={self.shares} dividends={self.dividends} penalties={self.penalties}>"



