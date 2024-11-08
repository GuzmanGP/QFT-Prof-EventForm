// Utility Functions
function updateMetadataFields(container, count) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
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

function addMetadataField(container) {
    const field = document.createElement('div');
    field.className = 'input-group mb-2';
    field.innerHTML = `
        <input type="text" class="form-control metadata-key" placeholder="Key">
        <input type="text" class="form-control metadata-value" placeholder="Value">
        <button type="button" class="btn btn-outline-danger remove-field">×</button>
    `;
    
    const keyInput = field.querySelector('.metadata-key');
    const valueInput = field.querySelector('.metadata-value');
    
    keyInput.addEventListener('input', () => validateMetadataKey(keyInput));
    valueInput.addEventListener('input', () => {
        if (valueInput.classList.contains('is-invalid')) {
            valueInput.classList.remove('is-invalid');
        }
    });
    
    field.querySelector('.remove-field').addEventListener('click', () => {
        field.remove();
        validateMetadataKeys(container);
    });
    
    container.appendChild(field);
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
        showFieldError(input, 'Duplicate metadata key found');
        return false;
    } else {
        clearFieldError(input);
        return true;
    }
}

function validateMetadataKeys(container) {
    const keys = new Set();
    let isValid = true;
    container.querySelectorAll('.metadata-key').forEach(input => {
        const key = input.value.trim();
        if (key && keys.has(key)) {
            showFieldError(input, 'Duplicate metadata key found');
            isValid = false;
        }
        keys.add(key);
    });
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('is-invalid', 'validation-shake');
    let feedback = field.nextElementSibling;
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        field.parentNode.insertBefore(feedback, field.nextElementSibling);
    }
    feedback.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('is-invalid', 'validation-shake');
    const feedback = field.nextElementSibling;
    if (feedback?.classList.contains('invalid-feedback')) {
        feedback.remove();
    }
}

