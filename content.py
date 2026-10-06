COLORES = {
    "cian":   "#33c9d6",
    "verde":  "#4fd6a0",
    "ambar":  "#f5b94d",
    "morado": "#c79bff",
    "azul":   "#5fb0ff",
    "rojo":   "#ff5a61",
}

TITULO_PESTANA = "Aperture · Semillero de Data Science e IA"

HERO_TITULO = 'SEMILLERO DE<br><span style="color:#29c5d6;">DATA SCIENCE E IA</span>'
HERO_TEXTO  = ('<span style="color:#1f8fa0;">//</span> Aplicamos '
               '<span style="color:#29c5d6;">modelos que predicen y deciden</span> '
               'en problemas reales. Los fundamentos son el punto de partida, no el destino.')

CHIPS = [
    ("Data Science",                "cian"),
    ("Machine Learning",            "verde"),
    ("IA & LLMs",                   "ambar"),
    ("High Performance Computing",  "morado"),
]

SOBRE = ('<strong style="color:#29c5d6;">Aperture</strong> es una comunidad estudiantil '
         'construida en torno al <strong style="color:#29c5d6;">Data Science y la IA</strong>. '
         'Convertimos la teoría en proyectos de valor, aportamos a la innovación y aprendemos '
         'a escalarlos hasta que funcionen de verdad en el mundo real.')

LAB_FRASE = "No solo estudiamos la IA. La construimos y la llevamos a la realidad."
LAB_INVITACION = "Conoce los proyectos del semillero."

CONTACTO_TITULO = "CONTACTO"
CONTACTO_TEXTO  = "¿Te suena? Súmate al semillero o escríbenos por cualquiera de estos canales."

REDES = [
    ("Instagram", "@aperture.systems",               "https://instagram.com/aperture.systems",                       "[o]", "morado"),
    ("Correo",    "aperture.systems.lab@gmail.com",   "mailto:aperture.systems.lab@gmail.com",                        "@",   "cian"),
    ("WhatsApp",  "Únete al grupo",                   "https://chat.whatsapp.com/Bi83DY3f9tDCSMHDUqyHDM?s=cl&p=a&ilr=4&amv=2", "#", "verde"),
]

BOOT = [
    ("SYSTEM",  "APERTURE OS v1.0"),
    ("ENFOQUE", "DATA SCIENCE & IA"),
    ("MODO",    "SEMILLERO DE INVESTIGACION"),
    ("LINEAS",  "DATA · ML · IA · LLMs"),
    ("ACCESO",  "CONCEDIDO"),
]

ACCESO_TITULO = "SIN REQUISITOS PREVIOS"
ACCESO_FRASE  = "Lo único que pedimos son ganas de aprender y de construir."

ACCESO_PUNTOS = [
    ("01", "Se entra sin saber",
     "No hace falta llegar sabiendo. La idea es aprender lo que no sepas, con la guía "
     "de los demás miembros del semillero.",
     "cian"),
    ("02", "Se aprende construyendo",
     "Fomentamos los proyectos, las competencias y todo lo práctico, porque se aprende haciendo.",
     "verde"),

    ("03", "Reuniones semanales",
     "Cada lunes de 4 a 6 p. m. nos vemos presencialmente en la Facultad de Minas para "
     "aprender juntos. El calendario está más abajo.",
     "ambar"),
]

LINEAS_TITULO = "LÍNEAS DE ESTUDIO"
LINEAS_TEXTO  = "Tres frentes de trabajo. Pulsa una tarjeta para ver de qué va."

LINEAS = [
    {
        "clave": "ds",
        "color": "cian",
        "nombre": "Data Science y Machine Learning",
        "resumen": "Análisis, estadística y modelos que predicen.",
        "alias": "Data Science & Machine Learning",
        "titulo": "Ciencia de Datos y Aprendizaje Automático",
        "esencia": "Del dato crudo al modelo en producción.",
        "temas": [
            ("Estadística y minería de datos",     "histograma"),
            ("Aprendizaje automático y profundo",  "frontera"),
            ("Modelos en producción",              "despliegue"),
        ],
    },
    {
        "clave": "ia",
        "color": "ambar",
        "nombre": "IA y Sistemas Inteligentes",
        "resumen": "Transformers, agentes y RAG.",
        "alias": "AI & Intelligent Systems",
        "titulo": "Inteligencia Artificial y Sistemas Inteligentes",
        "esencia": "De los modelos de lenguaje a los agentes que actúan.",
        "temas": [
            ("Modelos de lenguaje y Transformers", "capas"),
            ("Agentes inteligentes",               "bucle"),
            ("RAG y GraphRAG",                     "recuperar"),
        ],
    },
    {
        "clave": "hpc",
        "color": "morado",
        "nombre": "High Performance Computing",
        "resumen": "Cómputo en GPU, en paralelo y a escala.",
        "alias": "High Performance Computing",
        "titulo": "Computación de Alto Desempeño e Infraestructura para IA",
        "esencia": "El cómputo que entrena y sostiene la IA.",
        "temas": [
            ("Programación en GPU",                "chip"),
            ("Cómputo paralelo y distribuido",     "reparto"),
            ("MLOps y LLMOps",                     "ciclo"),
        ],
    },
]

