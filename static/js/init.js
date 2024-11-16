// init.js

import { addQuestion } from './question.js';
import { validateForm } from './validation.js';
import { setupCounterButtons } from './metadataFields.js';
import { updateQuestionsHeader, updateQuestionCount, showAlert, updateQuestionsList, loadForm } from './utils.js';

export function initializeForm() {
    // Initialize Bootstrap Modal
    const formListModal = document.getElementById('formListModal');
    const bsModal = new bootstrap.Modal(formListModal);

    const form = document.getElementById('formConfiguration');
    const addQuestionBtn = document.getElementById('addQuestion');
    const questionsList = document.getElementById('questions');

    // Add initial question if none exists
    if (!questionsList.querySelector('.question-card')) {
        setTimeout(() => {
            addQuestion();
            updateQuestionCount();
            updateQuestionsList();
        }, 100);
    }

    // Add question button handler
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => {
            addQuestion();
            updateQuestionCount();
            updateQuestionsList();
        });
    }

    // Setup back to menu button
    document.querySelector('.back-to-menu')?.addEventListener('click', () => {
        document.getElementById('questionsList').scrollIntoView({ behavior: 'smooth' });
    });

    // Setup form load functionality with enhanced error handling
    const loadFormButtons = document.querySelectorAll('.load-form');
    loadFormButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const formId = button.getAttribute('data-form-id');
            if (!formId) {
                showAlert('danger', 'Invalid form ID');
                return;
            }

            try {
                const success = await loadForm(formId);
                if (success) {
                    bsModal.hide();
                    showAlert('success', 'Form loaded successfully');
                }
            } catch (error) {
                console.error('Error loading form:', error);
                showAlert('danger', `Error loading form: ${error.message}`);
            }
        });
    });

    // Setup metadata counters
    const metadataSections = document.querySelectorAll('.metadata-section');
    for (const section of metadataSections) {
        const container = section.querySelector('.metadata-container');
        const buttons = section.querySelectorAll('.counter-button');
        const display = section.querySelector('.counter-display');
        setupCounterButtons(buttons, container, display);
    }

    // Form submission handler
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Add reset button handler
    const resetButton = form?.querySelector('button[type="reset"]');
    if (resetButton) {
        form.addEventListener('reset', (e) => {
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
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm(e.target)) {
        return;
    }

    const form = e.target;
    
    // Get form data
    const formData = new FormData(form);
    
    // Get metadata values
    const categoryMetadata = getMetadataValues('categoryMetadata');
    const subcategoryMetadata = getMetadataValues('subcategoryMetadata');
    
    // Update hidden inputs with metadata
    document.getElementById('categoryMetadataInput').value = JSON.stringify(categoryMetadata);
    document.getElementById('subcategoryMetadataInput').value = JSON.stringify(subcategoryMetadata);
    
    // Get questions data
    const questionsData = getQuestionsData();
    document.getElementById('questionsInput').value = JSON.stringify(questionsData);

    // Submit the form
    form.submit();
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
    return Array.from(questions).map((card, index) => ({
        id: card.dataset.questionId, // Add question ID if it exists
        reference: card.querySelector('.question-title').value,
        content: card.querySelector('.question-content').value,
        answer_type: card.querySelector('.answer-type').value,
        required: card.querySelector('.question-required').checked,
        question_metadata: getQuestionMetadata(card),
        order: index + 1,
        ...getQuestionOptions(card)
    }));
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

function getQuestionOptions(card) {
    const options = {};
    
    if (card.querySelector('.answer-type').value === 'list') {
        const optionsList = card.querySelector('.options-list');
        const optionTags = optionsList?.querySelectorAll('.option-tag');
        if (optionTags?.length > 0) {
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