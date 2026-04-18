from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
from data_store import get_config, set_config, delete_config

router = APIRouter()
_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PinBody(BaseModel):
    pin: str


@router.get("/pin")
def pin_status():
    """¿Hay PIN configurado? Solo devuelve true/false, nunca el hash."""
    val = get_config("admin_pin")
    return {"set": val is not None}


@router.post("/pin")
def save_pin(body: PinBody):
    if not body.pin or not body.pin.strip():
        raise HTTPException(status_code=400, detail="PIN vacío")
    hashed = _pwd.hash(body.pin.strip())
    set_config("admin_pin", hashed)
    return {"ok": True}


@router.post("/pin/verify")
def verify_pin(body: PinBody):
    stored = get_config("admin_pin")
    if stored is None:
        return {"valid": True}   # sin PIN → acceso libre
    return {"valid": _pwd.verify(body.pin, stored)}


@router.delete("/pin")
def remove_pin():
    delete_config("admin_pin")
    return {"ok": True}
