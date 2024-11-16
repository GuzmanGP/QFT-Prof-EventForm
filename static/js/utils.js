// utils.js
import { clearFieldError } from './validationUtils.js';
import { addQuestion } from './question.js';

// Function to show/hide loading overlay with enhanced animations
export function toggleLoadingOverlay(show = true, message = 'Loading form data...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = overlay?.querySelector('.loading-text');
    
    if (!overlay || !loadingText) {
        console.error('Loading overlay elements not found');
        return;
    }
    
    if (show) {
        overlay.classList.remove('d-none');
        loadingText.textContent = message;
        // Force reflow before adding animations
        overlay.offsetHeight;
        overlay.classList.add('animate__animated', 'animate__fadeIn');
    } else {
        overlay.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            overlay.classList.remove('animate__animated', 'animate__fadeIn', 'animate__fadeOut');
            overlay.classList.add('d-none');
        }, 500);
    }
}

// Function to show alerts in the interface
export function showAlert(type, message) {
    const alertContainer = document.querySelector('.alert-container');
    if (!alertContainer) {
        console.error('Alert container not found');
        return;
    }
    
    const alert = document.createElement('div');
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

// Function to load form data
export async function loadForm(formId) {
    try {
        const questionsContainer = document.getElementById('questions');
        if (!questionsContainer) {
            throw new Error('Questions container not found');
        }

        toggleLoadingOverlay(true, 'Fetching form data...');
        
        // Initial delay to ensure loading overlay is visible
        await new Promise(resolve => setTimeout(resolve, 800));

        const response = await fetch(`/api/forms/${formId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load form');
        }

        const { form: formData } = data;
        
        // Loading form fields with delay
        toggleLoadingOverlay(true, 'Loading form fields...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set basic form fields with animation
        for (const field of ['title', 'category', 'subcategory']) {
            const element = document.getElementById(field);
            if (element && formData[field]) {
                element.value = formData[field];
                element.classList.add('animate__animated', 'animate__fadeIn');
                await new Promise(resolve => setTimeout(() => {
                    element.classList.remove('animate__animated', 'animate__fadeIn');
                    resolve();
                }, 500));
            }
        }

        // Loading metadata with delay
        toggleLoadingOverlay(true, 'Loading metadata...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set metadata fields
        if (formData.category_metadata) {
            setMetadataFields('categoryMetadata', formData.category_metadata);
        }
        if (formData.subcategory_metadata) {
            setMetadataFields('subcategoryMetadata', formData.subcategory_metadata);
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
        toggleLoadingOverlay(true, 'Loading questions...');

        // Clear existing questions
        questionsContainer.innerHTML = '';
        
        // Add questions with animation
        for (const questionData of formData.questions) {
            const card = addQuestion();
            if (!card) continue;

            card.dataset.questionId = questionData.id;
            
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

            // Add animation to the card
            card.classList.add('animate__animated', 'animate__fadeInUp');
            await new Promise(resolve => setTimeout(() => {
                card.classList.remove('animate__animated', 'animate__fadeInUp');
                resolve();
            }, 500));
        }

        // Update UI elements
        updateQuestionsList();
        updateQuestionCount();
        
        // Final delay before hiding overlay
        await new Promise(resolve => setTimeout(resolve, 800));
        toggleLoadingOverlay(false);

        return true;
    } catch (error) {
        console.error('Error loading form:', error);
        showAlert('danger', `Error loading form: ${error.message}`);
        toggleLoadingOverlay(false);
        return false;
    }
}

// Rest of the utility functions...
export function updateQuestionsHeader() {
    const count = document.querySelectorAll('.question-card').length;
    const header = document.getElementById('questionsHeader');
    if (header) {
        header.textContent = `Questions (${count})`;
    }
}

export function updateQuestionCount() {
    const count = document.querySelectorAll('.question-card').length;
    const countDisplay = document.getElementById('questionCount');
    if (countDisplay) {
        countDisplay.textContent = count.toString();
    }
    return count;
}

export function updateQuestionsList() {
    const navList = document.getElementById('questionNavList');
    if (!navList) {
        console.error('Question navigation list not found');
        return;
    }
    
    const questions = document.querySelectorAll('.question-card');
    navList.innerHTML = '';
    
    questions.forEach((card, index) => {
        const reference = card.querySelector('.question-title')?.value || 'Undefined reference';
        const listItem = document.createElement('div');
        listItem.className = 'question-menu-item animate__animated animate__fadeInLeft';
        
        listItem.innerHTML = `
            <a href="#" class="question-menu-link">
                <i class="fas fa-chevron-right me-2"></i>
                <span>Question ${index + 1}: ${reference}</span>
            </a>
        `;
        
        listItem.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            card.scrollIntoView({ behavior: 'smooth' });
        });
        
        navList.appendChild(listItem);
    });
}

function setMetadataFields(containerId, metadata = {}) {
    const container = document.getElementById(containerId);
    const countDisplay = document.getElementById(`${containerId}Count`);
    
    if (!container || !countDisplay) {
        console.error(`Metadata container or count display not found for ${containerId}`);
        return;
    }

    const count = Object.keys(metadata).length;
    countDisplay.textContent = count.toString();
    container.innerHTML = '';
    
    Object.entries(metadata).forEach(([key, value], index) => {
        const field = document.createElement('div');
        field.className = 'input-group mb-2 animate__animated animate__fadeInRight';
        field.innerHTML = `
            <input type="text" class="form-control metadata-key" value="${key}" placeholder="Key">
            <input type="text" class="form-control metadata-value" value="${value}" placeholder="Value">
            <button type="button" class="btn btn-outline-danger remove-field">×</button>
        `;
        container.appendChild(field);
    });
}