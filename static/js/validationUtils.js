// validationUtils.js

// Function to show field-specific error
export function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    // Remove existing error messages
    const existingFeedback = field.parentNode.querySelector('.invalid-feedback');
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

    field.parentNode.insertBefore(feedback, field.nextSibling);
    
    // Add error highlight animation
    field.classList.add('error-highlight');
    setTimeout(() => field.classList.remove('error-highlight'), 1000);
}

// Function to clear form field errors
export function clearFieldError(field) {
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
    form.insertAdjacentElement('beforebegin', summary);
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
    const errors = [];
    let isValid = true;
    const questionIndex = Array.from(card.parentElement.children).indexOf(card) + 1;

    const reference = card.querySelector('.question-title');
    const content = card.querySelector('.question-content');
    const answerType = card.querySelector('.answer-type');

    if (!reference.value.trim()) {
        showFieldError(reference, 'Question reference is required');
        errors.push(`Question ${questionIndex}: Reference is required`);
        isValid = false;
    } else if (reference.value.length > 50) {
        showFieldError(reference, 'Reference must be less than 50 characters');
        errors.push(`Question ${questionIndex}: Reference is too long`);
        isValid = false;
    }

    if (!content.value.trim()) {
        showFieldError(content, 'Question content is required');
        errors.push(`Question ${questionIndex}: Content is required`);
        isValid = false;
    }

    if (answerType.value === 'list') {
        const optionsList = card.querySelector('.options-list');
        const optionsCount = optionsList.querySelectorAll('.option-tag').length;
        const optionsInput = card.querySelector('.options-input');
        
        if (optionsCount >= 2) {
            // If we have enough options, clear any error and make input optional
            clearFieldError(optionsInput);
            optionsInput.required = false;
        } else {
            // Only show error if we don't have enough options
            optionsInput.required = true;
            if (!optionsInput.value.trim() && optionsCount < 2) {
                showFieldError(optionsInput, 'Please add at least two options');
                errors.push(`Question ${questionIndex}: At least two options are required`);
                isValid = false;
            }
        }
    }

    return { isValid, errors };
}
