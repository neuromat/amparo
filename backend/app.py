from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, request, send_from_directory, session
from flask_cors import CORS
from flask_session import Session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash
import os
import secrets
import logging
from datetime import datetime
from pathlib import Path
from functools import wraps
import psycopg2
import psycopg2.extras

app = Flask(__name__, static_folder='static', static_url_path='')

# ========================================
# SEGURANÇA
# ========================================

IS_PRODUCTION = os.environ.get('FLASK_ENV') == 'production'

# CORS: whitelist explícita de origens permitidas
ALLOWED_ORIGINS = os.environ.get(
    'ALLOWED_ORIGINS',
    '' if IS_PRODUCTION else 'http://localhost:5173'
).split(',')
ALLOWED_ORIGINS = [o.strip() for o in ALLOWED_ORIGINS if o.strip()]

CORS(app,
     supports_credentials=True,
     origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else None,
     allow_headers=['Content-Type'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Configuração de sessão
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))
if IS_PRODUCTION and not os.environ.get('SECRET_KEY'):
    logging.warning("ATENÇÃO: SECRET_KEY não definida! Sessões serão invalidadas a cada restart.")
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './flask_session'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = IS_PRODUCTION  # True em produção (HTTPS)
app.config['SESSION_COOKIE_HTTPONLY'] = True
Session(app)

# Rate limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per hour"],
    storage_uri="memory://",
)


# Proteção CSRF: valida Origin em requisições que modificam estado
@app.before_request
def csrf_protect():
    if request.method in ('POST', 'PUT', 'DELETE'):
        origin = request.headers.get('Origin')
        # Se tem Origin header, validar contra whitelist
        if origin:
            if ALLOWED_ORIGINS and origin not in ALLOWED_ORIGINS:
                return jsonify({'error': 'Origin not allowed'}), 403
        # Em produção, exigir que Origin ou Referer esteja presente
        elif IS_PRODUCTION:
            referer = request.headers.get('Referer')
            if not referer:
                return jsonify({'error': 'Missing Origin header'}), 403

# Configuração do PostgreSQL
DB_CONFIG = {
    'dbname': os.environ.get('DB_NAME', 'amparoapp'),
    'user': os.environ.get('DB_USER', 'lucmol'),
    'host': os.environ.get('DB_HOST', '/var/run/postgresql'),
    'port': int(os.environ.get('DB_PORT', 5432)),
}
db_password = os.environ.get('DB_PASSWORD')
if db_password:
    DB_CONFIG['password'] = db_password

# Caminho para estáticos
if os.getenv('FLASK_ENV') == 'production':
    STATIC_PATH = Path(__file__).parent / 'static'
else:
    STATIC_PATH = Path(__file__).parent.parent.parent


def get_db():
    """Retorna uma conexão ao PostgreSQL"""
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = True
    return conn


def query_all(sql, params=None):
    """Executa query e retorna lista de dicts"""
    conn = get_db()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, params or ())
        rows = cur.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def query_one(sql, params=None):
    """Executa query e retorna um dict ou None"""
    conn = get_db()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, params or ())
        row = cur.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def query_scalar(sql, params=None):
    """Executa query e retorna valor escalar"""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute(sql, params or ())
        row = cur.fetchone()
        return row[0] if row else None
    finally:
        conn.close()


def execute(sql, params=None):
    """Executa INSERT/UPDATE/DELETE"""
    conn = get_db()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, params or ())
        try:
            return dict(cur.fetchone()) if cur.description else None
        except psycopg2.ProgrammingError:
            return None
    finally:
        conn.close()


# ========================================
# AUTENTICAÇÃO
# ========================================

