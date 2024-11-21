// eventDates.js

export function initializeEventDates() {
    console.log('Initializing event dates functionality...');
    
    const addDateButton = document.getElementById('addEventDate');
    const eventDatesContainer = document.getElementById('eventDates');
    const eventDatesInput = document.getElementById('eventDatesInput');

    if (!addDateButton || !eventDatesContainer || !eventDatesInput) {
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

        // Initialize hidden input
        updateEventDatesInput();

        // Add date button click handler with error handling
        addDateButton.addEventListener('click', () => {
            console.log('Add date button clicked');
            try {
                addEventDate();
            } catch (error) {
                console.error('Error adding event date:', error);
                showAlert('danger', 'Failed to add event date. Please try again.');
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
}

function addEventDate(dateValue = '') {
    const eventDatesContainer = document.getElementById('eventDates');
    const dateGroup = document.createElement('div');
    dateGroup.className = 'input-group mb-2 animate__animated animate__fadeIn';
    
    const currentDate = dateValue || new Date().toISOString().slice(0, 16);
    
    dateGroup.innerHTML = `
        <input type="datetime-local" class="form-control event-date" value="${currentDate}">
        <button class="btn btn-outline-danger remove-date" type="button">×</button>
    `;

    // Add remove handler
    const removeButton = dateGroup.querySelector('.remove-date');
    removeButton.addEventListener('click', () => {
        dateGroup.classList.add('animate__fadeOut');
        setTimeout(() => {
            dateGroup.remove();
            updateEventDatesInput();
        }, 300);
    });

    // Add change handler
    const dateInput = dateGroup.querySelector('.event-date');
    dateInput.addEventListener('change', updateEventDatesInput);

    eventDatesContainer.appendChild(dateGroup);
    updateEventDatesInput();
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
