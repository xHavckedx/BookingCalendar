let busyDays = [];
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const calendar = document.getElementById('calendar');
const monthYearLabel = document.getElementById('monthYear');
let currentDate = new Date();
let selectedDay = null; // Guardar el día seleccionado

// Obtener los días ocupados del backend
function getBusyDays() {
    axios.get('http://localhost:5000/get-busy-days')
        .then(response => {
            console.log("Datos recibidos del backend: ", response.data);
            busyDays = response.data.busy_days.map(day => new Date(day)); // Convertir a objeto Date
            console.log("Días ocupados después de convertir: ", busyDays);
            generateCalendar(currentDate); // Llamar al calendario después de obtener los días ocupados
        })
        .catch(error => {
            console.error('Error fetching busy days', error);
        });
}

// Función para generar el calendario
function generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    calendar.innerHTML = ''; // Limpiar el calendario

    // Actualizar el título del mes y año
    monthYearLabel.textContent = `${monthNames[month]} ${year}`;

    // Agregar los días de la semana
    daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-header';
        dayElement.textContent = day;
        calendar.appendChild(dayElement);
    });

    // Espacios en blanco para los días anteriores al inicio del mes
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyElement = document.createElement('div');
        calendar.appendChild(emptyElement);
    }

    // Generar los días del mes
    for (let day = 1; day <= lastDateOfMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        // Si es el día actual, resaltarlo
        if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            dayElement.classList.add('today');
        }

        // Verificar si el día actual está en los días ocupados
        const currentDate = new Date(year, month, day);
        const isBusyDay = busyDays.some(busyDate => {
            return busyDate.toDateString() === currentDate.toDateString();
        });

        if (isBusyDay) {
            dayElement.classList.add('is-busy'); // Estilo adicional para días con horas ocupadas
        }

        // Añadir evento de clic para seleccionar el día y mostrar las horas disponibles
        dayElement.addEventListener('click', () => {
            selectedDay = currentDate;
            const busyHoursForSelectedDay = busyDays
                .filter(busyDate => busyDate.toDateString() === currentDate.toDateString())
                .map(busyDate => busyDate.getHours());

            showAvailableHours(busyHoursForSelectedDay);
        });

        calendar.appendChild(dayElement);
    }
}

// Función para mostrar las horas disponibles
function showAvailableHours(busyHours) {
    const hoursList = document.getElementById('hoursList');
    hoursList.innerHTML = ''; // Limpiar las horas anteriores

    // Generar todas las horas disponibles, excluyendo las ocupadas
    const availableHours = generateAvailableHours(busyHours);
    
    availableHours.forEach(hour => {
        const hourTag = document.createElement('span');
        hourTag.className = 'tag is-primary'; // Estilo de Bulma para las horas disponibles
        hourTag.textContent = hour;
        hoursList.appendChild(hourTag);
    });
}

// Generar todas las horas disponibles de 8 AM a 6 PM, excluyendo las ocupadas
function generateAvailableHours(busyHours) {
    const hours = [];
    for (let h = 8; h <= 18; h++) { // Horario de 8:00 a 18:00
        const hourString = `${h < 10 ? '0' : ''}${h}:00`;
        if (!busyHours.includes(h)) {
            hours.push(hourString);
        }
    }
    return hours;
}

// Inicializar el calendario con la fecha actual
generateCalendar(currentDate);

// Botones para cambiar de mes
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
});

// Llamar a getBusyDays al cargar la página
window.onload = function () {
    getBusyDays();
};
