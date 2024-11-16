// utils.js
import { clearFieldError } from './validationUtils.js';

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
    alert.className = `alert alert-${type} alert-dismissible fade show animate__animated animate__fadeInDown`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Add the alert to the container interface
    alertContainer.appendChild(alert);
    
    // Set a timer to automatically remove the alert after 5 seconds
    setTimeout(() => {
        alert.classList.add('animate__fadeOutUp');
        setTimeout(() => alert.remove(), 500);
    }, 5000);
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

// Function to update questions list
export function updateQuestionsList() {
    const navList = document.getElementById('questionNavList');
    if (!navList) return;
    
    const questions = document.querySelectorAll('.question-card');
    
    navList.innerHTML = '';
    questions.forEach((card, index) => {
        const reference = card.querySelector('.question-title')?.value || 'Undefined reference';
        const full_reference = `Question ${index + 1}: ${reference}`;
        
        const listItem = document.createElement('div');
        listItem.className = 'question-menu-item animate__animated animate__fadeInLeft';
        
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'question-menu-link';
        link.innerHTML = `
            <i class="fas fa-chevron-right me-2"></i>
            <span>${full_reference}</span>
        `;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            card.scrollIntoView({ behavior: 'smooth' });
        });
        
        listItem.appendChild(link);
        navList.appendChild(listItem);
    });
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
            
            // Set basic form fields with animation
            const fields = ['title', 'category', 'subcategory'];
            fields.forEach((field, index) => {
                const element = document.getElementById(field);
                if (data.form[field]) {
                    setTimeout(() => {
                        element.value = data.form[field];
                        element.classList.add('animate__animated', 'animate__fadeIn');
                    }, index * 100);
                }
            });
            
            // Clear existing questions
            const questionsContainer = document.getElementById('questions');
            questionsContainer.innerHTML = '';
            
            // Add questions with staggered animation
            data.form.questions.forEach((q, index) => {
                setTimeout(() => addQuestionWithData(q), (fields.length + 1) * 100 + index * 200);
            });
            
            return true;
        } else {
            throw new Error(data.error || 'Failed to load form');
        }
    } catch (error) {
        showAlert('danger', `Error loading form: ${error.message}`);
        return false;
    }
}

// Helper function to set metadata fields with animation
function setMetadataFields(containerId, metadata) {
    const container = document.getElementById(containerId);
    const display = document.querySelector(`#${containerId}Count`);
    const count = Object.keys(metadata).length;
    
    // Update counter with animation
    if (display) {
        display.textContent = count.toString();
        display.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => display.classList.remove('animate__animated', 'animate__pulse'), 1000);
    }
    
    // Clear existing fields
    container.innerHTML = '';
    
    // Add fields for each metadata entry with staggered animation
    Object.entries(metadata).forEach(([key, value], index) => {
        setTimeout(() => {
            const field = document.createElement('div');
            field.className = 'input-group mb-2 animate__animated animate__fadeInRight';
            field.innerHTML = `
                <input type="text" class="form-control metadata-key" value="${key}" placeholder="Key">
                <input type="text" class="form-control metadata-value" value="${value}" placeholder="Value">
                <button type="button" class="btn btn-outline-danger remove-field">×</button>
            `;
            container.appendChild(field);
        }, index * 100);
    });
}
