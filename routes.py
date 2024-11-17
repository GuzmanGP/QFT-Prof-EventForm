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
    
    return render_template('form.html', form_data=form_data)

@app.route('/save_form', methods=['POST'])
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
        form = FormConfiguration(
            title=title,
            category=category,
            subcategory=subcategory,
            category_metadata=category_metadata,
            subcategory_metadata=subcategory_metadata
        )
        
        db.session.add(form)
        db.session.flush()  # Get form ID
        
        # Process questions
        for q_data in questions_data:
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
        
        db.session.commit()
        flash('Form saved successfully', 'success')
        return redirect(url_for('new_form_index'))
        
    except Exception as e:
        db.session.rollback()
        flash(f'Error saving form: {str(e)}', 'danger')
        return redirect(url_for('new_form_index'))

@app.errorhandler(404)
def not_found_error(error):
    return render_template('error.html', error="Page not found"), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('error.html', error="Internal server error"), 500
