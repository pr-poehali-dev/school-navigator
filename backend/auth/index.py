import json
import os
import uuid
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p50623390_school_navigator')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Регистрация пользователя и получение профиля по session_id."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    headers = event.get('headers') or {}
    session_id = headers.get('x-session-id') or headers.get('X-Session-Id')

    if method == 'GET':
        if not session_id:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'no_session'})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f'SELECT id, name, class_name FROM {SCHEMA}.users WHERE session_id = %s',
            (session_id,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not_found'})}
        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({'id': row[0], 'name': row[1], 'class_name': row[2]})
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = (body.get('name') or '').strip()
        class_name = (body.get('class_name') or '').strip()
        if not name or not class_name:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'name and class_name required'})}

        new_session = str(uuid.uuid4())
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f'INSERT INTO {SCHEMA}.users (name, class_name, session_id) VALUES (%s, %s, %s) RETURNING id',
            (name, class_name, new_session)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({'id': user_id, 'name': name, 'class_name': class_name, 'session_id': new_session})
        }

    return {'statusCode': 405, 'headers': CORS, 'body': ''}