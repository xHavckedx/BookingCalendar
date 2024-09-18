export class BusyDayManager {
    constructor() {
        this.busyDays = [];
    }

    // Método que devuelve una promesa cuando los días ocupados se cargan
    getBusyDays() {
        return axios.get('http://localhost:5000/get-busy-days')
            .then(response => {
                console.log("Datos recibidos del backend: ", response.data);
                this.busyDays = response.data.busy_days.map(day => new Date(day));
                console.log("Días ocupados después de convertir: ", this.busyDays);
            })
            .catch(error => {
                console.error('Error fetching busy days', error);
            });
    }

    getBusyHoursForDay(date) {
        return this.busyDays
            .filter(busyDate => busyDate.toDateString() === date.toDateString())
            .map(busyDate => busyDate.getHours());
    }

    generateAvailableHours(busyHours) {
        const hours = [];
        for (let h = 7; h <= 18; h++) {
            if (!busyHours.includes(h)) {
                hours.push(`${h < 10 ? '0' : ''}${h}:00`);
            }
        }
        return hours;
    }
}
