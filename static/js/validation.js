// validation.js
import { showAlert } from './utils.js';
import { validateMetadataContainer } from './metadataFields.js';
import { validateQuestions } from './question.js';
import { showFieldError, clearFieldError, showErrorSummary, clearAllErrors } from './validationUtils.js';

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
    } else if (title.value.length > 200) {
        showFieldError(title, 'Title must be less than 200 characters');
        errors.push('Title is too long');
        isValid = false;
    }

    // Validate category
    const category = form.querySelector('#category');
    if (!category.value.trim()) {
        showFieldError(category, 'Category is required');
        errors.push('Category is required');
        isValid = false;
    } else if (category.value.length > 100) {
        showFieldError(category, 'Category must be less than 100 characters');
        errors.push('Category is too long');
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

export function validateAllMetadata(errors) {
    const containers = ['categoryMetadata', 'subcategoryMetadata'];
    containers.forEach(containerId => {
        const containerElement = document.getElementById(containerId);
        if (containerElement) {
            validateMetadataContainer(containerElement, errors);
        }
    });
}