PROYECTOS_TITULO = "PROYECTOS"
PROYECTOS_TEXTO  = ("Del notebook a producción. Conoce los proyectos construidos en el semillero, "
                    "inspírate con ellos o súmate a mejorarlos.")
PROYECTOS_BOTON  = "ver los proyectos"

MARCA_SANGHELIOS = (
    '<span style="display:inline-flex; align-items:center; font-family:\'JetBrains Mono\',monospace;'
    ' font-weight:700; font-size:clamp(27px,5vw,40px); letter-spacing:-1px; line-height:1;">'
      '<span style="color:#ff5a61;">Sang</span>'
      '<span style="color:#cfe8ec;">heli</span>'
      '<svg viewBox="0 0 24 30" style="width:0.76em; height:0.95em; margin:0 0.03em;" fill="none" aria-hidden="true">'
        '<path d="M12 1.6C12 1.6 2.6 13 2.6 19.2a9.4 9.4 0 0 0 18.8 0C21.4 13 12 1.6 12 1.6Z"'
        ' stroke="#ff5a61" stroke-width="2.7"/>'
        '<path d="M7.7 19.4a4.3 4.3 0 0 0 4.3 4.3" stroke="#ff5a61" stroke-width="2.7" stroke-linecap="round"/>'
      '</svg>'
      '<span style="color:#cfe8ec;">s</span>'
    '</span>'
)

PROYECTOS = [
    {
        "clave": "sanghelios",
        "color": "rojo",
        "nombre": "Sanghelios",
        "marca": MARCA_SANGHELIOS,
        "titulo": "Inteligencia Predictiva para Bancos de Sangre",
        "periodo": "may. 2026 – jul. 2026",
        "estado": "desplegado",
        "resumen": "Anticipa la escasez de sangre 14 días antes y la convierte en campañas de donación.",
        "descripcion": ("Sistema que predice 14 días antes las posibles escaseces de sangre en el "
                        "Hospital General de Medellín utilizando un modelo XGBoost, convirtiendo esa "
                        "señal en campañas de donación diseñadas con IA, desplegadas mediante un "
                        "dashboard y un mapa 3D."),
        "claves": [
            "Predicción de escasez con 14 días de anticipación (XGBoost).",
            "Campañas de donación redactadas y segmentadas por agentes de IA.",
            "Dashboard operativo y mapa 3D de Medellín para ver dónde donar.",
        ],
        "tags": ["Python", "FastAPI", "XGBoost", "Agentes de IA", "Data Science", "Machine Learning"],
        "autores": ["Jerónimo Hoyos", "Daniel Arango", "Jose Miguel García", "Valentina Muñoz"],
        "video": "7mOG2cgMJ0c",
        "enlaces": [
            ("ver el despliegue", "https://main.jero98772.page/sanghelios/",             True),
            ("repositorio",       "https://github.com/aperture-systems-lab/Sanghelios", False),
        ],
    },
]

CALENDARIO_TITULO = "CALENDARIO 2026-2"
CALENDARIO_TEXTO  = "Las reuniones del semillero, semana a semana."

REUNION_INICIO = "2026-09-07"
REUNION_FIN    = "2026-11-26"
REUNION_DIA    = 0
REUNION_TITULO = "Reunión del semillero"
REUNION_LUGAR  = "Facultad de Minas"
REUNION_HORA   = "4:00 – 6:00 p. m."

REUNIONES = {
    # fecha: (título, ponente, de qué va)
    "2026-09-07": ("Cuando la IA se convierte en el motor de transformación de una empresa",
                   "Juan Carlos González",
                   "Qué cambia dentro de una organización cuando la IA deja de ser un "
                   "experimento y pasa a mover el negocio."),
    "2026-09-14": ("¿Cómo funcionan las redes neuronales?", "Jerónimo Hoyos",
                   "Qué hay debajo de una red neuronal. De la neurona artificial al "
                   "entrenamiento que la hace aprender."),
    "2026-09-18": ("Introducción a Git y GitHub", "Jerónimo Hoyos",
                   "Control de versiones desde cero. Cómo guardar la historia de tu "
                   "código, volver atrás cuando algo se rompe y trabajar con otros sin "
                   "pisarse el trabajo."),
    "2026-09-21": ("Introducción a la Regresión", "Valentina Muñoz",
                   "El modelo con el que todo empieza. Cómo trazar la relación entre "
                   "variables y usarla para predecir."),
    "2026-09-28": ("Visión Artificial", "Nicolás Mesa Ortega",
                   "Cómo una máquina aprende a ver. De los píxeles crudos al modelo "
                   "que reconoce lo que hay dentro de una imagen."),
    "2026-09-25": ("¿Cómo hacer redes neuronales en Python?", "Jerónimo Hoyos",
                   "De la teoría al código. Construir y entrenar una red neuronal en "
                   "Python con PyTorch."),
    "2026-10-05": ("Introducción a los sistemas RAG", "Esteban López Aguirre",
                   "Cómo darle a un modelo de lenguaje una fuente de verdad. Recuperar, "
                   "dar contexto y responder sin inventar."),
    "2026-10-19": ("Detectives de bases de datos: una muy breve introducción a SQL",
                   "Ronald Hernández",
                   "Preguntarle cosas a una base de datos y que responda. Las consultas "
                   "mínimas para encontrar lo que está escondido entre las tablas."),
    "2026-10-26": ("Topología aplicada al análisis de datos", "Carlos Reza",
                   "La forma de los datos también dice cosas. Cómo la topología "
                   "encuentra estructura donde la estadística clásica no llega."),
    "2026-11-09": ("Monte Carlo, de la bomba atómica a las finanzas cuantitativas",
                   "Jose Miguel García",
                   "Simular miles de veces lo que no se puede calcular. El método que "
                   "nació en el Proyecto Manhattan y hoy le pone número al riesgo en "
                   "los mercados."),
    "2026-11-23": ("Muestra de proyectos", "",
                   "Cierre del semestre. Cada equipo presenta lo que construyó: qué "
                   "problema atacó, cómo lo resolvió y qué sigue."),
}

