// question.js

import { updateMetadataFields, setupCounterButtons } from './metadataFields.js';
import { showAlert, clearFieldError } from './utils.js';
import { showFieldError } from './validationUtils.js';

// Function to update the questions menu
function updateQuestionsList() {
    const navList = document.getElementById('questionNavList');
    const questions = document.querySelectorAll('.question-card');
    
    navList.innerHTML = '';
    for (let i = 0; i < questions.length; i++) {
        const card = questions[i];
        const reference = `${card.querySelector('.question-title').value}` || `Undefined reference`;
        const full_reference = `Question ${i + 1}: ${card.querySelector('.question-title').value}` || `Question ${i + 1}`;
        const listItem = document.createElement('a');
        listItem.href = '#';
        listItem.className = 'list-group-item list-group-item-action';
        listItem.textContent = full_reference;
        listItem.addEventListener('click', (e) => {
            e.preventDefault();
            card.scrollIntoView({ behavior: 'smooth' });
        });
        navList.appendChild(listItem);
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
    const buttons = metadataSection.querySelectorAll('.counter-button');
    const display = metadataSection.querySelector('.counter-display');
    
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
export function addQuestion() {
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

    // Add back to menu event
    card.querySelector('.back-to-menu').addEventListener('click', () => {
        document.getElementById('questionsList').scrollIntoView({ behavior: 'smooth' });
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
}

export function validateQuestions() {
    const questions = document.querySelectorAll('.question-card');
    const errors = [];
    let isValid = true;

    for (let i = 0; i < questions.length; i++) {
        const card = questions[i];
        const reference = card.querySelector('.question-title');
        const content = card.querySelector('.question-content');
        const answerType = card.querySelector('.answer-type');
        const listOptions = card.querySelector('.list-options input');

        if (!reference.value.trim()) {
            showFieldError(reference, 'Question reference is required');
            errors.push(`Question ${i + 1}: Reference is required`);
            isValid = false;
        } else if (reference.value.length > 50) {
            showFieldError(reference, 'Reference must be less than 50 characters');
            errors.push(`Question ${i + 1}: Reference is too long`);
            isValid = false;
        }

        if (!content.value.trim()) {
            showFieldError(content, 'Question content is required');
            errors.push(`Question ${i + 1}: Content is required`);
            isValid = false;
        }

        if (answerType.value === 'list') {
            const options = listOptions.value.trim();
            if (!options || options.split(',').filter(opt => opt.trim()).length < 2) {
                showFieldError(listOptions, 'At least two comma-separated options are required');
                errors.push(`Question ${i + 1}: List options must contain at least two items`);
                isValid = false;
            }
        }
    }

    return { isValid, errors };
}
