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
    
    if (!aiCheckbox || !aiInstructions) {
        console.warn('AI processing elements not found');
        return;
    }
    
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

// Function to safely set field value
function safeSetField(element, value, isCheckbox = false) {
    if (!element) return false;
    
    try {
        if (isCheckbox) {
            element.checked = Boolean(value);
        } else {
            element.value = value || '';
        }
        return true;
    } catch (error) {
        console.warn('Error setting field value:', error);
        return false;
    }
}

// Function to initialize metadata counter
function initializeMetadataCounter(card) {
    const metadataSection = card.querySelector('.metadata-section');
    if (!metadataSection) {
        console.warn('Metadata section not found');
        return;
    }

    const container = metadataSection.querySelector('.question-metadata');
    const buttons = metadataSection.querySelectorAll('.counter-button');
    const display = metadataSection.querySelector('.counter-display');
    
    if (!container || !display) {
        console.warn('Required metadata elements not found');
        return;
    }
    
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
    
    if (!typeSelect || !listOptions) {
        console.warn('Answer type elements not found');
        return;
    }
    
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

    // Check if all required fields exist
    const missingFields = Object.entries(fields)
        .filter(([key, element]) => !element)
        .map(([key]) => key);
    
    if (missingFields.length > 0) {
        console.warn('Missing required fields:', missingFields);
        return;
    }

    for (const key in fields) {
        const field = fields[key];
        field.addEventListener('input', () => {
            if (field.classList.contains('is-invalid')) {
                clearFieldError(field);
            }
        });
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
        setTimeout(() => optionsInput.focus(), 500);
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
    if (!list) {
        console.error('Options list element not found');
        return;
    }

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
        
        if (!contentDiv || !header) {
            throw new Error('Required card elements not found');
        }

        contentDiv.id = uniqueId;
        header.setAttribute('data-bs-target', '#' + uniqueId);

        // Update question number
        const questionNumber = updateQuestionCount() + 1;
        const numberElement = card.querySelector('.question-number');
        if (numberElement) {
            numberElement.textContent = `Question ${questionNumber}`;
        }

        // Initialize all functionality
        initializeMetadataCounter(card);
        configureAnswerTypeChange(card);
        configureAIProcessing(card);
        setupQuestionValidation(card);
        setupListOptions(card);

        // If question data is provided, populate the fields
        if (questionData) {
            try {
                // Add the card to the DOM first
                const questionsContainer = document.getElementById('questions');
                if (!questionsContainer) {
                    throw new Error('Questions container not found');
                }
                questionsContainer.appendChild(card);

                // Wait for the next frame to ensure elements are properly rendered
                requestAnimationFrame(() => {
                    const fields = {
                        title: card.querySelector('.question-title'),
                        content: card.querySelector('.question-content'),
                        answerType: card.querySelector('.answer-type'),
                        required: card.querySelector('.question-required')
                    };

                    // Verify all required elements exist
                    const missingFields = Object.entries(fields)
                        .filter(([key, element]) => !element)
                        .map(([key]) => key);

                    if (missingFields.length > 0) {
                        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                    }

                    // Safely set field values
                    Object.entries(fields).forEach(([key, element]) => {
                        if (element) {
                            const value = key === 'required' ? questionData.required :
                                        key === 'answerType' ? questionData.answer_type || 'text' :
                                        questionData[key === 'title' ? 'reference' : 'content'];
                            
                            if (element.type === 'checkbox') {
                                element.checked = Boolean(value);
                            } else {
                                element.value = value || '';
                            }
                        }
                    });
                    
                    // Handle list type questions
                    if (questionData.answer_type === 'list' && Array.isArray(questionData.options)) {
                        const listOptions = card.querySelector('.list-options');
                        const optionsList = listOptions?.querySelector('.options-list');
                        
                        if (listOptions && optionsList) {
                            listOptions.classList.remove('d-none');
                            questionData.options.forEach(opt => {
                                if (opt && typeof opt === 'string') {
                                    addOptionToList(opt, optionsList);
                                }
                            });
                        }
                    }
                    
                    // Handle AI instructions
                    if (questionData.ai_instructions) {
                        const aiCheckbox = card.querySelector('.question-ai');
                        const aiInstructions = card.querySelector('.ai-instructions');
                        const aiTextarea = aiInstructions?.querySelector('textarea');

                        if (aiCheckbox && aiInstructions && aiTextarea) {
                            aiCheckbox.checked = true;
                            aiInstructions.style.display = 'block';
                            aiTextarea.value = questionData.ai_instructions;
                        }
                    }
                    
                    // Handle metadata
                    if (questionData.question_metadata && typeof questionData.question_metadata === 'object') {
                        const container = card.querySelector('.question-metadata');
                        const display = card.querySelector('.question-meta-count');
                        
                        if (container && display) {
                            const metadata = questionData.question_metadata;
                            const count = Object.keys(metadata).length;
                            display.textContent = count.toString();
                            
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
                    }
                });
            } catch (populateError) {
                console.error('Error populating question data:', populateError);
                showAlert('warning', `Error populating question data: ${populateError.message}`);
            }
        } else {
            // If no question data, just append the empty card
            const questionsContainer = document.getElementById('questions');
            if (questionsContainer) {
                questionsContainer.appendChild(card);
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
            const icon = header.querySelector('.toggle-icon');
            
            if (icon && contentDiv) {
                header.addEventListener('click', () => {
                    icon.style.transform = contentDiv.classList.contains('show') ? 'rotate(0deg)' : 'rotate(180deg)';
                });
                
                // Set initial rotation state
                icon.style.transform = 'rotate(180deg)';
            }
        }

        updateQuestionsList();
        updateQuestionCount();

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