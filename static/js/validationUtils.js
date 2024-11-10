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
