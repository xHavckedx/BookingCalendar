import { DateTimeFormatterSingleton } from "./DateTimeFormater.js";
export class EventForm {
    constructor(formElementId, eventFormContainerId) {
        this.formElement = document.getElementById(formElementId);
        this.eventFormContainer = document.getElementById(eventFormContainerId);
        this.startDateTimeInput = document.getElementById('startDateTime');
        this.endDateTimeInput = document.getElementById('endDateTime');
        this.formatter = new DateTimeFormatterSingleton();
        this.formElement.addEventListener('submit', this.submitForm.bind(this));
    }

    show(selectedDate, selectedHour) {
        this.eventFormContainer.style.display = 'block';
        const formattedStartDateTime = this.formatDateTime(selectedDate, selectedHour, false);
        this.startDateTimeInput.value = formattedStartDateTime;

        const formattedEndDateTime = this.formatDateTime(selectedDate, selectedHour, true);
        this.endDateTimeInput.value = formattedEndDateTime;

        this.startDateTimeInput.disabled = true;
        this.endDateTimeInput.disabled = true;
    }

    formatDateTime(date, hour, isEndDate) {
        const [hourString, minuteString] = hour.split(':');
        date.setHours(parseInt(hourString), parseInt(minuteString), 0, 0);
    
        if (isEndDate){
            date.setHours(date.getHours() + 1);
        }

        // Formatear la fecha en Europe/Madrid
        // Obtener las partes formateadas de la fecha
        const formattedParts = this.formatter.format(date);

        //formatear la fecha
        const formatedDate = this.formatter.formatDate(formattedParts, date, false)
    
        // Devolver el formato 'YYYY-MM-DDTHH:MM'
        return formatedDate;
    }
    
    resultMessageEvent(isCorrect){
        const messageContainer = document.getElementById('messageContainer')
        const messageContainerError = document.getElementById('messageContainerError')
        if (isCorrect){
            messageContainer.style.display = 'block'
            messageContainerError.style.display = 'none'
        } else if (!isCorrect){
            messageContainerError.style.display = 'block'
            messageContainer.style.display = 'none'
        }
    }

    extractTimeFromDateTime(dateTimeString) {
        // Dividimos la cadena por la letra 'T'
        const [date, time] = dateTimeString.split('T');
        
        // Retornamos solo la parte de la hora (HH:MM)
        return time;
    }

    formatToGoogleCalendarISO(dateTimeString) {
        // Crear el objeto Date a partir de la fecha y hora proporcionada
        const date = new Date(dateTimeString + ':00'); // Asegurar que se incluya segundos "00"
    
        // Obtener las partes formateadas de la fecha
        const formattedParts = this.formatter.format(date);

        //formatear la fecha
        const formatedDate = this.formatter.formatDate(formattedParts, date, true)
        return formatedDate
    }

    submitForm(event) {
        event.preventDefault();
        const eventTitle = document.getElementById('eventTitle').value;
    
        const startDateTime = this.formatDateTime(new Date(this.startDateTimeInput.value), this.extractTimeFromDateTime(this.startDateTimeInput.value), false);
        const endDateTime = this.formatDateTime(new Date(this.endDateTimeInput.value), this.extractTimeFromDateTime(this.endDateTimeInput.value), false);

        axios.post('http://localhost:5000/add-event', {
            summary: eventTitle,
            start: {
                dateTime: this.formatToGoogleCalendarISO(startDateTime),
                timeZone: 'Europe/Madrid'
            },
            end: {
                dateTime: this.formatToGoogleCalendarISO(endDateTime),
                timeZone: 'Europe/Madrid'
            }
        }
        ).then(response => {
            console.log('Evento agregado con éxito', response.data);
            this.resultMessageEvent(response);
            this.eventFormContainer.style.display = 'none';
        })
        .catch(error => {
            console.error('Error al agregar el evento', error);
            this.resultMessageEvent(false);
        });
    }
    
}
