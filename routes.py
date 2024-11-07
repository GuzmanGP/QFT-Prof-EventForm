from flask import render_template, request, jsonify, flash
from app import app, db
from models import FormConfiguration, Question
import time

def retry_database_operation(operation, max_retries=3, delay=1):
    for attempt in range(max_retries):
        try:
            return operation()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(delay * (2 ** attempt))

@app.route('/')
def index():
    return render_template('form.html')

@app.route('/api/forms', methods=['POST'])
def create_form():
    try:
        data = request.get_json()
        
        form = FormConfiguration(
            title=data.get('title', 'Untitled Form'),
            category=data['category'],
            subcategory=data.get('subcategory'),
            category_metadata=data.get('category_metadata', {}),
            subcategory_metadata=data.get('subcategory_metadata', {})
        )
        
        for q_data in data.get('questions', []):
            question = Question(
                reference=q_data['reference'],
                content=q_data['content'],
                answer_type=q_data['answer_type'],
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
        
        retry_database_operation(save_form)
        return jsonify({'success': True, 'id': form.id})
    
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
