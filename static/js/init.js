// init.js

import { addQuestion } from './question.js';
import { validateForm } from './validation.js';
import { setupCounterButtons } from './metadataFields.js';
import { updateQuestionsHeader, updateQuestionCount, showAlert } from './utils.js';

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

    // Form submission handler
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;

    // Get form data
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('subcategory', document.getElementById('subcategory')?.value || '');
    
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
