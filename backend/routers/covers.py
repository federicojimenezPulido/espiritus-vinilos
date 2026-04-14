from fastapi import APIRouter, Query, Header
from typing import Optional
import urllib.request
import urllib.parse
import json
import re
from data_store import read_collection, write_collection

router = APIRouter()

# ── GET /api/covers?type=vinyl&q=... ─────────────────────────────────────────
# Busca portada en Discogs (vinilos) — token via header x-discogs-token
@router.get("/")
def get_cover(
    type: str = Query(...),
    q: str = Query(...),
    x_discogs_token: Optional[str] = Header(None),
):
    if type == "vinyl":
        return search_discogs(q, x_discogs_token)
    return {"cover": None, "source": None}


# ── POST /api/covers/fetch ────────────────────────────────────────────────────
# Scrapea og:image de la URL del producto y guarda cover_url en el JSON
# Body: { "coll": "rum", "index": 5, "url": "https://..." }
@router.post("/fetch")
def fetch_and_save_cover(body: dict):
    coll  = body.get("coll")
    index = body.get("index")
    url   = body.get("url")

    if not all([coll, index is not None, url]):
        return {"cover": None, "error": "faltan parámetros"}

    cover = scrape_og_image(url)

    if cover:
        data = read_collection(coll)
        if 0 <= index < len(data):
            data[index]["cover_url"] = cover
            write_collection(coll, data)

    return {"cover": cover}


# ── POST /api/covers/fetch-discogs ────────────────────────────────────────────
# Busca portada en Discogs y la persiste en el vinilo
# Body: { "index": 5, "q": "Hector Lavoe La Voz" }
@router.post("/fetch-discogs")
def fetch_and_save_discogs(
    body: dict,
    x_discogs_token: Optional[str] = Header(None),
):
    index = body.get("index")
    q     = body.get("q")

    if index is None or not q:
        return {"cover": None, "error": "faltan parámetros"}

    result = search_discogs(q, x_discogs_token)
    cover  = result.get("cover")

    if cover:
        data = read_collection("vinyls")
        if 0 <= index < len(data):
            data[index]["cover_url"] = cover
            write_collection("vinyls", data)

    return result


# ── GET /api/covers/scrape?url=... ───────────────────────────────────────────
# Raspa og:image de cualquier URL y devuelve la imagen real (sin guardar)
# Útil cuando el usuario pega una URL de release de Discogs manualmente
@router.get("/scrape")
def scrape_cover(url: str = Query(...)):
    cover = scrape_og_image(url)
    return {"cover": cover, "original_url": url}


# ── POST /api/covers/bulk-discogs ─────────────────────────────────────────────
# Fetchea portadas Discogs para todos los vinilos que no tienen cover_url
# Retorna { updated: N, skipped: N }
@router.post("/bulk-discogs")
def bulk_fetch_discogs(x_discogs_token: Optional[str] = Header(None)):
    if not x_discogs_token:
        return {"error": "no token", "updated": 0, "skipped": 0}

    data    = read_collection("vinyls")
    updated = 0
    skipped = 0

    for i, vinyl in enumerate(data):
        if vinyl.get("cover_url"):   # ya tiene portada → saltar
            skipped += 1
            continue
        q      = f"{vinyl.get('artista', '')} {vinyl.get('album', '')}".strip()
        result = search_discogs(q, x_discogs_token)
        if result.get("cover"):
            data[i]["cover_url"] = result["cover"]
            updated += 1

    if updated:
        write_collection("vinyls", data)

    return {"updated": updated, "skipped": skipped}


# ── Helpers ───────────────────────────────────────────────────────────────────

def scrape_og_image(url: str) -> Optional[str]:
    """Extrae og:image del HTML de la URL — como un SELECT sobre el <head>"""
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; EspiritusVinilos/1.0)"}
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            # Leer solo los primeros 50KB — el <head> siempre está al inicio
            html = resp.read(50_000).decode("utf-8", errors="ignore")

        # Buscar og:image en cualquier orden de atributos
        patterns = [
            r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
            r'<meta[^>]+name=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
        ]
        for pattern in patterns:
            m = re.search(pattern, html, re.IGNORECASE)
            if m:
                img = m.group(1).strip()
                if img.startswith("http"):
                    return img
        return None
    except Exception:
        return None


def search_discogs(q: str, token: Optional[str]):
    if not token:
        return {"cover": None, "source": "discogs", "error": "no token"}

    encoded = urllib.parse.quote(q)
    url = f"https://api.discogs.com/database/search?q={encoded}&type=release&per_page=1&token={token}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "EspiritusVinilos/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
        results = data.get("results", [])
        if results:
            img = results[0].get("cover_image")
            if img and "spacer" not in img:
                return {"cover": img, "source": "discogs"}
        return {"cover": None, "source": "discogs"}
    except Exception as e:
        return {"cover": None, "source": "discogs", "error": str(e)}
