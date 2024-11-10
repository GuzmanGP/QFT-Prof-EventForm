from flask import render_template, request, jsonify, flash
from app import app, db
from models import FormConfiguration, Question
from sheets_sync import sync_form_to_sheet
import time

def retry_database_operation(operation, max_retries=3, delay=1):
    for attempt in range(max_retries):
        try:
            return operation()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(delay * (2 ** attempt))

def validate_form_data(data):
    errors = []
    
    # Validate required fields
    if not data.get('title'):
        errors.append('Form title is required')
    elif len(data['title']) > 200:
        errors.append('Form title must be less than 200 characters')

    if not data.get('category'):
        errors.append('Category is required')
    elif len(data['category']) > 100:
        errors.append('Category must be less than 100 characters')
        
    # Validate questions
    questions = data.get('questions', [])
    if not questions:
        errors.append('At least one question is required')
    
    for i, question in enumerate(questions, 1):
        if not question.get('reference'):
            errors.append(f'Question {i}: Reference is required')
        elif len(question['reference']) > 50:
            errors.append(f'Question {i}: Reference must be less than 50 characters')
            
        if not question.get('content'):
            errors.append(f'Question {i}: Content is required')
            
    # Validate metadata
    for meta_type in ['category_metadata', 'subcategory_metadata']:
        metadata = data.get(meta_type, {})
        if len(metadata) > 20:
            errors.append(f'{meta_type.replace("_", " ").title()} cannot have more than 20 items')
    
    if errors:
        raise ValueError('\n'.join(errors))

@app.route('/')
def index():
    return render_template('form.html')

@app.route('/api/forms', methods=['POST'])
def create_form():
    try:
        data = request.get_json()
        
        # Validate form data
        try:
            validate_form_data(data)
        except ValueError as e:
            return jsonify({'success': False, 'error': str(e)}), 400
        
        form = FormConfiguration(
            title=data['title'],
            category=data['category'],
            subcategory=data.get('subcategory'),
            category_metadata=data.get('category_metadata', {}),
            subcategory_metadata=data.get('subcategory_metadata', {})
        )
        
        for q_data in data.get('questions', []):
            question = Question(
                reference=q_data['reference'],
                content=q_data['content'],
                answer_type=q_data.get('answer_type', 'text'),
                options=q_data.get('options', []),
                question_metadata=q_data.get('question_metadata', {}),
                required=q_data.get('required', False),
                order=q_data.get('order'),
                ai_instructions=q_data.get('ai_instructions')
            )
            form.questions.append(question)
        
        def save_form():
            db.session.add(form)
            db.session.commit()
            
            # Sync to Google Sheets
            sync_success = sync_form_to_sheet(form)
            return sync_success
        
        sync_success = retry_database_operation(save_form)
        return jsonify({
            'success': True, 
            'id': form.id,
            'sheets_sync': sync_success
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.errorhandler(404)
def not_found_error(error):
    return render_template('error.html', error="Page not found"), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('error.html', error="Internal server error"), 500
