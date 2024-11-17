// question.js

import { updateMetadataFields, addMetadataField } from './metadataFields.js';
import { updateQuestionCount, showAlert, updateQuestionsList } from './utils.js';
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
    
    buttons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    
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

    fields.reference.addEventListener('input', () => {
        updateQuestionsList();
    });
}

function setupListOptions(card) {
    const optionsInput = card.querySelector('.options-input');
    const optionsList = card.querySelector('.options-list');
    const addButton = card.querySelector('.add-option-confirm');
    const modalElement = card.querySelector('#optionModal');
    
    if (!modalElement || !optionsInput || !optionsList || !addButton) {
        console.error('Required modal elements not found');
        return;
    }
    
    // Create modal instance
    const modal = new bootstrap.Modal(modalElement);
    
    // Focus and enable input when modal opens
    modalElement.addEventListener('show.bs.modal', () => {
        optionsInput.disabled = false;
        optionsInput.focus();
    });
    
    // Handle option addition via button click
    addButton.addEventListener('click', () => {
        const value = optionsInput.value.trim();
        if (value) {
            addOptionToList(value, optionsList, optionsInput);
            modal.hide();
        }
    });
    
    // Handle option addition via Enter key
    optionsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = optionsInput.value.trim();
            if (value) {
                addOptionToList(value, optionsList, optionsInput);
                modal.hide();
            }
        }
    });
    
    // Reset modal on hide
    modalElement.addEventListener('hidden.bs.modal', () => {
        optionsInput.value = '';
        optionsInput.disabled = false;
    });
}

function addOptionToList(value, list, input) {
    const existingOptions = Array.from(list.querySelectorAll('.option-text'))
        .map(opt => opt.textContent.toLowerCase());
    
    if (existingOptions.includes(value.toLowerCase())) {
        showAlert('warning', 'This option already exists');
        return;
    }
    
    const optionTag = document.createElement('div');
    optionTag.className = 'option-tag animate__animated animate__fadeIn';
    optionTag.innerHTML = `
        <span class="option-text">${value}</span>
        <span class="remove-option">&times;</span>
    `;
    
    list.appendChild(optionTag);
    if (input) {
        input.value = '';
    }
}

// Add event delegation for remove option
export function addQuestion(questionData = null) {
    try {
        const template = document.getElementById('questionTemplate');
        if (!template) {
            console.error('Question template not found');
            throw new Error('Question template not found');
        }
        
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.card');
        if (!card) {
            console.error('Card element not found in template');
            throw new Error('Card element not found in template');
        }

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

        // If question data is provided, populate the fields
        if (questionData) {
            try {
                setTimeout(() => {
                    const titleInput = card.querySelector('.question-title');
                    const contentInput = card.querySelector('.question-content');
                    const answerTypeSelect = card.querySelector('.answer-type');
                    const requiredCheckbox = card.querySelector('.question-required');
                    
                    if (titleInput) titleInput.value = questionData.reference || '';
                    if (contentInput) contentInput.value = questionData.content || '';
                    if (answerTypeSelect) answerTypeSelect.value = questionData.answer_type || 'text';
                    if (requiredCheckbox) requiredCheckbox.checked = questionData.required || false;
                    
                    if (questionData.answer_type === 'list' && questionData.options) {
                        const listOptions = card.querySelector('.list-options');
                        if (listOptions) {
                            listOptions.classList.remove('d-none');
                            
                            // Add options as tags
                            const optionsList = listOptions.querySelector('.options-list');
                            if (optionsList) {
                                questionData.options.forEach(opt => {
                                    const optionTag = document.createElement('div');
                                    optionTag.className = 'option-tag';
                                    optionTag.innerHTML = `
                                        <span class="option-text">${opt}</span>
                                        <span class="remove-option">&times;</span>
                                    `;
                                    optionsList.appendChild(optionTag);
                                });
                            }
                        }
                    }
                    
                    if (questionData.ai_instructions) {
                        const aiCheckbox = card.querySelector('.question-ai');
                        const aiInstructions = card.querySelector('.ai-instructions');
                        if (aiCheckbox && aiInstructions) {
                            aiCheckbox.checked = true;
                            aiInstructions.style.display = 'block';
                            const aiTextarea = aiInstructions.querySelector('textarea');
                            if (aiTextarea) {
                                aiTextarea.value = questionData.ai_instructions;
                            }
                        }
                    }
                    
                    // Set metadata
                    if (questionData.question_metadata) {
                        const container = card.querySelector('.question-metadata');
                        const display = card.querySelector('.question-meta-count');
                        if (container && display) {
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
                    }
                }, 300);
            } catch (populateError) {
                console.error('Error populating question data:', populateError);
                showAlert('warning', `Error populating question data: ${populateError.message}`);
            }
        }

        // Add remove event with animation
        const removeButton = card.querySelector('.remove-question');
        if (removeButton) {
            removeButton.addEventListener('click', function() {
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
        }

        // Add toggle icon rotation
        if (header) {
            header.addEventListener('click', () => {
                const icon = header.querySelector('.toggle-icon');
                if (icon && contentDiv) {
                    icon.style.transform = contentDiv.classList.contains('show') ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            });

            // Set initial rotation state
            const icon = header.querySelector('.toggle-icon');
            if (icon) {
                icon.style.transform = 'rotate(180deg)';
            }
        }

        const questionsContainer = document.getElementById('questions');
        if (questionsContainer) {
            questionsContainer.appendChild(card);
            updateQuestionsList();
            updateQuestionCount();
        }

        return card;
    } catch (error) {
        console.error('Error adding question:', error);
        showAlert('danger', `Failed to load question: ${error.message}`);
        return null;
    }
}

export function validateQuestions() {
    const questions = document.querySelectorAll('.question-card');
    const errors = [];
    let isValid = true;

    questions.forEach((card, index) => {
        const validation = validateQuestion(card);
        if (!validation.isValid) {
            errors.push(...validation.errors);
            isValid = false;
        }
    });

    return { isValid, errors };
}
