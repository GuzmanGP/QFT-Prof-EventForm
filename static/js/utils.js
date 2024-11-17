// utils.js - Export functions first
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

export function smoothTransition(element, animationClass, duration = 300) {
    element.classList.add('animate__animated', animationClass);
    return new Promise(resolve => setTimeout(() => {
        element.classList.remove('animate__animated', animationClass);
        resolve();
    }, duration));
}

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

// Import dependencies after exports
import { clearFieldError } from './validationUtils.js';
import { addQuestion } from './question.js';

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

export async function loadForm(formId) {
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
                await smoothTransition(element, 'animate__fadeIn');
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
            setQuestionFields(card, questionData);

            await smoothTransition(card, 'animate__fadeInUp');
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

export async function handleFormSubmit(formId, formElement) {
    try {
        const questionsContainer = document.getElementById('questions');
        if (!questionsContainer) {
            throw new Error('Questions container not found');
        }

        toggleLoadingOverlay(true, 'Submitting form data...');
        
        // Get form data
        const formData = new FormData(formElement);
        const questions = [];

        // Collect question data
        const questionCards = document.querySelectorAll('.question-card');
        for (const card of questionCards) {
            const questionId = card.dataset.questionId;
            const questionData = {
                id: questionId,
                order: card.dataset.order,
                reference: card.querySelector('.question-title').value,
                content: card.querySelector('.question-content').value,
                answer_type: card.querySelector('.answer-type').value,
                required: card.querySelector('.question-required').checked,
                ai_instructions: card.querySelector('.question-ai-instructions').value,
                options: [],
                question_metadata: {}
            };

            // Collect options for list type questions
            if (questionData.answer_type === 'list') {
                const optionsList = card.querySelector('.options-list');
                if (optionsList) {
                    const optionTags = optionsList.querySelectorAll('.option-tag');
                    for (const optionTag of optionTags) {
                        questionData.options.push(optionTag.querySelector('.option-text').textContent);
                    }
                }
            }

            // Collect question metadata
            const metadataFields = card.querySelectorAll('.question-metadata .input-group');
            for (const field of metadataFields) {
                const keyInput = field.querySelector('.metadata-key');
                const valueInput = field.querySelector('.metadata-value');
                if (keyInput && valueInput) {
                    questionData.question_metadata[keyInput.value] = valueInput.value;
                }
            }

            questions.push(questionData);
        }

        // Add question data to formData
        formData.append('questions', JSON.stringify(questions));

        // Submit form data to API
        const response = await fetch(`/api/forms/${formId}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to submit form');
        }

        // Handle success
        toggleLoadingOverlay(false);
        showAlert('success', data.message);
    } catch (error) {
        console.error('Error submitting form:', error);
        showAlert('danger', `Error submitting form: ${error.message}`);
        toggleLoadingOverlay(false);
    }
}
