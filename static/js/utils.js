// utils.js - Export functions first
export function smoothTransition(element, animationClass, duration = 300) {
    element.classList.add('animate__animated', animationClass);
    return new Promise(resolve => setTimeout(() => {
        element.classList.remove('animate__animated', animationClass);
        resolve();
    }, duration));
}

export function showAlert(type, message) {
    const alertContainer = document.querySelector('.alert-container');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

export function showErrorState(container, message, formId) {
    // Clear previous error states
    clearErrorState(container);
    
    // Create error message element with improved UI
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-state mt-3 animate__animated animate__fadeIn';
    errorDiv.innerHTML = `
        <div class="alert alert-danger">
            <h5 class="mb-2"><i class="fas fa-exclamation-triangle me-2"></i>Error Loading Form</h5>
            <p class="mb-2">${message}</p>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-light btn-sm retry-load">
                    <i class="fas fa-sync-alt me-1"></i>Retry
                </button>
                <button class="btn btn-outline-light btn-sm create-new">
                    <i class="fas fa-plus me-1"></i>Create New Form
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(errorDiv);
    
    // Add event listeners for retry and new form buttons
    const retryButton = errorDiv.querySelector('.retry-load');
    const newFormButton = errorDiv.querySelector('.create-new');
    
    if (retryButton) {
        retryButton.addEventListener('click', async () => {
            try {
                clearErrorState(container);
                showAlert('info', 'Retrying form load...');
                await loadForm(formId);
            } catch (error) {
                console.error('Error during retry:', error);
                showAlert('danger', 'Failed to retry loading form');
            }
        });
    }
    
    if (newFormButton) {
        newFormButton.addEventListener('click', () => {
            clearErrorState(container);
            window.location.href = '/';
        });
    }
}

export function clearErrorState(container) {
    const errorState = container.querySelector('.error-state');
    if (errorState) {
        errorState.classList.add('animate__fadeOut');
        setTimeout(() => errorState.remove(), 300);
    }
}

// Import dependencies after exports but before function implementations
import { clearFieldError } from './validationUtils.js';
import { addQuestion } from './question.js';

export function toggleLoadingOverlay(show = true, message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = overlay?.querySelector('.loading-text');
    
    if (!overlay || !loadingText) {
        console.error('Loading overlay elements not found');
        return;
    }
    
    if (show) {
        overlay.style.display = 'flex';
        overlay.classList.remove('d-none');
        loadingText.textContent = message;
        overlay.classList.add('animate__animated', 'animate__fadeIn');
    } else {
        overlay.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            overlay.classList.remove('animate__animated', 'animate__fadeIn', 'animate__fadeOut');
            overlay.classList.add('d-none');
            overlay.style.display = 'none';
        }, 300);
    }
}

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

export async function loadForm(formId) {
    const questionsContainer = document.getElementById('questions');
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second delay between retries
    
    async function attemptLoad() {
        try {
            if (!questionsContainer) {
                throw new Error('Questions container not found');
            }

            toggleLoadingOverlay(true, 'Initializing form load...');
            await new Promise(resolve => setTimeout(resolve, 300));

            toggleLoadingOverlay(true, 'Fetching form data...');
            const response = await fetch(`/api/forms/${formId}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to load form');
            }

            const { form: formData } = data;
            console.log('Loaded form data:', formData); // Debug log
            
            // Set basic form fields with animation
            for (const field of ['title', 'category', 'subcategory']) {
                const element = document.getElementById(field);
                if (element && formData[field]) {
                    element.value = formData[field];
                    await smoothTransition(element, 'animate__fadeIn');
                }
            }

            // Set metadata fields
            if (formData.category_metadata) {
                setMetadataFields('categoryMetadata', formData.category_metadata);
            }
            if (formData.subcategory_metadata) {
                setMetadataFields('subcategoryMetadata', formData.subcategory_metadata);
            }
            
            // Clear existing questions
            questionsContainer.innerHTML = '';
            
            // Add questions with animation and maintain order
            if (formData.questions && Array.isArray(formData.questions)) {
                console.log('Processing questions:', formData.questions); // Debug log
                const sortedQuestions = formData.questions.sort((a, b) => (a.order || 0) - (b.order || 0));
                
                for (const questionData of sortedQuestions) {
                    console.log('Adding question:', questionData); // Debug log
                    addQuestion(questionData);
                }
            }

            // Update UI elements
            updateQuestionsList();
            updateQuestionCount();
            
            toggleLoadingOverlay(false);
            clearErrorState(questionsContainer);
            return true;
        } catch (error) {
            console.error(`Error loading form (attempt ${retryCount + 1}/${maxRetries}):`, error);
            
            if (retryCount < maxRetries - 1) {
                retryCount++;
                showAlert('warning', `Loading failed, retrying... (${retryCount}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return attemptLoad();
            } else {
                toggleLoadingOverlay(false);
                showErrorState(questionsContainer, `Failed to load form after ${maxRetries} attempts: ${error.message}`, formId);
                return false;
            }
        }
    }
    
    return attemptLoad();
}

export function setMetadataFields(containerId, metadata = {}) {
    const container = document.getElementById(containerId);
    const countDisplay = document.getElementById(`${containerId}Count`);
    
    if (!container || !countDisplay) {
        console.error(`Metadata container or count display not found for ${containerId}`);
        return;
    }

    const count = Object.keys(metadata).length;
    countDisplay.textContent = count.toString();
    container.innerHTML = '';
    
    Object.entries(metadata).forEach(([key, value]) => {
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

export function setQuestionFields(card, questionData) {
    // Set basic fields
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
                field.className = 'input-group mb-2 animate__animated animate__fadeInRight';
                field.innerHTML = `
                    <input type="text" class="form-control metadata-key" value="${key}" placeholder="Key">
                    <input type="text" class="form-control metadata-value" value="${value}" placeholder="Value">
                    <button type="button" class="btn btn-outline-danger remove-field">×</button>
                `;
                metadataContainer.appendChild(field);
            });
        }
    }
}

export async function getQuestionsData(formId) {
    try {
        toggleLoadingOverlay(true, 'Fetching form data...');
        const response = await fetch(`/api/forms/${formId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load form');
        }

        const { form: formData } = data;
        return formData;
    } catch (error) {
        console.error('Error loading form:', error);
        showAlert('danger', `Error loading form: ${error.message}`);
        toggleLoadingOverlay(false);
        return null;
    }
}