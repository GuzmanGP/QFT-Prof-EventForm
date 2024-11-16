// utils.js
import { clearFieldError } from './validationUtils.js';
import { addQuestion } from './question.js';

// Function to show alerts in the interface
export function showAlert(type, message) {
    const alertContainer = document.querySelector('.alert-container');
    const alert = document.createElement('div');
    
    const existingAlert = Array.from(alertContainer.children).find(alert => 
        alert.classList.contains(`alert-${type}`) && alert.textContent.includes(message)
    );

    if (existingAlert) return;

    alert.className = `alert alert-${type} alert-dismissible fade show animate__animated animate__fadeInDown`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    alertContainer.appendChild(alert);
    
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

// Function to set metadata fields
function setMetadataFields(containerId, metadata = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const countDisplay = document.getElementById(`${containerId}Count`);
    const count = Object.keys(metadata).length;
    
    if (countDisplay) {
        countDisplay.textContent = count.toString();
        countDisplay.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => countDisplay.classList.remove('animate__animated', 'animate__pulse'), 1000);
    }
    
    container.innerHTML = '';
    
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

// Function to load form data
export async function loadForm(formId) {
    try {
        const response = await fetch(`/api/forms/${formId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load form');
        }

        // Clear existing form
        const form = document.getElementById('formConfiguration');
        form.reset();
        
        // Clear existing questions
        const questionsContainer = document.getElementById('questions');
        questionsContainer.innerHTML = '';
        
        const { form: formData } = data;
        
        // Set basic form fields with animation
        ['title', 'category', 'subcategory'].forEach((field, index) => {
            const element = document.getElementById(field);
            if (element && formData[field]) {
                setTimeout(() => {
                    element.value = formData[field];
                    element.classList.add('animate__animated', 'animate__fadeIn');
                    setTimeout(() => element.classList.remove('animate__animated', 'animate__fadeIn'), 1000);
                }, index * 100);
            }
        });

        // Set metadata fields
        setTimeout(() => {
            setMetadataFields('categoryMetadata', formData.category_metadata);
            setMetadataFields('subcategoryMetadata', formData.subcategory_metadata);
        }, 300);

        // Add questions with animation
        formData.questions.forEach((questionData, index) => {
            setTimeout(() => {
                const card = addQuestion();
                if (!card) return;

                // Set question fields
                const fields = {
                    '.question-title': questionData.reference,
                    '.question-content': questionData.content,
                    '.answer-type': questionData.answer_type,
                    '.question-required': questionData.required,
                    '.question-ai-instructions': questionData.ai_instructions
                };

                Object.entries(fields).forEach(([selector, value]) => {
                    const element = card.querySelector(selector);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = value;
                        } else {
                            element.value = value || '';
                        }
                    }
                });

                // Handle options for list type questions
                if (questionData.answer_type === 'list' && questionData.options?.length) {
                    const listOptions = card.querySelector('.list-options');
                    const optionsList = card.querySelector('.options-list');
                    if (listOptions && optionsList) {
                        listOptions.classList.remove('d-none');
                        questionData.options.forEach(option => {
                            const optionTag = document.createElement('span');
                            optionTag.className = 'option-tag';
                            optionTag.innerHTML = `
                                <span class="option-text">${option}</span>
                                <button type="button" class="remove-option">×</button>
                            `;
                            optionsList.appendChild(optionTag);
                        });
                    }
                }

                // Set question metadata
                if (questionData.question_metadata) {
                    const metadataContainer = card.querySelector('.question-metadata');
                    if (metadataContainer) {
                        Object.entries(questionData.question_metadata).forEach(([key, value]) => {
                            const field = document.createElement('div');
                            field.className = 'input-group mb-2';
                            field.innerHTML = `
                                <input type="text" class="form-control metadata-key" value="${key}" placeholder="Key">
                                <input type="text" class="form-control metadata-value" value="${value}" placeholder="Value">
                                <button type="button" class="btn btn-outline-danger remove-field">×</button>
                            `;
                            metadataContainer.appendChild(field);
                        });
                    }
                }

                card.classList.add('animate__animated', 'animate__fadeInUp');
                setTimeout(() => card.classList.remove('animate__animated', 'animate__fadeInUp'), 1000);
            }, index * 200 + 500);
        });

        // Update UI elements
        setTimeout(() => {
            updateQuestionsList();
            updateQuestionCount();
        }, (formData.questions.length * 200) + 700);

        return true;
    } catch (error) {
        showAlert('danger', `Error loading form: ${error.message}`);
        return false;
    }
}
