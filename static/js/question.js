// question.js

import { updateMetadataFields, setupCounterButtons } from './metadataFields.js';
import { showAlert, updateQuestionCount, clearFieldError } from './utils.js';

// Function to update the questions menu
function updateQuestionsList() {
    const navList = document.getElementById('questionNavList');
    const questions = document.querySelectorAll('.question-card');
    
    navList.innerHTML = '';
    questions.forEach((card, index) => {
        const reference = card.querySelector('.question-title').value || `Question ${index + 1}`;
        const listItem = document.createElement('a');
        listItem.href = '#';
        listItem.className = 'list-group-item list-group-item-action';
        listItem.textContent = reference;
        listItem.addEventListener('click', (e) => {
            e.preventDefault();
            card.scrollIntoView({ behavior: 'smooth' });
        });
        navList.appendChild(listItem);
    });
}

// Function to add a new question to the form
export function addQuestion() {
    const template = document.getElementById('questionTemplate');
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.card');

    // Update question number
    const questionNumber = updateQuestionCount() + 1;
    card.querySelector('.question-number').textContent = `Question ${questionNumber}`;

    // Initialize metadata counter
    initializeMetadataCounter(card);
    configureAnswerTypeChange(card);
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
    });

    // Add back to menu event
    card.querySelector('.back-to-menu').addEventListener('click', () => {
        document.getElementById('questionsList').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('questions').appendChild(card);
    updateQuestionsList();
}

// Function to remove a question
export function removeQuestion(card) {
    if (document.querySelectorAll('.question-card').length <= 1) {
        showAlert('warning', 'At least one question is required');
        return;
    }
    card.remove();
    updateQuestionNumbers();
    updateQuestionsList();
}

function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-card');
    for (let i = 0; i < questions.length; i++) {
        questions[i].querySelector('.question-number').textContent = `Question ${i + 1}`;
    }
    updateQuestionCount();
}

function initializeMetadataCounter(card) {
    const metadataSection = card.querySelector('.metadata-section');
    const container = metadataSection.querySelector('.metadata-container');
    const buttons = metadataSection.querySelectorAll('.counter-button');
    const display = metadataSection.querySelector('.counter-display');
    setupCounterButtons(buttons, container, display);
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
    fields.reference.addEventListener('input', updateQuestionsList);
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
