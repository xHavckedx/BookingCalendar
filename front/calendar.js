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
        const busyHoursForDay = busyDays
            .filter(busyDate => busyDate.toDateString() === currentDate.toDateString())
            .map(busyDate => busyDate.getHours());

        const availableHours = generateAvailableHours(busyHoursForDay);

        // Si no hay horas disponibles, marcar el día como completamente ocupado
        if (availableHours.length === 0) {
            dayElement.classList.add('fully-busy'); // Estilo para días completamente ocupados
            dayElement.style.pointerEvents = 'none'; // Deshabilitar la selección
        } else if (availableHours.length < 12) { //parcialmente ocupado
            dayElement.classList.add('partially-busy');
            // Añadir evento de clic para seleccionar el día y mostrar las horas disponibles
            dayElement.addEventListener('click', () => {
                selectedDay = currentDate;
                showAvailableHours(busyHoursForDay);
            });
        } else {
            //dayElement.classList.add('avalaible')
            // Añadir evento de clic para seleccionar el día y mostrar las horas disponibles
            dayElement.addEventListener('click', () => {
                selectedDay = currentDate;
                showAvailableHours(busyHoursForDay);
            });
        }

        calendar.appendChild(dayElement);
    }
}


// Función para mostrar las horas disponibles y el formulario
// Función para mostrar las horas disponibles y el formulario
function showAvailableHours(busyHours) {
    const hoursList = document.getElementById('hoursList');
    hoursList.innerHTML = ''; // Limpiar las horas anteriores

    const availableHours = generateAvailableHours(busyHours); // Obtener solo las horas disponibles

    if (availableHours.length === 0) {
        hoursList.innerHTML = '<p>No hay horas disponibles para este día.</p>';
        return; // No continuar si no hay horas disponibles
    }

    availableHours.forEach(hour => {
        const hourTag = document.createElement('span');
        hourTag.className = 'tag is-primary'; // Estilo de Bulma para las horas disponibles
        hourTag.textContent = hour;
        hourTag.style.cursor = 'pointer'

        // Añadir evento al hacer clic en la hora disponible
        hourTag.addEventListener('click', () => {
            // Mostrar el formulario y pasar la hora seleccionada al formulario
            showEventForm(hour);
        });

        hoursList.appendChild(hourTag);
    });
}



