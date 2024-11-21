// utils.js - Export functions first
export function smoothTransition(element, animationClass, duration = 300) {
    element.classList.add('animate__animated', animationClass);
    return new Promise(resolve => setTimeout(() => {
        element.classList.remove('animate__animated', animationClass);
        resolve();
    }, duration));
}

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

export function showErrorState(container, message, formId) {
    // Clear previous error states
    clearErrorState(container);
    
    // Create error message element with improved UI
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-state mt-3 animate__animated animate__fadeIn';
    errorDiv.innerHTML = `
        <div class="alert alert-danger">
            <h5 class="mb-2"><i class="fas fa-exclamation-triangle me-2"></i>Error Loading Form</h5>
            <p class="mb-2">${message}</p>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-light btn-sm retry-load">
                    <i class="fas fa-sync-alt me-1"></i>Retry
                </button>
                <button class="btn btn-outline-light btn-sm create-new">
                    <i class="fas fa-plus me-1"></i>Create New Form
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(errorDiv);
    
    // Add event listeners for retry and new form buttons
    const retryButton = errorDiv.querySelector('.retry-load');
    const newFormButton = errorDiv.querySelector('.create-new');
    
    if (retryButton) {
        retryButton.addEventListener('click', async () => {
            try {
                clearErrorState(container);
                showAlert('info', 'Retrying form load...');
                await loadForm(formId);
            } catch (error) {
                console.error('Error during retry:', error);
                showAlert('danger', 'Failed to retry loading form');
            }
        });
    }
    
    if (newFormButton) {
        newFormButton.addEventListener('click', () => {
            clearErrorState(container);
            window.location.href = '/';
        });
    }
}

export function clearErrorState(container) {
    const errorState = container.querySelector('.error-state');
    if (errorState) {
        errorState.classList.add('animate__fadeOut');
        setTimeout(() => errorState.remove(), 300);
    }
}

// Import dependencies
import { clearFieldError, validateFormData } from './validationUtils.js';
import { addQuestion } from './question.js';

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

export function updateQuestionCount() {
    const count = document.querySelectorAll('.question-card').length;
    const countDisplay = document.getElementById('questionCount');
    if (countDisplay) {
        countDisplay.textContent = count.toString();
    }
    return count;
}

export async function loadForm(formData) {
    if (!formData) {
        throw new Error('Invalid form data');
    }
    
    // Initialize form data
    console.debug('Initializing form data');
    
    // Extract formId properly whether it's a string/number or an object
    const formId = formData.id || formData;
    if (!formId) {
        throw new Error('Invalid form ID');
    }
    
    // Ensure proper URL construction
    const url = `/api/form/${formId}`;
    console.debug('Constructed URL:', url);
    
    try {
        const result = await attemptLoad(url);
        return result;
    } catch (error) {
        console.error('Error loading form:', error);
        throw error;
    }
}

async function attemptLoad(url, attempts = 3) {
    const questionsContainer = document.getElementById('questions');
    if (!questionsContainer) {
        throw new Error('Questions container not found');
    }

    toggleLoadingOverlay(true, 'Loading form...');

    for (let i = 1; i <= attempts; i++) {
        try {
            console.debug(`Attempting to load form from: ${url} (attempt ${i}/${attempts})`);
            const response = await fetch(url);
            
            if (response.status === 404) {
                throw new Error('Form not found. Please check the form ID and try again.');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.text();
            console.debug('Received response:', data);
            
            if (!data || data.trim() === '') {
                throw new Error('Empty response received');
            }
            
            const formData = JSON.parse(data);
            
            // Validate form data
            const validation = validateFormData(formData);
            if (!validation.isValid) {
                throw new Error('Invalid form data: ' + validation.errors.join(', '));
            }
            
            // Clear existing questions
            questionsContainer.innerHTML = '';
            
            // Add a new empty question if no questions exist
            if (!formData.questions || formData.questions.length === 0) {
                await addQuestion();
                updateQuestionCount();
                updateQuestionsList();
                toggleLoadingOverlay(false);
                return true;
            }
            
            // Set basic form fields with animation
            for (const field of ['title', 'category', 'subcategory']) {
                const element = document.getElementById(field);
                if (element && formData[field]) {
                    element.value = formData[field];
                    await smoothTransition(element, 'animate__fadeIn');
                }
            }

            // Validate and set metadata fields
            console.debug('Validating metadata fields...');
            
            // Validate category metadata
            if (formData.category_metadata !== undefined) {
                if (typeof formData.category_metadata === 'object' && !Array.isArray(formData.category_metadata)) {
                    console.debug('Setting category metadata:', formData.category_metadata);
                    setMetadataFields('categoryMetadata', formData.category_metadata);
                } else {
                    console.error('Invalid category metadata format:', formData.category_metadata);
                    showAlert('warning', 'Invalid category metadata format');
                }
            } else {
                console.debug('No category metadata found');
                setMetadataFields('categoryMetadata', {});
            }

            // Validate subcategory metadata
            if (formData.subcategory_metadata !== undefined) {
                if (typeof formData.subcategory_metadata === 'object' && !Array.isArray(formData.subcategory_metadata)) {
                    console.debug('Setting subcategory metadata:', formData.subcategory_metadata);
                    setMetadataFields('subcategoryMetadata', formData.subcategory_metadata);
                } else {
                    console.error('Invalid subcategory metadata format:', formData.subcategory_metadata);
                    showAlert('warning', 'Invalid subcategory metadata format');
                }
            } else {
                console.debug('No subcategory metadata found');
                setMetadataFields('subcategoryMetadata', {});
            }

            // Add questions with animation
            if (formData.questions && Array.isArray(formData.questions)) {
                const sortedQuestions = formData.questions.sort((a, b) => (a.order || 0) - (b.order || 0));
                for (const questionData of sortedQuestions) {
                    await addQuestion(questionData);
                }
            }

            // Update UI elements
            updateQuestionsList();
            updateQuestionCount();
            toggleLoadingOverlay(false);
            clearErrorState(questionsContainer);
            return true;

        } catch (error) {
            console.error(`Error loading form (attempt ${i}/${attempts}):`, error);
            
            // If this is not the last attempt, wait and retry
            if (i < attempts) {
                showAlert('warning', `Loading failed (attempt ${i}/${attempts}). Retrying...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * i)); // Exponential backoff
                continue;
            }
            
            // On final attempt, show error state and throw
            toggleLoadingOverlay(false);
            const errorMsg = error.message.includes('Form not found') ? 
                error.message : 
                `Failed to load form after ${attempts} attempts: ${error.message}`;
            
            showErrorState(questionsContainer, errorMsg, formData?.id);
            throw new Error(errorMsg);
        }
    }
}