function showErrorSummary(errors) {
    const existingSummary = document.querySelector('.error-summary');
    if (existingSummary) {
        existingSummary.remove();
    }
    
    const summary = document.createElement('div');
    summary.className = 'error-summary alert alert-danger';
    summary.innerHTML = `
        <h5>Please correct the following errors:</h5>
        <ul>
            ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
    `;
    document.querySelector('.alert-container').appendChild(summary);
    summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showAlert(type, message) {
    const alertContainer = document.querySelector('.alert-container');
    const existingAlerts = alertContainer.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

function clearValidationErrors() {
    document.querySelectorAll('.is-invalid').forEach(element => {
        element.classList.remove('is-invalid', 'validation-shake');
    });
    document.querySelectorAll('.invalid-feedback, .error-summary').forEach(element => {
        element.remove();
    });
}

function validateForm(form) {
    clearValidationErrors();
    let isValid = true;
    const errors = [];
    
    // Validate title
    const title = form.querySelector('#title');
    if (!title.value.trim()) {
        showFieldError(title, 'Form title is required');
        errors.push('Form title is required');
        isValid = false;
    } else if (title.value.length > 200) {
        showFieldError(title, 'Form title must be less than 200 characters');
        errors.push('Form title must be less than 200 characters');
        isValid = false;
    }
    
    // Validate category
    const category = form.querySelector('#category');
    if (!category.value.trim()) {
        showFieldError(category, 'Category is required');
        errors.push('Category is required');
        isValid = false;
    } else if (category.value.length > 100) {
        showFieldError(category, 'Category must be less than 100 characters');
        errors.push('Category must be less than 100 characters');
        isValid = false;
    }
    
    // Validate questions
    const questions = form.querySelectorAll('.question-card');
    if (!questions.length) {
        errors.push('At least one question is required');
        isValid = false;
        showAlert('danger', 'At least one question is required');
    }
    
    questions.forEach((card, index) => {
        const title = card.querySelector('.question-title');
        const content = card.querySelector('.question-content');
        const answerType = card.querySelector('.answer-type');
        
        if (!title.value.trim()) {
            showFieldError(title, 'Question reference is required');
            errors.push(`Question ${index + 1}: Reference is required`);
            isValid = false;
        } else if (title.value.length > 50) {
            showFieldError(title, 'Question reference must be less than 50 characters');
            errors.push(`Question ${index + 1}: Reference must be less than 50 characters`);
            isValid = false;
        }
        
        if (!content.value.trim()) {
            showFieldError(content, 'Question content is required');
            errors.push(`Question ${index + 1}: Content is required`);
            isValid = false;
        }
        
        if (answerType.value === 'list') {
            const options = card.querySelector('.list-options input');
            if (!options.value.trim()) {
                showFieldError(options, 'List options are required');
                errors.push(`Question ${index + 1}: List options are required`);
                isValid = false;
            }
        }
    });
    
    // Validate metadata
    form.querySelectorAll('.metadata-container').forEach(container => {
        if (!validateMetadataKeys(container)) {
            isValid = false;
        }
        
        container.querySelectorAll('.metadata-value').forEach(input => {
            if (!input.value.trim() && input.previousElementSibling.value.trim()) {
                showFieldError(input, 'Value is required when key is provided');
                errors.push('Metadata value is required when key is provided');
                isValid = false;
            }
        });
    });
    
    if (errors.length) {
        showErrorSummary(errors);
    }
    
    return isValid;
}

// Initialize form handling when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formConfiguration');
    
    // Initialize metadata counters
    document.querySelectorAll('.metadata-section').forEach(section => {
        const container = section.querySelector('.metadata-container');
        const buttons = section.querySelectorAll('.counter-button');
        const display = section.querySelector('.counter-display');
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                const currentCount = parseInt(display.textContent);
                const newCount = this.classList.contains('increase-count') 
                    ? currentCount + 1 
                    : Math.max(0, currentCount - 1);
                
                updateMetadataFields(container, newCount);
                display.textContent = newCount;
            });
        });
    });
    
    // Add Question button handler
    document.getElementById('addQuestion').addEventListener('click', function() {
        const template = document.getElementById('questionTemplate');
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.card');
        
        const questionNumber = document.querySelectorAll('.question-card').length + 1;
        card.querySelector('.question-number').textContent = `Question ${questionNumber}`;
        
        // Initialize metadata counter for new question
        const metadataSection = card.querySelector('.metadata-section');
        const container = metadataSection.querySelector('.metadata-container');
        const buttons = metadataSection.querySelectorAll('.counter-button');
        const display = metadataSection.querySelector('.counter-display');
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                const currentCount = parseInt(display.textContent);
                const newCount = this.classList.contains('increase-count') 
                    ? currentCount + 1 
                    : Math.max(0, currentCount - 1);
                
                updateMetadataFields(container, newCount);
                display.textContent = newCount;
            });
        });
        
        // Add other event listeners
        card.querySelector('.answer-type').addEventListener('change', function() {
            const listOptions = card.querySelector('.list-options');
            listOptions.classList.toggle('d-none', this.value !== 'list');
            
            const input = listOptions.querySelector('input');
            input.required = this.value === 'list';
            if (this.value === 'list' && input.classList.contains('is-invalid')) {
                clearFieldError(input);
            }
        });
        
        card.querySelector('.question-ai').addEventListener('change', function() {
            const aiInstructions = card.querySelector('.ai-instructions');
            aiInstructions.style.display = this.checked ? 'block' : 'none';
        });
        
        card.querySelector('.remove-question').addEventListener('click', function() {
            card.remove();
            document.querySelectorAll('.question-card').forEach((card, index) => {
                card.querySelector('.question-number').textContent = `Question ${index + 1}`;
            });
        });
        
        document.getElementById('questions').appendChild(card);
    });
    
    // Form submission handler
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm(form)) {
                return;
            }
            
            const formData = {
                title: form.querySelector('#title').value.trim(),
                category: form.querySelector('#category').value.trim(),
                subcategory: form.querySelector('#subcategory').value.trim(),
                category_metadata: getMetadataValues('categoryMetadata'),
                subcategory_metadata: getMetadataValues('subcategoryMetadata'),
                questions: Array.from(form.querySelectorAll('.question-card')).map((card, index) => ({
                    reference: card.querySelector('.question-title').value.trim(),
                    content: card.querySelector('.question-content').value.trim(),
                    answer_type: card.querySelector('.answer-type').value,
                    options: card.querySelector('.answer-type').value === 'list' 
                        ? card.querySelector('.list-options input').value.split(',').map(opt => opt.trim()).filter(opt => opt)
                        : [],
                    required: card.querySelector('.question-required').checked,
                    ai_processing: card.querySelector('.question-ai').checked,
                    ai_instructions: card.querySelector('.question-ai-instructions').value.trim(),
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
                    let message = 'Form saved successfully';
                    if (!data.sheets_sync) {
                        message += ' (Google Sheets sync failed - please check API permissions)';
                    }
                    showAlert('success', message);
                    form.reset();
                    document.getElementById('questions').innerHTML = '';
                    document.querySelectorAll('.counter-display').forEach(display => {
                        display.textContent = '0';
                    });
                    document.querySelectorAll('.metadata-container').forEach(container => {
                        container.innerHTML = '';
                    });
                } else {
                    throw new Error(data.error || 'Failed to save form');
                }
            } catch (error) {
                showAlert('danger', error.message);
                showErrorSummary([error.message]);
            }
        });
    }
});

function getMetadataValues(container) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    const metadata = {};
    container.querySelectorAll('.input-group').forEach(group => {
        const key = group.querySelector('.metadata-key').value.trim();
        const value = group.querySelector('.metadata-value').value.trim();
        if (key && value) {
            metadata[key] = value;
        }
    });
    
    return metadata;
}
