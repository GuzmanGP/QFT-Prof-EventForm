// eventDates.js

export function initializeEventDates() {
    console.log('Initializing event dates functionality...');
    
    const eventDatesContainer = document.getElementById('eventDates');
    const eventDatesInput = document.getElementById('eventDatesInput');
    const decreaseButton = document.querySelector('.decrease-count[data-target="eventDates"]');
    const increaseButton = document.querySelector('.increase-count[data-target="eventDates"]');

    if (!eventDatesContainer || !eventDatesInput || !decreaseButton || !increaseButton) {
        const error = 'Required event date elements not found';
        console.error(error);
        throw new Error(error);
    }

    // Initialize counter buttons
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
            removeLastEventDate();
        } catch (error) {
            console.error('Error removing event date:', error);
            showAlert('danger', 'Failed to remove date. Please try again.');
        }
    });

    // Initialize hidden input
    updateEventDatesInput();
    updateCounterDisplay();
}

function addEventDate(initialValue = '') {
    const eventDatesContainer = document.getElementById('eventDates');
    if (!eventDatesContainer) {
        throw new Error('Event dates container not found');
    }

    try {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'input-group mb-2 animate__animated animate__fadeIn';
        
        dateGroup.innerHTML = `
            <input type="datetime-local" 
                   class="form-control event-date" 
                   value="${initialValue}"
                   required>
        `;

        const dateInput = dateGroup.querySelector('.event-date');
        if (dateInput) {
            dateInput.addEventListener('change', () => {
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

function removeLastEventDate() {
    const eventDatesContainer = document.getElementById('eventDates');
    if (!eventDatesContainer) return;

    const lastDate = eventDatesContainer.lastElementChild;
    if (lastDate) {
        lastDate.classList.remove('animate__fadeIn');
        lastDate.classList.add('animate__fadeOut');
        setTimeout(() => {
            lastDate.remove();
            updateEventDatesInput();
            updateCounterDisplay();
        }, 300);
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

function updateCounterDisplay() {
    const count = document.querySelectorAll('.event-date').length;
    const countDisplay = document.getElementById('eventDatesCount');
    if (countDisplay) {
        countDisplay.textContent = count.toString();
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
    
    // Update counter
    updateCounterDisplay();
}