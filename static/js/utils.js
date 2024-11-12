// utils.js

// Function to show alerts in the interface
export function showAlert(type, message) {
    // Get the alert container where the alert will be inserted
    const alertContainer = document.querySelector('.alert-container');

    // Create a new div element for the alert
    const alert = document.createElement('div');
    
    // Check if an alert with same type and message exists to avoid duplicates
    const existingAlert = Array.from(alertContainer.children).find(alert => 
        alert.classList.contains(`alert-${type}`) && alert.textContent.includes(message)
    );

    // If a similar alert exists, exit the function to avoid duplicates
    if (existingAlert) return;

    // Assign alert type class (success, warning, danger, etc.)
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Add the alert to the container interface
    alertContainer.appendChild(alert);
    
    // Set a timer to automatically remove the alert after 5 seconds
    setTimeout(() => alert.remove(), 5000);
}

// Function to show field error
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

// Function to clear field error
export function clearFieldError(field) {
    if (field.classList.contains('is-invalid')) {
        field.classList.remove('is-invalid', 'error-highlight');
        const feedback = field.nextElementSibling;
        if (feedback?.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    }
}

// Function to update the questions header based on the number of rendered questions
export function updateQuestionsHeader() {
    const count = document.querySelectorAll('.question-card').length;
    const header = document.getElementById('questionsHeader');
    if (header) {
        header.textContent = `Questions (${count})`;
    }
}

// Function to update question count
export function updateQuestionCount() {
    const count = document.querySelectorAll('.question-card').length;
    const countDisplay = document.getElementById('questionCount');
    if (countDisplay) {
        countDisplay.textContent = count.toString();
    }
    return count;
}
