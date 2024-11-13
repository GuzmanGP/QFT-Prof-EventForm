// init.js

import { addQuestion } from './question.js';
import { validateForm } from './validation.js';
import { setupCounterButtons } from './metadataFields.js';
import { updateQuestionsHeader, updateQuestionCount, showAlert, loadForm } from './utils.js';

export function initializeForm() {
    const form = document.getElementById('formConfiguration');
    const addQuestionBtn = document.getElementById('addQuestion');
    const questionsList = document.getElementById('questions');

    // Add initial question if none exists
    if (!questionsList.querySelector('.question-card')) {
        addQuestion();
        updateQuestionCount();
    }

    // Add question button handler
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => {
            addQuestion();
            updateQuestionCount();
        });
    }

    // Setup back to menu button
    document.querySelector('.back-to-menu').addEventListener('click', () => {
        document.getElementById('questionsList').scrollIntoView({ behavior: 'smooth' });
    });

    // Setup metadata counters
    const metadataSections = document.querySelectorAll('.metadata-section');
    for (const section of metadataSections) {
        const container = section.querySelector('.metadata-container');
        const buttons = section.querySelectorAll('.counter-button');
        const display = section.querySelector('.counter-display');
        setupCounterButtons(buttons, container, display);
    }

    // Setup form loading
    document.querySelectorAll('.load-form').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const formId = button.getAttribute('data-form-id');
            const modal = bootstrap.Modal.getInstance(document.getElementById('formListModal'));
            
            if (await loadForm(formId)) {
                modal.hide();
                showAlert('success', 'Form loaded successfully');
            }
        });
    });

    // Form submission handler
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const questionsList = document.getElementById('questions');

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
            const summary = `Form "${formData.title}" saved successfully!\n` +
                           `Category: ${formData.category}\n` +
                           (formData.subcategory ? `Subcategory: ${formData.subcategory}\n` : '') +
                           `Questions: ${formData.questions.length}\n` +
                           `Metadata fields: ${Object.keys(formData.category_metadata).length + 
                                             Object.keys(formData.subcategory_metadata).length}`;
                           
            showAlert('success', summary);
            form.reset();
            questionsList.innerHTML = '';
            addQuestion();
            updateQuestionCount();
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
    return Array.from(questions).map(card => ({
        reference: card.querySelector('.question-title').value,
        content: card.querySelector('.question-content').value,
        answer_type: card.querySelector('.answer-type').value,
        required: card.querySelector('.question-required').checked,
        question_metadata: getQuestionMetadata(card),
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
        const optionsInput = card.querySelector('.list-options input').value;
        if (optionsInput) {
            options.options = optionsInput.split(',').map(opt => opt.trim()).filter(Boolean);
        }
    }

    const aiEnabled = card.querySelector('.question-ai')?.checked;
    if (aiEnabled) {
        options.ai_instructions = card.querySelector('.question-ai-instructions')?.value;
    }

    return options;
}
