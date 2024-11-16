// question.js

import { updateMetadataFields, addMetadataField } from './metadataFields.js';
import { updateQuestionCount, showAlert } from './utils.js';
import { showFieldError, clearFieldError, validateQuestion } from './validationUtils.js';

// Function to update question numbers after removal
function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-card');
    questions.forEach((card, index) => {
        const numberElement = card.querySelector('.question-number');
        numberElement.classList.add('animate__animated', 'animate__pulse');
        numberElement.textContent = `Question ${index + 1}`;
        setTimeout(() => numberElement.classList.remove('animate__animated', 'animate__pulse'), 1000);
    });
}

// Function to configure AI Processing
function configureAIProcessing(card) {
    const aiCheckbox = card.querySelector('.question-ai');
    const aiInstructions = card.querySelector('.ai-instructions');
    
    aiCheckbox.addEventListener('change', function() {
        if (this.checked) {
            aiInstructions.style.display = 'block';
            aiInstructions.classList.add('animate__animated', 'animate__fadeIn');
        } else {
            aiInstructions.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                aiInstructions.style.display = 'none';
                aiInstructions.classList.remove('animate__animated', 'animate__fadeOut');
            }, 500);
        }
    });
}

// Function to initialize metadata counter
function initializeMetadataCounter(card) {
    const metadataSection = card.querySelector('.metadata-section');
    const container = metadataSection.querySelector('.question-metadata');
    const buttons = metadataSection.querySelectorAll('.counter-button');
    const display = metadataSection.querySelector('.counter-display');
    
    // Remove any existing event listeners
    buttons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    
    // Get fresh references after replacing buttons
    const newButtons = metadataSection.querySelectorAll('.counter-button');
    
    newButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentCount = parseInt(display.textContent);
            const isIncrease = button.classList.contains('increase-count');
            const newCount = isIncrease ? currentCount + 1 : Math.max(0, currentCount - 1);
            
            if (newCount <= 20) {
                if (isIncrease && container.children.length < newCount) {
                    addMetadataField(container);
                    display.textContent = newCount;
                } else if (!isIncrease && container.children.length > 0) {
                    const lastField = container.lastChild;
                    if (lastField && lastField.parentNode === container) {
                        lastField.classList.add('animate__fadeOutRight');
                        setTimeout(() => {
                            if (lastField.parentNode === container) {
                                container.removeChild(lastField);
                                display.textContent = newCount;
                            }
                        }, 500);
                    }
                }
            }
        });
    });
}

function configureAnswerTypeChange(card) {
    const typeSelect = card.querySelector('.answer-type');
    const listOptions = card.querySelector('.list-options');
    
    typeSelect.addEventListener('change', function() {
        const isListType = this.value === 'list';
        
        if (isListType) {
            listOptions.classList.remove('d-none');
            listOptions.classList.add('animate__animated', 'animate__fadeIn');
        } else {
            listOptions.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                listOptions.classList.remove('animate__animated', 'animate__fadeOut');
                listOptions.classList.add('d-none');
            }, 500);
        }
        
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

// Add setupListOptions function
function setupListOptions(card) {
    const optionsInput = card.querySelector('.options-input');
    const optionsList = card.querySelector('.options-list');
    
    optionsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = optionsInput.value.trim();
            
            if (value) {
                const optionTag = document.createElement('div');
                optionTag.className = 'option-tag animate__animated animate__fadeIn';
                optionTag.innerHTML = `
                    <span class="option-text">${value}</span>
                    <span class="remove-option">&times;</span>
                `;
                
                optionTag.querySelector('.remove-option').addEventListener('click', () => {
                    optionTag.classList.add('animate__fadeOut');
                    setTimeout(() => optionTag.remove(), 300);
                });
                
                optionsList.appendChild(optionTag);
                optionsInput.value = '';
            }
        }
    });
}

