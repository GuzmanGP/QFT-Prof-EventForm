// init.js

import { addQuestion } from './question.js';
import { validateForm } from './validation.js';
import { setupCounterButtons } from './metadataFields.js';
import { updateQuestionsHeader, updateQuestionCount, showAlert } from './utils.js';

export function initializeForm() {
    const form = document.getElementById('formConfiguration');
    const addQuestionBtn = document.getElementById('addQuestion');
    const questionsList = document.getElementById('questions');
    const formId = form.dataset.formId;

    // Load existing form data if form ID is present
    if (formId) {
        loadFormData(formId);
    } else {
        // Add initial question if none exists
        if (!questionsList.querySelector('.question-card')) {
            addQuestion();
            updateQuestionCount();
        }
    }

    // Add question button handler
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => {
            addQuestion();
            updateQuestionCount();
        });
    }

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

async function loadFormData(formId) {
    try {
        const response = await fetch(`/api/forms/${formId}`);
        if (!response.ok) throw new Error('Failed to load form data');
        
        const data = await response.json();
        
        // Populate form fields
        document.getElementById('title').value = data.title;
        document.getElementById('category').value = data.category;
        if (data.subcategory) {
            document.getElementById('subcategory').value = data.subcategory;
        }
        
        // Load metadata
        loadMetadata('categoryMetadata', data.category_metadata);
        loadMetadata('subcategoryMetadata', data.subcategory_metadata);
        
        // Load questions
        const questionsList = document.getElementById('questions');
        questionsList.innerHTML = ''; // Clear existing questions
        
        for (const questionData of data.questions) {
            const questionCard = addQuestion();
            populateQuestionData(questionCard, questionData);
        }
        
        updateQuestionCount();
    } catch (error) {
        showAlert('danger', 'Error loading form data: ' + error.message);
    }
}

function loadMetadata(containerId, metadata) {
    const container = document.getElementById(containerId);
    const count = Object.keys(metadata).length;
    const counterDisplay = container.parentElement.querySelector('.counter-display');
    counterDisplay.textContent = count.toString();
    
    // Update metadata fields
    container.innerHTML = '';
    for (const [key, value] of Object.entries(metadata)) {
        const field = document.createElement('div');
        field.className = 'input-group mb-2';
        field.innerHTML = `
            <input type="text" class="form-control metadata-key" value="${key}" placeholder="Key">
            <input type="text" class="form-control metadata-value" value="${value}" placeholder="Value">
            <button type="button" class="btn btn-outline-danger remove-field">×</button>
        `;
        container.appendChild(field);
    }
}

function populateQuestionData(card, data) {
    card.querySelector('.question-title').value = data.reference;
    card.querySelector('.question-content').value = data.content;
    
    const answerTypeSelect = card.querySelector('.answer-type');
    answerTypeSelect.value = data.answer_type;
    
    if (data.answer_type === 'list') {
        const listOptions = card.querySelector('.list-options');
        listOptions.classList.remove('d-none');
        listOptions.querySelector('input').value = data.options.join(', ');
    }
    
    card.querySelector('.question-required').checked = data.required;
    
    // Handle AI instructions
    const aiCheckbox = card.querySelector('.question-ai');
    const aiInstructions = card.querySelector('.ai-instructions');
    if (data.ai_instructions) {
        aiCheckbox.checked = true;
        aiInstructions.style.display = 'block';
        aiInstructions.querySelector('textarea').value = data.ai_instructions;
    }
    
    // Load question metadata
    const metadataContainer = card.querySelector('.question-metadata');
    const metadataCount = Object.keys(data.question_metadata).length;
    card.querySelector('.question-meta-count').textContent = metadataCount.toString();
    
    for (const [key, value] of Object.entries(data.question_metadata)) {
        const field = document.createElement('div');
        field.className = 'input-group mb-2';
        field.innerHTML = `
            <input type="text" class="form-control metadata-key" value="${key}" placeholder="Key">
            <input type="text" class="form-control metadata-value" value="${value}" placeholder="Value">
            <button type="button" class="btn btn-outline-danger remove-field">×</button>
        `;
        metadataContainer.appendChild(field);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formId = form.dataset.formId;
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
        const url = formId ? `/api/forms/${formId}` : '/api/forms';
        const method = formId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.success) {
            showAlert('success', `Form ${formId ? 'updated' : 'saved'} successfully`);
            // Redirect to forms list after successful save
            window.location.href = '/';
        } else {
            throw new Error(data.error || `Failed to ${formId ? 'update' : 'save'} form`);
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
