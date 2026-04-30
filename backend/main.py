from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import vinyls, rums, whiskies, covers, spotify, config, sessions

app = FastAPI(title="Espíritus & Vinilos API", version="1.0.0")

# CORS — permite que el frontend (localhost:5173 o github.io) llame al backend
# Es como los permisos de acceso entre esquemas en Oracle
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4173",
        "http://localhost:4174",
        "https://federicojimenezpulido.github.io",
        "https://enlasnubestrepao.github.io",
        "https://enlasnubestrepao.com",
        "https://www.enlasnubestrepao.com",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers — como hacer PUBLIC SYNONYM a los procedures de cada package
app.include_router(vinyls.router,    prefix="/api/vinyls",    tags=["Vinyls"])
app.include_router(rums.router,      prefix="/api/rums",      tags=["Rums"])
app.include_router(whiskies.router,  prefix="/api/whiskies",  tags=["Whiskies"])
app.include_router(covers.router,    prefix="/api/covers",    tags=["Covers"])
app.include_router(spotify.router,   prefix="/api/spotify",   tags=["Spotify"])
app.include_router(config.router,    prefix="/api/config",    tags=["Config"])
app.include_router(sessions.router,  prefix="/api/sessions",  tags=["Sessions"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Espíritus & Vinilos API"}
