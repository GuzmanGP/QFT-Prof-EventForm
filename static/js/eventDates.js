// eventDates.js

export function initializeEventDates() {
    console.log('Initializing event dates functionality...');
    
    const eventDatesContainer = document.getElementById('eventDates');
    const eventDatesInput = document.getElementById('eventDatesInput');
    const eventDatesCount = document.getElementById('eventDatesCount');
    const decreaseButton = document.querySelector('.decrease-count[data-target="eventDates"]');
    const increaseButton = document.querySelector('.increase-count[data-target="eventDates"]');

    if (!eventDatesContainer || !eventDatesInput || !eventDatesCount || !decreaseButton || !increaseButton) {
        const error = 'Required event date elements not found. Please check if all elements are present in the DOM.';
        console.error(error);
        throw new Error(error);
    }

    try {
        console.log('Setting up event dates...');
        
        // Initialize hidden input with empty dates array if not already set
        if (!eventDatesInput.value) {
            eventDatesInput.value = JSON.stringify({ dates: [] });
            console.log('Initialized empty dates array');
        }

        // Initialize hidden input and counter display
        updateEventDatesInput();
        updateCounterDisplay();

        // Add counter button click handlers with error handling
        increaseButton.addEventListener('click', () => {
            console.log('Increase button clicked');
            try {
                addEventDate();
                updateCounterDisplay();
            } catch (error) {
                console.error('Error adding event date:', error);
                showAlert('danger', 'Failed to add event date. Please try again.');
            }
        });

        decreaseButton.addEventListener('click', () => {
            console.log('Decrease button clicked');
            try {
                const lastDate = eventDatesContainer.lastElementChild;
                if (lastDate) {
                    lastDate.classList.add('animate__fadeOut');
                    setTimeout(() => {
                        lastDate.remove();
                        updateEventDatesInput();
                        updateCounterDisplay();
                    }, 300);
                }
            } catch (error) {
                console.error('Error removing event date:', error);
                showAlert('danger', 'Failed to remove date. Please try again.');
            }
        });

        // Initialize validity date change handlers
        const validityStartDate = document.getElementById('validity_start_date');
        const validityEndDate = document.getElementById('validity_end_date');

        if (validityStartDate && validityEndDate) {
            validityStartDate.addEventListener('change', () => {
                if (validityEndDate.value && validityStartDate.value > validityEndDate.value) {
                    validityEndDate.value = validityStartDate.value;
                }
                validityEndDate.min = validityStartDate.value;
            });

            validityEndDate.addEventListener('change', () => {
                if (validityStartDate.value && validityEndDate.value < validityStartDate.value) {
                    validityStartDate.value = validityEndDate.value;
                }
                validityStartDate.max = validityEndDate.value;
            });
        }

        console.log('Event dates initialization completed successfully');
    } catch (error) {
        console.error('Error in initializeEventDates:', error);
        throw error;
    }
}

function addEventDate(dateValue = '') {
    console.log('Adding new event date');
    
    const eventDatesContainer = document.getElementById('eventDates');
    if (!eventDatesContainer) {
        const error = 'Event dates container not found';
        console.error(error);
        throw new Error(error);
    }

    try {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'input-group mb-2 animate__animated animate__fadeIn';
        
        const currentDate = dateValue || new Date().toISOString().slice(0, 16);
        
        dateGroup.innerHTML = `
            <input type="datetime-local" class="form-control event-date" value="${currentDate}">
            <button class="btn btn-outline-danger remove-date" type="button" title="Remove Date">×</button>
        `;

        // Add remove handler with error handling
        const removeButton = dateGroup.querySelector('.remove-date');
        if (removeButton) {
            removeButton.addEventListener('click', () => {
                try {
                    console.log('Removing event date');
                    dateGroup.classList.add('animate__fadeOut');
                    setTimeout(() => {
                        dateGroup.remove();
                        updateEventDatesInput();
                    }, 300);
                } catch (error) {
                    console.error('Error removing event date:', error);
                    showAlert('danger', 'Failed to remove date. Please try again.');
                }
            });
        }

        // Add change handler with validation
        const dateInput = dateGroup.querySelector('.event-date');
        if (dateInput) {
            dateInput.addEventListener('change', () => {
function updateCounterDisplay() {
    const count = document.querySelectorAll('.event-date').length;
    const countDisplay = document.getElementById('eventDatesCount');
    if (countDisplay) {
        countDisplay.textContent = count.toString();
    }
}
                try {
                    if (!dateInput.value) {
                        showAlert('warning', 'Please select a valid date and time');
                        return;
                    }
                    updateEventDatesInput();
                } catch (error) {
                    console.error('Error updating event date:', error);
                    showAlert('danger', 'Failed to update date. Please try again.');
                }
            });
        }

        eventDatesContainer.appendChild(dateGroup);
        updateEventDatesInput();
        console.log('Event date added successfully');
    } catch (error) {
        console.error('Error in addEventDate:', error);
        throw error;
    }
}

function updateEventDatesInput() {
    const dates = Array.from(document.querySelectorAll('.event-date'))
        .map(input => input.value)
        .filter(date => date);

    const eventDatesInput = document.getElementById('eventDatesInput');
    if (eventDatesInput) {
        eventDatesInput.value = JSON.stringify({ dates });
    }
}

export function loadEventDates(dates = []) {
    const eventDatesContainer = document.getElementById('eventDates');
    if (!eventDatesContainer) return;

    // Clear existing dates
    eventDatesContainer.innerHTML = '';

    // Add each date
    dates.forEach(date => {
        if (date) {
            addEventDate(date);
        }
    });
}
