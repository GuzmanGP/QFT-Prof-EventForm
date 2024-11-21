from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB
from enum import Enum

class EventType(Enum):
    EVENT_CREATED = "event_created"
    EVENT_UPDATED = "event_updated"
    EVENT_DELETED = "event_deleted"

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    data = db.Column(JSONB, nullable=False)
    event_metadata = db.Column(JSONB, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed = db.Column(db.Boolean, default=False)
    error = db.Column(db.Text)
    
    event_config_id = db.Column(db.Integer, db.ForeignKey('event_configuration.id'))
    event_config = db.relationship('EventConfiguration', backref='events')

    def __init__(self, type=None, data=None, event_metadata=None, event_config_id=None):
        self.type = type
        self.data = data or {}
        self.event_metadata = event_metadata or {}
        self.event_config_id = event_config_id
        self.processed = False
        self.error = None

class EventConfiguration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_reference = db.Column(db.String(200), nullable=False)
    event_type = db.Column(db.String(100), nullable=False)
    event_description = db.Column(db.Text)
    event_metadata = db.Column(JSONB, default=dict)
    event_type_metadata = db.Column(JSONB, default=dict)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_update_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def create_event(self, event_type, data, event_metadata=None):
        event = Event(
            type=event_type.value,
            data=data,
            event_metadata=event_metadata or {},
            event_config_id=self.id
        )
        db.session.add(event)
        return event


