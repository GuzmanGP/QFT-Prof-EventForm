// eventDates.js
import { showAlert } from './utils.js';

export function initializeEventDates() {
    console.group('Event Dates Initialization');
    console.log('Starting event dates initialization...');
    
    const containerId = 'eventDates';
    const container = document.getElementById(containerId);
    const buttons = document.querySelectorAll(`.counter-button[data-target="${containerId}"]`);
    const display = document.querySelector(`#${containerId}Count`);
    const hiddenInput = document.getElementById(`${containerId}Input`);

    console.log('DOM Elements:', {
        container: container?.id || 'Not found',
        buttonCount: buttons?.length || 0,
        display: display?.id || 'Not found',
        hiddenInput: hiddenInput?.id || 'Not found'
    });

    // Validate required elements
    if (!container || !buttons.length || !display || !hiddenInput) {
        const error = new Error('Required event date elements not found');
        console.error('Initialization failed:', error);
        console.groupEnd();
        throw error;
    }

    console.debug('Found elements:', {
        containerId,
        buttonCount: buttons.length,
        currentCount: display.textContent
    });

    try {
        // Initialize counter buttons
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const currentCount = parseInt(display.textContent);
                const isIncrease = button.classList.contains('increase-count');
                
                console.log('Button clicked:', { isIncrease, currentCount });
                
                if (isIncrease && currentCount < 20) {
                    addEventDate();
                } else if (!isIncrease && currentCount > 0) {
                    const lastDate = container.querySelector('.input-group:last-child');
                    if (lastDate) {
                        removeEventDate(lastDate);
                    }
                } else if (isIncrease && currentCount >= 20) {
                    console.warn('Maximum event dates limit (20) reached');
                    showAlert('warning', 'Maximum number of event dates reached (20)');
                }
            });
        });

        // Initialize hidden input and counter display
        updateEventDatesInput();
        updateCounterDisplay();
        
        console.log('Event dates initialized successfully');
    } catch (error) {
        console.error('Error initializing event dates:', error);
        throw error;
    }
}

function initializeCounterButtons(decreaseButton, increaseButton) {
    if (!decreaseButton || !increaseButton) {
        throw new Error('Counter buttons not provided');
    }

    console.log('Initializing event date counter buttons');

    // Increase counter handler with improved error handling
    increaseButton.addEventListener('click', () => {
        console.log('Increase button clicked - adding new event date');
        try {
            const currentCount = document.querySelectorAll('.event-date').length;
            console.log(`Current event dates count: ${currentCount}`);
            
            addEventDate();
            updateCounterDisplay();
            
            console.log('Successfully added new event date');
        } catch (error) {
            console.error('Error adding event date:', error);
            showAlert('danger', `Failed to add event date: ${error.message}`);
        }
    });

    // Decrease counter handler with improved validation
    decreaseButton.addEventListener('click', () => {
        console.log('Decrease button clicked - removing last event date');
        try {
            const lastDate = document.querySelector('#eventDates .input-group:last-child');
            const currentCount = document.querySelectorAll('.event-date').length;
            
            console.log(`Current event dates count: ${currentCount}`);
            
            if (lastDate) {
                removeEventDate(lastDate);
                console.log('Successfully removed last event date');
            } else {
                console.warn('No event dates to remove');
                showAlert('warning', 'No event dates to remove');
            }
        } catch (error) {
            console.error('Error removing event date:', error);
            showAlert('danger', `Failed to remove event date: ${error.message}`);
        }
    });

    console.log('Successfully initialized event date counter buttons');
}

