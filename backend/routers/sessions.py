"""
sessions.py — Endpoints para el feature Sesiones de Espíritu y Vinilo

Identidad: email + token UUID almacenado en localStorage del cliente.
Cada request autenticado incluye el header X-Client-Token.
RLS en Supabase valida que el token corresponda al cliente correcto.
"""
import os
import uuid
import httpx
import base64
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from data_store import get_conn

router = APIRouter()

SPOTIFY_CLIENT_ID     = os.environ.get("SPOTIFY_CLIENT_ID", "").strip()
SPOTIFY_CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET", "").strip()

MAX_SESSIONS       = 5
MAX_TRACKS_MS      = 7_200_000   # 2 horas en ms
MAX_SPIRITS        = 3


# ── helpers ──────────────────────────────────────────────────────────────────

def set_rls(conn, token: str):
    """Configura el token en la sesión de PG para que RLS funcione."""
    with conn.cursor() as cur:
        cur.execute("SELECT set_config('app.client_token', %s, true)", (token,))


def get_client_by_token(conn, token: str) -> dict:
    with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
        cur.execute("SELECT * FROM session_clients WHERE token = %s", (token,))
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Token inválido")
    return dict(row)


def require_token(x_client_token: Optional[str]) -> str:
    if not x_client_token:
        raise HTTPException(status_code=401, detail="Header X-Client-Token requerido")
    return x_client_token


