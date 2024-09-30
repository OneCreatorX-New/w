const WORKER_DOMAIN = 'https://bypasss.brunotoledo526.workers.dev';
let sM = 0, sPP = 110, s = [], pA = 0, sO = [], fA = "todos";

document.addEventListener('DOMContentLoaded', init);

async function init() {
    s = await getS();
    sO = [...s];
    setEL();
    updS();
    chkUP();
}

async function getS() {
    try {
        const response = await fetch(`${WORKER_DOMAIN}/scripts`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error("Error al obtener scripts:", e);
        return [];
    }
}

function setEL() {
    document.getElementById('anterior').addEventListener('click', () => chgP(-1));
    document.getElementById('siguiente').addEventListener('click', () => chgP(1));
    document.getElementById('busqueda').addEventListener('input', srchS);
    document.getElementById('filtro-todos').addEventListener('click', () => fltrS("todos"));
    document.getElementById('filtro-universales').addEventListener('click', () => fltrS("universales"));
    document.getElementById('filtro-juegos').addEventListener('click', () => fltrS("juegos"));
    document.getElementById('mas-antiguos').addEventListener('click', invO);
    document.getElementById('btn-apoyame').addEventListener('click', shwMA);
    document.getElementById('btn-bypass-general').addEventListener('click', shwMB);
    document.getElementById('link-discord').addEventListener('click', () => window.open("https://discord.com/invite/xJWSR7H6gy", "_blank"));
    document.getElementById('link-youtube').addEventListener('click', () => window.open("https://youtube.com/@onecreatorx", "_blank"));
    document.getElementById('btnBypass').addEventListener('click', rB);
    document.querySelectorAll('.close').forEach(b => b.addEventListener('click', clsM));
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    };
}

function updS() {
    const sC = document.getElementById('scripts-principales');
    sC.innerHTML = '';
    getP().forEach(s => {
        const sE = crSE(s);
        sC.appendChild(sE);
    });
    updN();
}

function crSE(s) {
    const e = document.createElement('div');
    e.className = 'script';
    e.innerHTML = `
        <h2>${s.t}</h2>
        ${s.d ? `<p>${s.d}</p>` : ''}
        <button onclick="cpS('${s.id}', '${s.t}')">Copiar</button>
        <button onclick="shS('${s.t}', '${s.id}')">Compartir</button>
        <button onclick="shwDR('${s.t}')">Reportar</button>
        ${s.isGame ? `<a href="${s.url}" target="_blank" class="btn-juego">Ir al Juego</a>` : ''}
    `;
    return e;
}

function cpS(id, t) {
    const script = s.find(script => script.id === id);
    if (script) {
        navigator.clipboard.writeText(script.loader)
            .then(() => {
                shwN("¡Script copiado al portapapeles!");
                sIW(t, 'Copiado');
            })
            .catch(e => console.error("Error al copiar: ", e));
    } else {
        console.error("Script no encontrado:", id);
    }
}

function updN() {
    const tP = Math.ceil(s.length / sPP);
    document.getElementById('info-pagina').textContent = `Página ${pA + 1} de ${tP}`;
    document.getElementById('anterior').disabled = pA === 0;
    document.getElementById('siguiente').disabled = pA === tP - 1;
}

function chgP(d) {
    const nP = pA + d;
    if (nP >= 0 && nP * sPP < s.length) {
        pA = nP;
        updS();
    }
}

function srchS() {
    const t = document.getElementById('busqueda').value.toLowerCase();
    s = sO.filter(s => s.t.toLowerCase().includes(t));
    pA = 0;
    updS();
}

function fltrS(f) {
    fA = f;
    s = sO.filter(s => {
        if (f === "universales") return !s.isGame;
        if (f === "juegos") return s.isGame;
        return true;
    });
    pA = 0;
    updS();
}

function invO() {
    s.reverse();
    updS();
}

function getP() {
    const i = pA * sPP;
    return s.slice(i, i + sPP);
}

function shS(n, id) {
    const script = s.find(script => script.id === id);
    if (script) {
        const u = `${window.location.origin}/?script=${encodeURIComponent(id)}`;
        navigator.clipboard.writeText(u)
            .then(() => sIW(n, 'Compartido'))
            .catch(e => console.error("Error al copiar:", e));
    } else {
        console.error("Script no encontrado:", id);
    }
}

