// utils.js
import { clearFieldError } from './validationUtils.js';
import { addQuestion } from './question.js';

// Export declarations
export { showAlert, toggleLoadingOverlay, loadForm, updateQuestionsHeader, updateQuestionCount, updateQuestionsList };

// Function to show alerts in the interface
function showAlert(type, message) {
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

// Function to show/hide loading overlay with enhanced animations
function toggleLoadingOverlay(show = true, message = 'Loading form data...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = overlay?.querySelector('.loading-text');
    
    if (!overlay || !loadingText) {
        console.error('Loading overlay elements not found');
        return;
    }
    
    if (show) {
        overlay.style.display = 'flex';  // Use flex instead of block
        overlay.classList.remove('d-none');
        loadingText.textContent = message;
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
    } else {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.classList.add('d-none');
            overlay.style.display = 'none';
        }, 300);
    }
}

// Function to load form data
async function loadForm(formId) {
    try {
        const questionsContainer = document.getElementById('questions');
        if (!questionsContainer) {
            throw new Error('Questions container not found');
        }

        toggleLoadingOverlay(true, 'Initializing form load...');
        await new Promise(resolve => setTimeout(resolve, 500));

        toggleLoadingOverlay(true, 'Fetching form data...');
        const response = await fetch(`/api/forms/${formId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load form');
        }

        const { form: formData } = data;
        
        toggleLoadingOverlay(true, 'Processing form fields...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set basic form fields with animation
        for (const field of ['title', 'category', 'subcategory']) {
            const element = document.getElementById(field);
            if (element && formData[field]) {
                element.value = formData[field];
                element.classList.add('animate__animated', 'animate__fadeIn');
                await new Promise(resolve => setTimeout(() => {
                    element.classList.remove('animate__animated', 'animate__fadeIn');
                    resolve();
                }, 300));
            }
        }

        toggleLoadingOverlay(true, 'Loading metadata...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set metadata fields
        if (formData.category_metadata) {
            setMetadataFields('categoryMetadata', formData.category_metadata);
        }
        if (formData.subcategory_metadata) {
            setMetadataFields('subcategoryMetadata', formData.subcategory_metadata);
        }
        
        toggleLoadingOverlay(true, 'Loading questions...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Clear existing questions
        questionsContainer.innerHTML = '';
        
        // Add questions with animation and maintain order
        const sortedQuestions = formData.questions.sort((a, b) => (a.order || 0) - (b.order || 0));
        for (const questionData of sortedQuestions) {
            const card = addQuestion();
            if (!card) continue;

            // Set question ID
            card.dataset.questionId = questionData.id;
            card.dataset.order = questionData.order || 0;
            
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

            card.classList.add('animate__animated', 'animate__fadeInUp');
            await new Promise(resolve => setTimeout(() => {
                card.classList.remove('animate__animated', 'animate__fadeInUp');
                resolve();
            }, 300));
        }

        // Update UI elements
        updateQuestionsList();
        updateQuestionCount();
        
        toggleLoadingOverlay(true, 'Finalizing...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toggleLoadingOverlay(false);
        return true;
    } catch (error) {
        console.error('Error loading form:', error);
        showAlert('danger', `Error loading form: ${error.message}`);
        toggleLoadingOverlay(false);
        return false;
    }
}

// Function to update questions header
function updateQuestionsHeader() {
    const count = document.querySelectorAll('.question-card').length;
    const header = document.getElementById('questionsHeader');
    if (header) {
        header.textContent = `Questions (${count})`;
    }
}

// Function to update question count
function updateQuestionCount() {
    const count = document.querySelectorAll('.question-card').length;
    const countDisplay = document.getElementById('questionCount');
    if (countDisplay) {
        countDisplay.textContent = count.toString();
    }
    return count;
}

// Function to update questions list
function updateQuestionsList() {
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

// Function to set metadata fields
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
