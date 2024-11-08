// Form Configuration Management
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formConfiguration');
    let questionCounter = 0;
    
    // Initialize metadata counter buttons for all sections
    document.querySelectorAll('.metadata-section').forEach(section => {
        const buttons = section.querySelectorAll('.counter-button');
        const container = section.querySelector('.metadata-container');
        const display = section.querySelector('.counter-display');
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                const isIncrease = this.classList.contains('increase-count');
                let count = parseInt(display.textContent);
                count = isIncrease ? count + 1 : Math.max(0, count - 1);
                
                if (count >= 0 && count <= 20) {
                    updateMetadataFields(container, count);
                    display.textContent = count;
                }
            });
        });
    });
    
    // Add Question button handler
    document.getElementById('addQuestion').addEventListener('click', function() {
        const template = document.getElementById('questionTemplate');
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.card');
        
        // Update question number
        const questionNumber = card.querySelector('.question-number');
        questionNumber.textContent = `Question ${questionCounter + 1}`;
        
        // Set unique IDs for checkboxes
        const requiredCheckbox = card.querySelector('.question-required');
        const aiCheckbox = card.querySelector('.question-ai');
        requiredCheckbox.id = `required_${questionCounter + 1}`;
        aiCheckbox.id = `ai_${questionCounter + 1}`;
        
        // Update labels
        card.querySelector('[for="required_TEMPLATE"]').setAttribute('for', `required_${questionCounter + 1}`);
        card.querySelector('[for="ai_TEMPLATE"]').setAttribute('for', `ai_${questionCounter + 1}`);
        
        // Add answer type change handler
        const answerTypeSelect = card.querySelector('.answer-type');
        const listOptions = card.querySelector('.list-options');
        
        answerTypeSelect.addEventListener('change', function() {
            listOptions.classList.toggle('d-none', this.value !== 'list');
        });
        
        // Add title change handler for real-time updates
        card.querySelector('.question-title').addEventListener('input', function() {
            updateQuestionList();
        });
        
        // Add remove button handler
        card.querySelector('.remove-question').addEventListener('click', function() {
            card.remove();
            updateQuestionNumbers();
            updateQuestionList();
        });

        // Add back to menu button handler
        card.querySelector('.back-to-menu').addEventListener('click', function() {
            const questionsHeader = document.querySelector('.questions-header');
            const questionsList = document.getElementById('questionsList');
            
            if (!questionsList.classList.contains('show')) {
                new bootstrap.Collapse(questionsList).show();
            }
            
            questionsHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        // Initialize metadata counters for the new question
        setupMetadataCounters(card);
        
        // Add to questions container
        document.getElementById('questions').appendChild(card);
        questionCounter = document.querySelectorAll('.question-card').length;
        document.getElementById('questionCount').textContent = questionCounter;
        updateQuestionList();
    });
    
    // Form reset handler
    form.addEventListener('reset', function() {
        questionCounter = 0;
        document.getElementById('questionCount').textContent = '0';
        document.getElementById('questions').innerHTML = '';
        document.querySelectorAll('.counter-display').forEach(display => {
            display.textContent = '0';
        });
        document.querySelectorAll('.metadata-container').forEach(container => {
            container.innerHTML = '';
        });
        updateQuestionList();
        clearValidationErrors();
    });
    
    // Form validation and submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const formData = {
            category: document.getElementById('category').value,
            subcategory: document.getElementById('subcategory').value,
            category_metadata: getMetadataValues('categoryMetadata'),
            subcategory_metadata: getMetadataValues('subcategoryMetadata'),
            questions: Array.from(document.querySelectorAll('.question-card')).map((card, index) => ({
                reference: card.querySelector('.question-title').value,
                content: card.querySelector('.question-content').value,
                answer_type: card.querySelector('.answer-type').value,
                options: card.querySelector('.answer-type').value === 'list' 
                    ? card.querySelector('.list-options input').value.split(',').map(opt => opt.trim()).filter(opt => opt)
                    : [],
                required: card.querySelector('.question-required').checked,
                ai_processing: card.querySelector('.question-ai').checked,
                ai_instructions: card.querySelector('.question-ai-instructions').value,
                question_metadata: getMetadataValues(card.querySelector('.question-metadata')),
                order: index + 1
            }))
        };
        
        try {
            const response = await fetch('/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                const details = formData.questions.map(q => ({
                    title: q.reference,
                    type: q.answer_type,
                    metadata: Object.keys(q.question_metadata).length
                }));
                showAlert('success', 'Form saved successfully', details);
                form.reset();
            } else {
                throw new Error(data.error || 'Failed to save form');
            }
        } catch (error) {
            showAlert('danger', error.message);
        }
    });
});

