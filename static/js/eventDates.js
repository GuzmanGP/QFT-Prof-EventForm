// eventDates.js

export function initializeEventDates() {
    console.log('Initializing event dates functionality...');
    const containerId = 'eventDates';
    
    // Standard validation for container elements
    const container = document.getElementById(containerId);
    const buttons = document.querySelectorAll(`.counter-button[data-target="${containerId}"]`);
    const display = document.querySelector(`#${containerId}Count`);
    const hiddenInput = document.getElementById(`${containerId}Input`);

    if (!container || !buttons.length || !display || !hiddenInput) {
        console.error('Required elements not found:', {
            container: !!container,
            buttons: buttons.length,
            display: !!display,
            hiddenInput: !!hiddenInput
        });
        return;
    }

    console.debug('Found elements:', {
        containerId,
        buttonCount: buttons.length,
        currentCount: display.textContent
    });

    try {
        // Initialize handlers for counter buttons
        initializeCounterButtons(decreaseButton, increaseButton);
        
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
    const eventDatesContainer = document.getElementById('eventDates');
    if (!eventDatesContainer) {
        throw new Error('Event dates container not found');
    }

    try {
        // Create date input group with animation
        const dateGroup = document.createElement('div');
        dateGroup.className = 'input-group mb-2';
        dateGroup.innerHTML = `
            <input type="datetime-local" 
                   class="form-control event-date" 
                   value="${initialValue}"
                   required>
        `;

        // Add animation classes
        dateGroup.classList.add('animate__animated', 'animate__fadeIn');

        // Add change event listener
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

        // Add to container and update state
        eventDatesContainer.appendChild(dateGroup);
        updateEventDatesInput();
        console.log('Event date added successfully');
    } catch (error) {
        console.error('Error in addEventDate:', error);
        throw error;
    }
}

function removeEventDate(dateElement) {
    // Add fade out animation
    dateElement.classList.remove('animate__fadeIn');
    dateElement.classList.add('animate__fadeOut');

    // Remove after animation
    setTimeout(() => {
        dateElement.remove();
        updateEventDatesInput();
        updateCounterDisplay();
    }, 300);
}

function updateEventDatesInput() {
    try {
        const dates = Array.from(document.querySelectorAll('.event-date'))
            .map(input => input.value)
            .filter(date => date);

        const eventDatesInput = document.getElementById('eventDatesInput');
        if (eventDatesInput) {
            eventDatesInput.value = JSON.stringify({ dates });
        }
    } catch (error) {
        console.error('Error updating event dates input:', error);
        throw error;
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