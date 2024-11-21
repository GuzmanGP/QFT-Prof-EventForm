// init.js
import { validateForm } from './validation.js';
import { setupCounterButtons } from './metadataFields.js';
import { 
    showAlert, 
    toggleLoadingOverlay,
    setMetadataFields,
    showErrorState,
    loadForm 
} from './utils.js';

export async function initializeForm() {
    const form = document.getElementById('formConfiguration');
    const eventDatesContainer = document.getElementById('eventDates');
    const addDateButton = document.getElementById('addEventDate');

    if (!form || !eventDatesContainer || !addDateButton) {
        throw new Error('Required form elements not found');
    }

    try {
        // Load initial form data if available
        if (window.initialFormData) {
            console.debug('Initial form data found:', window.initialFormData);
            await loadForm(window.initialFormData);
        } else {
            console.debug('No initial form data, adding empty question');
            // Initialize event dates functionality
            initializeEventDates();
        }
        
        

        // Setup metadata counters with improved initialization and validation
        console.log('Starting metadata counters initialization...');
        
        // Ensure DOM is fully loaded
        if (document.readyState === 'loading') {
            console.log('DOM not fully loaded, waiting...');
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        console.log('DOM ready, setting up metadata counters...');
        const metadataSections = document.querySelectorAll('.metadata-section');
        console.log(`Found ${metadataSections.length} metadata sections`);
        
        if (metadataSections.length === 0) {
            console.warn('No metadata sections found in the document');
            return;
        }
        
        // Initialize all metadata sections
        for (const section of metadataSections) {
            try {
                const container = section.querySelector('.metadata-container');
                const buttons = section.querySelectorAll('.counter-button');
                const display = section.querySelector('.counter-display');
                
                if (!container || !buttons || !display) {
                    console.error('Missing required elements for metadata section');
                    continue;
                }
                
                setupCounterButtons(Array.from(buttons), container, display);
                console.log(`Successfully initialized counter for ${container.id}`);
            } catch (error) {
                console.error('Error initializing metadata section:', error);
            }
        }

        // Form submission handler
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // Add reset button handler
        const resetButton = form?.querySelector('button[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                console.debug('Form reset initiated');
                // Clear all option tags
                document.querySelectorAll('.options-list').forEach(list => {
                    list.innerHTML = '';
                });
                
                // Reset all answer type selects and hide list options
                document.querySelectorAll('.answer-type').forEach(select => {
                    select.value = 'text';
                    const listOptions = select.closest('.card-body')?.querySelector('.list-options');
                    if (listOptions) {
                        listOptions.classList.add('d-none');
                        listOptions.classList.remove('animate__fadeIn');
                    }
                });
                
                // Update questions menu references
                setTimeout(() => {
                    updateQuestionsList();
                    updateQuestionCount();
                }, 100);
            });
        }
    } catch (error) {
        console.error('Error in initializeForm:', error);
        const errorMessage = error.message.includes('Form not found') ?
            'The requested form could not be found. Creating a new form instead.' :
            error.message;
        
        showErrorState(questionsContainer, errorMessage);
        
        // If form not found, create a new form
        if (error.message.includes('Form not found')) {
            await addQuestion();
            updateQuestionCount();
            updateQuestionsList();
        }
        
        throw error;
    }
}

