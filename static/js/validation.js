// validation.js

import { showAlert } from './utils.js';
import { validateMetadataContainer } from './metadataFields.js';
import { validateQuestions } from './question.js';

export function validateForm(form) {
    let isValid = true;
    const errors = [];
    clearAllErrors();

    // Validate title
    const title = form.querySelector('#title');
    if (!title.value.trim()) {
        showFieldError(title, 'Title is required');
        errors.push('Title is required');
        isValid = false;
    }

    // Validate category
    const category = form.querySelector('#category');
    if (!category.value.trim()) {
        showFieldError(category, 'Category is required');
        errors.push('Category is required');
        isValid = false;
    }

    // Validate metadata
    validateAllMetadata(errors);

    // Validate questions
    const questionValidation = validateQuestions();
    if (!questionValidation.isValid) {
        errors.push(...questionValidation.errors);
        isValid = false;
    }

    if (!isValid) {
        showErrorSummary(errors);
        const firstError = document.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.classList.add('validation-shake');
            setTimeout(() => firstError.classList.remove('validation-shake'), 500);
        }
    }

    return isValid;
}

export function showFieldError(field, message) {
    field.classList.add('is-invalid');
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    field.parentNode.insertBefore(feedback, field.nextSibling);
}

export function validateAllMetadata(errors) {
    const containers = ['categoryMetadata', 'subcategoryMetadata'];
    for (const container of containers) {
        const containerElement = document.getElementById(container);
        if (containerElement) {
            validateMetadataContainer(containerElement, errors);
        }
    }
}

export function clearAllErrors() {
    const invalidFields = document.querySelectorAll('.is-invalid');
    for (const field of invalidFields) {
        field.classList.remove('is-invalid');
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    }

    const errorSummary = document.querySelector('.error-summary');
    if (errorSummary) {
        errorSummary.remove();
    }
}

export function showErrorSummary(errors) {
    const summary = document.createElement('div');
    summary.className = 'error-summary alert alert-danger';
    summary.innerHTML = `
        <h5>Please correct the following errors:</h5>
        <ul>${errors.map(error => `<li>${error}</li>`).join('')}</ul>
    `;
    const form = document.getElementById('formConfiguration');
    form.insertAdjacentElement('beforebegin', summary);
}