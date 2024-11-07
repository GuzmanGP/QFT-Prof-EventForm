document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formConfiguration');
    let questionCounter = 0;
    
    // Add Question button handler
    document.getElementById('addQuestion').addEventListener('click', function() {
        const template = document.getElementById('questionTemplate');
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.card');
        
        // Update question number
        questionCounter++;
        const questionNumber = card.querySelector('.question-number');
        questionNumber.textContent = `Question ${questionCounter}`;
        
        // Set unique IDs for checkboxes
        const requiredCheckbox = card.querySelector('.question-required');
        const aiCheckbox = card.querySelector('.question-ai');
        requiredCheckbox.id = `required_${questionCounter}`;
        aiCheckbox.id = `ai_${questionCounter}`;
        
        // Update labels
        card.querySelector('[for="required_TEMPLATE"]').setAttribute('for', `required_${questionCounter}`);
        card.querySelector('[for="ai_TEMPLATE"]').setAttribute('for', `ai_${questionCounter}`);
        
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
        
        // Add metadata counter handlers
        setupMetadataCounters(card);
        
        // Add to questions container
        document.getElementById('questions').appendChild(card);
        updateQuestionList();
    });
    
    // Form validation and submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const formData = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            subcategory: document.getElementById('subcategory').value,
            category_metadata: getMetadataValues('categoryMetadata'),
            subcategory_metadata: getMetadataValues('subcategoryMetadata'),
            questions: Array.from(document.querySelectorAll('.question-card')).map((card, index) => ({
                reference: card.querySelector('.question-title').value,
                content: card.querySelector('.question-content').value,
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
                showAlert('success', 'Form saved successfully');
                form.reset();
                document.getElementById('questions').innerHTML = '';
                document.querySelectorAll('.counter-display').forEach(display => {
                    display.textContent = '0';
                });
                updateQuestionNumbers();
                updateQuestionList();
            } else {
                throw new Error(data.error || 'Failed to save form');
            }
        } catch (error) {
            showAlert('danger', error.message);
        }
    });
    
    // Form validation
    function validateForm() {
        let isValid = true;
        const errors = [];
        
        // Clear previous validation errors
        document.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        });
        
        document.querySelectorAll('.invalid-feedback').forEach(element => {
            element.remove();
        });
        
        const errorSummary = document.querySelector('.error-summary');
        if (errorSummary) {
            errorSummary.remove();
        }
        
        // Validate title
        const titleInput = document.getElementById('title');
        if (!titleInput.value.trim()) {
            showFieldError(titleInput, 'Title is required');
            errors.push('Title is required');
            isValid = false;
        }
        
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
        });
        
        if (!isValid) {
            showErrorSummary(errors);
        }
        
        return isValid;
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
        form.insertBefore(summary, form.firstChild);
    }
    
    function showAlert(type, message) {
        const alertContainer = document.querySelector('.alert-container');
        if (!alertContainer) return;
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertContainer.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    }
    
    function updateQuestionNumbers() {
        document.querySelectorAll('.question-card').forEach((card, index) => {
            card.querySelector('.question-number').textContent = `Question ${index + 1}`;
        });
        questionCounter = document.querySelectorAll('.question-card').length;
        document.getElementById('questionCount').textContent = questionCounter;
    }
    
    function setupMetadataCounters(container) {
        container.querySelectorAll('.counter-button').forEach(button => {
            button.addEventListener('click', function() {
                const isIncrease = this.classList.contains('increase-count');
                const targetContainer = this.closest('.metadata-section')
                    .querySelector('.metadata-container');
                const counterDisplay = this.closest('.metadata-section')
                    .querySelector('.counter-display');
                let count = parseInt(counterDisplay.textContent);
                
                count = isIncrease ? count + 1 : count - 1;
                if (count >= 0 && count <= 20) {
                    updateMetadataFields(targetContainer, count);
                    counterDisplay.textContent = count;
                }
            });
        });
    }
    
    // Initialize existing metadata counters
    document.querySelectorAll('.metadata-section').forEach(section => {
        setupMetadataCounters(section);
    });
});

function addMetadataField(container) {
    const field = document.createElement('div');
    field.className = 'input-group mb-2';
    field.innerHTML = `
        <input type="text" class="form-control" placeholder="Key">
        <input type="text" class="form-control" placeholder="Value">
        <button type="button" class="btn btn-outline-danger remove-field">×</button>
    `;
    
    field.querySelector('.remove-field').addEventListener('click', () => {
        field.remove();
        const metadataSection = container.closest('.metadata-section');
        const counterDisplay = metadataSection.querySelector('.counter-display');
        const currentCount = parseInt(counterDisplay.textContent);
        counterDisplay.textContent = currentCount - 1;
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

function getMetadataValues(container) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (!container) {
        return {};
    }
    
    const metadata = {};
    container.querySelectorAll('.input-group').forEach(group => {
        const inputs = group.querySelectorAll('input');
        const key = inputs[0].value.trim();
        const value = inputs[1].value.trim();
        if (key && value) {
            metadata[key] = value;
        }
    });
    return metadata;
}

function updateQuestionList() {
    const list = document.getElementById('questionNavList');
    const listContainer = document.getElementById('questionsList');
    if (!list || !listContainer) return;
    
    const questions = document.querySelectorAll('.question-card');
    
    // Show/hide the list based on question count
    listContainer.classList.toggle('d-none', questions.length === 0);
    
    list.innerHTML = '';
    questions.forEach((card, index) => {
        const title = card.querySelector('.question-title').value.trim() || 'Untitled Question';
        const item = document.createElement('button');
        item.className = 'list-group-item list-group-item-action';
        item.textContent = `Question ${index + 1}: ${title}`;
        item.addEventListener('click', () => {
            const questionCard = card.querySelector('.card-header');
            if (questionCard) {
                questionCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        list.appendChild(item);
    });
}
