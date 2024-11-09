// validation.js

import { showAlert } from './utils.js';
import { validateMetadataContainer } from './metadataFields.js';

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

export function validateQuestions() {
    const questions = document.querySelectorAll('.question-card');
    const errors = [];
    let isValid = true;

    for (let i = 0; i < questions.length; i++) {
        const card = questions[i];
        const reference = card.querySelector('.question-title');
        const content = card.querySelector('.question-content');
        const answerType = card.querySelector('.answer-type');
        const listOptions = card.querySelector('.list-options input');

        if (!reference.value.trim()) {
            showFieldError(reference, 'Question reference is required');
            errors.push(`Question ${i + 1}: Reference is required`);
            isValid = false;
        } else if (reference.value.length > 50) {
            showFieldError(reference, 'Reference must be less than 50 characters');
            errors.push(`Question ${i + 1}: Reference is too long`);
            isValid = false;
        }

        if (!content.value.trim()) {
            showFieldError(content, 'Question content is required');
            errors.push(`Question ${i + 1}: Content is required`);
            isValid = false;
        }

        if (answerType.value === 'list') {
            const options = listOptions.value.trim();
            if (!options || options.split(',').filter(opt => opt.trim()).length < 2) {
                showFieldError(listOptions, 'At least two comma-separated options are required');
                errors.push(`Question ${i + 1}: List options must contain at least two items`);
                isValid = false;
            }
        }
    }

    return { isValid, errors };
}

export function validateAllMetadata(errors) {
    const containers = ['categoryMetadata', 'subcategoryMetadata'];
    for (let i = 0; i < containers.length; i++) {
        const container = document.getElementById(containers[i]);
        if (container) {
            validateMetadataContainer(container, errors);
        }
    }
}

export function showFieldError(field, message) {
    field.classList.add('is-invalid');
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    field.parentNode.insertBefore(feedback, field.nextSibling);
}

export function clearAllErrors() {
    const invalidFields = document.querySelectorAll('.is-invalid');
    for (let i = 0; i < invalidFields.length; i++) {
        const field = invalidFields[i];
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
    summary.className = 'error-summary';
    summary.innerHTML = `
        <h5>Please correct the following errors:</h5>
        <ul>${errors.map(error => `<li>${error}</li>`).join('')}</ul>
    `;
    const form = document.getElementById('formConfiguration');
    form.insertAdjacentElement('beforebegin', summary);
}
