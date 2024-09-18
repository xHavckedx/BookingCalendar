//Singleton

export class DateTimeFormatterSingleton {
    constructor() {
        if (!DateTimeFormatterSingleton.instance) {
            // Crear la instancia única de Intl.DateTimeFormat
            this.formatter = new Intl.DateTimeFormat('sv-SE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'Europe/Madrid',
            });
            DateTimeFormatterSingleton.instance = this;
        }

        return DateTimeFormatterSingleton.instance;
    }

    // Método para usar el formatter
    format(date) {
        return this.formatter.formatToParts(date);
    }

    formatDate(formattedParts, date, inISO){
        const year = formattedParts.find(part => part.type === 'year').value;
        const month = formattedParts.find(part => part.type === 'month').value;
        const day = formattedParts.find(part => part.type === 'day').value;
        const hour = formattedParts.find(part => part.type === 'hour').value;
        const minute = formattedParts.find(part => part.type === 'minute').value;
        const second = formattedParts.find(part => part.type === 'second').value;
    
        // Obtener el offset de la zona horaria actual en minutos
        const timeZoneOffset = -date.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(timeZoneOffset) / 60);
        const offsetMinutes = Math.abs(timeZoneOffset) % 60;
        const offsetSign = timeZoneOffset >= 0 ? '+' : '-';
    
        // Asegurarse de que horas y minutos del offset tengan dos dígitos
        const formattedOffset = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    
        // Devolver la cadena en formato ISO con el offset de la zona horaria
        if (inISO){
            return `${year}-${month}-${day}T${hour}:${minute}:${second}${formattedOffset}`;
        }else{
            return `${year}-${month}-${day}T${hour}:${minute}`
        }
    }
}