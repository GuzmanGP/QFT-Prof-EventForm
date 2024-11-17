from flask import render_template, request, jsonify, flash, redirect, url_for, json
from app import app, db
from models import FormConfiguration, Question

@app.route('/')
def new_form_index():
    return render_template('form.html')

@app.route('/<int:form_id>')
def load_form_index(form_id=None):
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

@app.errorhandler(404)
def not_found_error(error):
    return render_template('error.html', error="Page not found"), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('error.html', error="Internal server error"), 500
