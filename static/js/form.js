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

// ... [Keep all other existing functions until the form submission part] ...

// Update the form submission part to include title
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearValidationErrors();
    
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
            showAlert('success', 'Form saved successfully');
            form.reset();
        } else {
            throw new Error(data.error || 'Failed to save form');
        }
    } catch (error) {
        showAlert('danger', error.message);
        showErrorSummary([error.message]);
    }
});

// Update validateForm to include title validation
function validateForm() {
    clearValidationErrors();
    let isValid = true;
    const errors = [];
    
    // Validate title
    const title = document.getElementById('title');
    if (!title.value.trim()) {
        showFieldError(title, 'Form title is required');
        errors.push('Form title is required');
        isValid = false;
    }
    
    // Validate category
    const category = document.getElementById('category');
    if (!category.value.trim()) {
        showFieldError(category, 'Category is required');
        errors.push('Category is required');
        isValid = false;
    }
    
    // ... [Rest of the validation code remains the same] ...
    
    return isValid;
}
