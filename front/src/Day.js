
export class Day {
    constructor(year, month, day, busyDayManager) {
        this.date = new Date(year, month, day);
        this.isToday = this.isTodayDate();
        this.busyDayManager = busyDayManager;

        // Obtener las horas ocupadas para este día
        this.busyHours = this.busyDayManager.getBusyHoursForDay(this.date) || [];
    }

    // Verificar si el día es el día actual
    isTodayDate() {
        const today = new Date();
        return this.date.getDate() === today.getDate() &&
               this.date.getMonth() === today.getMonth() &&
               this.date.getFullYear() === today.getFullYear();
    }

    // Renderizar el día y agregar comportamiento basado en las horas disponibles
    render(calendarElement, selectDayCallback) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = this.date.getDate();

        if (this.isToday) {
            dayElement.classList.add('today'); // Resaltar el día actual
        }

        // Generar horas disponibles a partir de las horas ocupadas
        const availableHours = this.busyDayManager.generateAvailableHours(this.busyHours);

        // Comportamiento según las horas disponibles
        if (availableHours.length === 0) {
            dayElement.classList.add('fully-busy');  // Día completamente ocupado
            dayElement.style.pointerEvents = 'none'; // Desactivar clic
        } else if (availableHours.length < 12) {
            dayElement.classList.add('partially-busy'); // Día parcialmente ocupado
            // Evento para mostrar las horas disponibles al hacer clic
            dayElement.addEventListener('click', () => selectDayCallback(this.date, availableHours));
        } else {
            // Día disponible
            dayElement.addEventListener('click', () => selectDayCallback(this.date, availableHours));
        }

        // Añadir el día al calendario
        calendarElement.appendChild(dayElement);
    }
}
