document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formConfiguration');
    let questionCounter = 0;
    
    function addMetadataField(container) {
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

        const removeBtn = field.querySelector('.remove-field');
        removeBtn.addEventListener('click', () => {
            field.remove();
            const metadataSection = targetContainer.closest('.metadata-section');
            const counterDisplay = metadataSection.querySelector('.counter-display');
            const currentCount = parseInt(counterDisplay.textContent);
            counterDisplay.textContent = currentCount - 1;
        });
        
        if (targetContainer && targetContainer.appendChild) {
            targetContainer.appendChild(field);
        }
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
        const counterDisplay = document.querySelector(`[data-target="${containerId}"]`)
            ?.parentNode?.querySelector('.counter-display');
        
        if (!counterDisplay) {
            console.error('Counter display not found');
            return false;
        }
        
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
    
    function updateQuestionList() {
        const list = document.getElementById('questionNavList');
        const listContainer = document.getElementById('questionsList');
        if (!list || !listContainer) return;
        
        const questions = document.querySelectorAll('.question-card');
        
        // Show/hide the list based on question count
        listContainer.classList.toggle('d-none', questions.length === 0);
        
        list.innerHTML = '';
        questions.forEach((card, index) => {
            const title = card.querySelector('.question-title').value || 'Untitled Question';
            const item = document.createElement('button');
            item.className = 'list-group-item list-group-item-action';
            item.textContent = `Question ${index + 1}: ${title}`;
            item.addEventListener('click', () => {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            list.appendChild(item);
        });
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
        const counterDisplay = container.closest('.metadata-section')?.querySelector('.counter-display');
        
        if (!counterDisplay) {
            console.error('Counter display not found');
            return false;
        }
        
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
        updateQuestionCount();
        updateQuestionList();
    }
    
    function addQuestion() {
        questionCounter++;
        const template = document.getElementById('questionTemplate');
        const questionElement = template.content.cloneNode(true);
        const questionContainer = document.getElementById('questions');
        
        if (!questionContainer) {
            console.error('Questions container not found');
            return;
        }
        
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
            e.stopPropagation();
            const currentCount = parseInt(counterDisplay.textContent);
            updateQuestionMetadataFields(metaContainer, currentCount - 1);
        });
        
        increaseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentCount = parseInt(counterDisplay.textContent);
            updateQuestionMetadataFields(metaContainer, currentCount + 1);
        });
        
        const aiProcessingCheckbox = questionElement.querySelector('.question-ai');
        const aiInstructions = questionElement.querySelector('.ai-instructions');
        
        aiProcessingCheckbox.addEventListener('change', (e) => {
            aiInstructions.style.display = e.target.checked ? 'block' : 'none';
        });
        
        questionElement.querySelector('.remove-question').addEventListener('click', () => {
            document.getElementById(uniqueId)?.remove();
            updateQuestionNumbers();
        });
        
        questionContainer.appendChild(questionElement);
        updateQuestionNumbers();
    }
    
    // Add input event listener for question titles
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('question-title')) {
            updateQuestionList();
        }
    });
    
    // Add click event listener for Add Question button
    document.getElementById('addQuestion').addEventListener('click', addQuestion);
    
    // Form validation and submission
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
    
    // Form submission handler
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
            } else {
                throw new Error(data.error || 'Failed to save form');
            }
        } catch (error) {
            showAlert('danger', error.message);
        }
    });
});
