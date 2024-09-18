// Importamos las clases desde sus respectivos archivos
import { Calendar } from './Calendar.js';

window.onload = function () {
    const calendar = new Calendar('calendar', 'monthYear', 'hoursList', 'eventForm', 'eventFormContainer');
    calendar.initCalendar();
    
    document.getElementById('prevMonth').addEventListener('click', () => calendar.prevMonth());
    document.getElementById('nextMonth').addEventListener('click', () => calendar.nextMonth());
    
};