def get_spotify_token() -> str:
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Spotify no configurado")
    credentials = base64.b64encode(
        f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()
    ).decode()
    resp = httpx.post(
        "https://accounts.spotify.com/api/token",
        data={"grant_type": "client_credentials"},
        headers={"Authorization": f"Basic {credentials}", "Content-Type": "application/x-www-form-urlencoded"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


# ── TEMPLATES ────────────────────────────────────────────────────────────────

@router.get("/templates")
def list_templates():
    """Devuelve las plantillas de sesión disponibles. Sin autenticación."""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            cur.execute("SELECT * FROM session_templates ORDER BY id")
            rows = cur.fetchall()
    return [dict(r) for r in rows]


# ── CATALOG (con DB ids para el picker de sesiones) ──────────────────────────

@router.get("/catalog/vinyls")
def catalog_vinyls():
    """Vinilos disponibles para armar una sesión — incluye DB id."""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            cur.execute("""
                SELECT id, artista, album, genero, cover_url, spotify_id, spotify_album_id
                FROM vinyls
                WHERE fuera IS NOT TRUE
                  AND (spotify_id IS NOT NULL OR spotify_album_id IS NOT NULL)
                ORDER BY artista, album
            """)
            rows = cur.fetchall()
    return [dict(r) for r in rows]


@router.get("/catalog/spirits")
def catalog_spirits():
    """Rones y whiskies disponibles para armar una sesión — incluye DB id."""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            cur.execute("""
                SELECT id, brand, name AS name, '' AS version,
                       type, country, cover_url, buy_url, 'rum' AS spirit_type
                FROM rums
                WHERE terminado IS NOT TRUE
                ORDER BY brand, name
            """)
            rums = cur.fetchall()
            cur.execute("""
                SELECT id, brand, '' AS name, version,
                       type, country, cover_url, buy_url, 'whisky' AS spirit_type
                FROM whiskies
                WHERE terminado IS NOT TRUE
                ORDER BY brand, version
            """)
            whiskies = cur.fetchall()
    return [dict(r) for r in rums] + [dict(r) for r in whiskies]


# ── CLIENTES ─────────────────────────────────────────────────────────────────

class ClientRegister(BaseModel):
    email: str
    name:  Optional[str] = None


@router.post("/clients", status_code=201)
def register_client(body: ClientRegister):
    """
    Registra o recupera un cliente por email.
    Si el email ya existe devuelve el token existente (login implícito).
    """
    with get_conn() as conn:
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            # ¿ya existe?
            cur.execute("SELECT id, token, name FROM session_clients WHERE email = %s", (body.email.lower().strip(),))
            existing = cur.fetchone()
            if existing:
                return {"token": str(existing["token"]), "name": existing["name"], "new": False}

            # Nuevo cliente
            new_token = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO session_clients (email, name, token) VALUES (%s, %s, %s) RETURNING id, token",
                (body.email.lower().strip(), body.name, new_token)
            )
            row = cur.fetchone()
    return {"token": str(row["token"]), "name": body.name, "new": True}


# ── SESIONES ─────────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    name:         str
    people_count: int
    template_id:  int
    notes:        Optional[str] = None


class SessionUpdate(BaseModel):
    name:         Optional[str] = None
    people_count: Optional[int] = None
    notes:        Optional[str] = None


@router.get("/")
def list_sessions(x_client_token: Optional[str] = Header(None)):
    token = require_token(x_client_token)
    with get_conn() as conn:
        client = get_client_by_token(conn, token)
        set_rls(conn, token)
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            cur.execute("""
                SELECT s.*, t.name_es as template_name, t.accent_color, t.tagline_es
                FROM sessions s
                JOIN session_templates t ON t.id = s.template_id
                WHERE s.client_id = %s
                ORDER BY s.created_at DESC
            """, (client["id"],))
            rows = cur.fetchall()
    return [dict(r) for r in rows]


@router.post("/", status_code=201)
def create_session(body: SessionCreate, x_client_token: Optional[str] = Header(None)):
    token = require_token(x_client_token)
    if not (2 <= body.people_count <= 8):
        raise HTTPException(status_code=400, detail="people_count debe estar entre 2 y 8")
    with get_conn() as conn:
        client = get_client_by_token(conn, token)
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            # Verificar límite de 5 sesiones
            cur.execute("SELECT COUNT(*) as cnt FROM sessions WHERE client_id = %s", (client["id"],))
            count = cur.fetchone()["cnt"]
            if count >= MAX_SESSIONS:
                raise HTTPException(status_code=400, detail=f"Máximo {MAX_SESSIONS} sesiones por cliente")

            # Verificar que el template existe
            cur.execute("SELECT id FROM session_templates WHERE id = %s", (body.template_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=400, detail="Template inválido")

            cur.execute("""
                INSERT INTO sessions (client_id, template_id, name, people_count, notes)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *
            """, (client["id"], body.template_id, body.name, body.people_count, body.notes))
            row = cur.fetchone()
    return dict(row)


@router.patch("/{session_id}")
def update_session(session_id: str, body: SessionUpdate, x_client_token: Optional[str] = Header(None)):
    token = require_token(x_client_token)
    if body.people_count is not None and not (2 <= body.people_count <= 8):
        raise HTTPException(status_code=400, detail="people_count debe estar entre 2 y 8")
    with get_conn() as conn:
        client = get_client_by_token(conn, token)
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            updates, vals = [], []
            if body.name         is not None: updates.append("name = %s");         vals.append(body.name)
            if body.people_count is not None: updates.append("people_count = %s"); vals.append(body.people_count)
            if body.notes        is not None: updates.append("notes = %s");        vals.append(body.notes)
            if not updates:
                raise HTTPException(status_code=400, detail="Nada que actualizar")
            updates.append("updated_at = now()")
            vals += [session_id, str(client["id"])]
            cur.execute(
                f"UPDATE sessions SET {', '.join(updates)} WHERE id = %s AND client_id = %s RETURNING *",
                vals
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return dict(row)


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: str, x_client_token: Optional[str] = Header(None)):
    token = require_token(x_client_token)
    with get_conn() as conn:
        client = get_client_by_token(conn, token)
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM sessions WHERE id = %s AND client_id = %s",
                (session_id, str(client["id"]))
            )
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Sesión no encontrada")


# ── TRACKS ───────────────────────────────────────────────────────────────────

class TrackAdd(BaseModel):
    vinyl_id:         int
    spotify_track_id: str
    track_name:       str
    artist_name:      str
    duration_ms:      int
    track_number:     Optional[int] = None


@router.get("/{session_id}/tracks")
def list_tracks(session_id: str, x_client_token: Optional[str] = Header(None)):
    token = require_token(x_client_token)
    with get_conn() as conn:
        client = get_client_by_token(conn, token)
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            # Verificar que la sesión pertenece al cliente
            cur.execute("SELECT id FROM sessions WHERE id = %s AND client_id = %s", (session_id, str(client["id"])))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Sesión no encontrada")
            cur.execute("SELECT * FROM session_tracks WHERE session_id = %s ORDER BY added_at", (session_id,))
            rows = cur.fetchall()
    return [dict(r) for r in rows]


@router.post("/{session_id}/tracks", status_code=201)
def add_track(session_id: str, body: TrackAdd, x_client_token: Optional[str] = Header(None)):
    token = require_token(x_client_token)
    with get_conn() as conn:
        client = get_client_by_token(conn, token)
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s AND client_id = %s", (session_id, str(client["id"])))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Sesión no encontrada")

            # Verificar duración total
            cur.execute("SELECT COALESCE(SUM(duration_ms), 0) as total FROM session_tracks WHERE session_id = %s", (session_id,))
            current_ms = cur.fetchone()["total"]
            if current_ms + body.duration_ms > MAX_TRACKS_MS:
                remaining = (MAX_TRACKS_MS - current_ms) / 60000
                raise HTTPException(status_code=400, detail=f"Límite de 2h superado. Disponible: {remaining:.1f} min")

            # Verificar que no esté duplicada
            cur.execute(
                "SELECT id FROM session_tracks WHERE session_id = %s AND spotify_track_id = %s",
                (session_id, body.spotify_track_id)
            )
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Esta canción ya está en la sesión")

            cur.execute("""
                INSERT INTO session_tracks
                  (session_id, vinyl_id, spotify_track_id, track_name, artist_name, duration_ms, track_number)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (session_id, body.vinyl_id, body.spotify_track_id,
                  body.track_name, body.artist_name, body.duration_ms, body.track_number))
            row = cur.fetchone()
    return dict(row)


@router.delete("/{session_id}/tracks/{track_id}", status_code=204)
def remove_track(session_id: str, track_id: str, x_client_token: Optional[str] = Header(None)):
    token = require_token(x_client_token)
    with get_conn() as conn:
        client = get_client_by_token(conn, token)
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s AND client_id = %s", (session_id, str(client["id"])))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Sesión no encontrada")
            cur.execute("DELETE FROM session_tracks WHERE id = %s AND session_id = %s", (track_id, session_id))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Track no encontrado")


# ── ESPÍRITUS ─────────────────────────────────────────────────────────────────

class SpiritAdd(BaseModel):
    spirit_type:  str   # 'rum' | 'whisky'
    spirit_id:    int
    brand:        str
    name:         str
    buy_price:    Optional[float] = None
    buy_currency: Optional[str]  = "COP"


@router.get("/{session_id}/spirits")
def list_spirits(session_id: str, x_client_token: Optional[str] = Header(None)):
    token = require_token(x_client_token)
    with get_conn() as conn:
        client = get_client_by_token(conn, token)
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s AND client_id = %s", (session_id, str(client["id"])))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Sesión no encontrada")
            cur.execute("SELECT * FROM session_spirits WHERE session_id = %s ORDER BY added_at", (session_id,))
            rows = cur.fetchall()
    return [dict(r) for r in rows]


@router.post("/{session_id}/spirits", status_code=201)
def add_spirit(session_id: str, body: SpiritAdd, x_client_token: Optional[str] = Header(None)):
    token = require_token(x_client_token)
    if body.spirit_type not in ("rum", "whisky"):
        raise HTTPException(status_code=400, detail="spirit_type debe ser 'rum' o 'whisky'")
    with get_conn() as conn:
        client = get_client_by_token(conn, token)
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s AND client_id = %s", (session_id, str(client["id"])))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Sesión no encontrada")

            # Verificar límite de 3 espíritus
            cur.execute("SELECT COUNT(*) as cnt FROM session_spirits WHERE session_id = %s", (session_id,))
            if cur.fetchone()["cnt"] >= MAX_SPIRITS:
                raise HTTPException(status_code=400, detail=f"Máximo {MAX_SPIRITS} espíritus por sesión")

            cur.execute("""
                INSERT INTO session_spirits
                  (session_id, spirit_type, spirit_id, brand, name, buy_price, buy_currency)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (session_id, body.spirit_type, body.spirit_id,
                  body.brand, body.name, body.buy_price, body.buy_currency))
            row = cur.fetchone()
    return dict(row)


