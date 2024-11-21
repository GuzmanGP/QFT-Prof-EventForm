from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB
from enum import Enum

class EventType(Enum):
    FORM_CREATED = "form_created"
    FORM_UPDATED = "form_updated"
    FORM_DELETED = "form_deleted"
    QUESTION_ADDED = "question_added"
    QUESTION_UPDATED = "question_updated"
    QUESTION_DELETED = "question_deleted"
    FORM_SUBMITTED = "form_submitted"

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    data = db.Column(JSONB, nullable=False)
    event_metadata = db.Column(JSONB, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed = db.Column(db.Boolean, default=False)
    error = db.Column(db.Text)
    
    form_id = db.Column(db.Integer, db.ForeignKey('form_configuration.id'))
    form = db.relationship('FormConfiguration', backref='events')

    def __init__(self, type=None, data=None, event_metadata=None, form_id=None):
        self.type = type
        self.data = data or {}
        self.event_metadata = event_metadata or {}
        self.form_id = form_id
        self.processed = False
        self.error = None

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

    def create_event(self, event_type, data, event_metadata=None):
        event = Event(
            type=event_type.value,
            data=data,
            event_metadata=event_metadata or {},
            form_id=self.id
        )
        db.session.add(event)
        return event

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


