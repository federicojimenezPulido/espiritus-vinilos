"""
spotify.py — Búsqueda de álbumes en Spotify y persistencia del ID
Flujo: Client Credentials → access_token → search → album_id → guardar en DB
"""
import os
import base64
import httpx
from typing import Optional
from fastapi import APIRouter, HTTPException
from data_store import read_collection, write_collection

router = APIRouter()

SPOTIFY_CLIENT_ID     = os.environ.get("SPOTIFY_CLIENT_ID", "").strip()
SPOTIFY_CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET", "").strip()

TOKEN_URL  = "https://accounts.spotify.com/api/token"
SEARCH_URL = "https://api.spotify.com/v1/search"


def get_access_token() -> str:
    """Client Credentials flow — no requiere login del usuario"""
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Spotify no configurado en el servidor")

    credentials = base64.b64encode(
        f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()
    ).decode()

    resp = httpx.post(
        TOKEN_URL,
        data={"grant_type": "client_credentials"},
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def search_album(token: str, artista: str, album: str) -> Optional[str]:
    """Busca el álbum en Spotify y devuelve el ID o None si no encuentra"""
    q = f"album:{album} artist:{artista}"
    resp = httpx.get(
        SEARCH_URL,
        params={"q": q, "type": "album", "limit": 1, "market": "CO"},
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    resp.raise_for_status()
    items = resp.json().get("albums", {}).get("items", [])
    if items:
        return items[0]["id"]

    # Fallback: búsqueda más amplia sin campo estructurado
    q2 = f"{artista} {album}"
    resp2 = httpx.get(
        SEARCH_URL,
        params={"q": q2, "type": "album", "limit": 1, "market": "CO"},
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    resp2.raise_for_status()
    items2 = resp2.json().get("albums", {}).get("items", [])
    return items2[0]["id"] if items2 else None


@router.put("/{index}")
def save_spotify_id(index: int, body: dict):
    """Guarda un spotify_id corregido manualmente"""
    spotify_id = (body.get("spotify_id") or "").strip()
    data = read_collection("vinilos")
    if index < 0 or index >= len(data):
        raise HTTPException(status_code=404, detail="Vinilo no encontrado")
    data[index]["spotify_id"] = spotify_id or None
    write_collection("vinilos", data)
    return {"spotify_id": data[index]["spotify_id"]}


@router.post("/{index}/refresh")
def refresh_spotify(index: int):
    """Fuerza una nueva búsqueda ignorando el ID guardado"""
    data = read_collection("vinilos")
    if index < 0 or index >= len(data):
        raise HTTPException(status_code=404, detail="Vinilo no encontrado")
    data[index]["spotify_id"] = None
    write_collection("vinilos", data)
    # Reusar la misma lógica de búsqueda
    vinyl   = data[index]
    token   = get_access_token()
    new_id  = search_album(token, vinyl.get("artista",""), vinyl.get("album",""))
    if new_id:
        data[index]["spotify_id"] = new_id
        write_collection("vinilos", data)
    return {"spotify_id": new_id, "cached": False}


@router.post("/{index}")
def find_and_save_spotify(index: int, body: dict = {}):
    """
    Busca el álbum en Spotify y guarda el spotify_id en la DB.
    Si ya tiene spotify_id lo devuelve sin buscar de nuevo.
    """
    data = read_collection("vinilos")
    if index < 0 or index >= len(data):
        raise HTTPException(status_code=404, detail="Vinilo no encontrado")

    vinyl = data[index]

    # Si ya tiene ID guardado, devolver directamente
    if vinyl.get("spotify_id"):
        return {"spotify_id": vinyl["spotify_id"], "cached": True}

    artista = vinyl.get("artista", "")
    album   = vinyl.get("album", "")
    if not artista or not album:
        raise HTTPException(status_code=400, detail="El vinilo no tiene artista o álbum")

    token      = get_access_token()
    spotify_id = search_album(token, artista, album)

    if not spotify_id:
        return {"spotify_id": None, "cached": False}

    # Persistir en DB
    data[index]["spotify_id"] = spotify_id
    write_collection("vinilos", data)

    return {"spotify_id": spotify_id, "cached": False}
