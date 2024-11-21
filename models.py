from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB

class FormConfiguration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    subcategory = db.Column(db.String(100))
    category_metadata = db.Column(JSONB, default=dict)
    subcategory_metadata = db.Column(JSONB, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    questions = db.relationship('Question', backref='form', cascade='all, delete-orphan')
    load_history = db.relationship('FormLoadHistory', backref='form', lazy='dynamic')

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.Integer, db.ForeignKey('form_configuration.id'), nullable=False)
    reference = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    answer_type = db.Column(db.String(20), nullable=False)
    options = db.Column(JSONB, default=list)
    question_metadata = db.Column(JSONB, default=dict)
    required = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer)
    ai_instructions = db.Column(db.Text)

class FormLoadHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.Integer, db.ForeignKey('form_configuration.id'), nullable=False)
    loaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))  # IPv6 addresses can be up to 45 characters
    user_agent = db.Column(db.String(255))
    success = db.Column(db.Boolean, default=True)
    error_message = db.Column(db.Text)