function addEventDate(initialValue = '') {
    console.group('Adding Event Date');
    console.log('Initial value:', initialValue);
    
    const eventDatesContainer = document.getElementById('eventDates');
    if (!eventDatesContainer) {
        const error = new Error('Event dates container not found');
        console.error('Failed to add event date:', error);
        console.groupEnd();
        throw error;
    }

    try {
        // Create date group with proper animation classes
        const dateGroup = document.createElement('div');
        dateGroup.className = 'input-group mb-2';
        dateGroup.classList.add('animate__animated', 'animate__fadeIn');
        
        // Validate initial value if provided
        const validatedValue = initialValue ? new Date(initialValue).toISOString().slice(0, 16) : '';
        
        dateGroup.innerHTML = `
            <input type="datetime-local" 
                   class="form-control event-date" 
                   value="${validatedValue}"
                   required>
            <button type="button" class="btn btn-outline-danger remove-field">×</button>
        `;

    // Add change event listener for validation
    const dateInput = dateGroup.querySelector('.event-date');
    if (dateInput) {
        dateInput.addEventListener('change', () => {
            if (!dateInput.value) {
                showAlert('warning', 'Please select a valid date and time');
                return;
            }
            updateEventDatesInput();
        });
    }

    // Add remove button handler
    const removeButton = dateGroup.querySelector('.remove-field');
    if (removeButton) {
        removeButton.addEventListener('click', () => {
            removeEventDate(dateGroup);
        });
    }

    eventDatesContainer.appendChild(dateGroup);
    
    // Add validation and update counter
    const display = document.querySelector('#eventDatesCount');
    if (display) {
        const currentCount = parseInt(display.textContent);
        display.textContent = (currentCount + 1).toString();
    }

    updateEventDatesInput();
    console.log('Event date added successfully');
}

function removeEventDate(dateElement) {
    dateElement.classList.remove('animate__fadeIn');
    dateElement.classList.add('animate__animated', 'animate__fadeOut');

    setTimeout(() => {
        dateElement.remove();
        // Update counter display
        const display = document.querySelector('#eventDatesCount');
        if (display) {
            const currentCount = parseInt(display.textContent);
            display.textContent = Math.max(0, currentCount - 1).toString();
        }
        updateEventDatesInput();
    }, 300);
}

function updateEventDatesInput() {
    console.group('Updating Event Dates Input');
    try {
        // Get all date inputs and validate them
        const dateInputs = document.querySelectorAll('.event-date');
        console.log('Found date inputs:', dateInputs.length);

        const dates = Array.from(dateInputs)
            .map(input => {
                const value = input.value.trim();
                if (value) {
                    try {
                        // Validate date format
                        const date = new Date(value);
                        if (isNaN(date.getTime())) {
                            throw new Error('Invalid date format');
                        }
                        return value;
                    } catch (err) {
                        console.warn('Invalid date value:', value);
                        return null;
                    }
                }
                return null;
            })
            .filter(date => date !== null);

        console.log('Valid dates:', dates.length);

        // Update hidden input
        const eventDatesInput = document.getElementById('eventDatesInput');
        if (eventDatesInput) {
            eventDatesInput.value = JSON.stringify({ dates });
            console.log('Updated hidden input with dates');
        } else {
            throw new Error('Event dates hidden input not found');
        }

        return dates.length > 0;
    } catch (error) {
        console.error('Failed to update event dates input:', error);
        throw error;
    } finally {
        console.groupEnd();
    }
}

function updateCounterDisplay() {
    try {
        const count = document.querySelectorAll('.event-date').length;
        const countDisplay = document.getElementById('eventDatesCount');
        if (countDisplay) {
            countDisplay.textContent = count.toString();
        }
    } catch (error) {
        console.error('Error updating counter display:', error);
        throw error;
    }
}

export function loadEventDates(dates = []) {
    const eventDatesContainer = document.getElementById('eventDates');
    if (!eventDatesContainer) {
        console.error('Event dates container not found');
        return;
    }

    try {
        // Clear existing dates
        eventDatesContainer.innerHTML = '';

        // Add each date with animation delay
        dates.forEach((date, index) => {
            if (date) {
                setTimeout(() => {
                    addEventDate(date);
                }, index * 100);
            }
        });

        // Update counter
        updateCounterDisplay();
    } catch (error) {
        console.error('Error loading event dates:', error);
        throw error;
    }
}