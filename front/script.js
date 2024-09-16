
let busyDays = [];

// Autenticación con Google
function authenticate() {
    axios.get('http://localhost:5000/authenticate')
        .then(response => {
            alert('Authenticated successfully');
        })
        .catch(error => {
            console.error('Error authenticating', error);
        });
}

// Obtener los días ocupados del backend
// Obtener los días y horas ocupados del backend
function getBusyDays() {
    axios.get('http://localhost:5000/get-busy-days')
        .then(response => {
            console.log("Datos recibidos del backend: ", response.data);
            busyDays = response.data.busy_days.map(day => new Date(day)); // Convertir a objeto Date
            console.log("Días ocupados después de convertir: ", busyDays);
            initializeFlatpickr();
        })
        .catch(error => {
            console.error('Error fetching busy days', error);
        });
}

// Inicializar Flatpickr con las horas ocupadas deshabilitadas
function initializeFlatpickr() {
    flatpickr('#startDate', {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        disable: [
            function (date) {
                // Verificar si la fecha seleccionada (con horas) está dentro de los eventos ocupados
                return busyDays.some(busyDate => {
                    // Comparar el día
                    const isSameDay = date.toDateString() === busyDate.toDateString();
                    // Comparar si la hora está ocupada
                    const isSameHour = date.getHours() === busyDate.getHours();
                    // Si es el mismo día y la misma hora, deshabilitar esa hora
                    return isSameDay && isSameHour;
                });
            }
        ],
        time_24hr: true, // Formato de 24 horas
        minDate: "today"  // Opcional: deshabilitar fechas anteriores a hoy
    });

    flatpickr('#endDate', {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        disable: [
            function (date) {
                return busyDays.some(busyDate => {
                    const isSameDay = date.toDateString() === busyDate.toDateString();
                    const isSameHour = date.getHours() === busyDate.getHours();
                    return isSameDay && isSameHour;
                });
            }
        ],
        time_24hr: true,
        minDate: "today"
    });
}

// Llamar a getBusyDays al cargar la página
window.onload = function () {
    getBusyDays();
};

// Agregar evento al calendario
function addEvent() {
    const eventTitle = document.getElementById('eventTitle').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!eventTitle || !startDate || !endDate) {
        alert('Please fill in all fields');
        return;
    }

    axios.post('http://localhost:5000/add-event', {
        summary: eventTitle,
        start: new Date(startDate).toISOString(),
        end: new Date(endDate).toISOString()
    })
        .then(response => {
            alert('Event added successfully');
        })
        .catch(error => {
            console.error('Error adding event', error);
        });
}