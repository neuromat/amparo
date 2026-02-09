#!/bin/sh
set -e

echo "Waiting for PostgreSQL at ${DB_HOST:-db}:${DB_PORT:-5432}..."

python3 -c "
import time, psycopg2, os
for i in range(30):
    try:
        conn = psycopg2.connect(
            dbname=os.environ.get('DB_NAME', 'amparoapp'),
            user=os.environ.get('DB_USER', 'admin_amparo'),
            password=os.environ.get('DB_PASSWORD', ''),
            host=os.environ.get('DB_HOST', 'db'),
            port=int(os.environ.get('DB_PORT', 5432)),
        )
        conn.close()
        print('PostgreSQL is ready!')
        break
    except psycopg2.OperationalError:
        print(f'Attempt {i+1}/30 - waiting...')
        time.sleep(2)
else:
    print('ERROR: Could not connect to PostgreSQL after 30 attempts')
    exit(1)
"

echo "Starting gunicorn..."
exec gunicorn \
    --bind 0.0.0.0:5000 \
    --workers "${GUNICORN_WORKERS:-2}" \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    app:app
