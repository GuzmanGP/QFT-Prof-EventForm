// Utility Functions
function updateQuestionCount() {
    const count = document.querySelectorAll('.question-card').length;
    const countDisplay = document.getElementById('questionCount');
    if (countDisplay) {
        countDisplay.textContent = count;
    }
    return count;
}

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
    });
    
    container.appendChild(field);
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

// Initialize form handling when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formConfiguration');
    
    // Add initial question immediately if none exist
    if (!document.querySelectorAll('.question-card').length) {
        const addQuestionBtn = document.getElementById('addQuestion');
        if (addQuestionBtn) {
            addQuestionBtn.click();
        }
    }
    
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
    const addQuestionBtn = document.getElementById('addQuestion');
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', function() {
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
            
            // Updated remove question handler
            card.querySelector('.remove-question').addEventListener('click', function() {
                if (updateQuestionCount() <= 1) {
                    showAlert('warning', 'At least one question is required');
                    return;
                }
                card.remove();
                // Update question numbers and count
                document.querySelectorAll('.question-card').forEach((card, index) => {
                    card.querySelector('.question-number').textContent = `Question ${index + 1}`;
                });
                updateQuestionCount();
            });
            
            document.getElementById('questions').appendChild(card);
            updateQuestionCount();
        });
    }
    
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
                    
                    // Ensure there's at least one question after reset
                    document.getElementById('addQuestion').click();
                    
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

function validateForm(form) {
    let isValid = true;
    const errors = [];
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate questions count first
    const questionCount = updateQuestionCount();
    if (questionCount === 0) {
        errors.push('At least one question is required');
        isValid = false;
        document.getElementById('addQuestion').click();
    }
    
    // Validate title
    const title = form.querySelector('#title');
    if (!title.value.trim()) {
        showFieldError(title, 'Title is required');
        errors.push('Title is required');
        isValid = false;
    }
    
    // Validate category
    const category = form.querySelector('#category');
    if (!category.value.trim()) {
        showFieldError(category, 'Category is required');
        errors.push('Category is required');
        isValid = false;
    }
    
    // Check for duplicate questions
    const references = new Set();
    const contents = new Set();
    
    document.querySelectorAll('.question-card').forEach((card, index) => {
        const reference = card.querySelector('.question-title').value.trim();
        const content = card.querySelector('.question-content').value.trim();
        
        // Validate required fields
        if (!reference) {
            showFieldError(card.querySelector('.question-title'), 'Question reference is required');
            errors.push(`Question ${index + 1}: Reference is required`);
            isValid = false;
        } else if (references.has(reference)) {
            showFieldError(card.querySelector('.question-title'), 'Duplicate reference found');
            errors.push(`Question ${index + 1}: Duplicate reference "${reference}"`);
            isValid = false;
        }
        references.add(reference);
        
        if (!content) {
            showFieldError(card.querySelector('.question-content'), 'Question content is required');
            errors.push(`Question ${index + 1}: Content is required`);
            isValid = false;
        } else if (contents.has(content)) {
            showFieldError(card.querySelector('.question-content'), 'Duplicate content found');
            errors.push(`Question ${index + 1}: Duplicate content`);
            isValid = false;
        }
        contents.add(content);
        
        // Validate list options if selected
        const answerType = card.querySelector('.answer-type').value;
        if (answerType === 'list') {
            const options = card.querySelector('.list-options input').value.trim();
            if (!options) {
                showFieldError(card.querySelector('.list-options input'), 'List options are required');
                errors.push(`Question ${index + 1}: List options are required`);
                isValid = false;
            }
        }
        
        // Validate metadata keys
        validateMetadataContainer(card.querySelector('.question-metadata'), errors, isValid);
    });
    
    // Validate category and subcategory metadata
    validateMetadataContainer(document.getElementById('categoryMetadata'), errors, isValid);
    validateMetadataContainer(document.getElementById('subcategoryMetadata'), errors, isValid);
    
    if (!isValid) {
        showErrorSummary(errors);
    }
    
    return isValid;
}

function validateMetadataContainer(container, errors, isValid) {
    const keys = new Set();
    container.querySelectorAll('.input-group').forEach(group => {
        const keyInput = group.querySelector('.metadata-key');
        const valueInput = group.querySelector('input:not(.metadata-key)');
        const key = keyInput.value.trim();
        const value = valueInput.value.trim();
        
        if (key && !value) {
            showFieldError(valueInput, 'Value is required when key is provided');
            errors.push('Metadata value is required when key is provided');
            isValid = false;
        }
        
        if (key && keys.has(key)) {
            showFieldError(keyInput, 'Duplicate key found');
            errors.push(`Duplicate metadata key "${key}"`);
            isValid = false;
        }
        keys.add(key);
    });
}

function clearAllErrors() {
    document.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
        const feedback = field.nextElementSibling;
        if (feedback?.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    });
    
    const errorSummary = document.querySelector('.error-summary');
    if (errorSummary) {
        errorSummary.remove();
    }
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    field.parentNode.insertBefore(feedback, field.nextSibling);
    field.classList.add('validation-shake');
    setTimeout(() => field.classList.remove('validation-shake'), 500);
}

function showErrorSummary(errors) {
    const summary = document.createElement('div');
    summary.className = 'error-summary';
    summary.innerHTML = `
        <h5>Please correct the following errors:</h5>
        <ul>
            ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
    `;
    document.querySelector('.alert-container').appendChild(summary);
}
