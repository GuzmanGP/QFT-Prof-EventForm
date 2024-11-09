// init.js
import { addQuestion, validateQuestions } from './question.js';
import { validateForm } from './validation.js';
import { setupCounterButtons } from './metadataFields.js';
import { showAlert, updateQuestionsHeader } from './utils.js';

export function initializeForm() {
    const form = document.getElementById('formConfiguration');
    const addQuestionBtn = document.getElementById('addQuestion');
    const questionsContainer = document.getElementById('questions');

    // Add initial question if none exists
    if (!questionsContainer.querySelector('.question-card')) {
        addQuestion();
    }

    // Update questions header to reflect initial count
    updateQuestionsHeader();

    // Setup metadata counters
    const metadataSections = document.querySelectorAll('.metadata-section');
    for (let i = 0; i < metadataSections.length; i++) {
        const section = metadataSections[i];
        const container = section.querySelector('.metadata-container');
        const buttons = section.querySelectorAll('.counter-button');
        const display = section.querySelector('.counter-display');
        setupCounterButtons(buttons, container, display);
    }

    // Add question button handler
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', addQuestion);
    }

    // Form submission handler
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const questionsContainer = document.getElementById('questions');

    // Validate the entire form
    if (!validateForm(form)) return;

    // Get form data
    const formData = {
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        subcategory: document.getElementById('subcategory')?.value || '',
        category_metadata: getMetadataValues('categoryMetadata'),
        subcategory_metadata: getMetadataValues('subcategoryMetadata'),
        questions: getQuestionsData()
    };

    try {
        const response = await fetch('/api/forms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.success) {
            let message = 'Form saved successfully';
            if (!data.sheets_sync) {
                message += ' (Google Sheets sync failed - please check API permissions)';
            }
            showAlert('success', message);
            form.reset();
            questionsContainer.innerHTML = '';
            addQuestion();
        } else {
            throw new Error(data.error || 'Failed to save form');
        }
    } catch (error) {
        showAlert('danger', error.message);
    }
}

function getMetadataValues(containerId) {
    const metadata = {};
    const container = document.getElementById(containerId);
    if (!container) return metadata;

    const groups = container.querySelectorAll('.input-group');
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
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
    const questionsData = [];
    
    for (let i = 0; i < questions.length; i++) {
        const card = questions[i];
        const data = {
            reference: card.querySelector('.question-title').value,
            content: card.querySelector('.question-content').value,
            answer_type: card.querySelector('.answer-type').value,
            required: card.querySelector('.question-required').checked,
            question_metadata: {}
        };

        // Get question metadata
        const metadataGroups = card.querySelectorAll('.question-metadata .input-group');
        for (let j = 0; j < metadataGroups.length; j++) {
            const group = metadataGroups[j];
            const key = group.querySelector('.metadata-key')?.value?.trim();
            const value = group.querySelector('.metadata-value')?.value?.trim();
            if (key && value) {
                data.question_metadata[key] = value;
            }
        }

        // Get list options if applicable
        if (data.answer_type === 'list') {
            const options = card.querySelector('.list-options input').value;
            if (options) {
                data.options = options.split(',').map(opt => opt.trim()).filter(Boolean);
            }
        }

        // Get AI instructions if enabled
        const aiEnabled = card.querySelector('.question-ai')?.checked;
        if (aiEnabled) {
            data.ai_instructions = card.querySelector('.question-ai-instructions')?.value;
        }

        questionsData.push(data);
    }
    
    return questionsData;
}
