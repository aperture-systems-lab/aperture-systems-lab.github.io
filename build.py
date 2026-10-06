import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

import content as C

PAGINAS = ("index.html", "proyectos/index.html", "links/index.html")
ESTATICOS = ("js/app.js", "js/proyectos.js", "css/styles.css")

ENLACE = re.compile(
    r'(<(?:script|link)\b[^>]*?\b(?:src|href)=")((?!https?://)[^"?]+\.(?:js|css))(?:\?[^"]*)?(")'
)

GLOWS = {
    "#33c9d6": "rgba(51,201,214,0.32)",
    "#4fd6a0": "rgba(79,214,160,0.32)",
    "#f5b94d": "rgba(245,185,77,0.3)",
    "#c79bff": "rgba(199,155,255,0.3)",
    "#5fb0ff": "rgba(95,176,255,0.3)",
    "#ff5a61": "rgba(255,90,97,0.32)",
}

def hexof(color):
    return C.COLORES.get(color, color)

def glowof(color):
    h = hexof(color)
    return GLOWS.get(h, "rgba(41,197,214,0.3)")

def build_lines():
    out = []
    for l in C.LINEAS:
        color = l.get("color", "cian")
        out.append({
            "key": l["clave"],
            "accent": hexof(color),
            "glow": glowof(color),
            "name": l["nombre"],
            "summary": l["resumen"],
            "alias": l["alias"],
            "title": l["titulo"],
            "essence": l["esencia"],
            "topics": [{"name": n, "dgm": d} for (n, d) in l["temas"]],
        })
    return out

def build_projects():
    out = []
    for p in getattr(C, "PROYECTOS", []):
        color = p.get("color", "cian")
        out.append({
            "key": p["clave"],
            "accent": hexof(color),
            "glow": glowof(color),
            "name": p["nombre"],
            "brand": p.get("marca", ""),
            "title": p["titulo"],
            "period": p.get("periodo", ""),
            "status": p.get("estado", ""),
            "summary": p["resumen"],
            "description": p["descripcion"],
            "highlights": p.get("claves", []),
            "tags": p.get("tags", []),
            "authors": p.get("autores", []),
            "video": p.get("video", ""),
            "links": [{"text": t, "url": u, "primary": bool(d)} for (t, u, d) in p.get("enlaces", [])],
        })
    return out

def build_meeting(fecha, titulo, ponente, texto):
    d = getattr(C, "DETALLES", {}).get(fecha, {})
    return {
        "title": titulo,
        "speaker": ponente,
        "text": texto,
        "flyer": d.get("flyer", ""),
        "time": d.get("hora", ""),
        "place": d.get("lugar", ""),
        "link": d.get("enlace", ""),
        "accent": hexof(d["color"]) if d.get("color") else "",
        "tag": d.get("etiqueta", ""),
    }

def build_calendar():
    return {
        "title": C.CALENDARIO_TITULO,
        "text": C.CALENDARIO_TEXTO,
        "start": C.REUNION_INICIO,
        "end": C.REUNION_FIN,
        "meetingWeekday": C.REUNION_DIA,
        "meetingTitle": C.REUNION_TITULO,
        "meetingPlace": C.REUNION_LUGAR,
        "meetingTime": C.REUNION_HORA,
        "meetings": {
            f: build_meeting(f, t, q, x) for f, (t, q, x) in C.REUNIONES.items()
        },
        "holidays": {f: {"label": lbl} for f, lbl in C.FESTIVOS.items()},
        "skipped": {f: {"label": lbl} for f, lbl in C.SIN_REUNION.items()},
        "milestones": {
            f: {"label": lbl, "accent": hexof(col)} for f, (lbl, col) in C.HITOS.items()
        },
    }

def build_data():
    return {
        "site": {
            "title": C.TITULO_PESTANA,
            "heroTitle": C.HERO_TITULO,
            "heroText": C.HERO_TEXTO,
            "chips": [{"text": t, "color": hexof(c)} for (t, c) in C.CHIPS],
            "about": C.SOBRE,
            "labPhrase": C.LAB_FRASE,
            "labInvite": C.LAB_INVITACION,
            "contactTitle": C.CONTACTO_TITULO,
            "contactText": C.CONTACTO_TEXTO,
            "linesTitle": C.LINEAS_TITULO,
            "linesText": C.LINEAS_TEXTO,
            "projectsTitle": C.PROYECTOS_TITULO,
            "projectsText": C.PROYECTOS_TEXTO,
            "projectsButton": C.PROYECTOS_BOTON,
            "accessTitle": C.ACCESO_TITULO,
            "accessPhrase": C.ACCESO_FRASE,
        },
        "access": [
            {"num": n, "title": t, "text": x, "accent": hexof(c), "glow": glowof(c)}
            for (n, t, x, c) in C.ACCESO_PUNTOS
        ],
        "bootRows": [
            {"label": l, "value": v, **({"accent": True} if i == len(C.BOOT) - 1 else {})}
            for i, (l, v) in enumerate(C.BOOT)
        ],
        "lines": build_lines(),
        "projects": build_projects(),
        "calendar": build_calendar(),
        "socials": [
            {"label": lbl, "handle": h, "url": u, "glyph": g,
             "accent": hexof(col), "glow": glowof(col)}
            for (lbl, h, u, g, col) in C.REDES
        ],
    }

def calcular_version(datos):
    h = hashlib.md5(datos.encode("utf-8"))
    for rel in ESTATICOS:
        ruta = ROOT / rel
        if ruta.exists():
            h.update(ruta.read_bytes())
    return h.hexdigest()[:8]

def sellar_paginas(version):
    tocadas = []
    for rel in PAGINAS:
        ruta = ROOT / rel
        if not ruta.exists():
            continue
        html = ruta.read_text(encoding="utf-8")
        nuevo = ENLACE.sub(lambda m: m.group(1) + m.group(2) + "?v=" + version + m.group(3), html)
        if nuevo != html:
            ruta.write_text(nuevo, encoding="utf-8", newline="")
            tocadas.append(rel)
    return tocadas

def main():
    data = build_data()
    body = json.dumps(data, ensure_ascii=False, indent=2)
    contenido = "window.APERTURE_DATA = " + body + ";\n"
    out = ROOT / "js" / "data.js"
    out.write_text(contenido, encoding="utf-8", newline="")
    print(f"OK · generado {out.relative_to(ROOT)}")

    version = calcular_version(contenido)
    tocadas = sellar_paginas(version)
    print(f"OK · version {version}" + (f" · actualizado {', '.join(tocadas)}" if tocadas else " · sin cambios"))

if __name__ == "__main__":
    main()