# Detalles opcionales de cada reunión. Una fecha que no caiga en el día habitual
# (REUNION_DIA) se agrega al calendario como sesión extra.
# fecha: {"flyer", "hora", "lugar", "enlace", "color", "etiqueta"}
DETALLES = {
    "2026-09-07": {"flyer": "assets/flyers/2026-09-07.webp"},
    "2026-09-14": {"flyer": "assets/flyers/2026-09-14.webp"},
    "2026-09-18": {"flyer":  "assets/flyers/2026-09-18.webp",
                   "hora":   "6:00 p. m.",
                   "lugar":  "Reunión virtual",
                   "enlace": "https://meet.google.com/hui-pkwe-boi"},
    "2026-09-21": {"flyer": "assets/flyers/2026-09-21.webp"},
    "2026-09-25": {"flyer": "assets/flyers/2026-09-25.webp",
                   "hora":  "6:00 p. m.",
                   "lugar": "Reunión virtual"},
    "2026-09-28": {"flyer": "assets/flyers/2026-09-28.webp"},
    "2026-10-05": {"flyer": "assets/flyers/2026-10-05.webp"},
}

# Seminario de finanzas cuantitativas: una sesión por semana, los jueves.
# fecha: (título, de qué va)
SEMINARIO_FINANZAS = {
    "2026-10-08": ("Sesión 1: Fundamentos cuantitativos e hipótesis de mercado",
                   "Retornos, riesgo, inferencia y regresión. Cómo convertir una idea "
                   "sobre el mercado en una hipótesis que los datos puedan rechazar."),
    "2026-10-15": ("Sesión 2: Portafolios, riesgo y factores",
                   "Diversificación, frontera eficiente, beta y prima de riesgo. Por qué "
                   "combinar activos cambia el riesgo que se corre."),
    "2026-10-22": ("Sesión 3: Asset pricing y estrategias factoriales",
                   "Alpha, factores y portfolio sorts. Separar lo que una estrategia gana "
                   "de verdad de lo que solo es exposición a factores conocidos."),
    "2026-10-29": ("Sesión 4: Diseño empírico, validación y robustez",
                   "Fuera de muestra, robustez y sobreajuste. Cómo saber si un backtest "
                   "encontró algo o solo se aprendió el pasado."),
    "2026-11-05": ("Sesión 5: Implementación, fricciones y desempeño neto",
                   "Turnover, costos y liquidez. Lo que queda de una señal cuando se "
                   "paga por operarla."),
    "2026-11-12": ("Sesión 6: Asset pricing condicional",
                   "Variables de estado e interacciones. Cuándo una señal funciona "
                   "según el momento en que está el mercado."),
    "2026-11-19": ("Sesión 7: Regímenes de mercado y métodos modernos",
                   "Markov switching, estados latentes y comparación con machine "
                   "learning. Modelar un mercado que cambia de comportamiento."),
    "2026-11-26": ("Sesión 8: Capstone: investigación cuantitativa aplicada",
                   "Integración y presentación. Cada participante presenta una "
                   "investigación completa: hipótesis, método, evidencia y límites."),
}

for _fecha, (_titulo, _texto) in SEMINARIO_FINANZAS.items():
    REUNIONES[_fecha] = (_titulo, "", _texto)
    DETALLES.setdefault(_fecha, {}).update(
        {"color": "morado", "etiqueta": "SEMINARIO DE FINANZAS CUANTITATIVAS"})

FESTIVOS = {
    "2026-10-12": "Día de la Raza",
    "2026-11-02": "Día de Todos los Santos",
    "2026-11-16": "Independencia de Cartagena",
}

SIN_REUNION = {
    "2026-11-30": "La Alborada",
}

HITOS = {
}
