from typing import Optional, Dict, Any
from models import Event, EventType, FormConfiguration, Question
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
                EventType.FORM_CREATED.value: EventHandler._handle_form_created,
                EventType.FORM_UPDATED.value: EventHandler._handle_form_updated,
                EventType.FORM_DELETED.value: EventHandler._handle_form_deleted,
                EventType.QUESTION_ADDED.value: EventHandler._handle_question_added,
                EventType.QUESTION_UPDATED.value: EventHandler._handle_question_updated,
                EventType.QUESTION_DELETED.value: EventHandler._handle_question_deleted,
                EventType.FORM_SUBMITTED.value: EventHandler._handle_form_submitted,
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
    def _handle_form_created(event: Event):
        """Handle form creation event"""
        form_data = event.data
        form = FormConfiguration(
            title=form_data['title'],
            category=form_data['category'],
            subcategory=form_data.get('subcategory'),
            category_metadata=form_data.get('category_metadata', {}),
            subcategory_metadata=form_data.get('subcategory_metadata', {})
        )
        db.session.add(form)
        db.session.flush()  # Get form ID

        # Create questions if included in the event
        if 'questions' in form_data:
            for q_data in form_data['questions']:
                question = Question(
                    form_id=form.id,
                    reference=q_data['reference'],
                    content=q_data['content'],
                    answer_type=q_data['answer_type'],
                    options=q_data.get('options', []),
                    question_metadata=q_data.get('question_metadata', {}),
                    required=q_data.get('required', False),
                    order=q_data.get('order', 0),
                    ai_instructions=q_data.get('ai_instructions')
                )
                db.session.add(question)

    @staticmethod
    def _handle_form_updated(event: Event):
        """Handle form update event"""
        form_data = event.data
        form = FormConfiguration.query.get(event.form_id)
        if not form:
            raise ValueError(f"Form not found with id {event.form_id}")

        # Update form fields
        form.title = form_data['title']
        form.category = form_data['category']
        form.subcategory = form_data.get('subcategory')
        form.category_metadata = form_data.get('category_metadata', {})
        form.subcategory_metadata = form_data.get('subcategory_metadata', {})

    @staticmethod
    def _handle_form_deleted(event: Event):
        """Handle form deletion event"""
        form = FormConfiguration.query.get(event.form_id)
        if form:
            db.session.delete(form)

    @staticmethod
    def _handle_question_added(event: Event):
        """Handle question addition event"""
        q_data = event.data
        question = Question(
            form_id=event.form_id,
            reference=q_data['reference'],
            content=q_data['content'],
            answer_type=q_data['answer_type'],
            options=q_data.get('options', []),
            question_metadata=q_data.get('question_metadata', {}),
            required=q_data.get('required', False),
            order=q_data.get('order', 0),
            ai_instructions=q_data.get('ai_instructions')
        )
        db.session.add(question)

    @staticmethod
    def _handle_question_updated(event: Event):
        """Handle question update event"""
        q_data = event.data
        question = Question.query.get(q_data['id'])
        if not question:
            raise ValueError(f"Question not found with id {q_data['id']}")

        question.reference = q_data['reference']
        question.content = q_data['content']
        question.answer_type = q_data['answer_type']
        question.options = q_data.get('options', [])
        question.question_metadata = q_data.get('question_metadata', {})
        question.required = q_data.get('required', False)
        question.order = q_data.get('order', 0)
        question.ai_instructions = q_data.get('ai_instructions')

    @staticmethod
    def _handle_question_deleted(event: Event):
        """Handle question deletion event"""
        question = Question.query.get(event.data['id'])
        if question:
            db.session.delete(question)

    @staticmethod
    def _handle_form_submitted(event: Event):
        """Handle form submission event"""
        # This is a placeholder for form submission handling
        # Implement based on your requirements
        pass
