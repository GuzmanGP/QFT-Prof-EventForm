from typing import Optional, Dict, Any
from models import Event, EventType, EventConfiguration
from app import db
from datetime import datetime
import json

class EventHandler:
    @staticmethod
    def handle_event(event: Event) -> bool:
        """Handle an event based on its type"""
        if event.processed:
            return True

        try:
            handler_map = {
                EventType.EVENT_CREATED.value: EventHandler._handle_event_created,
                EventType.EVENT_UPDATED.value: EventHandler._handle_event_updated,
                EventType.EVENT_DELETED.value: EventHandler._handle_event_deleted,
            }

            handler = handler_map.get(event.type)
            if handler:
                handler(event)
                event.processed = True
                event.error = None
                db.session.commit()
                return True
            else:
                event.error = f"Unknown event type: {event.type}"
                db.session.commit()
                return False

        except Exception as e:
            event.error = str(e)
            event.processed = False
            db.session.commit()
            return False

    @staticmethod
    def _handle_event_created(event: Event):
        """Handle event creation"""
        event_data = event.data
        event_config = EventConfiguration(
            event_reference=event_data['event_reference'],
            event_type=event_data['event_type'],
            event_description=event_data.get('event_description'),
            event_metadata=event_data.get('event_metadata', {}),
            event_type_metadata=event_data.get('event_type_metadata', {})
        )
        db.session.add(event_config)

    @staticmethod
    def _handle_event_updated(event: Event):
        """Handle event update"""
        event_data = event.data
        event_config = EventConfiguration.query.get(event.event_config_id)
        if not event_config:
            raise ValueError(f"Event configuration not found with id {event.event_config_id}")

        event_config.event_reference = event_data['event_reference']
        event_config.event_type = event_data['event_type']
        event_config.event_description = event_data.get('event_description')
        event_config.event_metadata = event_data.get('event_metadata', {})
        event_config.event_type_metadata = event_data.get('event_type_metadata', {})
        event_config.last_update_date = datetime.utcnow()

    @staticmethod
    def _handle_event_deleted(event: Event):
        """Handle event deletion"""
        event_config = EventConfiguration.query.get(event.event_config_id)
        if event_config:
            db.session.delete(event_config)
