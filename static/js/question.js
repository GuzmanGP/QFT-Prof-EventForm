// question.js

import { updateMetadataFields } from './metadataFields.js';
import { updateQuestionCount, showAlert } from './utils.js';
import { showFieldError, clearFieldError, validateQuestion } from './validationUtils.js';

// Function to update the questions menu
function updateQuestionsList() {
    const navList = document.getElementById('questionNavList');
    const questions = document.querySelectorAll('.question-card');
    
    navList.innerHTML = '';
    questions.forEach((card, index) => {
        const reference = card.querySelector('.question-title').value || 'Undefined reference';
        const full_reference = `Question ${index + 1}: ${reference}`;
        
        const listItem = document.createElement('div');
        listItem.className = 'question-menu-item';
        
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

// Function to update question numbers after removal
function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-card');
    questions.forEach((card, index) => {
        card.querySelector('.question-number').textContent = `Question ${index + 1}`;
    });
}

// Function to configure AI Processing
function configureAIProcessing(card) {
    const aiCheckbox = card.querySelector('.question-ai');
    const aiInstructions = card.querySelector('.ai-instructions');
    
    aiCheckbox.addEventListener('change', function() {
        aiInstructions.style.display = this.checked ? 'block' : 'none';
    });
}

// Function to initialize metadata counter
function initializeMetadataCounter(card) {
    const metadataSection = card.querySelector('.metadata-section');
    const container = metadataSection.querySelector('.metadata-container');
    let buttons = metadataSection.querySelectorAll('.counter-button');
    const display = metadataSection.querySelector('.counter-display');
    
    // Remove existing event listeners by cloning
    buttons.forEach(button => {
        const clone = button.cloneNode(true);
        button.parentNode.replaceChild(clone, button);
    });
    
    // Update buttons reference after cloning
    buttons = Array.from(container.querySelectorAll('.counter-button'));
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const currentCount = parseInt(display.textContent);
            const isIncrease = button.classList.contains('increase-count');
            const newCount = isIncrease ? currentCount + 1 : Math.max(0, currentCount - 1);
            
            if (newCount <= 20) {
                updateMetadataFields(container, newCount);
                display.textContent = newCount;
            }
        });
    });
}

function configureAnswerTypeChange(card) {
    const typeSelect = card.querySelector('.answer-type');
    const listOptions = card.querySelector('.list-options');
    
    typeSelect.addEventListener('change', function() {
        const isListType = this.value === 'list';
        listOptions.classList.toggle('d-none', !isListType);
        
        const input = listOptions.querySelector('input');
        input.required = isListType;
        
        if (!isListType && input.classList.contains('is-invalid')) {
            clearFieldError(input);
        }
    });
}

function setupQuestionValidation(card) {
    const fields = {
        reference: card.querySelector('.question-title'),
        content: card.querySelector('.question-content'),
        answerType: card.querySelector('.answer-type')
    };

    for (const key in fields) {
        const field = fields[key];
        if (field) {
            field.addEventListener('input', () => {
                if (field.classList.contains('is-invalid')) {
                    clearFieldError(field);
                }
            });
        }
    }

    // Add input event listener to update questions list when reference changes
    fields.reference.addEventListener('input', () => {
        updateQuestionsList();
    });
}

// Function to add a new question to the form
export function addQuestion(questionData = null) {
    const template = document.getElementById('questionTemplate');
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.card');
    
    // Generate unique ID for collapse
    const uniqueId = 'question_' + Date.now();
    const contentDiv = card.querySelector('[id^="questionContent"]');
    const header = card.querySelector('.card-header');
    
    contentDiv.id = uniqueId;
    header.setAttribute('data-bs-target', '#' + uniqueId);

    // Update question number
    const questionNumber = updateQuestionCount() + 1;
    card.querySelector('.question-number').textContent = `Question ${questionNumber}`;

    // Initialize metadata counter
    initializeMetadataCounter(card);
    configureAnswerTypeChange(card);
    configureAIProcessing(card);
    setupQuestionValidation(card);

    // If question data is provided, populate the fields
    if (questionData) {
        card.querySelector('.question-title').value = questionData.reference;
        card.querySelector('.question-content').value = questionData.content;
        card.querySelector('.answer-type').value = questionData.answer_type;
        card.querySelector('.question-required').checked = questionData.required;
        
        if (questionData.answer_type === 'list' && questionData.options) {
            const listOptions = card.querySelector('.list-options');
            listOptions.classList.remove('d-none');
            listOptions.querySelector('input').value = questionData.options.join(', ');
        }
        
        if (questionData.ai_instructions) {
            const aiCheckbox = card.querySelector('.question-ai');
            const aiInstructions = card.querySelector('.ai-instructions');
            aiCheckbox.checked = true;
            aiInstructions.style.display = 'block';
            aiInstructions.querySelector('textarea').value = questionData.ai_instructions;
        }
        
        // Set metadata
        if (questionData.question_metadata) {
            const container = card.querySelector('.question-metadata');
            const display = card.querySelector('.question-meta-count');
            const count = Object.keys(questionData.question_metadata).length;
            display.textContent = count.toString();
            
            Object.entries(questionData.question_metadata).forEach(([key, value]) => {
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
    }

    // Add remove event
    card.querySelector('.remove-question').addEventListener('click', function() {
        if (document.querySelectorAll('.question-card').length <= 1) {
            showAlert('warning', 'At least one question is required');
            return;
        }
        card.remove();
        updateQuestionNumbers();
        updateQuestionsList();
        updateQuestionCount();
    });

    // Add toggle icon rotation
    header.addEventListener('click', () => {
        const icon = header.querySelector('.toggle-icon');
        icon.style.transform = contentDiv.classList.contains('show') ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    // Set initial rotation state
    const icon = header.querySelector('.toggle-icon');
    icon.style.transform = 'rotate(180deg)';

    document.getElementById('questions').appendChild(card);
    updateQuestionsList();
    updateQuestionCount();

    // Scroll to the new question header
    const newQuestionHeader = card.querySelector('.card-header');
    if (newQuestionHeader) {
        newQuestionHeader.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

export function validateQuestions() {
    const questions = document.querySelectorAll('.question-card');
    const errors = [];
    let isValid = true;

    for (let i = 0; i < questions.length; i++) {
        const card = questions[i];
        const validationResult = validateQuestion(card);
        if (!validationResult.isValid) {
            errors.push(...validationResult.errors);
            isValid = false;
        }
    }

    return { isValid, errors };
}
