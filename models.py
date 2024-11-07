from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import JSON

# Use JSON instead of JSONB for SQLite compatibility
class FormConfiguration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False)
    subcategory = db.Column(db.String(100))
    category_metadata = db.Column(JSON, default=dict)
    subcategory_metadata = db.Column(JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    questions = db.relationship('Question', backref='form', cascade='all, delete-orphan')

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.Integer, db.ForeignKey('form_configuration.id'), nullable=False)
    reference = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    answer_type = db.Column(db.String(20), nullable=False)
    options = db.Column(JSON, default=list)
    question_metadata = db.Column(JSON, default=dict)
    required = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer)
    ai_instructions = db.Column(db.Text)