// Generar todas las horas disponibles de 8 AM a 6 PM, excluyendo las ocupadas
function generateAvailableHours(busyHours) {
    const hours = [];
    for (let h = 7; h <= 18; h++) { // Horario de 8:00 a 18:00
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

// Función para mostrar las horas disponibles y el formulario
function showAvailableHours(busyHours) {
    const hoursList = document.getElementById('hoursList');
    hoursList.innerHTML = ''; // Limpiar las horas anteriores

    const availableHours = generateAvailableHours(busyHours);

    availableHours.forEach(hour => {
        const hourTag = document.createElement('span');
        hourTag.className = 'tag is-primary'; // Estilo de Bulma para las horas disponibles
        hourTag.textContent = hour;

        // Añadir evento al hacer clic en la hora disponible
        hourTag.addEventListener('click', () => {
            // Mostrar el formulario y pasar la hora seleccionada al formulario
            showEventForm(hour);
        });

        hoursList.appendChild(hourTag);
    });
}

// Función para formatear fecha/hora correctamente en el formato 'YYYY-MM-DDTHH:MM' para input datetime-local
function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes en formato MM
    const day = date.getDate().toString().padStart(2, '0'); // Día en formato DD
    const hours = date.getHours().toString().padStart(2, '0'); // Hora en formato HH
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Minutos en formato MM

    return `${year}-${month}-${day}T${hours}:${minutes}`; // Formato 'YYYY-MM-DDTHH:MM'
}


// Función para mostrar el formulario de evento y llenar los campos de fecha/hora
// Función para mostrar el formulario de evento y llenar los campos de fecha/hora
function showEventForm(selectedHour) {
    const eventFormContainer = document.getElementById('eventFormContainer');
    const startDateTimeInput = document.getElementById('startDateTime');
    const endDateTimeInput = document.getElementById('endDateTime');

    // Mostrar el formulario
    eventFormContainer.style.display = 'block';

    // Rellenar los campos de fecha y hora con la hora seleccionada
    const selectedDate = new Date(selectedDay); // Clonar el día seleccionado correctamente
    const [hour, minute] = selectedHour.split(':'); // Obtener hora y minutos seleccionados

    // Establecer la hora seleccionada en la fecha
    selectedDate.setHours(parseInt(hour, 10)); // Asegurarse de que sea un número entero
    selectedDate.setMinutes(0); // Asegúrate de que los minutos sean 0
    selectedDate.setSeconds(0); // Establecer los segundos a 0
    selectedDate.setMilliseconds(0); // Evitar problemas con los milisegundos

    // Formatear la fecha/hora de inicio y fin para el input de datetime-local
    const startDateTimeFormatted = formatDateTimeLocal(selectedDate);
    startDateTimeInput.value = startDateTimeFormatted;

    // Establecer la hora de fin automáticamente una hora después de la hora de inicio
    const endDateTime = new Date(selectedDate.getTime()); // Clonar el objeto fecha/hora
    endDateTime.setHours(endDateTime.getHours() + 1); // Sumar 1 hora para la fecha/hora de fin
    const endDateTimeFormatted = formatDateTimeLocal(endDateTime);
    endDateTimeInput.value = endDateTimeFormatted;

    // Deshabilitar los campos para evitar modificaciones
    startDateTimeInput.disabled = true;
    endDateTimeInput.disabled = true;

    console.log("Día seleccionado:", selectedDay);
    console.log("Hora seleccionada:", selectedHour);
    console.log("Fecha completa de inicio:", startDateTimeFormatted);
    console.log("Fecha completa de fin:", endDateTimeFormatted);
}

function addTimezoneAndSeconds(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = '00';  // Puedes dejar siempre los segundos como '00'

    // Obtener el offset de la zona horaria en minutos y convertirlo a '+HH:MM' o '-HH:MM'
    const timezoneOffset = -date.getTimezoneOffset(); // Negativo para ajustar el signo
    const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
    const offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
    const offsetSign = timezoneOffset >= 0 ? '+' : '-';

    const timezone = `${offsetSign}${offsetHours}:${offsetMinutes}`;

    // Retorna la fecha en el formato 'YYYY-MM-DDTHH:MM:SS+02:00'
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezone}`;
}



// Capturar el evento de envío del formulario
document.getElementById('eventForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Evitar el envío tradicional del formulario

    const eventTitle = document.getElementById('eventTitle').value;
    const startDateTime = document.getElementById('startDateTime').value; // Formato 'YYYY-MM-DDTHH:MM'
    const endDateTime = document.getElementById('endDateTime').value;

    // Convertir el valor del input 'datetime-local' a Date y luego formatearlo con zona horaria y segundos
    const formattedStartDateTime = addTimezoneAndSeconds(new Date(startDateTime));
    const formattedEndDateTime = addTimezoneAndSeconds(new Date(endDateTime));

    // Enviar los datos del evento al backend
    axios.post('http://localhost:5000/add-event', {
        summary: eventTitle,
        start: formattedStartDateTime,  // Fecha en formato ISO con segundos y zona horaria
        end: formattedEndDateTime       // Fecha en formato ISO con segundos y zona horaria
    })
    .then(response => {
        console.log('Evento agregado con éxito', response.data);

        // Insertar display al messagecontainer cuando la operación sea exitosa
        const messagecontainer = document.getElementById('messageContainer')
        messagecontainer.style.display = 'block'

        // Puedes ocultar el formulario aquí si quieres
        document.getElementById('eventFormContainer').style.display = 'none';
    })
    .catch(error => {
        const messageContainerError = document.getElementById('messageContainerError')
        messageContainerError.style.display = 'block'
        console.error('Error al agregar el evento', error);
    });
});

// Llamar a getBusyDays al cargar la página
window.onload = function () {
    getBusyDays();
};
