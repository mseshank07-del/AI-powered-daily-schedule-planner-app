from datetime import datetime, date, timedelta
import uuid

def generate_ics(schedule):
    today = date.today()
    lines = []
    lines.append('BEGIN:VCALENDAR')
    lines.append('VERSION:2.0')
    lines.append('PRODID:-//DayPlan//EN')
    lines.append('CALSCALE:GREGORIAN')
    
    for task in schedule:
        start_h, start_m = map(int, task['start_time'].split(':'))
        end_h, end_m = map(int, task['end_time'].split(':'))
        start_dt = datetime(today.year, today.month, today.day, start_h, start_m, 0)
        due_dt = datetime(today.year, today.month, today.day, end_h, end_m, 0)
        uid = str(uuid.uuid4())
        
        lines.append('BEGIN:VTODO')
        lines.append(f'UID:{uid}')
        lines.append(f'SUMMARY:{task["name"]}')
        lines.append(f'DTSTART:{start_dt.strftime("%Y%m%dT%H%M%S")}')
        lines.append(f'DUE:{due_dt.strftime("%Y%m%dT%H%M%S")}')
        lines.append(f'DTSTAMP:{datetime.utcnow().strftime("%Y%m%dT%H%M%S")}Z')
        lines.append('STATUS:NEEDS-ACTION')
        lines.append('BEGIN:VALARM')
        lines.append('TRIGGER:-PT5M')
        lines.append('ACTION:DISPLAY')
        lines.append(f'DESCRIPTION:Starting soon: {task["name"]}')
        lines.append('END:VALARM')
        lines.append('END:VTODO')
    
    lines.append('END:VCALENDAR')
    return '\r\n'.join(lines) + '\r\n'
