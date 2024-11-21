// loadHistory.js
import { showAlert } from './utils.js';

let loadAttempts = new Map();

export function recordLoadAttempt(formId, success, errorMessage = null) {
    const timestamp = new Date().toISOString();
    const attempt = {
        formId,
        timestamp,
        success,
        errorMessage
    };

    // Add to local tracking
    if (!loadAttempts.has(formId)) {
        loadAttempts.set(formId, []);
    }
    loadAttempts.get(formId).push(attempt);

    // Send to server
    fetch('/api/form-load-history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(attempt)
    }).catch(error => {
        console.error('Error recording load history:', error);
    });

    // Keep only last 10 attempts per form
    if (loadAttempts.get(formId).length > 10) {
        loadAttempts.get(formId).shift();
    }
}

export function getLoadHistory(formId) {
    return loadAttempts.get(formId) || [];
}

export function clearLoadHistory(formId) {
    loadAttempts.delete(formId);
}
