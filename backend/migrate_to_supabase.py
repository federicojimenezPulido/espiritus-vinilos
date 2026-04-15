"""
Migración de JSON → Supabase PostgreSQL
Uso: python3 migrate_to_supabase.py
Requiere: pip3 install psycopg2-binary
"""
import json, os, psycopg2
from pathlib import Path

# ── Conexión ──────────────────────────────────────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    print("ERROR: Definí la variable DATABASE_URL antes de correr el script")
    print("Ejemplo: DATABASE_URL='postgresql://postgres:TU_PASS@db.xxx.supabase.co:5432/postgres' python3 migrate_to_supabase.py")
    exit(1)

conn = psycopg2.connect(DATABASE_URL)
cur  = conn.cursor()

DATA = Path(__file__).parent / "data"

# ── Vinilos ───────────────────────────────────────────────────────────────────
print("Migrando vinilos...")
with open(DATA / "vinilos.json", encoding="utf-8") as f:
    vinyls = json.load(f)

cur.execute("DELETE FROM vinyls")
for v in vinyls:
    cur.execute("""
        INSERT INTO vinyls (artista, album, genero, agrupador, anio, pais,
                            sello, pais_sello, cat_num, origen, fuera,
                            discogs, cover_url, url)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        v.get("artista"), v.get("album"), v.get("genero"), v.get("agrupador"),
        v.get("anio"), v.get("pais"), v.get("sello"), v.get("pais_sello"),
        v.get("cat_num"), v.get("origen"), v.get("fuera", False),
        v.get("discogs", False), v.get("cover_url"), v.get("url"),
    ))
print(f"  ✅ {len(vinyls)} vinilos insertados")

# ── Rones ─────────────────────────────────────────────────────────────────────
print("Migrando rones...")
with open(DATA / "rums.json", encoding="utf-8") as f:
    rums = json.load(f)

cur.execute("DELETE FROM rums")
for r in rums:
    cur.execute("""
        INSERT INTO rums (brand, name, type, country, abv, blend,
                          age_low, age_max, region, scale, url, cover_url)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        r.get("brand"), r.get("name"), r.get("type"), r.get("country"),
        r.get("abv"), r.get("blend"), r.get("age_low"), r.get("age_max"),
        r.get("region"), r.get("scale"), r.get("url"), r.get("cover_url"),
    ))
print(f"  ✅ {len(rums)} rones insertados")

# ── Whiskies ──────────────────────────────────────────────────────────────────
print("Migrando whiskies...")
with open(DATA / "whiskies.json", encoding="utf-8") as f:
    whiskies = json.load(f)

cur.execute("DELETE FROM whiskies")
for w in whiskies:
    cur.execute("""
        INSERT INTO whiskies (brand, version, type, origin, country, abv,
                              years, region, distillery, url, cover_url)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        w.get("brand"), w.get("version"), w.get("type"), w.get("origin"),
        w.get("country"), w.get("abv"), w.get("years"), w.get("region"),
        w.get("distillery"), w.get("url"), w.get("cover_url"),
    ))
print(f"  ✅ {len(whiskies)} whiskies insertados")

conn.commit()
cur.close()
conn.close()
print("\n🎉 Migración completa")
