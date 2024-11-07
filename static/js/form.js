document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formConfiguration');
    let questionCounter = 0;
    
    function addMetadataField(container) {
        // Ensure we have a valid DOM element
        const targetContainer = typeof container === 'string' ? 
            document.getElementById(container) : container;
        
        if (!targetContainer || !(targetContainer instanceof HTMLElement)) {
            console.error('Invalid container:', container);
            return;
        }
        
        const field = document.createElement('div');
        field.className = 'input-group mb-2';
        field.innerHTML = `
            <input type="text" class="form-control" placeholder="Key">
            <input type="text" class="form-control" placeholder="Value">
            <button type="button" class="btn btn-outline-danger remove-field">×</button>
        `;

        // Add click handler for remove button
        const removeBtn = field.querySelector('.remove-field');
        removeBtn.addEventListener('click', () => {
            field.remove();
            // Update counter display
            const metadataSection = targetContainer.closest('.metadata-section');
            const counterDisplay = metadataSection.querySelector('.counter-display');
            const currentCount = parseInt(counterDisplay.textContent);
            counterDisplay.textContent = currentCount - 1;
        });
        
        targetContainer.appendChild(field);
    }
    
    function updateMetadataFields(containerId, count) {
        if (count > 20) {
            showAlert('warning', 'Maximum 20 metadata fields allowed');
            return false;
        } else if (count < 0) {
            count = 0;
        }
        
        const container = document.getElementById(containerId);
        if (!container || !(container instanceof HTMLElement)) {
            console.error('Container not found:', containerId);
            return false;
        }
        
        const currentFields = container.querySelectorAll('.input-group');
        const counterDisplay = document.querySelector(`[data-target="${containerId}"]`).parentNode.querySelector('.counter-display');
        
        if (count > currentFields.length) {
            for (let i = currentFields.length; i < count; i++) {
                addMetadataField(container);
            }
        } else {
            while (container.children.length > count) {
                container.removeChild(container.lastChild);
            }
        }
        
        counterDisplay.textContent = count;
        return true;
    }
    
    function updateQuestionMetadataFields(container, count) {
        if (count > 20) {
            showAlert('warning', 'Maximum 20 metadata fields allowed');
            return false;
        } else if (count < 0) {
            count = 0;
        }
        
        if (!container || !(container instanceof HTMLElement)) {
            console.error('Container not found');
            return false;
        }
        
        const currentFields = container.querySelectorAll('.input-group');
        const counterDisplay = container.closest('.metadata-section').querySelector('.counter-display');
        
        if (count > currentFields.length) {
            for (let i = currentFields.length; i < count; i++) {
                addMetadataField(container);
            }
        } else {
            while (container.children.length > count) {
                container.removeChild(container.lastChild);
            }
        }
        
        counterDisplay.textContent = count;
        return true;
    }
    
    function updateQuestionCount() {
        const count = document.querySelectorAll('.question-card').length;
        const countDisplay = document.getElementById('questionCount');
        if (countDisplay) {
            countDisplay.textContent = count;
        }
    }
    
    function getMetadataValues(container) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        
        if (!container || !(container instanceof HTMLElement)) {
            console.error('Invalid container for metadata values');
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
    
    function showAlert(type, message) {
        const alertContainer = document.querySelector('.alert-container');
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
        updateQuestionCount();
    }
    
    function addQuestion() {
        questionCounter++;
        const template = document.getElementById('questionTemplate');
        const questionElement = template.content.cloneNode(true);
        const questionContainer = document.getElementById('questions');
        
        const uniqueId = `question_${questionCounter}`;
        questionElement.querySelector('.question-card').id = uniqueId;
        
        const requiredCheckbox = questionElement.querySelector('.question-required');
        const aiCheckbox = questionElement.querySelector('.question-ai');
        requiredCheckbox.id = `required_${uniqueId}`;
        aiCheckbox.id = `ai_${uniqueId}`;
        requiredCheckbox.nextElementSibling.htmlFor = requiredCheckbox.id;
        aiCheckbox.nextElementSibling.htmlFor = aiCheckbox.id;
        
        const metaContainer = questionElement.querySelector('.question-metadata');
        
        // Setup counter buttons for question metadata
        const decreaseBtn = questionElement.querySelector('.decrease-count');
        const increaseBtn = questionElement.querySelector('.increase-count');
        const counterDisplay = questionElement.querySelector('.counter-display');
        
        decreaseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            const currentCount = parseInt(counterDisplay.textContent);
            updateQuestionMetadataFields(metaContainer, currentCount - 1);
        });
        
        increaseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            const currentCount = parseInt(counterDisplay.textContent);
            updateQuestionMetadataFields(metaContainer, currentCount + 1);
        });
        
        const aiProcessingCheckbox = questionElement.querySelector('.question-ai');
        const aiInstructions = questionElement.querySelector('.ai-instructions');
        
        aiProcessingCheckbox.addEventListener('change', (e) => {
            aiInstructions.style.display = e.target.checked ? 'block' : 'none';
        });
        
        questionElement.querySelector('.remove-question').addEventListener('click', () => {
            document.getElementById(uniqueId).remove();
            updateQuestionNumbers();
        });
        
        questionContainer.appendChild(questionElement);
        updateQuestionNumbers();
    }
    
    function getQuestionsData() {
        const questions = [];
        document.querySelectorAll('.question-card').forEach((card, index) => {
            questions.push({
                reference: card.querySelector('.question-title').value,
                content: card.querySelector('.question-content').value,
                required: card.querySelector('.question-required').checked,
                ai_processing: card.querySelector('.question-ai').checked,
                ai_instructions: card.querySelector('.question-ai-instructions').value,
                question_metadata: getMetadataValues(card.querySelector('.question-metadata')),
                order: index + 1
            });
        });
        return questions;
    }

    function validateForm() {
        let isValid = true;
        const errors = [];
        
        clearValidationErrors();
        
        // Validate title
        const titleInput = document.getElementById('title');
        if (!titleInput.value.trim()) {
            showFieldError(titleInput, 'Title is required');
            errors.push('Title is required');
            isValid = false;
        } else if (titleInput.value.length > 200) {
            showFieldError(titleInput, 'Title must be less than 200 characters');
            errors.push('Title must be less than 200 characters');
            isValid = false;
        }
        
        // Validate category
        const categoryInput = document.getElementById('category');
        if (!categoryInput.value.trim()) {
            showFieldError(categoryInput, 'Category is required');
            errors.push('Category is required');
            isValid = false;
        } else if (categoryInput.value.length > 100) {
            showFieldError(categoryInput, 'Category must be less than 100 characters');
            errors.push('Category must be less than 100 characters');
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
            } else if (title.value.length > 50) {
                showFieldError(title, 'Question title must be less than 50 characters');
                errors.push(`Question ${index + 1}: Title must be less than 50 characters`);
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
            const firstError = document.querySelector('.is-invalid');
            if (firstError) {
                firstError.classList.add('validation-shake');
                setTimeout(() => firstError.classList.remove('validation-shake'), 500);
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        return isValid;
    }
    
    function showFieldError(element, message) {
        element.classList.add('is-invalid');
        
        let feedback = element.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            element.parentNode.insertBefore(feedback, element.nextSibling);
        }
        feedback.textContent = message;
    }
    
    function clearValidationErrors() {
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
    }
    
    function showErrorSummary(errors) {
        let errorSummary = document.querySelector('.error-summary');
        
        if (!errorSummary) {
            errorSummary = document.createElement('div');
            errorSummary.className = 'error-summary';
            const heading = document.createElement('h5');
            heading.textContent = 'Please correct the following errors:';
            errorSummary.appendChild(heading);
            form.insertBefore(errorSummary, form.firstChild);
        }
        
        const errorList = document.createElement('ul');
        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            errorList.appendChild(li);
        });
        
        const existingList = errorSummary.querySelector('ul');
        if (existingList) {
            existingList.remove();
        }
        
        errorSummary.appendChild(errorList);
        errorSummary.classList.add('show');
    }
    
    async function submitForm(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const formData = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            subcategory: document.getElementById('subcategory').value,
            category_metadata: getMetadataValues('categoryMetadata'),
            subcategory_metadata: getMetadataValues('subcategoryMetadata'),
            questions: getQuestionsData()
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
                clearValidationErrors();
                updateQuestionCount();
                
                // Reset counter displays
                document.querySelectorAll('.counter-display').forEach(display => {
                    display.textContent = '0';
                });
            } else {
                throw new Error(data.error || 'Failed to save form');
            }
        } catch (error) {
            showAlert('danger', error.message);
        }
    }
    
    // Event Listeners for counter buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('increase-count') || e.target.classList.contains('decrease-count')) {
            e.stopPropagation(); // Prevent event bubbling
            const targetId = e.target.dataset.target;
            const counterDisplay = e.target.parentNode.querySelector('.counter-display');
            const currentCount = parseInt(counterDisplay.textContent);
            const newCount = e.target.classList.contains('increase-count') ? currentCount + 1 : currentCount - 1;
            
            if (targetId === 'question-metadata') {
                const metadataContainer = e.target.closest('.metadata-section').querySelector('.metadata-container');
                updateQuestionMetadataFields(metadataContainer, newCount);
            } else {
                updateMetadataFields(targetId, newCount);
            }
        }
    });
    
    document.getElementById('addQuestion').addEventListener('click', addQuestion);
    form.addEventListener('submit', submitForm);
    
    // Add input event listeners for live validation
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            if (input.classList.contains('is-invalid')) {
                input.classList.remove('is-invalid');
                const feedback = input.nextElementSibling;
                if (feedback && feedback.classList.contains('invalid-feedback')) {
                    feedback.remove();
                }
            }
        });
    });
});
