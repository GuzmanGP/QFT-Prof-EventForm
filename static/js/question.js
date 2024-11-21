// question.js

import { updateMetadataFields, addMetadataField } from './metadataFields.js';
import { 
    updateQuestionCount, 
    showAlert, 
    updateQuestionsList,
    toggleLoadingOverlay,
    showErrorState
} from './utils.js';
import { showFieldError, clearFieldError, validateQuestion } from './validationUtils.js';

// Function to update question numbers after removal
function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-card');
    questions.forEach((card, index) => {
        const numberElement = card.querySelector('.question-number');
        if (numberElement) {
            numberElement.classList.add('animate__animated', 'animate__pulse');
            numberElement.textContent = `Question ${index + 1}`;
            setTimeout(() => numberElement.classList.remove('animate__animated', 'animate__pulse'), 1000);
        }
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

function setupListOptions(card) {
    const optionsInput = card.querySelector('.options-input');
    const optionsList = card.querySelector('.options-list');
    
    if (!optionsInput || !optionsList) {
        console.error('Required options elements not found');
        return;
    }
    
    // Handle option addition via Enter key
    optionsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = optionsInput.value.trim();
            if (value) {
                addOptionToList(value, optionsList);
                optionsInput.value = '';
            }
        }
    });

    // Add event delegation for remove option
    optionsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-option')) {
            const optionTag = e.target.closest('.option-tag');
            if (optionTag) {
                optionTag.classList.add('animate__fadeOut');
                setTimeout(() => {
                    optionTag.remove();
                }, 300);
            }
        }
    });
}

function addOptionToList(value, list) {
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
}

function addQuestion(questionData = null) {
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

        // First append the card to the DOM
        const questionsContainer = document.getElementById('questions');
        if (!questionsContainer) {
            throw new Error('Questions container not found');
        }
        questionsContainer.appendChild(card);

        // Update question number after appending
        const questions = questionsContainer.querySelectorAll('.question-card');
        const questionNumber = questions.length;
        const numberElement = card.querySelector('.question-number');
        if (numberElement) {
            numberElement.textContent = `Question ${questionNumber}`;
        }

        // Initialize functionality
        initializeMetadataCounter(card);
        configureAnswerTypeChange(card);
        configureAIProcessing(card);
        setupQuestionValidation(card);
        setupListOptions(card);

        // If question data is provided, populate the fields
        if (questionData) {
            try {
                // Use requestAnimationFrame to ensure DOM is ready
                requestAnimationFrame(() => {
                    // Get all required fields first
                    const fields = {
                        title: card.querySelector('.question-title'),
                        content: card.querySelector('.question-content'),
                        answerType: card.querySelector('.answer-type'),
                        required: card.querySelector('.question-required'),
                        aiCheckbox: card.querySelector('.question-ai'),
                        aiInstructions: card.querySelector('.ai-instructions'),
                        aiTextarea: card.querySelector('.ai-instructions textarea')
                    };

                    // Validate all required fields exist
                    const missingFields = Object.entries(fields)
                        .filter(([key, element]) => !element)
                        .map(([key]) => key);

                    if (missingFields.length > 0) {
                        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                    }

                    // Set basic fields with error handling
                    try {
                        fields.title.value = questionData.reference || '';
                        fields.content.value = questionData.content || '';
                        fields.answerType.value = questionData.answer_type || 'text';
                        fields.required.checked = Boolean(questionData.required);

                        // Handle list type
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
                            fields.aiCheckbox.checked = true;
                            fields.aiInstructions.style.display = 'block';
                            fields.aiTextarea.value = questionData.ai_instructions;
                        }

                        // Handle metadata with improved validation
                        const container = card.querySelector('.question-metadata');
                        const display = card.querySelector('.question-meta-count');
                        
                        if (container && display) {
                            // Clear existing metadata fields first
                            container.innerHTML = '';
                            
                            let metadata = {};
                            
                            // Validate and parse metadata
                            if (questionData?.question_metadata) {
                                try {
                                    metadata = typeof questionData.question_metadata === 'string' 
                                        ? JSON.parse(questionData.question_metadata) 
                                        : questionData.question_metadata;
                                        
                                    if (typeof metadata !== 'object' || Array.isArray(metadata)) {
                                        console.warn('Invalid metadata format, defaulting to empty object');
                                        metadata = {};
                                    }
                                } catch (error) {
                                    console.warn('Error parsing metadata:', error);
                                    metadata = {};
                                }
                            }
                            
                            const count = Object.keys(metadata).length;
                            display.textContent = count.toString();
                            
                            // Add metadata fields with delay and validation
                            Object.entries(metadata).forEach(([key, value], index) => {
                                if (key && value !== undefined && value !== null) {
                                    setTimeout(() => {
                                        addMetadataField(container, key.toString(), value.toString());
                                    }, index * 100);
                                }
                            });
                        }
                    } catch (fieldError) {
                        console.error('Error setting field values:', fieldError);
                        showAlert('warning', `Error setting field values: ${fieldError.message}`);
                    }
                });
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

        return card;
    } catch (error) {
        console.error('Error creating question:', error);
        showAlert('danger', `Failed to create question: ${error.message}`);
        return null;
    }
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

    // Handle required checkbox separately to avoid null issues
    const requiredCheckbox = card.querySelector('.question-required');
    if (requiredCheckbox) {
        requiredCheckbox.addEventListener('input', () => {
            if (requiredCheckbox.classList.contains('is-invalid')) {
                clearFieldError(requiredCheckbox);
            }
        });
    }

    // Validate other fields
    Object.entries(fields).forEach(([key, field]) => {
        if (field) {
            field.addEventListener('input', () => {
                if (field.classList.contains('is-invalid')) {
                    clearFieldError(field);
                }
            });
        }
    });

    // Update question list when reference changes
    if (fields.reference) {
        fields.reference.addEventListener('input', () => {
            updateQuestionsList();
        });
    }
}

// Function to validate questions (removed export keyword)
function validateQuestions() {
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

// Export functions at the bottom of the file
export {
    addQuestion,
    validateQuestions,
    updateQuestionNumbers,
    configureAIProcessing,
    setupListOptions,
    addOptionToList
};