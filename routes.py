from flask import render_template, request, jsonify, flash, redirect, url_for, json
from app import app, db
from models import FormConfiguration, Question, Event, EventType
from event_handler import EventHandler


@app.route('/')
def new_form_index():
    return render_template('form.html')


@app.route('/<int:form_id>')
def load_form_index(form_id=None):
    form_data = None
    if form_id:
        try:
            # Get form with 404 handling
            form = FormConfiguration.query.get_or_404(form_id)
            
            # Create form_data dictionary with all fields including questions
            form_data = {
                'id': form.id,
                'title': form.title,
                'category': form.category,
                'subcategory': form.subcategory,
                'category_metadata': form.category_metadata,
                'subcategory_metadata': form.subcategory_metadata,
                'questions': [{
                    'id': q.id,
                    'reference': q.reference,
                    'content': q.content,
                    'answer_type': q.answer_type,
                    'options': q.options,
                    'question_metadata': q.question_metadata,
                    'required': q.required,
                    'order': q.order,
                    'ai_instructions': q.ai_instructions
                } for q in sorted(form.questions, key=lambda x: x.order or 0)]
            }
        except Exception as e:
            raise
    
    # Only pass form_data to template
    return render_template('form.html', form_data=form_data)


@app.route('/api/form/<int:form_id>')
def get_form(form_id):
    try:
        form = FormConfiguration.query.get_or_404(form_id)
        form_data = {
            'id': form.id,
            'title': form.title,
            'category': form.category,
            'subcategory': form.subcategory,
            'category_metadata': form.category_metadata,
            'subcategory_metadata': form.subcategory_metadata,
            'questions': [{
                'id': q.id,
                'reference': q.reference,
                'content': q.content,
                'answer_type': q.answer_type,
                'options': q.options,
                'question_metadata': q.question_metadata,
                'required': q.required,
                'order': q.order,
                'ai_instructions': q.ai_instructions
            } for q in sorted(form.questions, key=lambda x: x.order or 0)]
        }
        return jsonify(form_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/form/save', methods=['POST'])
def save_form():
    try:
        # Get form data
        form_data = request.form

        # Extract and parse form data
        form_dict = {
            'title': form_data.get('title'),
            'category': form_data.get('category'),
            'subcategory': form_data.get('subcategory'),
            'category_metadata': json.loads(form_data.get('category_metadata', '{}')),
            'subcategory_metadata': json.loads(form_data.get('subcategory_metadata', '{}')),
            'questions': json.loads(form_data.get('questions', '[]'))
        }

        # Create form configuration
        form = FormConfiguration()
        db.session.add(form)
        db.session.flush()  # Get form ID

        # Create form creation event
        event = Event(
            type=EventType.FORM_CREATED.value,
            data=form_dict,
            form_id=form.id
        )
        db.session.add(event)
        db.session.commit()

        # Process the event
        success = EventHandler.handle_event(event)
        if success:
            db.session.commit()
            flash('Form saved successfully', 'success')
        else:
            db.session.rollback()
            flash(f'Error saving form: {event.error}', 'danger')

        return redirect(url_for('new_form_index'))

    except Exception as e:
        db.session.rollback()
        flash(f'Error saving form: {str(e)}', 'danger')
        return redirect(url_for('new_form_index'))


@app.route('/form/<int:form_id>/update', methods=['POST'])
def update_form(form_id):
    try:
        form = FormConfiguration.query.get_or_404(form_id)
        form_data = request.get_json()

        # Create form update event
        event = form.create_event(
            EventType.FORM_UPDATED,
            data=form_data
        )
        db.session.commit()

        # Process the event
        success = EventHandler.handle_event(event)
        if success:
            db.session.commit()
            return jsonify({'message': 'Form updated successfully'})
        else:
            db.session.rollback()
            return jsonify({'error': event.error}), 500

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/form/<int:form_id>/delete', methods=['POST'])
def delete_form(form_id):
    try:
        form = FormConfiguration.query.get_or_404(form_id)
        
        # Create form deletion event
        event = form.create_event(
            EventType.FORM_DELETED,
            data={'form_id': form_id}
        )
        db.session.commit()

        # Process the event
        success = EventHandler.handle_event(event)
        if success:
            db.session.commit()
            return jsonify({'message': 'Form deleted successfully'})
        else:
            db.session.rollback()
            return jsonify({'error': event.error}), 500

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



@app.errorhandler(404)
def not_found_error(error):
    return render_template('error.html', error="Page not found"), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('error.html', error="Internal server error"), 500