@router.delete("/{session_id}/spirits/{spirit_id}", status_code=204)
def remove_spirit(session_id: str, spirit_id: str, x_client_token: Optional[str] = Header(None)):
    token = require_token(x_client_token)
    with get_conn() as conn:
        client = get_client_by_token(conn, token)
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s AND client_id = %s", (session_id, str(client["id"])))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Sesión no encontrada")
            cur.execute("DELETE FROM session_spirits WHERE id = %s AND session_id = %s", (spirit_id, session_id))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Espíritu no encontrado")


# ── PREVIEW ───────────────────────────────────────────────────────────────────

@router.get("/{session_id}/preview")
def get_preview(session_id: str, x_client_token: Optional[str] = Header(None)):
    token = require_token(x_client_token)
    with get_conn() as conn:
        client = get_client_by_token(conn, token)
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s AND client_id = %s", (session_id, str(client["id"])))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Sesión no encontrada")
            cur.execute("SELECT * FROM session_preview WHERE id = %s", (session_id,))
            row = cur.fetchone()
    return dict(row) if row else {}


# ── SPOTIFY TRACKS para un vinilo ─────────────────────────────────────────────

@router.get("/vinyls/{vinyl_id}/tracks")
def get_vinyl_tracks(vinyl_id: int):
    """
    Devuelve el tracklist de un vinilo.
    Si ya está cacheado en la columna tracks de vinyls, lo devuelve directo.
    Si no, consulta Spotify y lo persiste.
    """
    with get_conn() as conn:
        with conn.cursor(cursor_factory=__import__('psycopg2.extras', fromlist=['RealDictCursor']).RealDictCursor) as cur:
            cur.execute("SELECT id, artista, album, spotify_id, spotify_album_id, tracks FROM vinyls WHERE id = %s", (vinyl_id,))
            vinyl = cur.fetchone()
            if not vinyl:
                raise HTTPException(status_code=404, detail="Vinilo no encontrado")

            # Devolver cache si existe
            if vinyl["tracks"]:
                return {"tracks": vinyl["tracks"], "cached": True}

            # Determinar spotify_album_id — puede estar en la nueva columna o en spotify_id
            album_id = vinyl.get("spotify_album_id") or vinyl.get("spotify_id")
            if not album_id:
                raise HTTPException(status_code=404, detail="Este vinilo no tiene Spotify ID. Agregalo en el formulario de administración.")

            # Consultar Spotify
            sp_token = get_spotify_token()
            resp = httpx.get(
                f"https://api.spotify.com/v1/albums/{album_id}/tracks",
                params={"limit": 50, "market": "CO"},
                headers={"Authorization": f"Bearer {sp_token}"},
                timeout=10,
            )
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Álbum no encontrado en Spotify")
            resp.raise_for_status()

            items = resp.json().get("items", [])
            tracks = [
                {
                    "spotify_track_id": t["id"],
                    "name":             t["name"],
                    "duration_ms":      t["duration_ms"],
                    "track_number":     t["track_number"],
                    "disc_number":      t.get("disc_number", 1),
                }
                for t in items
            ]

            # Persistir en vinyls.tracks
            import json
            cur.execute(
                "UPDATE vinyls SET tracks = %s, tracks_fetched_at = now() WHERE id = %s",
                (json.dumps(tracks), vinyl_id)
            )

    return {"tracks": tracks, "cached": False}
