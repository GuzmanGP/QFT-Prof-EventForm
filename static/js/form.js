document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formConfiguration');
    let questionCounter = 0;
    
    function updateMetadataFields(containerId, count) {
        if (count > 20) {
            showAlert('warning', 'Maximum 20 metadata fields allowed');
            return;
        }
        
        const container = document.getElementById(containerId);
        const currentFields = container.querySelectorAll('.input-group');
        
        if (count > currentFields.length) {
            for (let i = currentFields.length; i < count; i++) {
                addMetadataField(containerId);
            }
        } else {
            while (container.children.length > count) {
                container.removeChild(container.lastChild);
            }
        }
    }
    
    function updateQuestionMetadataFields(container, count) {
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
        field.className = 'input-group';
        field.innerHTML = `
            <input type="text" class="form-control" placeholder="Key">
            <input type="text" class="form-control" placeholder="Value">
        `;
        container.appendChild(field);
    }
    
    function getMetadataValues(container) {
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
    }
    
    function addQuestion() {
        questionCounter++;
        const template = document.getElementById('questionTemplate');
        const questionElement = template.content.cloneNode(true);
        const questionContainer = document.getElementById('questions');
        
        // Update IDs to be unique
        const uniqueId = `question_${questionCounter}`;
        questionElement.querySelector('.question-card').id = uniqueId;
        
        // Update checkbox IDs and labels
        const requiredCheckbox = questionElement.querySelector('.question-required');
        const aiCheckbox = questionElement.querySelector('.question-ai');
        requiredCheckbox.id = `required_${uniqueId}`;
        aiCheckbox.id = `ai_${uniqueId}`;
        requiredCheckbox.nextElementSibling.htmlFor = requiredCheckbox.id;
        aiCheckbox.nextElementSibling.htmlFor = aiCheckbox.id;
        
        // Add event listeners
        const metaCounter = questionElement.querySelector('.question-meta-count');
        const metaContainer = questionElement.querySelector('.question-metadata');
        
        metaCounter.addEventListener('change', (e) => {
            updateQuestionMetadataFields(metaContainer, parseInt(e.target.value));
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
                title: card.querySelector('.question-title').value,
                content: card.querySelector('.question-content').value,
                required: card.querySelector('.question-required').checked,
                ai_processing: card.querySelector('.question-ai').checked,
                ai_instructions: card.querySelector('.question-ai-instructions').value,
                metadata: getMetadataValues(card.querySelector('.question-metadata')),
                order: index + 1
            });
        });
        return questions;
    }
    
    async function submitForm(event) {
        event.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            subcategory: document.getElementById('subcategory').value,
            category_metadata: getMetadataValues(document.getElementById('categoryMetadata')),
            subcategory_metadata: getMetadataValues(document.getElementById('subcategoryMetadata')),
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
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            showAlert('danger', error.message);
        }
    }
    
    // Event Listeners
    document.getElementById('categoryMetaCount').addEventListener('change', (e) => {
        updateMetadataFields('categoryMetadata', parseInt(e.target.value));
    });
    
    document.getElementById('subcategoryMetaCount').addEventListener('change', (e) => {
        updateMetadataFields('subcategoryMetadata', parseInt(e.target.value));
    });
    
    document.getElementById('addQuestion').addEventListener('click', addQuestion);
    
    form.addEventListener('submit', submitForm);
});
