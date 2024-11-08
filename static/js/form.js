// Utility Functions
function updateQuestionCount() {
    const count = document.querySelectorAll('.question-card').length;
    const countDisplay = document.getElementById('questionCount');
    if (countDisplay) {
        countDisplay.textContent = count;
    }
    return count;
}

function updateQuestionsList() {
    const navList = document.getElementById('questionNavList');
    navList.innerHTML = '';
    
    document.querySelectorAll('.question-card').forEach((card, index) => {
        const reference = card.querySelector('.question-title').value.trim() || `Question ${index + 1}`;
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        item.innerHTML = `
            ${reference}
            <span class="badge bg-primary rounded-pill">${index + 1}</span>
        `;
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('questionsList').classList.remove('show');
            card.scrollIntoView({ behavior: 'smooth' });
        });
        
        navList.appendChild(item);
    });
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

// Add Question function that can be called directly
function addQuestion() {
    const template = document.getElementById('questionTemplate');
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.card');
    
    // Set question number
    const questionNumber = document.querySelectorAll('.question-card').length + 1;
    card.querySelector('.question-number').textContent = `Question ${questionNumber}`;
    
    // Set default values
    card.querySelector('.question-title').value = '';  // Ensure empty initial value
    card.querySelector('.question-content').value = '';  // Ensure empty initial value
    card.querySelector('.answer-type').value = 'text';  // Set default answer type
    
    // Initialize all event listeners and setup
    initializeQuestionCard(card);
    
    // Add to DOM
    document.getElementById('questions').appendChild(card);
    updateQuestionCount();
    updateQuestionsList();  // Update the questions list after adding
    
    return card;
}

// Question card initialization function
function initializeQuestionCard(card) {
    // Initialize metadata counter
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
    
    // Answer type change handler
    card.querySelector('.answer-type').addEventListener('change', function() {
        const listOptions = card.querySelector('.list-options');
        listOptions.classList.toggle('d-none', this.value !== 'list');
        
        const input = listOptions.querySelector('input');
        input.required = this.value === 'list';
        if (this.value === 'list' && input.classList.contains('is-invalid')) {
            clearFieldError(input);
        }
    });
    
    // AI instructions toggle
    card.querySelector('.question-ai').addEventListener('change', function() {
        const aiInstructions = card.querySelector('.ai-instructions');
        aiInstructions.style.display = this.checked ? 'block' : 'none';
    });
    
    // Add question title input handler
    const titleInput = card.querySelector('.question-title');
    titleInput.addEventListener('input', () => {
        updateQuestionsList();
    });
    
    // Back to menu button handler
    card.querySelector('.back-to-menu').addEventListener('click', () => {
        const questionsMenu = document.getElementById('questionsList');
        questionsMenu.classList.add('show');
        questionsMenu.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Remove question handler
    card.querySelector('.remove-question').addEventListener('click', function() {
        if (updateQuestionCount() <= 1) {
            showAlert('warning', 'At least one question is required');
            return;
        }
        card.remove();
        // Update question numbers
        document.querySelectorAll('.question-card').forEach((card, index) => {
            card.querySelector('.question-number').textContent = `Question ${index + 1}`;
        });
        updateQuestionCount();
        updateQuestionsList();  // Update the questions list after removing
    });
}

[Rest of the file remains unchanged...]
