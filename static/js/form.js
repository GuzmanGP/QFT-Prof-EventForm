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
        
        // Ensure the container is a valid DOM element before appending
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
    
    function updateQuestionNavMenu() {
        const menu = document.getElementById('questionNavMenu');
        if (!menu) return;
        
        menu.innerHTML = '';
        
        document.querySelectorAll('.question-card').forEach((card, index) => {
            const title = card.querySelector('.question-title').value || 'Untitled Question';
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.className = 'dropdown-item';
            link.href = '#';
            link.textContent = `Question ${index + 1}: ${title}`;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            li.appendChild(link);
            menu.appendChild(li);
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
        updateQuestionNavMenu();
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
            updateQuestionNavMenu();
        }
    });
    
    [Rest of the existing code remains the same...]
});
