// validationUtils.js

// Function to show field-specific error
export function showFieldError(field, message) {
    if (!field) {
        console.warn('Attempted to show error on null field');
        return;
    }
    
    field.classList.add('is-invalid');
    
    // Remove existing error messages
    const existingFeedback = field.parentNode?.querySelector('.invalid-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    
    // Add error icon
    const errorIcon = document.createElement('span');
    errorIcon.className = 'error-icon';
    errorIcon.innerHTML = '⚠️';
    feedback.insertBefore(errorIcon, feedback.firstChild);

    field.parentNode?.insertBefore(feedback, field.nextSibling);
    
    // Add error highlight animation
    field.classList.add('error-highlight');
    setTimeout(() => field.classList.remove('error-highlight'), 1000);
}

// Function to clear form field errors
export function clearFieldError(field) {
    if (!field) {
        console.warn('Attempted to clear error on null field');
        return;
    }
    
    if (field.classList.contains('is-invalid')) {
        field.classList.remove('is-invalid', 'error-highlight');
        const feedback = field.nextElementSibling;
        if (feedback?.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    }
}

// Function to show error summary
export function showErrorSummary(errors) {
    if (!Array.isArray(errors) || errors.length === 0) return;

    const summary = document.createElement('div');
    summary.className = 'error-summary alert alert-danger';
    summary.innerHTML = `
        <h5><span class="error-icon">⚠️</span> Please correct the following errors:</h5>
        <ul>
            ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
    `;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Close');
    summary.appendChild(closeButton);

    const form = document.getElementById('formConfiguration');
    if (form) {
        form.insertAdjacentElement('beforebegin', summary);
    }
}

// Function to clear all validation errors
export function clearAllErrors() {
    // Clear field errors
    document.querySelectorAll('.is-invalid').forEach(field => {
        clearFieldError(field);
    });

    // Clear error summary
    const errorSummary = document.querySelector('.error-summary');
    if (errorSummary) {
        errorSummary.remove();
    }
}

// Function to validate a single question
export function validateQuestion(card) {
    if (!card) {
        console.warn('Attempted to validate null question card');
        return { isValid: false, errors: ['Invalid question card'] };
    }
    
    const errors = [];
    let isValid = true;
    const questionIndex = Array.from(card.parentElement?.children || []).indexOf(card) + 1;

    const reference = card.querySelector('.question-title');
    const content = card.querySelector('.question-content');
    const answerType = card.querySelector('.answer-type');
    
    if (!reference || !content || !answerType) {
        console.warn('Question elements not found in card');
        return { isValid: false, errors: ['Question elements not found'] };
    }

    if (!reference.value?.trim()) {
        showFieldError(reference, 'Question reference is required');
        errors.push(`Question ${questionIndex}: Reference is required`);
        isValid = false;
    } else if (reference.value.length > 50) {
        showFieldError(reference, 'Reference must be less than 50 characters');
        errors.push(`Question ${questionIndex}: Reference is too long`);
        isValid = false;
    }

    if (!content.value?.trim()) {
        showFieldError(content, 'Question content is required');
        errors.push(`Question ${questionIndex}: Content is required`);
        isValid = false;
    }

    if (answerType.value === 'list') {
        const optionsList = card.querySelector('.options-list');
        if (optionsList) {
            const optionsCount = optionsList.querySelectorAll('.option-tag').length;
            if (optionsCount < 2) {
                const optionsInput = card.querySelector('.options-input');
                if (optionsInput || optionsList) {
                    showFieldError(optionsInput || optionsList, 'Please add at least two options');
                    errors.push(`Question ${questionIndex}: At least two options are required`);
                    isValid = false;
                }
            }
        }
    }

    return { isValid, errors };
}
// Function to validate form data on load
export function validateFormData(formData) {
    const errors = [];
    
    // Validate basic form fields
    if (!formData.title?.trim()) {
        errors.push('Form title is required');
    } else if (formData.title.length > 200) {
        errors.push('Form title must be less than 200 characters');
    }
    
    if (!formData.category?.trim()) {
        errors.push('Form category is required');
    } else if (formData.category.length > 100) {
        errors.push('Category must be less than 100 characters');
    }
    
    // Validate metadata
    if (formData.category_metadata && typeof formData.category_metadata !== 'object') {
        errors.push('Invalid category metadata format');
    }
    
    if (formData.subcategory_metadata && typeof formData.subcategory_metadata !== 'object') {
        errors.push('Invalid subcategory metadata format');
    }
    
    // Validate questions
    if (!Array.isArray(formData.questions)) {
        errors.push('Invalid questions format');
    } else {
        formData.questions.forEach((question, index) => {
            if (!question.reference?.trim()) {
                errors.push(`Question ${index + 1}: Reference is required`);
            }
            if (!question.content?.trim()) {
                errors.push(`Question ${index + 1}: Content is required`);
            }
            if (!['text', 'num', 'date', 'list'].includes(question.answer_type)) {
                errors.push(`Question ${index + 1}: Invalid answer type`);
            }
            if (question.answer_type === 'list' && (!Array.isArray(question.options) || question.options.length < 2)) {
                errors.push(`Question ${index + 1}: List type questions require at least two options`);
            }
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
