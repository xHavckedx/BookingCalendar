import datetime
import os
from flask_cors import CORS
from flask import Flask, request, jsonify
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

app = Flask(__name__)

# Habilitar CORS
CORS(app)

# Configuración de permisos de Google Calendar
SCOPES = ['https://www.googleapis.com/auth/calendar']

# Función auxiliar para obtener o actualizar credenciales
def get_credentials():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # Si las credenciales no son válidas, renovarlas o crear nuevas
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                './back/credentials.json', SCOPES)
            creds = flow.run_local_server(port=4000)
        # Guardar las nuevas credenciales
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    
    return creds

# Función auxiliar para obtener un servicio de Google Calendar
def get_calendar_service():
    creds = get_credentials()
    return build('calendar', 'v3', credentials=creds)

# Ruta para autenticar al usuario y obtener credenciales
@app.route('/authenticate')
def authenticate():
    creds = get_credentials()
    return jsonify({'message': 'Authenticated successfully'})

# Función auxiliar para obtener el rango de fechas para el mes actual
def get_month_date_range():
    now = datetime.datetime.utcnow()
    first_day_of_month = now.replace(day=1)
    
    if now.month == 12:
        first_day_next_month = first_day_of_month.replace(year=now.year + 1, month=1)
    else:
        first_day_next_month = first_day_of_month.replace(month=now.month + 1)

    time_min = first_day_of_month.isoformat() + 'Z'
    time_max = first_day_next_month.isoformat() + 'Z'
    
    return time_min, time_max

# Ruta para obtener los días ocupados en el calendario de Google Calendar durante el mes actual
@app.route('/get-busy-days', methods=['GET'])
def get_busy_days():
    service = get_calendar_service()
    time_min, time_max = get_month_date_range()

    # Obtener los eventos dentro del mes actual
    events_result = service.events().list(
        calendarId='primary', timeMin=time_min, timeMax=time_max,
        singleEvents=True, orderBy='startTime').execute()

    events = events_result.get('items', [])
    busy_days = [event['start'].get('dateTime', event['start'].get('date')) for event in events]

    return jsonify({'busy_days': busy_days})

# Ruta para agregar un nuevo evento al calendario
@app.route('/add-event', methods=['POST'])
def add_event():
    if request.method == 'OPTIONS':
        # Respuesta para la solicitud preflight
        response = jsonify({'message': 'Preflight check successful'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response, 200
    
    data = request.json
    service = get_calendar_service()

    # Crear el nuevo evento
    event = {
        'summary': data['summary'],
        'start': {
            'dateTime': data['start']['dateTime'],
            'timeZone': data['start']['timeZone'],
        },
        'end': {
            'dateTime': data['end']['dateTime'],
            'timeZone': data['end']['timeZone'],
        },
    }

    created_event = service.events().insert(calendarId='primary', body=event).execute()

    return jsonify({'message': 'Event created successfully', 'event': created_event})

if __name__ == '__main__':
    app.run(debug=True)