// Utility Functions
function clearValidationErrors() {
    document.querySelectorAll('.is-invalid').forEach(element => {
        element.classList.remove('is-invalid', 'validation-shake');
    });
    
    document.querySelectorAll('.invalid-feedback, .metadata-error').forEach(element => {
        element.remove();
    });
    
    const errorSummary = document.querySelector('.error-summary');
    if (errorSummary) {
        errorSummary.remove();
    }
}

function validateForm() {
    let isValid = true;
    const errors = [];
    
    clearValidationErrors();
    
    // Validate category
    const categoryInput = document.getElementById('category');
    if (!categoryInput.value.trim()) {
        showFieldError(categoryInput, 'Category is required');
        errors.push('Category is required');
        isValid = false;
    }
    
    // Validate questions
    const questions = document.querySelectorAll('.question-card');
    if (questions.length === 0) {
        errors.push('At least one question is required');
        isValid = false;
        showAlert('danger', 'At least one question is required');
    }
    
    questions.forEach((card, index) => {
        const title = card.querySelector('.question-title');
        const content = card.querySelector('.question-content');
        const answerType = card.querySelector('.answer-type');
        const listOptions = card.querySelector('.list-options input');
        
        if (!title.value.trim()) {
            showFieldError(title, 'Question title is required');
            errors.push(`Question ${index + 1}: Title is required`);
            isValid = false;
        }
        
        if (!content.value.trim()) {
            showFieldError(content, 'Question content is required');
            errors.push(`Question ${index + 1}: Content is required`);
            isValid = false;
        }
        
        if (answerType.value === 'list' && !listOptions.value.trim()) {
            showFieldError(listOptions, 'List options are required for list type questions');
            errors.push(`Question ${index + 1}: List options are required`);
            isValid = false;
        }
    });
    
    // Validate all metadata containers
    document.querySelectorAll('.metadata-container').forEach(container => {
        validateAllMetadataKeys(container);
    });
    
    if (!isValid) {
        showErrorSummary(errors);
    }
    
    return isValid;
}

function validateMetadataKey(input) {
    const container = input.closest('.metadata-container');
    const currentKey = input.value.trim();
    let isDuplicate = false;
    
    container.querySelectorAll('.metadata-key').forEach(keyInput => {
        if (keyInput !== input && keyInput.value.trim() === currentKey && currentKey !== '') {
            isDuplicate = true;
        }
    });
    
    if (isDuplicate) {
        input.classList.add('is-invalid');
        
        // Create or update error message
        let feedback = input.closest('.input-group').querySelector('.metadata-error');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'metadata-error text-danger small mt-1';
            input.closest('.input-group').appendChild(feedback);
        }
        feedback.textContent = 'Duplicate key found';
    } else {
        input.classList.remove('is-invalid');
        const feedback = input.closest('.input-group').querySelector('.metadata-error');
        if (feedback) {
            feedback.remove();
        }
    }
}

function validateAllMetadataKeys(container) {
    container.querySelectorAll('.metadata-key').forEach(keyInput => {
        validateMetadataKey(keyInput);
    });
}

function showFieldError(element, message) {
    element.classList.add('is-invalid');
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    element.parentNode.appendChild(feedback);
    
    element.classList.add('validation-shake');
    setTimeout(() => element.classList.remove('validation-shake'), 500);
}

