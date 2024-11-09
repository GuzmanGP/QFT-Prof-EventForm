// ... rest of the existing code remains the same until line 338 ...

function validateMetadataContainer(container, errors) {
    const keys = new Set();
    const groups = container.querySelectorAll('.input-group');
    
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const keyInput = group.querySelector('.metadata-key');
        const valueInput = group.querySelector('.metadata-value');
        const key = keyInput.value.trim();
        const value = valueInput.value.trim();
        
        if (key && !value) {
            showFieldError(valueInput, 'Value required');
            errors.push('Metadata value required');
        }
        
        if (key && keys.has(key)) {
            showFieldError(keyInput, 'Duplicate key');
            errors.push(`Duplicate metadata key "${key}"`);
        }
        keys.add(key);
    }
}

function clearAllErrors() {
    document.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    });
    
    const errorSummary = document.querySelector('.error-summary');
    if (errorSummary) {
        errorSummary.remove();
    }
}

function showFieldError(field, message) {
    field.classList.add('is-invalid');
    field.classList.add('validation-shake');
    
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    field.parentNode.insertBefore(feedback, field.nextSibling);
    
    setTimeout(() => field.classList.remove('validation-shake'), 500);
}

function showErrorSummary(errors) {
    const summary = document.createElement('div');
    summary.className = 'error-summary';
    summary.innerHTML = `
        <div class="alert alert-danger">
            <h6>Please check the form for errors</h6>
            <ul class="mb-0">${errors.map(error => `<li>${error}</li>`).join('')}</ul>
        </div>
    `;
    const alertContainer = document.querySelector('.alert-container');
    alertContainer.appendChild(summary);
    
    // Remove after 5 seconds
    setTimeout(() => summary.remove(), 5000);
}

function validateMetadataKey(input) {
    if (input.classList.contains('is-invalid')) {
        input.classList.remove('is-invalid');
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    }
}
