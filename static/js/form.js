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

// ... [previous utility functions remain unchanged until line 236]

// Initialize form handling when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formConfiguration');
    
    // Add initial question if none exist
    if (!document.querySelectorAll('.question-card').length) {
        document.getElementById('addQuestion').click();
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
                const questions = document.querySelectorAll('.question-card');
                if (questions.length <= 1) {
                    showAlert('warning', 'At least one question is required');
                    return;
                }
                card.remove();
                // Update question numbers
                document.querySelectorAll('.question-card').forEach((card, index) => {
                    card.querySelector('.question-number').textContent = `Question ${index + 1}`;
                });
            });
            
            document.getElementById('questions').appendChild(card);
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
                    // Add initial question after form reset
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