export async function loadInitialFormData(formData) {
    try {
        console.debug('Loading initial form data:', formData);
        toggleLoadingOverlay(true, 'Loading form data...');
        
        // Set basic fields
        ['title', 'category', 'subcategory'].forEach(field => {
            const element = document.getElementById(field);
            if (element && formData[field]) {
                element.value = formData[field];
            }
        });

        // Clear and prepare questions container
        const questionsContainer = document.getElementById('questions');
        if (!questionsContainer) {
            throw new Error('Questions container not found');
        }
        questionsContainer.innerHTML = '';

        // Add questions with improved error handling
        if (formData.questions && Array.isArray(formData.questions)) {
            console.debug('Processing questions:', formData.questions);
            for (const questionData of formData.questions) {
                try {
                    const card = await addQuestion(questionData);
                    if (!card) {
                        throw new Error('Failed to create question card');
                    }
                } catch (error) {
                    console.error('Error adding question:', error);
                    showAlert('danger', `Failed to load question: ${error.message}`);
                }
            }
        }

        // Update UI
        updateQuestionsList();
        updateQuestionCount();
        toggleLoadingOverlay(false);
    } catch (error) {
        console.error('Error loading form data:', error);
        showAlert('danger', `Error loading form: ${error.message}`);
        showErrorState(questionsContainer, error.message, formData?.id);
        toggleLoadingOverlay(false);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm(e.target)) {
        return;
    }

    const form = e.target;
    
    try {
        // Get and validate metadata values
        const categoryMetadata = validateAndGetMetadata('categoryMetadata');
        const subcategoryMetadata = validateAndGetMetadata('subcategoryMetadata');
        
        if (!categoryMetadata.isValid || !subcategoryMetadata.isValid) {
            showAlert('danger', 'Please fix metadata validation errors before submitting');
            return false;
        }
        
        // Update hidden inputs with validated metadata
        document.getElementById('categoryMetadataInput').value = JSON.stringify(categoryMetadata.data);
        document.getElementById('subcategoryMetadataInput').value = JSON.stringify(subcategoryMetadata.data);
        
        // Get and validate questions data
        const questionsData = getQuestionsData();
        if (!questionsData.length) {
            showAlert('danger', 'At least one question is required');
            return;
        }
        
        // Update hidden input with questions data
        const questionsInput = document.getElementById('questionsInput');
        if (!questionsInput) {
            throw new Error('Questions input element not found');
        }
        questionsInput.value = JSON.stringify(questionsData);

        // Show loading state
        const saveButton = form.querySelector('#saveButton');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        }

        // Submit form
        form.submit();
    } catch (error) {
        console.error('Error submitting form:', error);
        showAlert('danger', `Error submitting form: ${error.message}`);
        
        // Reset save button state
        const saveButton = form.querySelector('#saveButton');
        if (saveButton) {
            saveButton.disabled = false;
function validateAndGetMetadata(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        return { isValid: false, data: {}, errors: ['Container not found'] };
    }

    const metadata = {};
    const errors = [];
    let isValid = true;

    const groups = container.querySelectorAll('.input-group');
    for (const group of groups) {
        const keyInput = group.querySelector('.metadata-key');
        const valueInput = group.querySelector('.metadata-value');
        
        if (!keyInput || !valueInput) continue;

        const key = keyInput.value.trim();
        const value = valueInput.value.trim();

        // Validate key and value
        if (!key) {
            keyInput.classList.add('is-invalid');
            errors.push('Metadata key cannot be empty');
            isValid = false;
        }
        
        if (!value) {
            valueInput.classList.add('is-invalid');
            errors.push('Metadata value cannot be empty');
            isValid = false;
        }

        if (key && value) {
            metadata[key] = value;
        }
    }

    return { isValid, data: metadata, errors };
}
            saveButton.innerHTML = '<i class="fas fa-save me-2"></i>Save';
        }
    }
}

function getMetadataValues(containerId) {
    const metadata = {};
    const container = document.getElementById(containerId);
    if (!container) return metadata;

    const groups = container.querySelectorAll('.input-group');
    for (const group of groups) {
        const key = group.querySelector('.metadata-key')?.value?.trim();
        const value = group.querySelector('.metadata-value')?.value?.trim();
        if (key && value) {
            metadata[key] = value;
        }
    }
    return metadata;
}

function getQuestionsData() {
    const questions = document.querySelectorAll('.question-card');
    return Array.from(questions).map((card, index) => {
        const questionData = {
            id: card.dataset.questionId,
            reference: card.querySelector('.question-title')?.value || '',
            content: card.querySelector('.question-content')?.value || '',
            answer_type: card.querySelector('.answer-type')?.value || 'text',
            required: card.querySelector('.question-required')?.checked || false,
            question_metadata: getQuestionMetadata(card),
            order: index + 1
        };

        // Add options for list type questions
        if (questionData.answer_type === 'list') {
            const optionsList = card.querySelector('.options-list');
            const optionTags = optionsList?.querySelectorAll('.option-tag');
            if (optionTags?.length > 0) {
                questionData.options = Array.from(optionTags).map(tag => 
                    tag.querySelector('.option-text').textContent
                );
            }
        }

        // Add AI instructions if enabled
        const aiEnabled = card.querySelector('.question-ai')?.checked;
        if (aiEnabled) {
            questionData.ai_instructions = card.querySelector('.question-ai-instructions')?.value;
        }

        return questionData;
    });
}

function getQuestionMetadata(card) {
    const metadata = {};
    const metadataGroups = card.querySelectorAll('.question-metadata .input-group');
    
    for (const group of metadataGroups) {
        const key = group.querySelector('.metadata-key')?.value?.trim();
        const value = group.querySelector('.metadata-value')?.value?.trim();
        if (key && value) {
            metadata[key] = value;
        }
    }
    return metadata;
}