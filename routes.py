from flask import render_template, request, jsonify, flash, redirect, url_for, json
from app import app, db
from models import EventConfiguration, Event, EventType
from event_handler import EventHandler


@app.route('/')
def new_event_index():
    return render_template('form.html')


@app.route('/<int:event_id>')
def load_event_index(event_id=None):
    event_data = None
    if event_id:
        try:
            # Get event with 404 handling
            event_config = EventConfiguration.query.get_or_404(event_id)
            
            # Create event_data dictionary with all fields
            event_data = {
                'id': event_config.id,
                'event_reference': event_config.event_reference,
                'event_type': event_config.event_type,
                'event_description': event_config.event_description,
                'event_metadata': event_config.event_metadata,
                'event_type_metadata': event_config.event_type_metadata,
                'event_dates': event_config.event_dates.get('dates', []),
            'validity_start_date': event_config.validity_start_date.isoformat() if event_config.validity_start_date else None,
            'validity_end_date': event_config.validity_end_date.isoformat() if event_config.validity_end_date else None,
                'registration_date': event_config.registration_date.isoformat(),
                'last_update_date': event_config.last_update_date.isoformat()
            }
        except Exception as e:
            raise
    
    # Only pass event_data to template
    return render_template('form.html', event_data=event_data)


@app.route('/api/event/<int:event_id>')
def get_event(event_id):
    try:
        event_config = EventConfiguration.query.get_or_404(event_id)
        event_data = {
            'id': event_config.id,
            'event_reference': event_config.event_reference,
            'event_type': event_config.event_type,
            'event_description': event_config.event_description,
            'event_metadata': event_config.event_metadata,
            'event_type_metadata': event_config.event_type_metadata,
            'registration_date': event_config.registration_date.isoformat(),
            'last_update_date': event_config.last_update_date.isoformat()
        }
        return jsonify(event_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/event/save', methods=['POST'])
def save_event():
    try:
        # Get event data
        event_data = request.form

        # Extract and parse event data
        event_dict = {
            'event_reference': event_data.get('event_reference'),
            'event_type': event_data.get('event_type'),
            'event_description': event_data.get('event_description'),
            'event_metadata': json.loads(event_data.get('event_metadata', '{}')),
            'event_type_metadata': json.loads(event_data.get('event_type_metadata', '{}')),
            'event_dates': json.loads(event_data.get('event_dates', '{"dates": []}')),
            'validity_start_date': datetime.fromisoformat(event_data.get('validity_start_date')) if event_data.get('validity_start_date') else None,
            'validity_end_date': datetime.fromisoformat(event_data.get('validity_end_date')) if event_data.get('validity_end_date') else None
        }

        # Create event configuration
        event_config = EventConfiguration(
            event_reference=event_dict['event_reference'],
            event_type=event_dict['event_type'],
            event_description=event_dict['event_description'],
            event_metadata=event_dict['event_metadata'],
            event_type_metadata=event_dict['event_type_metadata']
        )
        db.session.add(event_config)
        db.session.flush()  # Get event ID

        # Create event creation event
        event = Event(
            type=EventType.EVENT_CREATED.value,
            data=event_dict,
            event_config_id=event_config.id
        )
        db.session.add(event)
        db.session.commit()

        flash('Event saved successfully', 'success')
        return redirect(url_for('new_event_index'))

    except Exception as e:
        db.session.rollback()
        flash(f'Error saving event: {str(e)}', 'danger')
        return redirect(url_for('new_event_index'))


@app.route('/event/<int:event_id>/update', methods=['POST'])
def update_event(event_id):
    try:
        event_config = EventConfiguration.query.get_or_404(event_id)
        event_data = request.get_json()

        # Create event update event
        event = event_config.create_event(
            EventType.EVENT_UPDATED,
            data=event_data
        )
        db.session.commit()

        return jsonify({'message': 'Event updated successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/event/<int:event_id>/delete', methods=['POST'])
def delete_event(event_id):
    try:
        event_config = EventConfiguration.query.get_or_404(event_id)
        
        # Create event deletion event
        event = event_config.create_event(
            EventType.EVENT_DELETED,
            data={'event_id': event_id}
        )
        db.session.commit()

        # Delete the event configuration
        db.session.delete(event_config)
        db.session.commit()

        return jsonify({'message': 'Event deleted successfully'})

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
