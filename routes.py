from flask import render_template, request, jsonify, flash, redirect, url_for, json
from app import app, db
from models import FormConfiguration, Question

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
@app.route('/<int:form_id>')
def index(form_id=None):
    forms = FormConfiguration.query.order_by(FormConfiguration.created_at.desc()).all()
    
    # If form_id is provided, load that form's data
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
    
    return render_template('form.html', forms=forms, form_data=form_data)

@app.route('/save-form', methods=['POST'])
def save_form():
    try:
        # Get form data
        data = {
            'title': request.form['title'],
            'category': request.form['category'],
            'subcategory': request.form.get('subcategory'),
            'category_metadata': json.loads(request.form.get('category_metadata', '{}')),
            'subcategory_metadata': json.loads(request.form.get('subcategory_metadata', '{}')),
            'questions': json.loads(request.form.get('questions', '[]'))
        }
        
        # Validate form data
        try:
            validate_form_data(data)
        except ValueError as e:
            flash(str(e), 'danger')
            return redirect(url_for('index'))
        
        # Check if form exists
        existing_form = FormConfiguration.query.filter_by(
            title=data['title'],
            category=data['category']
        ).first()

        if existing_form:
            # Update existing form
            existing_form.subcategory = data['subcategory']
            existing_form.category_metadata = data['category_metadata']
            existing_form.subcategory_metadata = data['subcategory_metadata']
            
            # Get existing question IDs
            existing_question_ids = {q.id for q in existing_form.questions}
            submitted_question_ids = {int(q['id']) for q in data['questions'] if q.get('id')}
            
            # Delete questions that are no longer present
            questions_to_delete = existing_question_ids - submitted_question_ids
            if questions_to_delete:
                Question.query.filter(Question.id.in_(questions_to_delete)).delete(synchronize_session=False)
            
            # Update or create questions
            for q_data in data['questions']:
                if q_data.get('id'):
                    # Update existing question
                    question = Question.query.get(int(q_data['id']))
                    if question:
                        question.reference = q_data['reference']
                        question.content = q_data['content']
                        question.answer_type = q_data.get('answer_type', 'text')
                        question.options = q_data.get('options', [])
                        question.question_metadata = q_data.get('question_metadata', {})
                        question.required = q_data.get('required', False)
                        question.order = q_data.get('order')
                        question.ai_instructions = q_data.get('ai_instructions')
                else:
                    # Create new question
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
                    existing_form.questions.append(question)
            
            db.session.commit()
        else:
            # Create new form
            form = FormConfiguration(
                title=data['title'],
                category=data['category'],
                subcategory=data['subcategory'],
                category_metadata=data['category_metadata'],
                subcategory_metadata=data['subcategory_metadata']
            )
            
            # Add questions
            for q_data in data['questions']:
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
            
            db.session.add(form)
            db.session.commit()
        
        flash('Form saved successfully!', 'success')
        return redirect(url_for('index'))
        
    except Exception as e:
        db.session.rollback()
        flash(f'Error saving form: {str(e)}', 'danger')
        return redirect(url_for('index'))

@app.errorhandler(404)
def not_found_error(error):
    return render_template('error.html', error="Page not found"), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('error.html', error="Internal server error"), 500