// Update getQuestionOptions function
function getQuestionOptions(card) {
    const options = {};
    
    if (card.querySelector('.answer-type').value === 'list') {
        const optionTags = card.querySelectorAll('.option-tag');
        if (optionTags.length > 0) {
            options.options = Array.from(optionTags).map(tag => 
                tag.querySelector('.option-text').textContent
            );
        }
    }
    
    const aiEnabled = card.querySelector('.question-ai')?.checked;
    if (aiEnabled) {
        options.ai_instructions = card.querySelector('.question-ai-instructions')?.value;
    }
    
    return options;
}

// Function to add a new question to the form
export function addQuestion(questionData = null) {
    const template = document.getElementById('questionTemplate');
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.card');
    
    // Add animation class to new question card
    card.classList.add('animate__animated', 'animate__fadeInUp');
    
    // Generate unique ID for collapse
    const uniqueId = 'question_' + Date.now();
    const contentDiv = card.querySelector('[id^="questionContent"]');
    const header = card.querySelector('.card-header');
    
    contentDiv.id = uniqueId;
    header.setAttribute('data-bs-target', '#' + uniqueId);

    // Update question number
    const questionNumber = updateQuestionCount() + 1;
    card.querySelector('.question-number').textContent = `Question ${questionNumber}`;

    // Initialize all functionality
    initializeMetadataCounter(card);
    configureAnswerTypeChange(card);
    configureAIProcessing(card);
    setupQuestionValidation(card);
    setupListOptions(card);

    // If question data is provided, populate the fields with animation
    if (questionData) {
        setTimeout(() => {
            card.querySelector('.question-title').value = questionData.reference;
            card.querySelector('.question-content').value = questionData.content;
            card.querySelector('.answer-type').value = questionData.answer_type;
            card.querySelector('.question-required').checked = questionData.required;
            
            if (questionData.answer_type === 'list' && questionData.options) {
                const listOptions = card.querySelector('.list-options');
                listOptions.classList.remove('d-none');
                
                // Add options as tags
                const optionsList = listOptions.querySelector('.options-list');
                questionData.options.forEach(opt => {
                    const optionTag = document.createElement('div');
                    optionTag.className = 'option-tag';
                    optionTag.innerHTML = `
                        <span class="option-text">${opt}</span>
                        <span class="remove-option">&times;</span>
                    `;
                    
                    optionTag.querySelector('.remove-option').addEventListener('click', () => {
                        optionTag.classList.add('animate__fadeOut');
                        setTimeout(() => optionTag.remove(), 300);
                    });
                    
                    optionsList.appendChild(optionTag);
                });
            }
            
            if (questionData.ai_instructions) {
                const aiCheckbox = card.querySelector('.question-ai');
                const aiInstructions = card.querySelector('.ai-instructions');
                aiCheckbox.checked = true;
                aiInstructions.style.display = 'block';
                aiInstructions.querySelector('textarea').value = questionData.ai_instructions;
            }
            
            // Set metadata with animation
            if (questionData.question_metadata) {
                const container = card.querySelector('.question-metadata');
                const display = card.querySelector('.question-meta-count');
                const count = Object.keys(questionData.question_metadata).length;
                display.textContent = count.toString();
                
                Object.entries(questionData.question_metadata).forEach(([key, value], index) => {
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
        }, 300);
    }

    // Add remove event with animation
    card.querySelector('.remove-question').addEventListener('click', function() {
        if (document.querySelectorAll('.question-card').length <= 1) {
            showAlert('warning', 'At least one question is required');
            return;
        }
        
        card.classList.add('animate__animated', 'animate__fadeOutDown');
        setTimeout(() => {
            card.remove();
            updateQuestionNumbers();
            updateQuestionsList();
            updateQuestionCount();
        }, 500);
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

    // Scroll to the new question header with animation
    const newQuestionHeader = card.querySelector('.card-header');
    if (newQuestionHeader) {
        setTimeout(() => {
            newQuestionHeader.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
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
            
            // Add shake animation to invalid card
            card.classList.add('animate__animated', 'animate__shakeX');
            setTimeout(() => card.classList.remove('animate__animated', 'animate__shakeX'), 1000);
        }
    }

    return { isValid, errors };
}
