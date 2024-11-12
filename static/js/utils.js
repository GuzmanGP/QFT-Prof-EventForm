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

// Function to load form data
export async function loadForm(formId) {
    try {
        const response = await fetch(`/api/forms/${formId}`);
        const data = await response.json();
        
        if (data.success) {
            // Clear existing form
            const form = document.getElementById('formConfiguration');
            form.reset();
            
            // Set basic form fields
            document.getElementById('title').value = data.form.title;
            document.getElementById('category').value = data.form.category;
            if (data.form.subcategory) {
                document.getElementById('subcategory').value = data.form.subcategory;
            }
            
            // Set metadata
            setMetadataFields('categoryMetadata', data.form.category_metadata);
            setMetadataFields('subcategoryMetadata', data.form.subcategory_metadata);
            
            // Clear existing questions
            const questionsContainer = document.getElementById('questions');
            questionsContainer.innerHTML = '';
            
            // Add questions
            data.form.questions.forEach(q => addQuestionWithData(q));
            
            return true;
        } else {
            throw new Error(data.error || 'Failed to load form');
        }
    } catch (error) {
        showAlert('danger', `Error loading form: ${error.message}`);
        return false;
    }
}

// Helper function to set metadata fields
function setMetadataFields(containerId, metadata) {
    const container = document.getElementById(containerId);
    const display = document.querySelector(`#${containerId}Count`);
    const count = Object.keys(metadata).length;
    
    // Update counter
    if (display) {
        display.textContent = count.toString();
    }
    
    // Clear existing fields
    container.innerHTML = '';
    
    // Add fields for each metadata entry
    Object.entries(metadata).forEach(([key, value]) => {
        const field = document.createElement('div');
        field.className = 'input-group mb-2';
        field.innerHTML = `
            <input type="text" class="form-control metadata-key" value="${key}" placeholder="Key">
            <input type="text" class="form-control metadata-value" value="${value}" placeholder="Value">
            <button type="button" class="btn btn-outline-danger remove-field">×</button>
        `;
        container.appendChild(field);
    });
}
