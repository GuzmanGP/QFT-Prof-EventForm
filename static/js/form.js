// Replacing only the relevant section where the error occurs, keeping the rest of the file unchanged
// ...
function getMetadataValues(container) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    const metadata = {};
    container.querySelectorAll('.input-group').forEach(group => {
        const key = group.querySelector('.metadata-key').value.trim();
        const value = group.querySelector('.metadata-value').value.trim();
        if (key && value) {
            metadata[key] = value;
        }
    });
    
    return metadata;
}

function validateForm(form) {
    let isValid = true;
    const errors = [];
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate title
    const title = form.querySelector('#title');
    if (!title.value.trim()) {
        showFieldError(title, 'Title is required');
        errors.push('Title is required');
        isValid = false;
    }
    
    // Validate category
    const category = form.querySelector('#category');
    if (!category.value.trim()) {
        showFieldError(category, 'Category is required');
        errors.push('Category is required');
        isValid = false;
    }
    
    // Check for duplicate questions
    const references = new Set();
    const contents = new Set();
    
    document.querySelectorAll('.question-card').forEach((card, index) => {
        const reference = card.querySelector('.question-title').value.trim();
        const content = card.querySelector('.question-content').value.trim();
        
        // Validate required fields
        if (!reference) {
            showFieldError(card.querySelector('.question-title'), 'Question reference is required');
            errors.push(`Question ${index + 1}: Reference is required`);
            isValid = false;
        } else if (references.has(reference)) {
            showFieldError(card.querySelector('.question-title'), 'Duplicate reference found');
            errors.push(`Question ${index + 1}: Duplicate reference "${reference}"`);
            isValid = false;
        }
        references.add(reference);
        
        if (!content) {
            showFieldError(card.querySelector('.question-content'), 'Question content is required');
            errors.push(`Question ${index + 1}: Content is required`);
            isValid = false;
        } else if (contents.has(content)) {
            showFieldError(card.querySelector('.question-content'), 'Duplicate content found');
            errors.push(`Question ${index + 1}: Duplicate content`);
            isValid = false;
        }
        contents.add(content);
        
        // Validate list options if selected
        const answerType = card.querySelector('.answer-type').value;
        if (answerType === 'list') {
            const options = card.querySelector('.list-options input').value.trim();
            if (!options) {
                showFieldError(card.querySelector('.list-options input'), 'List options are required');
                errors.push(`Question ${index + 1}: List options are required`);
                isValid = false;
            }
        }
        
        // Validate metadata keys
        validateMetadataContainer(card.querySelector('.question-metadata'), errors);
    });
    
    // Validate category and subcategory metadata
    validateMetadataContainer(document.getElementById('categoryMetadata'), errors);
    validateMetadataContainer(document.getElementById('subcategoryMetadata'), errors);
    
    if (!isValid) {
        showErrorSummary(errors);
    }
    
    return isValid;
}