def get_current_user():
    """Retorna usuário logado ou None"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    return query_one(
        "SELECT id, username, email, role, nome FROM auth_users WHERE id = %s",
        (user_id,)
    )


def require_auth(role=None):
    """Decorator para proteger rotas"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({'error': 'Unauthorized'}), 401
            if role and user['role'] != role and user['role'] != 'admin':
                return jsonify({'error': 'Forbidden'}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator


def extract_speaker_info(resume_speaker, affiliation):
    """Extrai informações úteis do resume_speaker para criar um nome descritivo"""
    if not resume_speaker:
        if affiliation and len(affiliation) > 100:
            return affiliation[:97] + '...'
        return affiliation if affiliation else 'Palestrante'

    resume_lower = resume_speaker.lower()

    professions = [
        ('professor doutor', 'Professor Doutor'),
        ('professora doutora', 'Professora Doutora'),
        ('professor adjunto', 'Professor Adjunto'),
        ('professora adjunta', 'Professora Adjunta'),
        ('professor', 'Professor'),
        ('professora', 'Professora'),
        ('fisioterapeuta', 'Fisioterapeuta'),
        ('enfermeira', 'Enfermeira'),
        ('enfermeiro', 'Enfermeiro'),
        ('fonoaudióloga', 'Fonoaudióloga'),
        ('fonoaudiólogo', 'Fonoaudiólogo'),
        ('psicóloga', 'Psicóloga'),
        ('psicólogo', 'Psicólogo'),
        ('terapeuta ocupacional', 'Terapeuta Ocupacional'),
        ('nutricionista', 'Nutricionista'),
        ('advogada', 'Advogada'),
        ('advogado', 'Advogado'),
        ('coordenadora', 'Coordenadora'),
        ('coordenador', 'Coordenador'),
        ('diretor técnico', 'Diretor Técnico'),
        ('diretora técnica', 'Diretora Técnica'),
    ]

    for search_term, profession_title in professions:
        if search_term in resume_lower:
            if affiliation and affiliation != 'Palestrante':
                if len(affiliation) > 60:
                    affiliation_short = affiliation[:57] + '...'
                    return f"{profession_title} - {affiliation_short}"
                return f"{profession_title} - {affiliation}"
            return profession_title

    if affiliation:
        if len(affiliation) > 100:
            return affiliation[:97] + '...'
        return affiliation

    return 'Palestrante'


def serialize_datetime(obj):
    """Converte datetime para string ISO"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


def serialize_row(row):
    """Converte um dict de row do banco para JSON-serializable"""
    if not row:
        return row
    result = {}
    for k, v in row.items():
        if isinstance(v, datetime):
            result[k] = v.isoformat()
        elif isinstance(v, list):
            result[k] = v
        else:
            result[k] = v
    return result


# ========================================
# ENDPOINTS
# ========================================

@app.route('/api/health', methods=['GET'])
def health():
    """Endpoint de verificação de saúde"""
    return jsonify({"status": "ok", "message": "AMPARO API is running", "db": "postgresql"})


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Retorna estatísticas gerais do projeto"""
    total_usuarios = query_scalar("SELECT COUNT(*) FROM users_customuser")
    total_videos = query_scalar("SELECT COUNT(*) FROM blog_lecturevideo")
    total_palestras = query_scalar("SELECT COUNT(DISTINCT master_id) FROM blog_blog_translation WHERE master_id IS NOT NULL")
    total_exercicios = query_scalar("SELECT COUNT(*) FROM exercicios")
    total_estudos = query_scalar("SELECT COUNT(*) FROM estudos")
    total_cartilhas = query_scalar("SELECT COUNT(*) FROM blog_lecturefile")

    # Usuários por tipo
    type_counts_rows = query_all("""
        SELECT ut.name, COUNT(uc.id) as cnt
        FROM users_type ut
        LEFT JOIN users_customuser uc ON uc.type_of_person_id = ut.id
        GROUP BY ut.name
    """)
    type_counts = {r['name']: r['cnt'] for r in type_counts_rows}

    return jsonify({
        "total_usuarios": total_usuarios,
        "total_palestras": total_palestras,
        "total_videos": total_videos,
        "total_exercicios": total_exercicios,
        "total_estudos": total_estudos,
        "total_cartilhas": total_cartilhas,
        "total_conteudos": total_palestras + total_exercicios + total_estudos + total_cartilhas,
        "usuarios_por_tipo": type_counts
    })


@app.route('/api/latest-videos', methods=['GET'])
def get_latest_videos():
    """Retorna os vídeos mais recentes de todas as categorias"""
    limit = request.args.get('limit', 6, type=int)

    all_videos = []

    # Palestras com vídeo (publicadas)
    palestra_videos = query_all("""
        SELECT b.id, t.title, b.speaker, t.date_time, v.video, b.subcategory
        FROM blog_blog b
        JOIN blog_blog_translation t ON t.master_id = b.id AND t.language_code = 'pt-br'
        JOIN blog_lecturevideo v ON v.blog_post_id = b.id
        WHERE b.publish = true
        ORDER BY t.date_time DESC
    """)
    for pv in palestra_videos:
        all_videos.append({
            'id': pv['id'],
            'title': pv['title'] or '',
            'speaker': pv['speaker'] or '',
            'date': pv['date_time'].isoformat() if pv['date_time'] else '',
            'video_url': pv['video'] or '',
            'source': 'palestras',
            'link': f'/conteudos/palestras/{pv["id"]}'
        })

    # Exercícios com vídeo (não mockup)
    ex_videos = query_all("""
        SELECT id, title, instructor, published_date, video_url
        FROM exercicios
        WHERE mockup = false AND video_url IS NOT NULL AND video_url != ''
        ORDER BY published_date DESC
    """)
    for ex in ex_videos:
        all_videos.append({
            'id': ex['id'],
            'title': ex['title'] or '',
            'speaker': ex['instructor'] or '',
            'date': ex['published_date'].isoformat() if ex['published_date'] else '',
            'video_url': ex['video_url'] or '',
            'source': 'exercicios',
            'link': f'/conteudos/exercicios/{ex["id"]}'
        })

    # Estudos tipo vídeo (não mockup)
    est_videos = query_all("""
        SELECT id, title, author, published_date, external_link
        FROM estudos
        WHERE mockup = false AND content_type = 'video'
        ORDER BY published_date DESC
    """)
    for est in est_videos:
        all_videos.append({
            'id': est['id'],
            'title': est['title'] or '',
            'speaker': est['author'] or '',
            'date': est['published_date'].isoformat() if est['published_date'] else '',
            'video_url': est['external_link'] or '',
            'source': 'estudos',
            'link': f'/conteudos/estudos/{est["id"]}'
        })

    # Ordenar por data (mais recente primeiro)
    all_videos.sort(key=lambda x: x.get('date', ''), reverse=True)
    return jsonify(all_videos[:limit])


@app.route('/api/palestras', methods=['GET'])
def get_palestras():
    """Retorna lista de palestras com traduções e vídeos"""
    subcategory_filter = request.args.get('subcategory', None)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    # Query base com JOIN
    where_clause = ""
    params = []
    if subcategory_filter:
        where_clause = "AND b.subcategory = %s"
        params.append(subcategory_filter)

    # Total count
    total = query_scalar(f"""
        SELECT COUNT(*)
        FROM blog_blog_translation t
        JOIN blog_blog b ON b.id = t.master_id
        WHERE t.language_code = 'pt-br' {where_clause}
    """, params)

    # Dados paginados
    offset = (page - 1) * per_page
    rows = query_all(f"""
        SELECT b.id, b.speaker, b.moderator, b.slug, b.image, b.subcategory, b.publish, b.banner,
               t.title, t.date_time, t.resume_speaker, t.affiliation, t.body
        FROM blog_blog_translation t
        JOIN blog_blog b ON b.id = t.master_id
        WHERE t.language_code = 'pt-br' {where_clause}
        ORDER BY t.date_time DESC
        LIMIT %s OFFSET %s
    """, params + [per_page, offset])

    # Buscar vídeos para esses IDs
    if rows:
        ids = [r['id'] for r in rows]
        videos = query_all("""
            SELECT id, video, blog_post_id
            FROM blog_lecturevideo
            WHERE blog_post_id = ANY(%s)
        """, (ids,))
        video_dict = {}
        for v in videos:
            bid = v['blog_post_id']
            if bid not in video_dict:
                video_dict[bid] = []
            video_dict[bid].append(serialize_row(v))
    else:
        video_dict = {}

    result = []
    for r in rows:
        speaker_name = r['speaker'] or ''
        if not speaker_name:
            speaker_name = extract_speaker_info(
                r['resume_speaker'] or '',
                r['affiliation'] or ''
            )

        result.append({
            "id": r['id'],
            "slug": r['slug'] or f"palestra-{r['id']}",
            "speaker": speaker_name,
            "moderator": r['moderator'] or '',
            "image": "",
            "publish": True,
            "banner": False,
            "title": r['title'],
            "date_time": r['date_time'].isoformat() if r['date_time'] else None,
            "resume_speaker": r['resume_speaker'] or '',
            "affiliation": r['affiliation'] or '',
            "body": r['body'] or '',
            "subcategory": r['subcategory'] or 'palestras',
            "videos": video_dict.get(r['id'], [])
        })

    total_pages = (total + per_page - 1) // per_page if total else 0
    return jsonify({
        "palestras": result,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    })


@app.route('/api/palestras/<int:palestra_id>', methods=['GET'])
def get_palestra(palestra_id):
    """Retorna detalhes de uma palestra específica"""
    row = query_one("""
        SELECT b.id, b.speaker, b.moderator, b.slug, b.subcategory,
               t.title, t.date_time, t.resume_speaker, t.affiliation, t.body
        FROM blog_blog_translation t
        JOIN blog_blog b ON b.id = t.master_id
        WHERE t.language_code = 'pt-br' AND b.id = %s
    """, (palestra_id,))

    if not row:
        return jsonify({"error": "Palestra não encontrada"}), 404

    videos = query_all("""
        SELECT id, video, blog_post_id
        FROM blog_lecturevideo WHERE blog_post_id = %s
    """, (palestra_id,))

    speaker_name = row['speaker'] or ''
    if not speaker_name:
        speaker_name = extract_speaker_info(
            row['resume_speaker'] or '',
            row['affiliation'] or ''
        )

    return jsonify({
        "id": palestra_id,
        "slug": row['slug'] or f"palestra-{palestra_id}",
        "speaker": speaker_name,
        "moderator": row['moderator'] or '',
        "image": "",
        "publish": True,
        "banner": False,
        "title": row['title'],
        "date_time": row['date_time'].isoformat() if row['date_time'] else None,
        "resume_speaker": row['resume_speaker'] or '',
        "affiliation": row['affiliation'] or '',
        "body": row['body'] or '',
        "subcategory": row['subcategory'] or 'palestras',
        "videos": [serialize_row(v) for v in videos]
    })


# CONTEÚDOS - EXERCÍCIOS
@app.route('/api/conteudos/exercicios', methods=['GET'])
def get_exercicios():
    """Retorna lista de exercícios com paginação e filtro por subcategoria"""
    subcategory = request.args.get('subcategory', None)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    where_clause = ""
    params = []
    if subcategory:
        where_clause = "WHERE subcategory = %s"
        params.append(subcategory)

    total = query_scalar(f"SELECT COUNT(*) FROM exercicios {where_clause}", params)

    offset = (page - 1) * per_page
    rows = query_all(f"""
        SELECT * FROM exercicios {where_clause}
        ORDER BY published_date DESC
        LIMIT %s OFFSET %s
    """, params + [per_page, offset])

    total_pages = (total + per_page - 1) // per_page if total else 0
    return jsonify({
        "exercicios": [serialize_row(r) for r in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    })


@app.route('/api/conteudos/exercicios/<int:exercicio_id>', methods=['GET'])
def get_exercicio(exercicio_id):
    """Retorna detalhes de um exercício específico"""
    row = query_one("SELECT * FROM exercicios WHERE id = %s", (exercicio_id,))
    if not row:
        return jsonify({"error": "Exercício não encontrado"}), 404
    return jsonify(serialize_row(row))


# Alias para editor (carrega sem prefixo /conteudos/)
@app.route('/api/exercicios/<int:exercicio_id>', methods=['GET'])
def get_exercicio_alias(exercicio_id):
    return get_exercicio(exercicio_id)


@app.route('/api/conteudos/exercicios', methods=['POST'])
@require_auth('editor')
def create_exercicio():
    """Cria um novo exercício"""
    data = request.json
    new_id = query_scalar("SELECT COALESCE(MAX(id), 0) + 1 FROM exercicios")
    execute("""
        INSERT INTO exercicios (id, mockup, title, description, instructor, duration_minutes,
            difficulty_level, category, subcategory, video_url, thumbnail,
            published_date, tags, equipment_needed, body)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        new_id, data.get('mockup', False), data['title'],
        data.get('description', ''), data.get('instructor', ''),
        data.get('duration_minutes'), data.get('difficulty_level', ''),
        data.get('category', ''), data.get('subcategory', ''),
        data.get('video_url', ''), data.get('thumbnail', ''),
        data.get('published_date'), data.get('tags', []),
        data.get('equipment_needed', []), data.get('body', '')
    ))
    return jsonify({"message": "Exercício criado", "id": new_id}), 201


@app.route('/api/conteudos/exercicios/<int:exercicio_id>', methods=['PUT'])
@require_auth('editor')
def update_exercicio(exercicio_id):
    """Atualiza um exercício existente"""
    data = request.json
    existing = query_one("SELECT id FROM exercicios WHERE id = %s", (exercicio_id,))
    if not existing:
        return jsonify({"error": "Exercício não encontrado"}), 404
    execute("""
        UPDATE exercicios SET title=%s, description=%s, instructor=%s, duration_minutes=%s,
            difficulty_level=%s, category=%s, subcategory=%s, video_url=%s, thumbnail=%s,
            published_date=%s, tags=%s, equipment_needed=%s, body=%s, mockup=%s
        WHERE id=%s
    """, (
        data['title'], data.get('description', ''), data.get('instructor', ''),
        data.get('duration_minutes'), data.get('difficulty_level', ''),
        data.get('category', ''), data.get('subcategory', ''),
        data.get('video_url', ''), data.get('thumbnail', ''),
        data.get('published_date'), data.get('tags', []),
        data.get('equipment_needed', []), data.get('body', ''),
        data.get('mockup', False), exercicio_id
    ))
    return jsonify({"message": "Exercício atualizado"})


@app.route('/api/conteudos/exercicios/<int:exercicio_id>', methods=['DELETE'])
@require_auth('editor')
def delete_exercicio(exercicio_id):
    """Deleta um exercício"""
    execute("DELETE FROM exercicios WHERE id = %s", (exercicio_id,))
    return jsonify({"message": "Exercício deletado"})


# CONTEÚDOS - ESTUDOS
@app.route('/api/conteudos/estudos', methods=['GET'])
def get_estudos():
    """Retorna lista de estudos com paginação"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    total = query_scalar("SELECT COUNT(*) FROM estudos")

    offset = (page - 1) * per_page
    rows = query_all("""
        SELECT * FROM estudos
        ORDER BY published_date DESC
        LIMIT %s OFFSET %s
    """, (per_page, offset))

    total_pages = (total + per_page - 1) // per_page if total else 0
    return jsonify({
        "estudos": [serialize_row(r) for r in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    })


@app.route('/api/conteudos/estudos/<int:estudo_id>', methods=['GET'])
def get_estudo(estudo_id):
    """Retorna detalhes de um estudo específico"""
    row = query_one("SELECT * FROM estudos WHERE id = %s", (estudo_id,))
    if not row:
        return jsonify({"error": "Estudo não encontrado"}), 404
    return jsonify(serialize_row(row))


# Alias para editor (carrega sem prefixo /conteudos/)
@app.route('/api/estudos/<int:estudo_id>', methods=['GET'])
def get_estudo_alias(estudo_id):
    return get_estudo(estudo_id)


@app.route('/api/conteudos/estudos', methods=['POST'])
@require_auth('editor')
def create_estudo():
    """Cria um novo estudo"""
    data = request.json
    new_id = query_scalar("SELECT COALESCE(MAX(id), 0) + 1 FROM estudos")
    execute("""
        INSERT INTO estudos (id, mockup, title, description, author, content_type,
            published_date, category, tags, body, external_link, pdf_file, reading_time_minutes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        new_id, data.get('mockup', False), data['title'],
        data.get('description', ''), data.get('author', ''),
        data.get('content_type', 'html'), data.get('published_date'),
        data.get('category', ''), data.get('tags', []),
        data.get('body', ''), data.get('external_link', ''),
        data.get('pdf_file', ''), data.get('reading_time_minutes')
    ))
    return jsonify({"message": "Estudo criado", "id": new_id}), 201


@app.route('/api/conteudos/estudos/<int:estudo_id>', methods=['PUT'])
@require_auth('editor')
def update_estudo(estudo_id):
    """Atualiza um estudo existente"""
    data = request.json
    existing = query_one("SELECT id FROM estudos WHERE id = %s", (estudo_id,))
    if not existing:
        return jsonify({"error": "Estudo não encontrado"}), 404
    execute("""
        UPDATE estudos SET title=%s, description=%s, author=%s, content_type=%s,
            published_date=%s, category=%s, tags=%s, body=%s, external_link=%s,
            pdf_file=%s, reading_time_minutes=%s, mockup=%s
        WHERE id=%s
    """, (
        data['title'], data.get('description', ''), data.get('author', ''),
        data.get('content_type', 'html'), data.get('published_date'),
        data.get('category', ''), data.get('tags', []),
        data.get('body', ''), data.get('external_link', ''),
        data.get('pdf_file', ''), data.get('reading_time_minutes'),
        data.get('mockup', False), estudo_id
    ))
    return jsonify({"message": "Estudo atualizado"})


@app.route('/api/conteudos/estudos/<int:estudo_id>', methods=['DELETE'])
@require_auth('editor')
def delete_estudo(estudo_id):
    """Deleta um estudo"""
    execute("DELETE FROM estudos WHERE id = %s", (estudo_id,))
    return jsonify({"message": "Estudo deletado"})


# CONTEÚDOS - CARTILHAS
@app.route('/api/conteudos/cartilhas', methods=['GET'])
def get_cartilhas():
    """Retorna lista de cartilhas (PDFs)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    total = query_scalar("""
        SELECT COUNT(*)
        FROM blog_lecturefile lf
        JOIN blog_blog_translation t ON t.master_id = lf.blog_post_id AND t.language_code = 'pt-br'
    """)

    offset = (page - 1) * per_page
    rows = query_all("""
        SELECT lf.id, lf.blog_post_id, lf.file as pdf_file,
               t.title, t.body as description, t.date_time as published_date, t.affiliation,
               b.speaker
        FROM blog_lecturefile lf
        JOIN blog_blog_translation t ON t.master_id = lf.blog_post_id AND t.language_code = 'pt-br'
        JOIN blog_blog b ON b.id = lf.blog_post_id
        ORDER BY t.date_time DESC
        LIMIT %s OFFSET %s
    """, (per_page, offset))

    result = []
    for r in rows:
        result.append({
            "id": r['id'],
            "blog_post_id": r['blog_post_id'],
            "title": r['title'] or 'Cartilha',
            "description": r['description'] or '',
            "pdf_file": r['pdf_file'],
            "published_date": r['published_date'].isoformat() if r['published_date'] else None,
            "speaker": r['speaker'] or '',
            "affiliation": r['affiliation'] or ''
        })

    total_pages = (total + per_page - 1) // per_page if total else 0
    return jsonify({
        "cartilhas": result,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    })


@app.route('/api/conteudos/cartilhas/<int:cartilha_id>', methods=['GET'])
def get_cartilha(cartilha_id):
    """Retorna detalhes de uma cartilha específica"""
    row = query_one("""
        SELECT lf.id, lf.blog_post_id, lf.file as pdf_file,
               t.title, t.body as description, t.date_time as published_date,
               t.affiliation, t.resume_speaker,
               b.speaker
        FROM blog_lecturefile lf
        JOIN blog_blog_translation t ON t.master_id = lf.blog_post_id AND t.language_code = 'pt-br'
        JOIN blog_blog b ON b.id = lf.blog_post_id
        WHERE lf.id = %s
    """, (cartilha_id,))

    if not row:
        return jsonify({"error": "Cartilha não encontrada"}), 404

    return jsonify({
        "id": row['id'],
        "blog_post_id": row['blog_post_id'],
        "title": row['title'] or 'Cartilha',
        "description": row['description'] or '',
        "pdf_file": row['pdf_file'],
        "published_date": row['published_date'].isoformat() if row['published_date'] else None,
        "speaker": row['speaker'] or '',
        "affiliation": row['affiliation'] or '',
        "resume_speaker": row['resume_speaker'] or ''
    })


# CONTEÚDOS - PALESTRAS (alias GET + CRUD)
@app.route('/api/conteudos/palestras', methods=['GET'])
def get_conteudos_palestras():
    return get_palestras()


@app.route('/api/conteudos/palestras/<int:palestra_id>', methods=['GET'])
def get_conteudo_palestra(palestra_id):
    return get_palestra(palestra_id)


@app.route('/api/conteudos/palestras', methods=['POST'])
@require_auth('editor')
def create_palestra():
    """Cria uma nova palestra (blog + translation + videos)"""
    data = request.json
    new_id = query_scalar("SELECT COALESCE(MAX(id), 0) + 1 FROM blog_blog")

    # Insere blog_blog
    execute("""
        INSERT INTO blog_blog (id, speaker, moderator, slug, image, publish, banner, posted, subcategory)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        new_id, data.get('speaker', ''), data.get('moderator', ''),
        data.get('slug', ''), data.get('image', ''),
        data.get('publish', True), data.get('banner', False),
        data.get('posted'), data.get('subcategory', 'palestras')
    ))

    # Insere tradução pt-br
    trans_id = query_scalar("SELECT COALESCE(MAX(id), 0) + 1 FROM blog_blog_translation")
    execute("""
        INSERT INTO blog_blog_translation (id, language_code, title, body, date_time, resume_speaker, master_id, affiliation)
        VALUES (%s, 'pt-br', %s, %s, %s, %s, %s, %s)
    """, (
        trans_id, data.get('title', ''), data.get('content', ''),
        data.get('date_time'), data.get('resume_speaker', ''),
        new_id, data.get('affiliation', '')
    ))

    # Insere vídeos
    videos = data.get('videos', [])
    for video_url in videos:
        vid_id = query_scalar("SELECT COALESCE(MAX(id), 0) + 1 FROM blog_lecturevideo")
        execute("""
            INSERT INTO blog_lecturevideo (id, video, blog_post_id)
            VALUES (%s, %s, %s)
        """, (vid_id, video_url, new_id))

    return jsonify({"message": "Palestra criada", "id": new_id}), 201


@app.route('/api/conteudos/palestras/<int:palestra_id>', methods=['PUT'])
@require_auth('editor')
def update_palestra(palestra_id):
    """Atualiza uma palestra existente"""
    data = request.json
    existing = query_one("SELECT id FROM blog_blog WHERE id = %s", (palestra_id,))
    if not existing:
        return jsonify({"error": "Palestra não encontrada"}), 404

    # Atualiza blog_blog
    execute("""
        UPDATE blog_blog SET speaker=%s, moderator=%s, slug=%s, image=%s,
            publish=%s, banner=%s, posted=%s, subcategory=%s
        WHERE id=%s
    """, (
        data.get('speaker', ''), data.get('moderator', ''),
        data.get('slug', ''), data.get('image', ''),
        data.get('publish', True), data.get('banner', False),
        data.get('posted'), data.get('subcategory', 'palestras'),
        palestra_id
    ))

    # Atualiza tradução pt-br
    execute("""
        UPDATE blog_blog_translation SET title=%s, body=%s, date_time=%s,
            resume_speaker=%s, affiliation=%s
        WHERE master_id=%s AND language_code='pt-br'
    """, (
        data.get('title', ''), data.get('content', ''),
        data.get('date_time'), data.get('resume_speaker', ''),
        data.get('affiliation', ''), palestra_id
    ))

    # Substitui vídeos
    videos = data.get('videos', [])
    execute("DELETE FROM blog_lecturevideo WHERE blog_post_id = %s", (palestra_id,))
    for video_url in videos:
        vid_id = query_scalar("SELECT COALESCE(MAX(id), 0) + 1 FROM blog_lecturevideo")
        execute("""
            INSERT INTO blog_lecturevideo (id, video, blog_post_id)
            VALUES (%s, %s, %s)
        """, (vid_id, video_url, palestra_id))

    return jsonify({"message": "Palestra atualizada"})


@app.route('/api/conteudos/palestras/<int:palestra_id>', methods=['DELETE'])
@require_auth('editor')
def delete_palestra(palestra_id):
    """Deleta uma palestra e seus vídeos/tradução"""
    execute("DELETE FROM blog_lecturevideo WHERE blog_post_id = %s", (palestra_id,))
    execute("DELETE FROM blog_blog_translation WHERE master_id = %s", (palestra_id,))
    execute("DELETE FROM blog_blog WHERE id = %s", (palestra_id,))
    return jsonify({"message": "Palestra deletada"})


# CONTEÚDOS - CARTILHAS CRUD
@app.route('/api/conteudos/cartilhas', methods=['POST'])
@require_auth('editor')
def create_cartilha():
    """Cria uma nova cartilha (blog + translation + file)"""
    data = request.json
    new_id = query_scalar("SELECT COALESCE(MAX(id), 0) + 1 FROM blog_blog")

    # Insere blog_blog
    execute("""
        INSERT INTO blog_blog (id, speaker, moderator, slug, image, publish, banner, posted, subcategory)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'palestras')
    """, (
        new_id, data.get('speaker', ''), data.get('moderator', ''),
        data.get('slug', ''), data.get('image', ''),
        data.get('publish', True), data.get('banner', False),
        data.get('posted')
    ))

    # Insere tradução pt-br
    trans_id = query_scalar("SELECT COALESCE(MAX(id), 0) + 1 FROM blog_blog_translation")
    execute("""
        INSERT INTO blog_blog_translation (id, language_code, title, body, date_time, resume_speaker, master_id, affiliation)
        VALUES (%s, 'pt-br', %s, %s, %s, %s, %s, %s)
    """, (
        trans_id, data.get('title', ''), data.get('content', ''),
        data.get('date_time'), data.get('resume_speaker', ''),
        new_id, data.get('affiliation', '')
    ))

    # Insere arquivos
    files = data.get('files', [])
    for file_path in files:
        file_id = query_scalar("SELECT COALESCE(MAX(id), 0) + 1 FROM blog_lecturefile")
        execute("""
            INSERT INTO blog_lecturefile (id, file, blog_post_id)
            VALUES (%s, %s, %s)
        """, (file_id, file_path, new_id))

    return jsonify({"message": "Cartilha criada", "id": new_id}), 201


@app.route('/api/conteudos/cartilhas/<int:cartilha_id>', methods=['PUT'])
@require_auth('editor')
def update_cartilha(cartilha_id):
    """Atualiza uma cartilha existente"""
    data = request.json
    cartilha = query_one("SELECT blog_post_id FROM blog_lecturefile WHERE id = %s", (cartilha_id,))
    if not cartilha:
        return jsonify({"error": "Cartilha não encontrada"}), 404

    blog_id = cartilha['blog_post_id']

    # Atualiza blog_blog
    execute("""
        UPDATE blog_blog SET speaker=%s, moderator=%s, slug=%s, image=%s,
            publish=%s, banner=%s, posted=%s
        WHERE id=%s
    """, (
        data.get('speaker', ''), data.get('moderator', ''),
        data.get('slug', ''), data.get('image', ''),
        data.get('publish', True), data.get('banner', False),
        data.get('posted'), blog_id
    ))

    # Atualiza tradução
    execute("""
        UPDATE blog_blog_translation SET title=%s, body=%s, date_time=%s,
            resume_speaker=%s, affiliation=%s
        WHERE master_id=%s AND language_code='pt-br'
    """, (
        data.get('title', ''), data.get('content', ''),
        data.get('date_time'), data.get('resume_speaker', ''),
        data.get('affiliation', ''), blog_id
    ))

    # Substitui arquivos
    files = data.get('files', [])
    execute("DELETE FROM blog_lecturefile WHERE blog_post_id = %s", (blog_id,))
    for file_path in files:
        file_id = query_scalar("SELECT COALESCE(MAX(id), 0) + 1 FROM blog_lecturefile")
        execute("""
            INSERT INTO blog_lecturefile (id, file, blog_post_id)
            VALUES (%s, %s, %s)
        """, (file_id, file_path, blog_id))

    return jsonify({"message": "Cartilha atualizada"})


@app.route('/api/conteudos/cartilhas/<int:cartilha_id>', methods=['DELETE'])
@require_auth('editor')
def delete_cartilha(cartilha_id):
    """Deleta uma cartilha"""
    cartilha = query_one("SELECT blog_post_id FROM blog_lecturefile WHERE id = %s", (cartilha_id,))
    if not cartilha:
        return jsonify({"error": "Cartilha não encontrada"}), 404
    blog_id = cartilha['blog_post_id']
    execute("DELETE FROM blog_lecturefile WHERE blog_post_id = %s", (blog_id,))
    execute("DELETE FROM blog_blog_translation WHERE master_id = %s", (blog_id,))
    execute("DELETE FROM blog_blog WHERE id = %s", (blog_id,))
    return jsonify({"message": "Cartilha deletada"})


# CONTEÚDOS - STATS
@app.route('/api/conteudos/stats', methods=['GET'])
def get_conteudos_stats():
    """Retorna estatísticas de todos os tipos de conteúdo"""
    total_usuarios = query_scalar("SELECT COUNT(*) FROM users_customuser")
    total_videos = query_scalar("SELECT COUNT(*) FROM blog_lecturevideo")
    total_palestras = query_scalar("SELECT COUNT(DISTINCT master_id) FROM blog_blog_translation WHERE master_id IS NOT NULL")
    total_exercicios = query_scalar("SELECT COUNT(*) FROM exercicios")
    total_estudos = query_scalar("SELECT COUNT(*) FROM estudos")
    total_cartilhas = query_scalar("SELECT COUNT(*) FROM blog_lecturefile")

    return jsonify({
        "total_usuarios": total_usuarios,
        "total_palestras": total_palestras,
        "total_videos": total_videos,
        "total_exercicios": total_exercicios,
        "total_estudos": total_estudos,
        "total_cartilhas": total_cartilhas,
        "total_conteudos": total_palestras + total_exercicios + total_estudos + total_cartilhas
    })


@app.route('/api/pages', methods=['GET'])
def get_pages():
    """Retorna páginas estáticas"""
    rows = query_all("""
        SELECT p.id, p.slug, p.home_page, p.enabled,
               t.title, t.summary, t.body
        FROM pages_page p
        JOIN pages_page_translation t ON t.master_id = p.id AND t.language_code = 'pt-br'
    """)

    result = []
    for r in rows:
        result.append({
            "id": r['id'],
            "slug": r['slug'],
            "home_page": r['home_page'],
            "enabled": r['enabled'],
            "title": r['title'],
            "summary": r['summary'],
            "body": r['body']
        })
    return jsonify(result)


# ========================================
# ENDPOINTS DE AUTENTICAÇÃO
# ========================================

@app.route('/api/contact', methods=['POST'])
@limiter.limit("3 per minute")
def create_contact():
    """Endpoint para formulário de contato - cria usuário pending"""
    data = request.json
    nome = data.get('nome')
    telefone = data.get('telefone')
    email = data.get('email')

    if not nome or not email or not telefone:
        return jsonify({'error': 'Campos obrigatórios faltando'}), 400

    existing = query_one("SELECT id FROM auth_users WHERE email = %s", (email,))
    if existing:
        return jsonify({'error': 'Email já cadastrado'}), 400

    username = email.split('@')[0]
    password = generate_password_hash(secrets.token_urlsafe(8))

    execute("""
        INSERT INTO auth_users (username, password, email, role, nome, telefone, created_at)
        VALUES (%s, %s, %s, 'pending', %s, %s, %s)
    """, (username, password, email, nome, telefone, datetime.now().isoformat()))

    return jsonify({'message': 'Cadastro realizado! Aguarde aprovação.'}), 201


@app.route('/api/contact/pesquisador', methods=['POST'])
@limiter.limit("3 per minute")
def create_pesquisador():
    """Endpoint para formulário de pesquisador/estudante"""
    data = request.json
    nome = data.get('nome')
    telefone = data.get('telefone')
    email = data.get('email')
    instituicao = data.get('instituicao')
    area_pesquisa = data.get('area_pesquisa')
    lattes = data.get('lattes', '')
    tipo_vinculo = data.get('tipo_vinculo')

    if not all([nome, email, telefone, instituicao, area_pesquisa, tipo_vinculo]):
        return jsonify({'error': 'Campos obrigatórios faltando'}), 400

    existing = query_one("SELECT id FROM auth_users WHERE email = %s", (email,))
    if existing:
        return jsonify({'error': 'Email já cadastrado'}), 400

    username = email.split('@')[0]
    password = generate_password_hash(secrets.token_urlsafe(8))

    execute("""
        INSERT INTO auth_users
        (username, password, email, role, user_type, nome, telefone,
         instituicao, area_pesquisa, lattes, tipo_vinculo, created_at)
        VALUES (%s,%s,%s,'pending','pesquisador',%s,%s,%s,%s,%s,%s,%s)
    """, (username, password, email, nome, telefone,
          instituicao, area_pesquisa, lattes, tipo_vinculo,
          datetime.now().isoformat()))

    return jsonify({'message': 'Cadastro de pesquisador realizado! Aguarde aprovação.'}), 201


@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """Endpoint de login"""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = query_one(
        "SELECT id, username, email, password, role, nome FROM auth_users WHERE username = %s",
        (username,)
    )

    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Credenciais inválidas'}), 401

    if user['role'] == 'pending':
        return jsonify({'error': 'Usuário aguardando aprovação'}), 403

    session['user_id'] = user['id']
    return jsonify({
        'id': user['id'],
        'username': user['username'],
        'email': user['email'],
        'role': user['role'],
        'nome': user['nome']
    })


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Endpoint de logout"""
    session.pop('user_id', None)
    return jsonify({'message': 'Logout realizado'})


@app.route('/api/auth/me', methods=['GET'])
def get_me():
    """Retorna usuário logado"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    return jsonify({
        'id': user['id'],
        'username': user['username'],
        'email': user['email'],
        'role': user['role'],
        'nome': user['nome']
    })


@app.route('/api/auth/pending-users', methods=['GET'])
@require_auth('admin')
def get_pending_users():
    """Lista usuários pending (apenas admin)"""
    pending = query_all("""
        SELECT id, username, email, role, nome, telefone, user_type,
               instituicao, area_pesquisa, lattes, tipo_vinculo, created_at
        FROM auth_users WHERE role = 'pending'
    """)
    return jsonify([serialize_row(u) for u in pending])


@app.route('/api/auth/approve-user', methods=['POST'])
@require_auth('admin')
def approve_user():
    """Aprova usuário pending (apenas admin)"""
    data = request.json
    user_id = data.get('user_id')
    role = data.get('role', 'editor')

    user = query_one(
        "SELECT id, username, email, nome FROM auth_users WHERE id = %s AND role = 'pending'",
        (user_id,)
    )
    if not user:
        return jsonify({'error': 'Usuário não encontrado ou já aprovado'}), 404

    temp_password = secrets.token_urlsafe(8)
    hashed = generate_password_hash(temp_password)
    current_user = get_current_user()

    execute("""
        UPDATE auth_users
        SET role = %s, password = %s, approved_at = %s, approved_by = %s
        WHERE id = %s
    """, (role, hashed, datetime.now().isoformat(), current_user['id'], user_id))

    return jsonify({
        'message': 'Usuário aprovado',
        'username': user['username'],
        'temp_password': temp_password
    })


@app.route('/api/auth/reject-user', methods=['POST'])
@require_auth('admin')
def reject_user():
    """Rejeita e remove usuário pending (apenas admin)"""
    data = request.json
    user_id = data.get('user_id')
    execute("DELETE FROM auth_users WHERE id = %s", (user_id,))
    return jsonify({'message': 'Usuário rejeitado e removido'})


# Servir arquivos estáticos do frontend (produção)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve o frontend React buildado"""
    if path.startswith('api/'):
        return jsonify({"error": "Not found"}), 404

    if path and (STATIC_PATH / path).exists():
        return send_from_directory(STATIC_PATH, path)

    return send_from_directory(STATIC_PATH, 'index.html')


if __name__ == '__main__':
    print(f"PostgreSQL: {DB_CONFIG['dbname']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f"Env: {'production' if IS_PRODUCTION else 'development'}")
    port = int(os.getenv('PORT', 5000))
    app.run(
        debug=not IS_PRODUCTION,
        host='0.0.0.0' if IS_PRODUCTION else '127.0.0.1',
        port=port
    )
