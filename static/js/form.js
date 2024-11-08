// Utility Functions
function setupMetadataCounters(container) {
    const buttons = container.querySelectorAll('.counter-button');
    const metadataContainer = container.querySelector('.metadata-container');
    const display = container.querySelector('.counter-display');
    
    if (!buttons.length || !metadataContainer || !display) return;
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const isIncrease = this.classList.contains('increase-count');
            let count = parseInt(display.textContent);
            count = isIncrease ? count + 1 : Math.max(0, count - 1);
            
            if (count >= 0 && count <= 20) {
                updateMetadataFields(metadataContainer, count);
                display.textContent = count;
            }
        });
    });
}

// Form Configuration Management
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formConfiguration');
    let questionCounter = 0;
    
    // Initialize metadata counter buttons for all sections
    document.querySelectorAll('.metadata-section').forEach(section => {
        setupMetadataCounters(section);
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

// Include all utility functions from the original code
[All previous utility functions should be included here: 
clearValidationErrors(), validateForm(), validateMetadataKey(), 
validateAllMetadataKeys(), showFieldError(), showErrorSummary(), 
showAlert(), addMetadataField(), updateMetadataFields(), 
updateQuestionList(), etc.]