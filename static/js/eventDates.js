// eventDates.js

export function initializeEventDates() {
    const addDateButton = document.getElementById('addEventDate');
    const eventDatesContainer = document.getElementById('eventDates');
    const eventDatesInput = document.getElementById('eventDatesInput');

    if (!addDateButton || !eventDatesContainer || !eventDatesInput) {
        console.error('Required elements not found');
        return;
    }

    // Initialize hidden input
    updateEventDatesInput();

    // Add date button click handler
    addDateButton.addEventListener('click', () => {
        addEventDate();
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
