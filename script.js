document.addEventListener('DOMContentLoaded', function() {
    const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let events = JSON.parse(localStorage.getItem('events')) || [];

    const monthYearElement = document.getElementById('month-year');
    const calendarBody = document.getElementById('calendar-body');
    const eventModal = document.getElementById('event-modal');
    const dayEventModal = document.getElementById('day-event-modal');
    const closeModalButton = document.querySelector('.close-button');
    const addEventButton = document.getElementById('add-event');
    const eventForm = document.getElementById('event-form');
    const searchInput = document.getElementById('search-input');
    const eventsList = document.getElementById('events-list');
    const dayEventsList = document.getElementById('day-events-list');
    const eventIdInput = document.getElementById('event-id');
    const modalTitle = document.getElementById('modal-title');

    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
    addEventButton.addEventListener('click', openModal);
    closeModalButton.addEventListener('click', closeModal);
    window.addEventListener('click', outsideClick);
    eventForm.addEventListener('submit', saveEvent);
    searchInput.addEventListener('input', searchEvents);

    function changeMonth(delta) {
        currentMonth += delta;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    }

    function renderCalendar(month, year) {
        monthYearElement.textContent = `${monthNames[month]} ${year}`;
        calendarBody.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let date = 1;
        const startDay = firstDay === 0 ? 6 : firstDay - 1; // Adjusting start day to start from Monday
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');

            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                const dayIndex = i * 7 + j;
                if (dayIndex < startDay || date > daysInMonth) {
                    cell.textContent = '';
                } else {
                    cell.textContent = date;
                    cell.setAttribute('data-date', `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`);
                    cell.addEventListener('click', showDayEvents);
                    if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                        cell.classList.add('today');
                    }
                    const eventsForDay = events.filter(event => 
                        new Date(event.date).getDate() === date &&
                        new Date(event.date).getMonth() === month &&
                        new Date(event.date).getFullYear() === year
                    );
                    if (eventsForDay.length > 0) {
                        const indicator = document.createElement('div');
                        indicator.classList.add('event-indicator');
                        cell.appendChild(indicator);
                    }
                    date++;
                }
                row.appendChild(cell);
            }
            calendarBody.appendChild(row);
        }
        renderEventsList();
    }

    function renderEventsList() {
        eventsList.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase();
        events
            .filter(event => event.title.toLowerCase().includes(searchTerm) || event.location.toLowerCase().includes(searchTerm))
            .forEach((event, index) => {
                const li = document.createElement('li');
                li.textContent = `${event.title} - ${event.location} (${event.date})`;
                const actionsDiv = document.createElement('div');
                actionsDiv.classList.add('event-actions');
                const editButton = document.createElement('button');
                editButton.textContent = 'Modifier';
                editButton.addEventListener('click', () => editEvent(index));
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Supprimer';
                deleteButton.addEventListener('click', () => deleteEvent(index));
                actionsDiv.appendChild(editButton);
                actionsDiv.appendChild(deleteButton);
                li.appendChild(actionsDiv);
                eventsList.appendChild(li);
            });
    }

    function showDayEvents(e) {
        const date = e.currentTarget.getAttribute('data-date');
        dayEventsList.innerHTML = '';
        const eventsForDay = events.filter(event => event.date === date);
        eventsForDay.forEach((event, index) => {
            const li = document.createElement('li');
            li.textContent = `${event.title} - ${event.location}`;
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('event-actions');
            const editButton = document.createElement('button');
            editButton.textContent = 'Modifier';
            editButton.addEventListener('click', () => editEvent(index));
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Supprimer';
            deleteButton.addEventListener('click', () => deleteEvent(index));
            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);
            li.appendChild(actionsDiv);
            dayEventsList.appendChild(li);
        });
        dayEventModal.style.display = 'block';
    }

    function openModal() {
        modalTitle.textContent = 'Ajouter un événement';
        eventForm.reset();
        eventIdInput.value = '';
        eventModal.style.display = 'block';
    }

    function closeModal() {
        eventModal.style.display = 'none';
    }

    function closeDayEventModal() {
        dayEventModal.style.display = 'none';
    }

    function outsideClick(e) {
        if (e.target == eventModal) {
            closeModal();
        }
    }

    function editEvent(index) {
        const event = events[index];
        eventIdInput.value = index;
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-date').value = event.date;
        document.getElementById('event-location').value = event.location;
        document.getElementById('event-recurrence').value = event.recurrence;
        modalTitle.textContent = 'Modifier un événement';
        eventModal.style.display = 'block';
    }

    function saveEvent(e) {
        e.preventDefault();
        const id = eventIdInput.value;
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const location = document.getElementById('event-location').value;
        const recurrence = document.getElementById('event-recurrence').value;
        const event = { title, date, location, recurrence };

        if (id) {
            events[parseInt(id)] = event;
        } else {
            events.push(event);
        }

        localStorage.setItem('events', JSON.stringify(events));
        renderCalendar(currentMonth, currentYear);
        closeModal();
    }

    function deleteEvent(index) {
        events.splice(index, 1);
        localStorage.setItem('events', JSON.stringify(events));
        renderCalendar(currentMonth, currentYear);
        closeDayEventModal();
    }

    function searchEvents() {
        renderEventsList();
    }

    renderCalendar(currentMonth, currentYear);
});
