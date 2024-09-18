import { Day } from './Day.js'; // Importamos la clase Day desde otro archivo
import { BusyDayManager } from './BusyDayManager.js'; // Importamos la clase BusyDayManager
import { EventForm } from './EventForm.js';

export class Calendar {
    constructor(elementId, monthYearLabelId, hoursListId, formElementId, eventFormContainerID) {
        this.calendarElement = document.getElementById(elementId);
        this.monthYearLabel = document.getElementById(monthYearLabelId);
        this.hoursListElement = document.getElementById(hoursListId);
        this.currentDate = new Date();
        this.selectedDay = null;
        this.busyDayManager = new BusyDayManager();
        this.eventForm = new EventForm(formElementId, eventFormContainerID)
    }

    // Método para iniciar el calendario después de cargar los días ocupados
    initCalendar() {
        this.busyDayManager.getBusyDays().then(() => {
            // Cuando los días ocupados se cargan, generamos el calendario
            this.generateCalendar(this.currentDate);
        });
    }

    generateCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

        this.calendarElement.innerHTML = ''; // Limpiar el calendario
        this.updateMonthYearLabel(month, year);
        this.addWeekDaysHeaders();

        // Agregar los espacios en blanco para los días antes del inicio del mes
        for (let i = 0; i < firstDayOfMonth; i++) {
            this.calendarElement.appendChild(document.createElement('div'));
        }

        // Generar los días del mes
        for (let day = 1; day <= lastDateOfMonth; day++) {
            const dayObj = new Day(year, month, day, this.busyDayManager);
            dayObj.render(this.calendarElement, this.selectDay.bind(this));
        }
    }

    updateMonthYearLabel(month, year) {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        this.monthYearLabel.textContent = `${monthNames[month]} ${year}`;
    }

    addWeekDaysHeaders() {
        const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        daysOfWeek.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-header';
            dayElement.textContent = day;
            this.calendarElement.appendChild(dayElement);
        });
    }

    selectDay(day, availableHours) {
        this.selectedDay = day;
        console.log("Día seleccionado:", this.selectedDay);
        this.showAvailableHours(day, availableHours)
    }

    showAvailableHours(selectDay, availableHours) {
        this.hoursListElement.innerHTML = ''; // Limpiar las horas anteriores

        if (availableHours.length === 0) {
            this.hoursListElement.innerHTML = '<p>No hay horas disponibles para este día.</p>';
            return;
        }

        // Añadir las horas disponibles al contenedor
        availableHours.forEach(hour => {
            const hourElement = document.createElement('span');
            hourElement.className = 'tag is-primary'; // Clase CSS para estilo
            hourElement.textContent = hour;

            // Añadir evento de clic para seleccionar la hora
            hourElement.addEventListener('click', () => {
                console.log(`Hora seleccionada: ${hour}`);
                // Aquí puedes mostrar un formulario o realizar otra acción
                this.eventForm.show(selectDay, hour)
            });

            this.hoursListElement.appendChild(hourElement);
        });
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.generateCalendar(this.currentDate);
    }

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.generateCalendar(this.currentDate);
    }
}
