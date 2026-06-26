import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p50623390_school_navigator')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

DAY_NAMES = {1: 'Понедельник', 2: 'Вторник', 3: 'Среда', 4: 'Четверг', 5: 'Пятница'}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Возвращает расписание для класса пользователя по его session_id."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    session_id = headers.get('x-session-id') or headers.get('X-Session-Id')

    if not session_id:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'no_session'})}

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(f'SELECT class_name FROM {SCHEMA}.users WHERE session_id = %s', (session_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'user_not_found'})}

    class_name = row[0]

    cur.execute(
        f'''SELECT day_of_week, lesson_num, time_start, time_end, subject, teacher, cabinet
           FROM {SCHEMA}.schedule
           WHERE class_name = %s
           ORDER BY day_of_week, lesson_num''',
        (class_name,)
    )
    rows = cur.fetchall()
    conn.close()

    days: dict = {}
    for r in rows:
        day, num, t_start, t_end, subject, teacher, cabinet = r
        key = str(day)
        if key not in days:
            days[key] = {'day': day, 'day_name': DAY_NAMES.get(day, ''), 'lessons': []}
        days[key]['lessons'].append({
            'num': num,
            'time_start': t_start,
            'time_end': t_end,
            'subject': subject,
            'teacher': teacher,
            'cabinet': cabinet,
        })

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({'class_name': class_name, 'days': list(days.values())}, ensure_ascii=False)
    }