export function setMetadataFields(containerId, metadata = {}) {
    console.debug(`Setting metadata fields for ${containerId}:`, metadata);
    
    const container = document.getElementById(containerId);
    const countDisplay = document.querySelector(`#${containerId}Count`);
    const hiddenInput = document.getElementById(`${containerId}Input`);
    
    if (!container || !countDisplay) {
        console.error(`Metadata container or count display not found for ${containerId}`);
        return;
    }

    // Normalize metadata input
    let parsedMetadata = {};
    
    try {
        // Handle null, undefined, or empty cases
        if (metadata === null || metadata === undefined) {
            console.debug(`Null or undefined metadata for ${containerId}, using empty object`);
        } else {
            // Parse string metadata or use as-is if object
            parsedMetadata = typeof metadata === 'string' ? 
                JSON.parse(metadata) : 
                metadata;
                
            // Validate object structure
            if (typeof parsedMetadata !== 'object' || Array.isArray(parsedMetadata)) {
                console.warn(`Invalid metadata structure for ${containerId}, using empty object`);
                parsedMetadata = {};
            }
        }
    } catch (error) {
        console.warn(`Error processing metadata for ${containerId}:`, error);
        parsedMetadata = {};
    }

    try {
        // Clear container and initialize counters
        container.innerHTML = '';
        let validEntries = 0;
        const validatedMetadata = {};

        // Process each metadata entry with enhanced validation
        Object.entries(parsedMetadata).forEach(([key, value], index) => {
            // Enhanced key validation
            const processedKey = key?.toString().trim();
            if (!processedKey) {
                console.warn(`Skipping empty metadata key in ${containerId}`);
                return;
            }

            // Enhanced value validation with type coercion
            let processedValue = '';
            try {
                if (value !== null && value !== undefined) {
                    processedValue = value.toString().trim();
                }
            } catch (valueError) {
                console.warn(`Error processing value for key "${processedKey}":`, valueError);
                return;
            }

            try {
                // Create field with strict sanitization
                const field = document.createElement('div');
                field.className = 'input-group mb-2';
                
                const sanitizedKey = escapeHtml(processedKey);
                const sanitizedValue = escapeHtml(processedValue);
                
                // Add animation with delay based on index
                setTimeout(() => {
                    field.classList.add('animate__animated', 'animate__fadeInRight');
                }, index * 50);
                
                field.innerHTML = `
                    <input type="text" class="form-control metadata-key" value="${sanitizedKey}" placeholder="Key" required>
                    <input type="text" class="form-control metadata-value" value="${sanitizedValue}" placeholder="Value" required>
                    <button type="button" class="btn btn-outline-danger remove-field">×</button>
                `;

                // Enhanced validation handlers
                const keyInput = field.querySelector('.metadata-key');
                const valueInput = field.querySelector('.metadata-value');
                
                [keyInput, valueInput].forEach(input => {
                    // Add immediate validation
                    input.addEventListener('input', () => validateMetadataField(field));
                    // Add blur validation
                    input.addEventListener('blur', () => validateMetadataField(field));
                });

                // Add remove button handler
                const removeButton = field.querySelector('.remove-field');
                removeButton.addEventListener('click', () => {
                    field.classList.add('animate__fadeOutRight');
                    setTimeout(() => {
                        field.remove();
                        validEntries--;
                        countDisplay.textContent = validEntries.toString();
                        updateHiddenInput();
                    }, 300);
                });

                container.appendChild(field);
                validatedMetadata[sanitizedKey] = sanitizedValue;
                validEntries++;
            } catch (fieldError) {
                console.error(`Error creating metadata field for ${processedKey}:`, fieldError);
            }
        });

        // Update display counter
        countDisplay.textContent = validEntries.toString();
        
        // Update hidden input with validated data
        function updateHiddenInput() {
            if (hiddenInput) {
                const currentMetadata = {};
                container.querySelectorAll('.input-group').forEach(group => {
                    const key = group.querySelector('.metadata-key')?.value?.trim();
                    const value = group.querySelector('.metadata-value')?.value?.trim();
                    if (key && value) {
                        currentMetadata[key] = value;
                    }
                });
                hiddenInput.value = JSON.stringify(currentMetadata);
            }
        }
        
        updateHiddenInput();
        
        console.debug(`Successfully initialized ${validEntries} metadata fields for ${containerId}`);

    } catch (error) {
        console.error(`Error setting metadata fields for ${containerId}:`, error);
        showAlert('warning', `Error initializing metadata fields. Default values will be used.`);
        
        // Ensure clean state even after error
        container.innerHTML = '';
        countDisplay.textContent = '0';
        if (hiddenInput) {
            hiddenInput.value = '{}';
        }
    }
}

