document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formConfiguration');
    
    function updateMetadataFields(containerId, count) {
        if (count > 20) {
            showAlert('warning', 'Maximum 20 metadata fields allowed');
            return;
        }
        
        const container = document.getElementById(containerId);
        const currentFields = container.querySelectorAll('.input-group');
        
        if (count > currentFields.length) {
            for (let i = currentFields.length; i < count; i++) {
                addMetadataField(containerId);
            }
        } else {
            while (container.children.length > count) {
                container.removeChild(container.lastChild);
            }
        }
    }
    
    function addMetadataField(containerId) {
        const container = document.getElementById(containerId);
        const field = document.createElement('div');
        field.className = 'input-group';
        field.innerHTML = `
            <input type="text" class="form-control" placeholder="Key">
            <input type="text" class="form-control" placeholder="Value">
        `;
        container.appendChild(field);
    }
    
    function getMetadataValues(containerId) {
        const container = document.getElementById(containerId);
        const metadata = {};
        container.querySelectorAll('.input-group').forEach(group => {
            const inputs = group.querySelectorAll('input');
            const key = inputs[0].value.trim();
            const value = inputs[1].value.trim();
            if (key && value) {
                metadata[key] = value;
            }
        });
        return metadata;
    }
    
    function showAlert(type, message) {
        const alertContainer = document.querySelector('.alert-container');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertContainer.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    }
    
    async function submitForm(event) {
        event.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            subcategory: document.getElementById('subcategory').value,
            category_metadata: getMetadataValues('categoryMetadata'),
            subcategory_metadata: getMetadataValues('subcategoryMetadata'),
            questions: []
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
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            showAlert('danger', error.message);
        }
    }
    
    // Event Listeners
    document.getElementById('categoryMetaCount').addEventListener('change', (e) => {
        updateMetadataFields('categoryMetadata', parseInt(e.target.value));
    });
    
    document.getElementById('subcategoryMetaCount').addEventListener('change', (e) => {
        updateMetadataFields('subcategoryMetadata', parseInt(e.target.value));
    });
    
    form.addEventListener('submit', submitForm);
});
