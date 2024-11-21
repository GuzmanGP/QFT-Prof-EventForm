from flask import render_template, request, jsonify, flash, redirect, url_for, json
from app import app, db
from models import FormConfiguration, Question


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

        # Extract basic form fields
        title = form_data.get('title')
        category = form_data.get('category')
        subcategory = form_data.get('subcategory')

        # Parse JSON data from hidden inputs
        category_metadata = json.loads(form_data.get('category_metadata', '{}'))
        subcategory_metadata = json.loads(form_data.get('subcategory_metadata', '{}'))
        questions_data = json.loads(form_data.get('questions', '[]'))

        # Create or update form configuration
        form = FormConfiguration()
        form.title = title
        form.category = category
        form.subcategory = subcategory
        form.category_metadata = category_metadata
        form.subcategory_metadata = subcategory_metadata

        db.session.add(form)
        db.session.flush()  # Get form ID

        # Process questions
        for q_data in questions_data:
            # Create an instance of Question without arguments
            question = Question()

            # Set attributes manually
            question.form_id = form.id
            question.reference = q_data['reference']
            question.content = q_data['content']
            question.answer_type = q_data['answer_type']
            question.options = q_data.get('options', [])
            question.question_metadata = q_data.get('question_metadata', {})
            question.required = q_data.get('required', False)
            question.order = q_data.get('order', 0)
            question.ai_instructions = q_data.get('ai_instructions')
            db.session.add(question)

        db.session.commit()
        flash('Form saved successfully', 'success')
        return redirect(url_for('new_form_index'))

    except Exception as e:
        db.session.rollback()
        flash(f'Error saving form: {str(e)}', 'danger')
        return redirect(url_for('new_form_index'))



@app.route('/api/form-load-history', methods=['POST'])
def record_form_load():
    try:
        data = request.get_json()
        if not data or 'formId' not in data:
            return jsonify({'error': 'Invalid request data'}), 400
            
        history = FormLoadHistory(
            form_id=data['formId'],
            success=data['success'],
            error_message=data.get('errorMessage')
        )
        
        db.session.add(history)
        db.session.commit()
        return jsonify({'status': 'success'}), 200
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
