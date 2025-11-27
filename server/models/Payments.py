from server.extensions import db

class Payments(db.Model):
    __tablename__='payments'
    paymentId=db.Column(db.Integer, primary_key=True)
    memberId=db.Column(db.Integer,db.ForeignKey('users.memberId'), nullable=False)
    payname=db.Column(db.String(30), nullable=False)
    amount=db.Column(db.Numeric(9,2), nullable=False)
    method=db.Column(db.String(10),nullable=False)
    receipt=db.Column(db.String(18), unique=True, nullable=False)
    
    #relationships
    user=db.relationship('User',back_populates="payments")
    
    def to_dict(self):
        return{
        "paymentId":self.paymentId,
        "memberId":self.memberId,
        "payname":self.payname,
        "amount":float(self.amount),
        "method":self.method,
        "receipt":self.receipt
        }
    
    def __repr__(self):
        return f"<Payments paymentId={self.paymentId} memberId={self.memberId}payname={self.payname} amount={self.amount} method={self.method} receipt={self.receipt}>"
