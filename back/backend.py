import datetime
import os
from flask_cors import CORS
from flask import Flask, request, jsonify
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

app = Flask(__name__)

#Habilitar CORS

CORS(app)

# Configuración de permisos de Google Calendar
SCOPES = ['https://www.googleapis.com/auth/calendar']

@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# Ruta para autenticar al usuario y obtener credenciales
@app.route('/authenticate')
def authenticate():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                './back/credentials.json', SCOPES)
            creds = flow.run_local_server(port=4000)
        
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return jsonify({'message': 'Authenticated successfully'})


# Ruta para obtener los días ocupados en el calendario de Google Calendar durante el mes actual
@app.route('/get-busy-days', methods=['GET'])
def get_busy_days():
    creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    service = build('calendar', 'v3', credentials=creds)

    # Obtener la fecha actual
    now = datetime.datetime.utcnow()
    
    # Definir el primer día del mes actual
    first_day_of_month = now.replace(day=1)
    
    # Definir el primer día del siguiente mes, restándole un microsegundo para obtener el último segundo del mes actual
    if now.month == 12:  # Si estamos en diciembre, el siguiente mes es enero del siguiente año
        first_day_next_month = first_day_of_month.replace(year=now.year + 1, month=1)
    else:
        first_day_next_month = first_day_of_month.replace(month=now.month + 1)

    # Convertimos ambas fechas a formato ISO con zona horaria UTC ('Z')
    time_min = first_day_of_month.isoformat() + 'Z'
    time_max = first_day_next_month.isoformat() + 'Z'

    # Obtener los eventos dentro del mes actual
    events_result = service.events().list(
        calendarId='primary', timeMin=time_min, timeMax=time_max,
        singleEvents=True, orderBy='startTime').execute()

    events = events_result.get('items', [])

    busy_days = []
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        busy_days.append(start)

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
    creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    service = build('calendar', 'v3', credentials=creds)

    # Crear el nuevo evento
    event = {
        'summary': data['summary'],
        'start': {
            'dateTime': data['start'],  # Fecha y hora de inicio
            'timeZone': 'Europe/Madrid',  # Ajusta esto según tu zona horaria
        },
        'end': {
            'dateTime': data['end'],  # Fecha y hora de fin
            'timeZone': 'Europe/Madrid',
        },
    }

    created_event = service.events().insert(calendarId='primary', body=event).execute()

    return jsonify({'message': 'Event created successfully', 'event': created_event})


if __name__ == '__main__':
    app.run(debug=True)
