(function () {
  "use strict";

  var DATA = window.APERTURE_DATA || {};
  var bootRows = DATA.bootRows || [];
  var studyLines = DATA.lines || [];
  var access = DATA.access || [];
  var cal = DATA.calendar || {};
  var socials = DATA.socials || [];
  var site = DATA.site || {};

  var glowMap = {
    '#33c9d6': 'rgba(51,201,214,0.32)', '#4fd6a0': 'rgba(79,214,160,0.32)',
    '#f5b94d': 'rgba(245,185,77,0.3)', '#c79bff': 'rgba(199,155,255,0.3)',
    '#5fb0ff': 'rgba(95,176,255,0.3)', '#ff5a61': 'rgba(255,90,97,0.32)'
  };
  function glowFor(c) { return glowMap[c] || 'rgba(41,197,214,0.3)'; }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function $(id) { return document.getElementById(id); }
  function setHTML(id, html) { var el = $(id); if (el && html != null) el.innerHTML = html; }
  function setText(id, txt) { var el = $(id); if (el && txt != null) el.textContent = txt; }
  function scrollToId(id) {
    var el = $(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
  }

  function applySite() {
    if (site.title) document.title = site.title;
    setHTML('heroTitle', site.heroTitle);
    setHTML('heroText', site.heroText);
    setHTML('aboutText', site.about);
    setText('labPhrase', site.labPhrase);
    setText('labInvite', site.labInvite);
    setText('contactTitle', site.contactTitle);
    setText('contactText', site.contactText);
    if (site.projectsButton && $('pjAccessBtn')) $('pjAccessBtn').innerHTML = esc(site.projectsButton) + ' &#9656;';
    if (site.chips && $('heroChips')) {
      $('heroChips').innerHTML = site.chips.map(function (c) {
        return '<span style="font-family:\'JetBrains Mono\',monospace; font-size:13px; color:' + c.color + '; border:1px solid #1f6f7c; background:#0a1622; padding:5px 11px;">' + esc(c.text) + '</span>';
      }).join('');
    }
  }

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
               'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MESES_ABR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  var DIAS_INI = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function parseISO(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function toISO(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function wdIdx(d) { return (d.getDay() + 6) % 7; }
  function fechaLarga(d) { return DIAS[wdIdx(d)] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear(); }
  function fechaCorta(d) { return d.getDate() + ' ' + MESES_ABR[d.getMonth()]; }

  var CELDA = 46;
  var CAL_START = cal.start ? parseISO(cal.start) : null;
  var CAL_END = cal.end ? parseISO(cal.end) : null;
  var MEET_WD = cal.meetingWeekday == null ? 2 : cal.meetingWeekday;
  var HITOS = cal.milestones || {};
  var FESTIVOS = cal.holidays || {};
  var SIN_REUNION = cal.skipped || {};

  var meetings = (function () {
    var out = [], d, info, iso, habitual;
    if (!CAL_START || !CAL_END) return out;
    for (d = new Date(CAL_START); d <= CAL_END; d.setDate(d.getDate() + 1)) {
      iso = toISO(d);
      info = (cal.meetings || {})[iso];
      habitual = wdIdx(d) === MEET_WD && !FESTIVOS[iso] && !SIN_REUNION[iso];
      if (!habitual && !(info && info.title)) continue;
      out.push({
        iso: iso,
        date: new Date(d),
        title: info && info.title ? info.title : (cal.meetingTitle || 'Reunión del semillero'),
        speaker: info && info.speaker ? info.speaker : '',
        text: info && info.text ? info.text : '',
        flyer: info && info.flyer ? info.flyer : '',
        link: info && info.link ? info.link : '',
        accent: info && info.accent ? info.accent : '',
        tag: info && info.tag ? info.tag : '',
        time: info && info.time ? info.time : (cal.meetingTime || ''),
        place: info && info.place ? info.place : (cal.meetingPlace || ''),
        aparte: !habitual,
        planned: !!(info && info.title)
      });
    }
    return out;
  })();

  function colorMeet(r) { return r.accent || (r.aparte ? '#29c5d6' : '#4fd6a0'); }
  function fondoMeet(r) { return r.accent ? '#140f20' : (r.aparte ? '#06202a' : '#082019'); }

  // Hora en que termina una reunión, a partir de textos como "4:00 – 6:00 p. m."
  // o "6:00 p. m.". Con una sola hora se asume que dura dos horas; sin hora,
  // que dura todo el día.
  function finReunion(r) {
    var fin = new Date(r.date);
    var horas = (r.time || '').match(/\d{1,2}:\d{2}/g);
    if (!horas) { fin.setHours(23, 59, 59); return fin; }
    var pm = /p\.?\s*m/i.test(r.time);
    var hm = horas[horas.length - 1].split(':');
    var h = parseInt(hm[0], 10);
    if (h !== 12 && pm) h += 12;
    fin.setHours(h + (horas.length === 1 ? 2 : 0), parseInt(hm[1], 10), 0);
    return fin;
  }

  var PROXIMA = (function () {
    var ahora = new Date();
    var r = meetings.filter(function (m) { return finReunion(m) > ahora; })[0];
    return r ? r.iso : '';
  })();

  var meetIdx = (function () {
    var m = {};
    meetings.forEach(function (r, i) { m[r.iso] = i; });
    return m;
  })();

  function legendItem(color, glyph, text, bg) {
    return '' +
    '<span style="display:inline-flex; align-items:center; gap:8px; font-family:\'JetBrains Mono\',monospace; font-size:13px; color:#9fc4cd;">' +
      '<span style="width:17px; height:17px; display:grid; place-items:center; font-size:9px; color:' + color + '; border:2px solid ' + color + '; background:' + (bg || 'transparent') + ';">' + glyph + '</span>' +
      esc(text) +
    '</span>';
  }

  function dayCell(d) {
    var iso = toISO(d);
    var hoy = toISO(new Date()) === iso;
    var mi = meetIdx[iso];
    var hito = HITOS[iso];
    var esReunion = mi != null;
    var cReu = esReunion ? colorMeet(meetings[mi]) : '';

    var fg = '#7fa2ac', bg = 'transparent', bd = '1px solid transparent', extra = '';
    if (esReunion) {
      fg = cReu; bg = fondoMeet(meetings[mi]); bd = '2px solid ' + cReu;
      extra = 'box-shadow:0 0 10px ' + glowFor(cReu) + '; font-weight:700;';
    }
    if (hito) {
      fg = hito.accent; bd = '2px solid ' + hito.accent;
      extra = 'box-shadow:0 0 12px ' + glowFor(hito.accent) + '; font-weight:700;';
    }
    if (hoy) extra += ' outline:2px dashed #29c5d6; outline-offset:2px;';
    var esProx = esReunion && iso === PROXIMA;
    if (esProx) extra += ' --glow:' + glowFor(cReu) + ';';

    var style = 'position:relative; display:grid; place-items:center; height:' + CELDA + 'px; margin:0; padding:0; ' +
      'font-family:\'JetBrains Mono\',monospace; font-size:15px; color:' + fg + '; background:' + bg +
      '; border:' + bd + '; ' + extra;

    var punto = esReunion
      ? '<i style="position:absolute; bottom:5px; left:50%; transform:translateX(-50%); width:5px; height:5px; background:' + (hito ? hito.accent : cReu) + '; border-radius:50%;"></i>'
      : '';

    if (esReunion) {
      var marca = esProx
        ? '<i style="position:absolute; top:-9px; left:50%; transform:translateX(-50%); font-style:normal; font-size:9px; font-weight:700; letter-spacing:0.5px; line-height:1; color:#050a0e; background:' + cReu + '; padding:2px 4px; white-space:nowrap;">PRÓXIMA</i>'
        : '';
      return '<button class="calcell calday' + (esProx ? ' calprox' : '') + '" data-meet="' + mi + '" title="' + (esProx ? 'Próxima charla · ' : '') + esc(meetings[mi].title) + ' · ' + esc(fechaLarga(d)) + '" ' +
        'style="cursor:pointer; transition:transform .1s, box-shadow .1s; ' + style + '">' + d.getDate() + punto + marca + '</button>';
    }

    return '<span class="calcell"' + (hito ? ' title="' + esc(hito.label) + '"' : '') +
      ' style="' + style + '">' + d.getDate() + punto + '</span>';
  }

  var CAL_MESES = (function () {
    var out = [];
    if (!CAL_START || !CAL_END) return out;
    var hoy = new Date(), hoyAbs = hoy.getFullYear() * 12 + hoy.getMonth();
    var y = CAL_START.getFullYear(), m = CAL_START.getMonth();
    var yFin = CAL_END.getFullYear(), mFin = CAL_END.getMonth();
    if (hoyAbs < y * 12 + m) { y = hoy.getFullYear(); m = hoy.getMonth(); }
    if (hoyAbs > yFin * 12 + mFin) { yFin = hoy.getFullYear(); mFin = hoy.getMonth(); }
    while (y < yFin || (y === yFin && m <= mFin)) {
      out.push({ y: y, m: m });
      m++; if (m > 11) { m = 0; y++; }
    }
    return out;
  })();

  var mesIdx = (function () {
    var hoy = new Date(), i;
    for (i = 0; i < CAL_MESES.length; i++) {
      if (CAL_MESES[i].y === hoy.getFullYear() && CAL_MESES[i].m === hoy.getMonth()) return i;
    }
    return 0;
  })();

  function monthHtml(i) {
    var y = CAL_MESES[i].y, m = CAL_MESES[i].m;
    var hueco = wdIdx(new Date(y, m, 1));
    var total = new Date(y, m + 1, 0).getDate();
    var celdas = '', k, d, cuantas = 0;

    for (k = 0; k < hueco; k++) celdas += '<span class="calcell" style="height:' + CELDA + 'px;"></span>';
    for (k = 1; k <= total; k++) {
      d = new Date(y, m, k);
      if (meetIdx[toISO(d)] != null) cuantas++;
      celdas += dayCell(d);
    }

    var iniciales = DIAS_INI.map(function (l, j) {
      return '<span style="display:grid; place-items:center; height:24px; font-family:\'JetBrains Mono\',monospace; font-size:12px; letter-spacing:0.5px; color:' + (j === MEET_WD ? '#4fd6a0' : '#5c7a86') + ';">' + l + '</span>';
    }).join('');

    var flecha = function (id, glifo, apagado, etiqueta) {
      return '<button id="' + id + '" aria-label="' + etiqueta + '"' + (apagado ? ' disabled' : '') +
        ' style="cursor:' + (apagado ? 'default' : 'pointer') + '; font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:14px; ' +
        'color:' + (apagado ? '#1f4b54' : '#29c5d6') + '; background:transparent; border:2px solid ' + (apagado ? '#12303c' : '#29c5d6') + '; padding:4px 11px;">' + glifo + '</button>';
    };

    return '' +
    '<div style="background:#070f18; border:2px solid #173241; box-shadow:6px 6px 0 rgba(0,0,0,0.5);">' +
      '<div style="display:flex; align-items:center; gap:12px; padding:11px 14px; background:#0a1622; border-bottom:2px solid #16404d;">' +
        flecha('calPrev', '&#9666;', i === 0, 'mes anterior') +
        '<span style="flex:1; text-align:center; font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:16px; color:#cfe8ec;">' + MESES[m] + ' <span style="color:#5c7a86; font-weight:400;">' + y + '</span></span>' +
        flecha('calNext', '&#9656;', i === CAL_MESES.length - 1, 'mes siguiente') +
      '</div>' +
      '<div class="calcuerpo" style="padding:12px 14px 16px;">' +
        '<div class="calrejilla" style="display:grid; grid-template-columns:repeat(7,1fr); gap:5px; margin-bottom:5px;">' + iniciales + '</div>' +
        '<div class="calrejilla" style="display:grid; grid-template-columns:repeat(7,1fr); gap:5px;">' + celdas + '</div>' +
      '</div>' +
      '<div style="padding:10px 14px; border-top:2px solid #16404d; background:#0a1622; font-family:\'JetBrains Mono\',monospace; font-size:12px; color:' + (cuantas ? '#4fd6a0' : '#5c7a86') + ';">' +
        (cuantas ? cuantas + ' reuni' + (cuantas === 1 ? 'ón' : 'ones') + ' este mes' : 'sin reuniones este mes') +
      '</div>' +
    '</div>';
  }

  function pintarMes() {
    var caja = $('calMes');
    if (!caja) return;
    caja.innerHTML = monthHtml(mesIdx);
    Array.prototype.forEach.call(caja.querySelectorAll('.calday'), function (b) {
      b.addEventListener('click', function () { openMeeting(parseInt(b.getAttribute('data-meet'), 10)); });
    });
    $('calPrev').addEventListener('click', function () { if (mesIdx > 0) { mesIdx--; pintarMes(); } });
    $('calNext').addEventListener('click', function () { if (mesIdx < CAL_MESES.length - 1) { mesIdx++; pintarMes(); } });
  }

  function enMesesVisibles(iso) {
    if (!CAL_MESES.length) return false;
    var d = parseISO(iso);
    var a = CAL_MESES[0], z = CAL_MESES[CAL_MESES.length - 1];
    return d >= new Date(a.y, a.m, 1) && d <= new Date(z.y, z.m + 1, 0);
  }

  function filaReunion(r, i) {
    var color = r.planned ? colorMeet(r) : '#5c7a86';
    var fondo = r.planned ? fondoMeet(r) : 'transparent';
    var esProx = r.iso === PROXIMA;
    var marco = esProx
      ? 'background:' + fondo + '; border:none; border-left:4px solid ' + color + '; box-shadow:0 0 14px ' + glowFor(color) + '; padding:8px 10px 9px; margin:2px 0; '
      : 'background:transparent; border:none; padding:2px 0; margin:-2px 0; ';
    return '' +
    '<button class="filareu' + (esProx ? ' proxima' : '') + '" data-meet="' + i + '" title="' + esc(fechaLarga(r.date)) + '" ' +
      'style="cursor:pointer; text-align:left; width:100%; ' + marco +
      'display:flex; align-items:flex-start; gap:8px; font-family:\'JetBrains Mono\',monospace; font-size:13px; line-height:1.35; color:#9fc4cd; transition:transform .1s, color .1s;">' +
      '<span style="flex:none; width:17px; height:17px; display:grid; place-items:center; font-size:9px; color:' + color + '; border:2px solid ' + color + '; background:' + fondo + ';">&#9679;</span>' +
      '<span style="min-width:0;' + (esProx ? ' color:#fff;' : '') + '">' +
        (esProx ? '<span style="display:block; font-size:11px; font-weight:700; letter-spacing:0.8px; color:' + color + '; margin-bottom:3px;">&#9656; PRÓXIMA CHARLA</span>' : '') +
        '<b style="color:' + color + ';">' + esc(fechaCorta(r.date)) + '</b> · ' +
        esc(r.planned ? r.title : 'sin programar') +
      '</span>' +
    '</button>';
  }

  function bloqueHorario() {
    if (!cal.meetingTime && !cal.meetingPlace) return '';
    return '' +
    '<div style="background:#070f18; border:2px solid #173241; border-left:6px solid #4fd6a0; padding:13px 15px; display:flex; flex-direction:column; gap:5px;">' +
      '<span style="font-family:\'JetBrains Mono\',monospace; font-size:11px; letter-spacing:0.6px; text-transform:uppercase; color:#5c7a86;">cada ' + esc(DIAS[MEET_WD]) + '</span>' +
      (cal.meetingTime ? '<span style="font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:16px; color:#4fd6a0;">' + esc(cal.meetingTime) + '</span>' : '') +
      (cal.meetingPlace ? '<span style="font-family:\'JetBrains Mono\',monospace; font-size:13px; color:#9fc4cd;">' + esc(cal.meetingPlace) + '</span>' : '') +
    '</div>';
  }

  function renderCalendar() {
    var mount = $('calendarMount');
    if (!mount) return;
    if (!CAL_MESES.length) { mount.innerHTML = ''; return; }

    var hitos = Object.keys(HITOS).filter(enMesesVisibles).sort().map(function (iso) {
      var h = HITOS[iso], d = parseISO(iso);
      return legendItem(h.accent, '&#9670;', fechaCorta(d) + ' · ' + h.label.toLowerCase(), 'transparent');
    }).join('');

    mount.innerHTML = '' +
    '<div id="calendario" style="scroll-margin-top:72px;">' +
      '<div style="font-family:\'JetBrains Mono\',monospace; font-size:16px; color:#1f8fa0; margin-bottom:6px;">aperture@lab:~$ <span style="color:#cfe8ec;">cat ./calendario.ics</span></div>' +
      '<h3 style="font-family:\'Press Start 2P\'; font-size:clamp(13px,2.4vw,20px); color:#29c5d6; margin:0 0 10px;">' + esc(cal.title || 'CALENDARIO') + '</h3>' +
      '<p style="font-size:24px; color:#7fa2ac; margin:0 0 18px; font-family:\'VT323\',monospace;">' + esc(cal.text || '') + '</p>' +

      '<div class="calgrid">' +
        '<div id="calMes"></div>' +
        '<aside style="display:flex; flex-direction:column; gap:18px;">' +
          '<div style="display:flex; flex-direction:column; gap:6px;">' +
            '<div style="display:flex; justify-content:space-between; font-family:\'JetBrains Mono\',monospace; font-size:11px; letter-spacing:0.6px; text-transform:uppercase; color:#5c7a86;">' +
              '<span>agenda del semestre</span><span>' + meetings.length + ' sesiones &#8597;</span>' +
            '</div>' +
            '<div id="listaWrap" class="listawrap">' +
              '<div id="listaReu" class="listareu" style="position:relative; display:flex; flex-direction:column; gap:11px; max-height:340px; overflow-y:auto; padding:6px 10px 6px 4px;">' +
                meetings.map(filaReunion).join('') + hitos +
              '</div>' +
            '</div>' +
          '</div>' +
          bloqueHorario() +
        '</aside>' +
      '</div>' +
    '</div>';

    pintarMes();
    var lista = $('listaReu'), wrap = $('listaWrap');
    function bordes() {
      wrap.classList.toggle('arriba', lista.scrollTop > 4);
      wrap.classList.toggle('abajo', lista.scrollTop + lista.clientHeight < lista.scrollHeight - 4);
    }
    function irAProxima() {
      var fila = lista.querySelector('.proxima');
      if (fila) lista.scrollTop = fila.offsetTop - 30;
      bordes();
    }
    lista.addEventListener('scroll', bordes);
    requestAnimationFrame(irAProxima);
    window.addEventListener('load', irAProxima);
    Array.prototype.forEach.call(mount.querySelectorAll('.filareu'), function (b) {
      b.addEventListener('click', function () { openMeeting(parseInt(b.getAttribute('data-meet'), 10)); });
    });
  }

  function renderAccess() {
    var mount = $('accessMount');
    if (!mount || !access.length) return;

    var tarjetas = access.map(function (p) {
      return '' +
      '<div style="--glow:' + p.glow + '; background:#070f18; border:2px solid #173241; border-top:4px solid ' + p.accent + '; box-shadow:6px 6px 0 rgba(0,0,0,0.5); padding:18px 20px;">' +
        '<div style="font-family:\'Press Start 2P\'; font-size:13px; color:' + p.accent + '; margin-bottom:12px;">' + esc(p.num) + '</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:16px; color:#fff; margin-bottom:8px;">' + esc(p.title) + '</div>' +
        '<div style="font-size:20px; line-height:1.3; color:#9fc4cd; font-family:\'VT323\',monospace;">' + esc(p.text) + '</div>' +
      '</div>';
    }).join('');

    mount.innerHTML = '' +
    '<div id="acceso" style="scroll-margin-top:72px;">' +
      '<div style="font-family:\'JetBrains Mono\',monospace; font-size:16px; color:#1f8fa0; margin-bottom:6px;">aperture@lab:~$ <span style="color:#cfe8ec;">./requisitos.sh</span></div>' +
      '<h3 style="font-family:\'Press Start 2P\'; font-size:clamp(13px,2.4vw,20px); color:#29c5d6; margin:0 0 14px;">' + esc(site.accessTitle || '') + '</h3>' +
      '<p style="font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:clamp(17px,2.6vw,23px); line-height:1.4; color:#fff; margin:0 0 22px; max-width:760px;">' +
        '<span style="color:#4fd6a0;">&gt;</span> ' + esc(site.accessPhrase || '') + '</p>' +

      '<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(min(258px,100%),1fr)); gap:16px;">' + tarjetas + '</div>' +
    '</div>';
  }

  function lineCard(l) {
    return '' +
    '<button class="linea" data-line="' + esc(l.key) + '" style="--glow:' + l.glow + '; --acento:' + l.accent + '; cursor:pointer; text-align:left; padding:0 0 16px; background:#070f18; border:2px solid #173241; box-shadow:6px 6px 0 rgba(0,0,0,0.5); overflow:hidden; transition:transform .14s, box-shadow .14s, border-color .14s;">' +
      '<span class="viz" data-viz="' + esc(l.key) + '" aria-hidden="true" style="display:block; border-bottom:2px solid ' + l.accent + '; background:#04080c;"></span>' +
      '<b style="display:block; margin:14px 16px 6px; font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:16px; color:' + l.accent + ';">' + esc(l.name) + '</b>' +
      '<span style="display:block; margin:0 16px 10px; font-size:20px; line-height:1.25; color:#9fc4cd; font-family:\'VT323\',monospace;">' + esc(l.summary) + '</span>' +
      '<span style="display:block; margin:0 16px; font-family:\'JetBrains Mono\',monospace; font-size:12px; font-weight:700; color:' + l.accent + ';">ver la l&iacute;nea &#9656;</span>' +
    '</button>';
  }

  function renderLines() {
    var mount = $('linesMount');
    if (!mount || !studyLines.length) return;
    mount.innerHTML = '' +
    '<div id="lineas" style="scroll-margin-top:72px;">' +
      '<div style="font-family:\'JetBrains Mono\',monospace; font-size:16px; color:#1f8fa0; margin-bottom:6px;">aperture@lab:~$ <span style="color:#cfe8ec;">ls ./lineas/</span></div>' +
      '<h3 style="font-family:\'Press Start 2P\'; font-size:clamp(13px,2.4vw,20px); color:#29c5d6; margin:0 0 10px;">' + esc(site.linesTitle || 'LÍNEAS DE ESTUDIO') + '</h3>' +
      '<p style="font-size:24px; color:#7fa2ac; margin:0 0 18px; font-family:\'VT323\',monospace;">' + esc(site.linesText || '') + '</p>' +
      '<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(min(288px,100%),1fr)); gap:16px;">' + studyLines.map(lineCard).join('') + '</div>' +
    '</div>';

    Array.prototype.forEach.call(mount.querySelectorAll('.linea'), function (b) {
      b.addEventListener('click', function () { openLine(b.getAttribute('data-line')); });
    });
    mountVitrinas(mount);
  }

  var SVGNS = 'http://www.w3.org/2000/svg';
  var VIZ_W = 120, VIZ_H = 52;

  function svgEl(name, attrs) {
    var el = document.createElementNS(SVGNS, name);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) el.setAttribute(k, String(attrs[k]));
    return el;
  }
  function lienzo() { return svgEl('svg', { viewBox: '0 0 ' + VIZ_W + ' ' + VIZ_H }); }

  function vitrinaDS() {
    var svg = lienzo();
    var PUNTOS = [[16,39],[25,41],[34,34],[43,33],[51,28],[60,30],[69,22],[78,21],[88,15],[99,13],[107,10]];
    var X1 = 12, Y1 = 43, X2 = 111, Y2 = 9;
    var pend = (Y2 - Y1) / (X2 - X1);
    function enLaRecta(x) { return Y1 + pend * (x - X1); }

    svg.appendChild(svgEl('line', { 'class': 'eje', x1: 9, y1: 47, x2: 115, y2: 47 }));
    svg.appendChild(svgEl('line', { 'class': 'eje', x1: 9, y1: 47, x2: 9, y2: 5 }));
    PUNTOS.forEach(function (p) {
      svg.appendChild(svgEl('line', { 'class': 'residuo', x1: p[0], y1: p[1], x2: p[0], y2: enLaRecta(p[0]) }));
    });
    svg.appendChild(svgEl('line', { 'class': 'ajuste', x1: X1, y1: Y1, x2: X2, y2: Y2 }));
    PUNTOS.forEach(function (p, i) {
      var c = svgEl('circle', { 'class': 'punto', cx: p[0], cy: p[1], r: 2.5 });
      c.style.animationDelay = (i * 0.09) + 's';
      svg.appendChild(c);
    });
    return svg;
  }

  function vitrinaIA() {
    var svg = lienzo();
    var CAPAS = [2, 4, 4, 2], X = [12, 44, 76, 108], SEP = 11.5, RADIO = 4.2, PASO = 0.5;
    var capas = CAPAS.map(function (n, c) {
      var ys = [];
      for (var i = 0; i < n; i++) ys.push([X[c], VIZ_H / 2 + (i - (n - 1) / 2) * SEP]);
      return ys;
    });

    capas.slice(0, -1).forEach(function (capa, c) {
      capa.forEach(function (a) {
        capas[c + 1].forEach(function (b) {
          var s = svgEl('line', { 'class': 'sinapsis', x1: a[0], y1: a[1], x2: b[0], y2: b[1] });
          s.style.animationDelay = (c * PASO + 0.15).toFixed(2) + 's';
          svg.appendChild(s);
        });
      });
    });
    capas.forEach(function (capa, c) {
      capa.forEach(function (p) {
        var n = svgEl('circle', { 'class': 'neurona', cx: p[0], cy: p[1], r: RADIO });
        n.style.animationDelay = (c * PASO).toFixed(2) + 's';
        svg.appendChild(n);
      });
    });
    return svg;
  }

  function vitrinaHPC() {
    var svg = lienzo();
    var CHIPS = 3, LADO = 30, HUECO = 9, PATAS = 4, LARGO = 4;
    var REJILLA = 3, NUCLEO = 4, SEP = 1;
    var y0 = (VIZ_H - LADO) / 2;
    var x0 = (VIZ_W - (CHIPS * LADO + (CHIPS - 1) * HUECO)) / 2;

    for (var n = 0; n < CHIPS; n++) {
      var x = x0 + n * (LADO + HUECO);
      for (var p = 0; p < PATAS; p++) {
        var desp = 6 + p * 6;
        svg.appendChild(svgEl('line', { 'class': 'pata', x1: x - LARGO, y1: y0 + desp, x2: x, y2: y0 + desp }));
        svg.appendChild(svgEl('line', { 'class': 'pata', x1: x + LADO, y1: y0 + desp, x2: x + LADO + LARGO, y2: y0 + desp }));
        svg.appendChild(svgEl('line', { 'class': 'pata', x1: x + desp, y1: y0 - LARGO, x2: x + desp, y2: y0 }));
        svg.appendChild(svgEl('line', { 'class': 'pata', x1: x + desp, y1: y0 + LADO, x2: x + desp, y2: y0 + LADO + LARGO }));
      }
      svg.appendChild(svgEl('rect', { 'class': 'encapsulado', x: x, y: y0, width: LADO, height: LADO }));

      var die = REJILLA * NUCLEO + (REJILLA - 1) * SEP;
      var dieX = x + (LADO - die) / 2, dieY = y0 + (LADO - die) / 2;
      svg.appendChild(svgEl('rect', { 'class': 'dado', x: dieX - 2, y: dieY - 2, width: die + 4, height: die + 4 }));

      for (var f = 0; f < REJILLA; f++) {
        for (var c = 0; c < REJILLA; c++) {
          var nu = svgEl('rect', {
            'class': 'nucleo',
            x: dieX + c * (NUCLEO + SEP), y: dieY + f * (NUCLEO + SEP),
            width: NUCLEO, height: NUCLEO
          });
          nu.style.animationDelay = (n * 0.3 + (f + c) * 0.13) + 's';
          svg.appendChild(nu);
        }
      }
    }
    return svg;
  }

  var VITRINAS = { ds: vitrinaDS, ia: vitrinaIA, hpc: vitrinaHPC };

  function mountVitrinas(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('.viz[data-viz]'), function (caja) {
      var f = VITRINAS[caja.getAttribute('data-viz')];

      caja.innerHTML = '';
      if (f) caja.appendChild(f());
    });
  }

  var DIAGRAMAS = {
    histograma:
      '<rect class="tenue" x="4" y="16" width="6" height="6.5"/>' +
      '<rect class="tenue" x="11.5" y="12" width="6" height="10.5"/>' +
      '<rect class="tenue" x="19" y="8" width="6" height="14.5"/>' +
      '<rect class="tenue" x="26.5" y="12.5" width="6" height="10"/>' +
      '<rect class="tenue" x="34" y="17" width="6" height="5.5"/>' +
      '<line x1="2.5" y1="22.5" x2="41.5" y2="22.5"/>' +
      '<path d="M3 21.5 Q22 -8 41 21.5"/>',
    frontera:
      '<line class="guion" x1="4" y1="22" x2="40" y2="4"/>' +
      '<circle cx="10" cy="8" r="2.3"/><circle cx="17.5" cy="5" r="2.3"/><circle cx="13" cy="14" r="2.3"/>' +
      '<rect class="lleno" x="25.5" y="18" width="4.4" height="4.4"/>' +
      '<rect class="lleno" x="32.5" y="15" width="4.4" height="4.4"/>' +
      '<rect class="lleno" x="28" y="11" width="4.4" height="4.4"/>',
    despliegue:
      '<rect x="2" y="8" width="13" height="10"/><circle class="lleno" cx="8.5" cy="13" r="2.4"/>' +
      '<line x1="17" y1="13" x2="23" y2="13"/><polyline points="21,11 23,13 21,15"/>' +
      '<rect x="26" y="4" width="16" height="5"/><rect x="26" y="10.5" width="16" height="5"/><rect x="26" y="17" width="16" height="5"/>' +
      '<circle class="lleno" cx="29" cy="6.5" r="1"/><circle class="lleno" cx="29" cy="13" r="1"/><circle class="lleno" cx="29" cy="19.5" r="1"/>',
    capas:
      '<line x1="1.5" y1="13" x2="7" y2="13"/><polyline points="5,11 7,13 5,15"/>' +
      '<rect x="9" y="3.5" width="26" height="5.5"/><rect x="9" y="10.5" width="26" height="5.5"/><rect x="9" y="17.5" width="26" height="5.5"/>' +
      '<line class="tenue-trazo" x1="22" y1="9" x2="22" y2="10.5"/><line class="tenue-trazo" x1="22" y1="16" x2="22" y2="17.5"/>' +
      '<line x1="37" y1="13" x2="42.5" y2="13"/><polyline points="40.5,11 42.5,13 40.5,15"/>',
    bucle:
      '<line class="tenue-trazo" x1="20" y1="13" x2="20" y2="6"/>' +
      '<line class="tenue-trazo" x1="20" y1="13" x2="14" y2="19"/>' +
      '<line class="tenue-trazo" x1="20" y1="13" x2="26" y2="19"/>' +
      '<rect class="lleno" x="17.7" y="2.4" width="4.6" height="4.6"/>' +
      '<rect class="lleno" x="11.7" y="17.4" width="4.6" height="4.6"/>' +
      '<rect class="lleno" x="23.7" y="17.4" width="4.6" height="4.6"/>' +
      '<circle class="lleno" cx="20" cy="13" r="3.6"/>' +
      '<path d="M32 4.5 A 12.5 12.5 0 0 1 32 21.5"/><polyline points="34.6,19.2 31.6,21.8 30.9,18"/>',
    recuperar:
      '<rect class="tenue" x="2" y="4" width="9" height="13"/><rect x="5.5" y="7" width="9" height="13"/>' +
      '<line x1="7.5" y1="11.5" x2="12.5" y2="11.5"/><line x1="7.5" y1="15" x2="11" y2="15"/>' +
      '<line x1="17" y1="13" x2="23" y2="13"/><polyline points="21,11 23,13 21,15"/>' +
      '<line x1="27.5" y1="6" x2="33.5" y2="13.5"/><line x1="41" y1="8" x2="33.5" y2="13.5"/><line x1="38" y1="21" x2="33.5" y2="13.5"/>' +
      '<circle class="lleno" cx="27.5" cy="6" r="2.2"/><circle class="lleno" cx="41" cy="8" r="2.2"/>' +
      '<circle class="lleno" cx="38" cy="21" r="2.2"/><circle class="lleno" cx="33.5" cy="13.5" r="2.8"/>',
    chip:
      '<line x1="7" y1="9" x2="11" y2="9"/><line x1="7" y1="13" x2="11" y2="13"/><line x1="7" y1="17" x2="11" y2="17"/>' +
      '<line x1="33" y1="9" x2="37" y2="9"/><line x1="33" y1="13" x2="37" y2="13"/><line x1="33" y1="17" x2="37" y2="17"/>' +
      '<line x1="16" y1="1.5" x2="16" y2="5"/><line x1="22" y1="1.5" x2="22" y2="5"/><line x1="28" y1="1.5" x2="28" y2="5"/>' +
      '<line x1="16" y1="21" x2="16" y2="24.5"/><line x1="22" y1="21" x2="22" y2="24.5"/><line x1="28" y1="21" x2="28" y2="24.5"/>' +
      '<rect x="11" y="5" width="22" height="16"/><rect x="16" y="9" width="12" height="8"/>' +
      '<line class="tenue-trazo" x1="20" y1="9" x2="20" y2="17"/><line class="tenue-trazo" x1="24" y1="9" x2="24" y2="17"/>' +
      '<line class="tenue-trazo" x1="16" y1="13" x2="28" y2="13"/>',
    reparto:
      '<path d="M6.5 13 C10 13 11 5 14 5"/><path d="M6.5 13 H14"/><path d="M6.5 13 C10 13 11 21 14 21"/>' +
      '<path d="M30 5 C33 5 34 13 37.5 13"/><path d="M30 13 H37.5"/><path d="M30 21 C33 21 34 13 37.5 13"/>' +
      '<line class="tenue-trazo" x1="14" y1="5" x2="30" y2="5"/><line class="tenue-trazo" x1="14" y1="13" x2="30" y2="13"/>' +
      '<line class="tenue-trazo" x1="14" y1="21" x2="30" y2="21"/>' +
      '<rect class="lleno" x="16" y="3.4" width="3.6" height="3.2"/><rect class="lleno" x="22" y="11.4" width="3.6" height="3.2"/>' +
      '<rect class="lleno" x="26" y="19.4" width="3.6" height="3.2"/>' +
      '<circle class="lleno" cx="4" cy="13" r="2.6"/><circle class="lleno" cx="40" cy="13" r="2.6"/>',
    ciclo:
      '<rect x="3" y="3.5" width="10" height="9"/><rect x="17" y="3.5" width="10" height="9"/><rect x="31" y="3.5" width="10" height="9"/>' +
      '<line x1="13" y1="8" x2="17" y2="8"/><polyline points="15.4,6.4 17,8 15.4,9.6"/>' +
      '<line x1="27" y1="8" x2="31" y2="8"/><polyline points="29.4,6.4 31,8 29.4,9.6"/>' +
      '<path class="guion" d="M36 12.5 V20 H8 V13.8"/><polyline points="6.4,15.4 8,13.8 9.6,15.4"/>'
  };

  function renderSocials() {
    $('socialsMount').innerHTML = socials.map(function (s) {
      return '' +
      '<a class="social" href="' + s.url + '" target="_blank" rel="noopener" style="--glow:' + s.glow + '; text-decoration:none; display:flex; align-items:center; gap:15px; background:#0a1622; border:2px solid #173241; border-left:6px solid ' + s.accent + '; box-shadow:4px 4px 0 rgba(0,0,0,0.5); padding:17px 18px; transition:transform .1s, box-shadow .1s;">' +
        '<span style="font-family:\'Press Start 2P\'; font-size:17px; color:' + s.accent + '; min-width:34px;">' + esc(s.glyph) + '</span>' +
        '<span style="display:flex; flex-direction:column; gap:3px;">' +
          '<span style="font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:15px; color:#fff;">' + esc(s.label) + '</span>' +
          '<span style="font-family:\'JetBrains Mono\',monospace; font-size:14px; color:#9fc4cd;">' + esc(s.handle) + '</span>' +
        '</span>' +
      '</a>';
    }).join('');
  }

  function openOverlay(color, meta, ancho, cuerpo) {
    $('modalMount').innerHTML = '' +
    '<div id="ovBack" class="ovback" style="position:fixed; inset:0; z-index:150; background:rgba(3,7,12,0.86); display:flex; align-items:flex-start; justify-content:center; padding:42px 18px; overflow-y:auto;">' +
      '<div id="ovCard" style="width:100%; max-width:' + ancho + '; background:#0a1622; border:3px solid ' + color + '; box-shadow:10px 10px 0 rgba(0,0,0,0.55), 0 0 32px ' + glowFor(color) + '; animation:popIn .2s ease;">' +
        '<div style="display:flex; gap:6px; align-items:center; padding:10px 14px; background:#070f18; border-bottom:2px solid ' + color + ';">' +
          '<span style="width:11px;height:11px;background:#157a87;border-radius:50%;"></span>' +
          '<span style="width:11px;height:11px;background:#1f8fa0;border-radius:50%;"></span>' +
          '<span style="width:11px;height:11px;background:' + color + ';border-radius:50%;"></span>' +
          '<span style="font-size:14px; color:#5c7a86; margin-left:8px; font-family:\'JetBrains Mono\',monospace; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(meta) + '</span>' +
          '<button id="ovClose" aria-label="cerrar" style="cursor:pointer; background:transparent; border:2px solid ' + color + '; color:' + color + '; font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:13px; padding:3px 9px;">[ x ]</button>' +
        '</div>' +
        '<div style="padding:22px 24px;">' + cuerpo + '</div>' +
      '</div>' +
    '</div>';
    $('ovBack').addEventListener('click', closeModal);
    $('ovCard').addEventListener('click', function (e) { e.stopPropagation(); });
    $('ovClose').addEventListener('click', closeModal);
  }
  function closeZoom() {
    var z = $('zoomBack');
    if (!z) return false;
    z.parentNode.removeChild(z);
    return true;
  }

  function openZoom(src, titulo, color) {
    closeZoom();
    var capa = document.createElement('div');
    capa.id = 'zoomBack';
    capa.style.cssText = 'position:fixed; inset:0; z-index:210; background:rgba(3,7,12,0.95); ' +
      'display:flex; align-items:center; justify-content:center; padding:26px 16px; overflow:auto; cursor:zoom-out;';
    capa.innerHTML = '' +
      '<button id="zoomClose" aria-label="cerrar" style="position:fixed; top:16px; right:16px; z-index:1; cursor:pointer; background:#0a1622; border:2px solid ' + color + '; color:' + color + '; font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:13px; padding:5px 11px;">[ x ]</button>' +
      '<img id="zoomImg" src="' + esc(src) + '" alt="Flyer de la charla: ' + esc(titulo) + '" ' +
        'style="display:block; max-width:min(100%,780px); max-height:90vh; width:auto; margin:auto; ' +
        'border:3px solid ' + color + '; box-shadow:0 0 42px ' + glowFor(color) + '; cursor:zoom-in;" />';
    document.body.appendChild(capa);

    var img = $('zoomImg'), ampliada = false;
    capa.addEventListener('click', closeZoom);
    $('zoomClose').addEventListener('click', function (e) { e.stopPropagation(); closeZoom(); });
    img.addEventListener('click', function (e) {
      e.stopPropagation();
      ampliada = !ampliada;
      if (ampliada) {
        img.style.maxWidth = 'none';
        img.style.maxHeight = 'none';
        img.style.width = (img.naturalWidth || 1080) + 'px';
        img.style.cursor = 'zoom-out';
        capa.style.alignItems = 'flex-start';
      } else {
        img.style.maxWidth = 'min(100%,780px)';
        img.style.maxHeight = '90vh';
        img.style.width = 'auto';
        img.style.cursor = 'zoom-in';
        capa.style.alignItems = 'center';
        capa.scrollTop = 0;
      }
    });
  }

  function closeModal() {
    if (closeZoom()) return;
    $('modalMount').innerHTML = '';
  }

  function openMeeting(i) {
    var r = meetings[i];
    if (!r) return;
    var color = r.planned ? colorMeet(r) : '#f5b94d';

    var cuerpo = '' +
      '<div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:16px;">' +
        '<span style="font-family:\'JetBrains Mono\',monospace; font-size:12px; font-weight:700; color:#050a0e; background:' + color + '; padding:3px 9px;">' + esc(r.tag || (r.aparte ? 'SESIÓN EXTRA' : 'REUNIÓN')) + '</span>' +
        '<span style="font-family:\'JetBrains Mono\',monospace; font-size:12px; color:' + color + '; border:1px solid ' + color + '; padding:2px 8px;">' + esc(r.iso) + '</span>' +
        (r.link ? '<span style="font-family:\'JetBrains Mono\',monospace; font-size:12px; font-weight:700; color:#050a0e; background:#cfe8ec; padding:3px 9px;">VIRTUAL</span>' : '') +
      '</div>' +
      '<div style="font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:clamp(19px,3vw,25px); color:#fff; line-height:1.25; margin-bottom:6px;">' + esc(r.planned ? r.title : (cal.meetingTitle || 'Reunión del semillero')) + '</div>' +
      (r.speaker ? '<div style="font-family:\'JetBrains Mono\',monospace; font-size:15px; color:' + color + '; margin-bottom:8px;">por ' + esc(r.speaker) + '</div>' : '') +
      '<div style="font-family:\'JetBrains Mono\',monospace; font-size:14px; color:#9fc4cd; margin-bottom:' + (r.time || r.place ? '10px' : '18px') + ';">' + esc(fechaLarga(r.date)) + '</div>' +
      (r.time || r.place
        ? '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px;">' +
            (r.time ? '<span style="font-family:\'JetBrains Mono\',monospace; font-size:13px; font-weight:700; color:#4fd6a0; border:1px solid #1f6f7c; background:#0a1622; padding:4px 10px;">' + esc(r.time) + '</span>' : '') +
            (r.place ? '<span style="font-family:\'JetBrains Mono\',monospace; font-size:13px; font-weight:700; color:#29c5d6; border:1px solid #1f6f7c; background:#0a1622; padding:4px 10px;">' + esc(r.place) + '</span>' : '') +
          '</div>'
        : '') +
      (r.link
        ? '<a class="pjlink" href="' + esc(r.link) + '" target="_blank" rel="noopener" style="--glow:' + glowFor(color) + '; display:inline-flex; align-items:center; gap:9px; text-decoration:none; font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:14px; color:#050a0e; background:' + color + '; border:2px solid ' + color + '; box-shadow:4px 4px 0 rgba(0,0,0,0.5); padding:9px 14px; margin-bottom:18px; transition:transform .1s, box-shadow .1s;">entrar a la reunión &#9656;</a>'
        : '') +
      (r.planned ? '' :
        '<div style="display:flex; gap:12px; align-items:flex-start; background:#070f18; border:2px solid #f5b94d; border-left:6px solid #f5b94d; padding:14px 16px; margin-bottom:18px;">' +
          '<span style="font-family:\'Press Start 2P\'; font-size:12px; color:#f5b94d; line-height:1.2;">?</span>' +
          '<span style="font-family:\'JetBrains Mono\',monospace; font-weight:700; font-size:15px; color:#f5b94d;">Tema por definir</span>' +
        '</div>') +
      (r.text ? '<p style="font-size:22px; line-height:1.45; color:#cfe8ec; margin:0; font-family:\'VT323\',monospace;">' + esc(r.text) + '</p>' : '') +
      (r.flyer
        ? '<button class="flyer" type="button" style="--glow:' + glowFor(color) + '; display:block; width:100%; text-align:left; font:inherit; cursor:zoom-in; background:#070f18; border:2px solid #173241; border-top:4px solid ' + color + '; box-shadow:6px 6px 0 rgba(0,0,0,0.5); padding:12px; margin-top:20px; transition:transform .1s, box-shadow .1s;">' +
            '<span style="display:flex; align-items:center; justify-content:space-between; gap:10px; font-family:\'JetBrains Mono\',monospace; font-size:11px; letter-spacing:0.6px; text-transform:uppercase; color:#5c7a86; margin-bottom:10px;">' +
              '<span>flyer de la charla</span>' +
              '<span style="color:' + color + ';">[ ampliar ]</span>' +
            '</span>' +
            '<img src="' + esc(r.flyer) + '" alt="Flyer de la charla: ' + esc(r.title) + '" loading="lazy" style="display:block; width:100%; max-width:390px; margin:0 auto; border:2px solid #173241;" />' +
          '</button>'
        : '');

    openOverlay(color, 'aperture@lab:~$ cat ./reuniones/' + r.iso + '.md', '640px', cuerpo);

    var flyer = $('modalMount').querySelector('.flyer');
    if (flyer) {
      flyer.addEventListener('click', function () { openZoom(r.flyer, r.title, color); });
    }
  }

  function openLine(key) {
    var l = null;
    studyLines.forEach(function (x) { if (x.key === key) l = x; });
    if (!l) return;

    var temas = (l.topics || []).map(function (t, i) {
      return '' +
      '<li style="color:' + l.accent + '; padding:12px; border:2px solid #173241; background:#070f18; animation:popIn .3s ease both; animation-delay:' + (i * 0.07) + 's;">' +
        '<svg class="dgm" viewBox="0 0 44 26" aria-hidden="true">' + DIAGRAMAS[t.dgm] + '</svg>' +
        '<span style="display:block; font-family:\'JetBrains Mono\',monospace; font-size:13px; line-height:1.45; color:#cfe8ec;">' + esc(t.name) + '</span>' +
      '</li>';
    }).join('');

    var cuerpo = '' +

      '<div class="viz" data-viz="' + esc(l.key) + '" aria-hidden="true" style="display:block; border-bottom:2px solid ' + l.accent + '; background:#04080c; margin:-22px -24px 20px;"></div>' +
      '<div style="font-family:\'JetBrains Mono\',monospace; font-size:11px; letter-spacing:0.6px; text-transform:uppercase; color:#5c7a86; margin-bottom:10px;">' + esc(l.alias) + '</div>' +
      '<h3 style="font-family:\'Press Start 2P\'; font-size:clamp(11px,2.2vw,15px); line-height:1.75; color:' + l.accent + '; margin:0 0 12px; font-weight:400;">' + esc(l.title) + '</h3>' +
      '<p style="font-size:22px; line-height:1.4; color:#9fc4cd; margin:0 0 20px; font-family:\'VT323\',monospace;"><span style="color:' + l.accent + ';">//</span> ' + esc(l.essence) + '</p>' +
      '<ul style="display:grid; grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr)); gap:10px; margin:0; padding:0; list-style:none;">' + temas + '</ul>';

    openOverlay(l.accent, 'aperture@lab:~$ cat ./lineas/' + l.key + '.md', '680px', cuerpo);
    mountVitrinas($('modalMount'));
  }

  function initNav() {
    var open = false;
    var tabs = $('navtabs'), toggle = $('mobtoggle');
    toggle.addEventListener('click', function () {
      open = !open;
      tabs.classList.toggle('open', open);
      toggle.innerHTML = open ? '[ x ]' : '[ &#8801; ]';
    });
    $('goInicio').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-scroll]'), function (b) {
      b.addEventListener('click', function () {
        if (open) { open = false; tabs.classList.remove('open'); toggle.innerHTML = '[ &#8801; ]'; }
        scrollToId(b.getAttribute('data-scroll'));
      });
    });
  }

  function startBoot() {
    var lines = 0, closing = false, timers = [];
    var mount = $('bootMount');
    function rowHtml(r) {
      return '<div style="display:flex; gap:16px; margin-bottom:10px; font-size:clamp(14px,2.2vw,20px); letter-spacing:0.5px; line-height:1.3; animation:rowIn .18s ease;">' +
        '<span style="flex:none; width:min(40vw,200px); color:#5c8a96;">' + esc(r.label) + '</span>' +
        '<span style="color:' + (r.accent ? '#29c5d6' : '#cfe8ec') + ';">' + esc(r.value) + '</span>' +
      '</div>';
    }
    function render() {
      var rows = bootRows.slice(0, lines).map(rowHtml).join('');
      mount.innerHTML = '' +
      '<div id="bootOverlay" style="position:fixed; inset:0; z-index:200; background:#050a0e; color:#29c5d6; font-family:\'JetBrains Mono\',monospace; cursor:pointer; overflow:hidden; transform-origin:center; animation:' + (closing ? 'crtOff 0.6s ease forwards' : 'none') + ';">' +
        '<div style="position:absolute; inset:0; pointer-events:none; background:repeating-linear-gradient(0deg, rgba(0,0,0,0.32) 0px, rgba(0,0,0,0.32) 1px, transparent 1px, transparent 3px);"></div>' +
        '<div style="position:absolute; left:0; right:0; height:90px; pointer-events:none; background:linear-gradient(180deg, transparent, rgba(41,197,214,0.06), transparent); animation:bootSweep 4s linear infinite;"></div>' +
        '<div style="height:100%; display:flex; align-items:center; padding:24px;">' +
          '<div style="width:100%; max-width:720px; margin:0 auto; animation:bootJitter 0.18s steps(2) infinite;">' +
            '<div style="display:flex; align-items:center; gap:14px; margin-bottom:26px; border-bottom:2px solid #173a44; padding-bottom:14px;">' +
              '<img src="assets/aperture-eye-cyan.png" alt="" style="width:42px; height:42px; object-fit:contain; animation:irisPulse 2.4s ease-in-out infinite;" />' +
              '<div style="font-size:clamp(15px,2.4vw,21px); letter-spacing:1px; color:#cfe8ec;">APERTURE // INICIANDO SISTEMA</div>' +
            '</div>' +
            rows +
            '<div style="margin-top:8px; font-size:clamp(14px,2.2vw,20px);"><span style="display:inline-block; width:11px; height:18px; background:#29c5d6; animation:blink 1s steps(1) infinite; vertical-align:-2px;"></span></div>' +
          '</div>' +
        '</div>' +
        '<div style="position:absolute; bottom:22px; right:26px; font-size:14px; color:#3f6470;">[ pulsa para saltar ]</div>' +
      '</div>';
      var ov = $('bootOverlay');
      if (ov) ov.addEventListener('click', skip);
    }
    function finish() {
      document.removeEventListener('keydown', skip);
      mount.innerHTML = '';
      $('nav').style.animation = 'siteIn 0.6s ease';
    }
    function skip() {
      if (closing) return;
      timers.forEach(clearTimeout); timers = [];
      closing = true; render();
      setTimeout(finish, 600);
    }
    document.addEventListener('keydown', skip);
    render();
    bootRows.forEach(function (_, i) {
      timers.push(setTimeout(function () { lines = i + 1; render(); }, 380 + i * 420));
    });
    var done = 380 + bootRows.length * 420 + 500;
    timers.push(setTimeout(function () { closing = true; render(); }, done));
    timers.push(setTimeout(finish, done + 650));
  }

  function startMatrix() {
    var c = $('matrixRain');
    if (!c) return;
    var ctx = c.getContext('2d');
    var fs = 15, drops = [];
    function resize() {
      c.width = window.innerWidth; c.height = window.innerHeight;
      var cols = Math.floor(c.width / fs);
      drops = Array(cols).fill(0).map(function () { return Math.floor(Math.random() * -40); });
    }
    resize();
    window.addEventListener('resize', resize);
    var chars = '01<>{}[]()/\\=;:#$+*!?abcdef01'.split('');
    function draw() {
      ctx.fillStyle = 'rgba(5,10,14,0.09)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = fs + 'px monospace';
      for (var i = 0; i < drops.length; i++) {
        var t = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() < 0.025 ? '#cfe8ec' : '#1f8fa0';
        ctx.fillText(t, i * fs, drops[i] * fs);
        if (drops[i] * fs > c.height && Math.random() > 0.972) drops[i] = 0;
        drops[i]++;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  function startNeuralNet() {
    var c = $('neuralNet');
    if (!c) return;
    var ctx = c.getContext('2d');
    var W = 0, H = 0;
    function resize() { W = c.width = (c.clientWidth || 800); H = c.height = (c.clientHeight || 320); }
    resize();
    window.addEventListener('resize', resize);

    var mono = "12px 'JetBrains Mono', monospace";
    var NB = 18, GX = 12, GY = 7;
    var clusters = (function () {
      var cols = ['#33c9d6', '#4fd6a0', '#f5b94d'];
      var pts = Array.from({ length: 34 }, function () {
        return { bx: 0.08 + Math.random() * 0.84, by: 0.08 + Math.random() * 0.84, ph: Math.random() * 6.28 };
      });
      var cents = cols.map(function (_, i) { return { ph: i * 2.1 }; });
      return { cols: cols, pts: pts, cents: cents };
    })();

    var frame = 0;
    function draw() {
      var t = frame / 60;
      ctx.clearRect(0, 0, W, H);
      var pad = 16, gap = 18, topPad = 30, botPad = 16;

      var cols = window.innerWidth <= 620 ? 1 : 3;
      var rows = Math.ceil(3 / cols);
      var pw = (W - pad * 2 - gap * (cols - 1)) / cols;
      var ph = (H - botPad - rows * topPad - (rows - 1) * gap) / rows;
      var P = [0, 1, 2].map(function (i) {
        var col = i % cols, row = Math.floor(i / cols);
        return { x: pad + col * (pw + gap), y: topPad + row * (topPad + ph + gap), w: pw, h: ph };
      });
      var titles = ['distribución · gaussiana', 'clustering · k-means', 'gpu · kernels'];
      var tcol = ['#33c9d6', '#4fd6a0', '#f5b94d'];
      P.forEach(function (p, i) {
        ctx.strokeStyle = 'rgba(31,143,160,0.30)'; ctx.lineWidth = 1;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = tcol[i]; ctx.font = mono;
        ctx.fillText(titles[i], p.x + 1, p.y - 9);
      });

      (function () {
        var p = P[0];
        var mean = (NB - 1) / 2 + Math.sin(t * 0.6) * 2.4;
        var sd = 3 + Math.sin(t * 0.9) * 0.8;
        var bw = p.w / NB;
        var peak = 0, hs = [];
        for (var k = 0; k < NB; k++) { var z = (k - mean) / sd; var v = Math.exp(-0.5 * z * z) * (0.85 + 0.25 * Math.sin(t * 2 + k * 0.7)); hs.push(v); if (v > peak) peak = v; }
        for (var k2 = 0; k2 < NB; k2++) {
          var bh = (hs[k2] / peak) * (p.h - 12);
          var bx = p.x + k2 * bw + 1.5, by = p.y + p.h - bh;
          ctx.fillStyle = 'rgba(51,201,214,0.85)';
          ctx.fillRect(bx, by, bw - 3, bh);
        }
        ctx.strokeStyle = '#cfe8ec'; ctx.lineWidth = 1.6; ctx.beginPath();
        for (var xx = 0; xx <= p.w; xx += 3) { var k3 = xx / bw; var z3 = (k3 - mean) / sd; var v3 = Math.exp(-0.5 * z3 * z3); var yy = p.y + p.h - v3 * (p.h - 12); if (xx === 0) ctx.moveTo(p.x + xx, yy); else ctx.lineTo(p.x + xx, yy); }
        ctx.stroke();
      })();

      (function () {
        var p = P[1];
        var ix = p.x + 14, iy = p.y + 12, iw = p.w - 28, ih = p.h - 24;
        var CX = function (fx) { return ix + fx * iw; }, CY = function (fy) { return iy + fy * ih; };
        var cpos = clusters.cents.map(function (cc) {
          return { fx: 0.5 + 0.30 * Math.cos(t * 0.45 + cc.ph), fy: 0.5 + 0.27 * Math.sin(t * 0.38 + cc.ph * 1.4) };
        });
        clusters.pts.forEach(function (pt) {
          var fx = pt.bx + 0.014 * Math.cos(t * 1.3 + pt.ph);
          var fy = pt.by + 0.014 * Math.sin(t * 1.1 + pt.ph);
          var best = 0, bd = 1e9;
          for (var k = 0; k < cpos.length; k++) {
            var dx = fx - cpos[k].fx, dy = fy - cpos[k].fy, d = dx * dx + dy * dy;
            if (d < bd) { bd = d; best = k; }
          }
          var col = clusters.cols[best];
          var x = CX(fx), y = CY(fy), mx = CX(cpos[best].fx), my = CY(cpos[best].fy);
          ctx.strokeStyle = col; ctx.globalAlpha = 0.22; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(mx, my); ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.arc(x, y, 2.8, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        });
        cpos.forEach(function (cp, k) {
          var col = clusters.cols[k], x = CX(cp.fx), y = CY(cp.fy);
          var pr = 9 + Math.sin(t * 2 + k) * 2.2;
          ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = col; ctx.shadowBlur = 15;
          ctx.beginPath(); ctx.arc(x, y, pr, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        });
      })();

      (function () {
        var p = P[2];
        var cw = (p.w - 6) / GX, ch = (p.h - 6) / GY;
        for (var gy = 0; gy < GY; gy++) for (var gx = 0; gx < GX; gx++) {
          var v = 0.5 + 0.5 * Math.sin(t * 3 - (gx + gy) * 0.5);
          var cx = p.x + 3 + gx * cw, cy = p.y + 3 + gy * ch;
          if (v > 0.62) { ctx.fillStyle = 'rgba(245,185,77,' + (0.35 + 0.55 * v).toFixed(2) + ')'; ctx.shadowColor = '#f5b94d'; ctx.shadowBlur = 9 * v; }
          else { ctx.fillStyle = 'rgba(199,155,255,0.16)'; ctx.shadowBlur = 0; }
          ctx.fillRect(cx + 1, cy + 1, cw - 3, ch - 3);
          ctx.shadowBlur = 0;
        }
      })();

      frame++;
      requestAnimationFrame(draw);
    }
    draw();
  }

  function init() {
    applySite();
    renderAccess();
    renderLines();
    renderCalendar();
    renderSocials();
    initNav();
    if (window.location.hash.length > 1) scrollToId(window.location.hash.slice(1));
    startMatrix();
    startNeuralNet();
    startBoot();
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) closeModal();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
