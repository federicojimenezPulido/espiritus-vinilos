"""
data_store.py — Capa de acceso a datos
Antes: leía/escribía archivos JSON
Ahora: lee/escribe en Supabase PostgreSQL via psycopg2

Analogía SQL: este módulo ES la capa de acceso a datos —
como un package PL/SQL que abstrae los SELECTs e INSERTs
del resto de la aplicación.
"""
import os
import psycopg2
import psycopg2.extras
from contextlib import contextmanager

DATABASE_URL = (os.environ.get("DATABASE_URL") or "").strip()

# Mapeo nombre de colección → tabla SQL
_VINYL_COLS = ["artista","album","genero","agrupador","anio","pais",
               "sello","pais_sello","cat_num","origen","fuera",
               "discogs","cover_url","url","spotify_id",
               "tiktok_url","ig_url"]

TABLES = {
    "vinilos":  "vinyls",   # vinyls.py usa "vinilos"
    "vinyls":   "vinyls",   # covers.py usa "vinyls"
    "rums":     "rums",
    "whiskies": "whiskies",
}

COLUMNS = {
    "vinilos":  _VINYL_COLS,
    "vinyls":   _VINYL_COLS,
    "rums":     ["brand","name","type","country","abv","blend",
                 "age_low","age_max","region","scale","url","cover_url","terminado"],
    "whiskies": ["brand","version","type","origin","country","abv",
                 "years","region","distillery","url","cover_url","terminado"],
}


@contextmanager
def get_conn():
    """Context manager de conexión — como OPEN/CLOSE cursor en PL/SQL"""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def read_collection(name: str) -> list:
    """SELECT * FROM tabla ORDER BY id — devuelve lista de dicts sin el campo id"""
    table = TABLES[name]
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(f"SELECT * FROM {table} ORDER BY id")
            rows = cur.fetchall()
    return [{k: v for k, v in row.items() if k != "id"} for row in rows]


def write_collection(name: str, data: list) -> None:
    """
    Reemplaza toda la tabla con los datos nuevos.
    Equivalente a TRUNCATE + INSERT bulk en Oracle.
    Usa advisory lock para evitar race conditions: si dos requests llegan
    al mismo tiempo, la segunda espera a que termine la primera.
    Analogía Oracle: LOCK TABLE ... IN EXCLUSIVE MODE.
    """
    table   = TABLES[name]
    cols    = COLUMNS[name]
    lock_id = abs(hash(table)) % 2_147_483_647   # lock único por tabla
    with get_conn() as conn:
        with conn.cursor() as cur:
            # Lock a nivel de transacción — se libera automáticamente al commit/rollback
            cur.execute("SELECT pg_advisory_xact_lock(%s)", (lock_id,))
            cur.execute(f"DELETE FROM {table}")
            if data:
                placeholders = ",".join(["%s"] * len(cols))
                col_names    = ",".join(cols)
                sql  = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"
                rows = [tuple(row.get(c) for c in cols) for row in data]
                cur.executemany(sql, rows)