function validateMetadataField(field) {
    const keyInput = field.querySelector('.metadata-key');
    const valueInput = field.querySelector('.metadata-value');
    const isValid = keyInput.value.trim() !== '' && valueInput.value.trim() !== '';
    
    [keyInput, valueInput].forEach(input => {
        input.classList.toggle('is-invalid', !input.value.trim());
    });
    
    return isValid;
}

// Helper function to escape HTML special characters
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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
    
    // Add proper question metadata handling
    if (questionData.question_metadata && typeof questionData.question_metadata === 'object') {
        const container = card.querySelector('.question-metadata');
        const display = card.querySelector('.question-meta-count');
        
        if (container && display) {
            const metadata = questionData.question_metadata;
            const count = Object.keys(metadata).length;
            display.textContent = count.toString();
            
            // Clear existing metadata
            container.innerHTML = '';
            
            // Add metadata fields
            Object.entries(metadata).forEach(([key, value]) => {
                const field = document.createElement('div');
                field.className = 'input-group mb-2 animate__animated animate__fadeInRight';
                field.innerHTML = `
                    <input type="text" class="form-control metadata-key" value="${key}" placeholder="Key" required>
                    <input type="text" class="form-control metadata-value" value="${value}" placeholder="Value" required>
                    <button type="button" class="btn btn-outline-danger remove-field">×</button>
                `;
                container.appendChild(field);
            });
        }
    }

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