function showErrorSummary(errors) {
    const summary = document.createElement('div');
    summary.className = 'error-summary';
    
    const heading = document.createElement('h5');
    heading.textContent = 'Please correct the following errors:';
    summary.appendChild(heading);
    
    const list = document.createElement('ul');
    errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        list.appendChild(li);
    });
    
    summary.appendChild(list);
    const form = document.getElementById('formConfiguration');
    form.insertBefore(summary, form.firstChild);
}

function showAlert(type, message, details = null) {
    const alertContainer = document.querySelector('.alert-container');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    
    let alertContent = `
        <div class="d-flex justify-content-between align-items-start">
            <div>${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    if (details && type === 'success') {
        alertContent += `
            <div class="mt-2">
                <button class="btn btn-sm btn-outline-light" type="button" data-bs-toggle="collapse" data-bs-target="#alertDetails">
                    Show Details ▼
                </button>
                <div class="collapse mt-2" id="alertDetails">
                    <div class="card card-body bg-light text-dark">
                        <h6 class="mb-2">Questions Summary:</h6>
                        <ul class="list-unstyled mb-0">
                            ${details.map(q => `
                                <li>
                                    <strong>${q.title}</strong> (${q.type})
                                    ${q.metadata > 0 ? `<span class="badge bg-secondary">${q.metadata} metadata</span>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
    
    alert.innerHTML = alertContent;
    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

function addMetadataField(container) {
    const field = document.createElement('div');
    field.className = 'input-group mb-2';
    field.innerHTML = `
        <input type="text" class="form-control metadata-key" placeholder="Key">
        <input type="text" class="form-control" placeholder="Value">
        <button type="button" class="btn btn-outline-danger remove-field">×</button>
    `;
    
    // Add real-time key validation
    const keyInput = field.querySelector('.metadata-key');
    keyInput.addEventListener('input', () => {
        validateMetadataKey(keyInput);
    });
    
    field.querySelector('.remove-field').addEventListener('click', () => {
        field.remove();
        const metadataSection = container.closest('.metadata-section');
        const counterDisplay = metadataSection.querySelector('.counter-display');
        const currentCount = parseInt(counterDisplay.textContent);
        counterDisplay.textContent = currentCount - 1;
        // Revalidate all keys after removal
        validateAllMetadataKeys(container);
    });
    
    container.appendChild(field);
}

function updateMetadataFields(container, count) {
    if (count > 20) {
        showAlert('warning', 'Maximum 20 metadata fields allowed');
        return;
    }
    
    const currentFields = container.querySelectorAll('.input-group');
    
    if (count > currentFields.length) {
        for (let i = currentFields.length; i < count; i++) {
            addMetadataField(container);
        }
    } else {
        while (container.children.length > count) {
            container.removeChild(container.lastChild);
        }
    }
}

function updateQuestionList() {
    const list = document.getElementById('questionNavList');
    const listContainer = document.getElementById('questionsList');
    if (!list || !listContainer) return;
    
    const questions = document.querySelectorAll('.question-card');
    listContainer.classList.toggle('d-none', questions.length === 0);
    
    list.innerHTML = '';
    questions.forEach((card, index) => {
        const title = card.querySelector('.question-title').value.trim() || 'Untitled Question';
        const type = card.querySelector('.answer-type').value;
        const item = document.createElement('button');
        item.className = 'list-group-item list-group-item-action';
        item.innerHTML = `Question ${index + 1}: ${title} <span class="badge bg-secondary">${type}</span>`;
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const questionCard = card.querySelector('.card-header');
            if (questionCard) {
                const invalidFields = card.querySelectorAll('.is-invalid');
                const tempRemoved = [];
                
                invalidFields.forEach(field => {
                    tempRemoved.push({
                        element: field,
                        classes: ['is-invalid', 'validation-shake']
                    });
                    field.classList.remove('is-invalid', 'validation-shake');
                });
                
                questionCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                setTimeout(() => {
                    tempRemoved.forEach(item => {
                        item.element.classList.add(...item.classes);
                    });
                }, 500);
            }
        });
        
        list.appendChild(item);
    });
}
