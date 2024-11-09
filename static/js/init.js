// init.js

import { addQuestion, validateQuestions } from './question.js';
import { validateForm } from './validation.js';
import { setupCounterButtons } from './metadataFields.js';
import { showAlert } from './utils.js';

export function initializeForm() {
    const form = document.getElementById('formConfiguration');
    const addQuestionBtn = document.getElementById('addQuestion');

    // Add initial question if none exists
    const questionsContainer = document.getElementById('questions');
    if (!questionsContainer.querySelector('.question-card')) {
        addQuestion();
    }

    // Setup metadata counters
    document.querySelectorAll('.metadata-section').forEach(section => {
        const container = section.querySelector('.metadata-container');
        const buttons = section.querySelectorAll('.counter-button');
        const display = section.querySelector('.counter-display');
        setupCounterButtons(buttons, container, display);
    });

    // Add question button handler
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', addQuestion);
    }

    // Form submission handler
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validate the entire form
            if (!validateForm(form)) return;

            // Get form data
            const formData = {
                title: document.getElementById('title').value,
                category: document.getElementById('category').value,
                subcategory: document.getElementById('subcategory').value,
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
                    showAlert('success', 'Form saved successfully');
                    form.reset();
                    questionsContainer.innerHTML = '';
                    addQuestion();
                } else {
                    throw new Error(data.error || 'Failed to save form');
                }
            } catch (error) {
                showAlert('danger', error.message);
            }
        });
    }
}

function getMetadataValues(containerId) {
    const metadata = {};
    const container = document.getElementById(containerId);
    container.querySelectorAll('.input-group').forEach(group => {
        const key = group.querySelector('.metadata-key').value.trim();
        const value = group.querySelector('.metadata-value').value.trim();
        if (key && value) {
            metadata[key] = value;
        }
    });
    return metadata;
}

function getQuestionsData() {
    return Array.from(document.querySelectorAll('.question-card')).map(card => {
        const data = {
            reference: card.querySelector('.question-title').value,
            content: card.querySelector('.question-content').value,
            answer_type: card.querySelector('.answer-type').value,
            required: card.querySelector('.question-required').checked,
            question_metadata: {}
        };

        // Get question metadata
        card.querySelectorAll('.question-metadata .input-group').forEach(group => {
            const key = group.querySelector('.metadata-key').value.trim();
            const value = group.querySelector('.metadata-value').value.trim();
            if (key && value) {
                data.question_metadata[key] = value;
            }
        });

        // Get list options if applicable
        if (data.answer_type === 'list') {
            const options = card.querySelector('.list-options input').value;
            data.options = options.split(',').map(opt => opt.trim()).filter(Boolean);
        }

        // Get AI instructions if enabled
        const aiEnabled = card.querySelector('.question-ai').checked;
        if (aiEnabled) {
            data.ai_instructions = card.querySelector('.question-ai-instructions').value;
        }

        return data;
    });
}