function shwN(m) {
    const n = document.createElement('div');
    n.textContent = m;
    n.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8); color: white; padding: 10px 20px;
        border-radius: 5px; z-index: 1000;
    `;
    document.body.appendChild(n);
    setTimeout(() => document.body.removeChild(n), 3000);
}

function shwDR(n) {
    shwD(`
        <h2>Reportar problema con: ${n}</h2>
        <textarea id="reporteTexto" placeholder="Describe el problema..."></textarea>
        <button id="enviarReporte">Enviar Reporte</button>
    `, () => {
        const t = document.getElementById('reporteTexto').value;
        if (t) {
            sR(n, t);
            clsD();
            shwN("Reporte enviado. ¡Gracias por tu feedback!");
        } else {
            shwN("Por favor, describe el problema antes de enviar.");
        }
    });
}

function shwD(c, oE = null) {
    const d = document.createElement('div');
    d.innerHTML = `
        <div class="modal-content">
            ${c}
            <button class="cerrarDialogo">Cerrar</button>
        </div>
    `;
    d.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.5); display: flex;
        justify-content: center; align-items: center; z-index: 1000;
    `;
    document.body.appendChild(d);

    d.querySelector('.cerrarDialogo').addEventListener('click', () => document.body.removeChild(d));
    if (oE) {
        d.querySelector('#enviarReporte').addEventListener('click', oE);
    }
}

function clsD() {
    const d = document.querySelector('div[style*="position: fixed"]');
    if (d) document.body.removeChild(d);
}

async function gUI() {
    try {
        const ip = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip);
        let p = localStorage.getItem('pais');
        if (!p) {
            p = await fetch(`https://ipapi.co/${ip}/country_name`).then(r => r.text());
            localStorage.setItem('pais', p);
        }
        const h = new Date().toLocaleString('es-ES', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        return { p, h };
    } catch (e) {
        console.error("Error al obtener info del usuario:", e);
        return { p: 'N/A', h: 'N/A' };
    }
}

async function sIW(s, a) {
    const { p, h } = await gUI();
    sendWebhook('interaction', { country: p, time: h, script: s, action: a });
}

async function sR(n, m) {
    const { p, h } = await gUI();
    sendWebhook('report', { script: n, message: m, country: p, time: h });
}

async function sB(u, r) {
    const { p, h } = await gUI();
    sendWebhook('bypass', { url: u, response: r, country: p, time: h });
}

async function sendWebhook(type, content) {
    try {
        const response = await fetch(`${WORKER_DOMAIN}/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, content })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (e) {
        console.error("Error al enviar webhook:", e);
    }
}

function shwMA() {
    document.getElementById('modal-apoyame').style.display = 'block';
}

function shwMB() {
    document.getElementById('modal-bypass').style.display = 'block';
}

function clsM() {
    this.closest('.modal').style.display = 'none';
}

async function rB() {
    const u = document.getElementById('urlInput').value.trim();
    if (u) {
        try {
            const response = await fetch(`${WORKER_DOMAIN}/bypass?url=${encodeURIComponent(u)}`);
            const data = await response.json();
            
            sB(u, data);
            
            if (data.success) {
                document.getElementById('resultado').textContent = `Resultado: ${data.result || 'URL procesada con éxito'}`;
            } else {
                document.getElementById('resultado').textContent = `Error: ${data.error || 'No se pudo procesar la URL'}`;
            }
        } catch (e) {
            console.error('Error al obtener la respuesta:', e);
            document.getElementById('resultado').textContent = 'Error al procesar la solicitud.';
        }
    } else {
        document.getElementById('resultado').textContent = 'Por favor, ingrese una URL válida.';
    }
}

function chkUP() {
    const uP = new URLSearchParams(window.location.search);
    const sId = uP.get('script');
    if (sId) {
        const sc = s.find(s => s.id === sId);
        if (sc) {
            shwD(`
                <h2>${sc.t}</h2>
                ${sc.d ? `<p>${sc.d}</p>` : ''}
                <button onclick="cpS('${sc.id}', '${sc.t}')" class="dialog-button">Copiar Script</button>
                ${sc.isGame ? `<a href="${sc.url}" target="_blank" class="dialog-button">Ir al Juego</a>` : ''}
                <button onclick="clsD()" class="dialog-button">Cerrar</button>
            `);
        }
    }
}

init();
