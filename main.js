const WORKER_DOMAIN = 'https://bypass.api-x.site';
let sM = 0, sPP = 110, s = [], pA = 0, sO = [], fA = "todos";
let lastActionTime = 0;

document.addEventListener('DOMContentLoaded', init);

async function init() {
    s = await getS();
    sO = [...s];
    setEL();
    updS();
    chkUP();
    populateScriptSelector();
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
    document.getElementById('btn-sugerir-mejora').addEventListener('click', shwMS);
    document.getElementById('btn-pedir-script').addEventListener('click', shwMP);
    document.getElementById('enviarSugerencia').addEventListener('click', enviarSugerencia);
    document.getElementById('enviarPeticion').addEventListener('click', enviarPeticion);
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
        <button onclick="shwSS('${s.id}', '${s.t}')">Sugerir</button>
        ${s.isGame ? `<a href="${s.url}" target="_blank" class="btn-juego">Ir al Juego</a>` : ''}
    `;
    return e;
}

function cpS(id, t) {
    const script = s.find(script => script.id === id);
    if (script) {
        navigator.clipboard.writeText(script.loader)
            .then(() => {
                showNotification("SCRIPT_COPIED");
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
            .then(() => {
                showNotification("LINK_COPIED");
                sIW(n, 'Compartido');
            })
            .catch(e => console.error("Error al copiar:", e));
    } else {
        console.error("Script no encontrado:", id);
    }
}

async function showNotification(key) {
    try {
        const response = await fetch(`${WORKER_DOMAIN}/notification?key=${key}`);
        if (response.ok) {
            const message = await response.text();
            const notification = document.getElementById('notification');
            const textElement = notification.querySelector('.notification-text');
            textElement.textContent = message;
            notification.style.display = 'block';
            
            let i = 0;
            const speed = 50;
            textElement.textContent = '';
            
            function typeWriter() {
                if (i < message.length) {
                    textElement.textContent += message.charAt(i);
                    i++;
                    setTimeout(typeWriter, speed);
                }
            }
            
            typeWriter();
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        } else {
            console.error('Error fetching notification:', response.status);
        }
    } catch (error) {
        console.error('Error fetching notification:', error);
    }
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
            showNotification("REPORT_SENT");
        } else {
            showNotification("DESCRIBE_PROBLEM");
        }
    });
}

function shwD(c, oE = null) {
    const existingModals = document.querySelectorAll('.modal-shared');
    existingModals.forEach(modal => document.body.removeChild(modal));
    
    const d = document.createElement('div');
    d.className = 'modal-shared';
    d.innerHTML = `
        <div class="dialog-content">
            ${c}
            <button class="close-button" onclick="clsD()">×</button>
        </div>
    `;
    d.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.5); display: flex;
        justify-content: center; align-items: center; z-index: 1000;
    `;
    document.body.appendChild(d);

    if (oE) {
        d.querySelector('#enviarReporte')?.addEventListener('click', oE);
    }
}

function clsD() {
    const d = document.querySelector('.modal-shared');
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
    if (!canPerformAction()) {
        showNotification("WAIT_BEFORE_ACTION");
        return;
    }

    try {
        const response = await fetch(`${WORKER_DOMAIN}/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, content })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        lastActionTime = Date.now();
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

function shwMS() {
    document.getElementById('modal-sugerir-mejora').style.display = 'block';
}

function shwMP() {
    document.getElementById('modal-pedir-script').style.display = 'block';
}

function clsM() {
    this.closest('.modal').style.display = 'none';
}

async function rB() {
    const u = document.getElementById('urlInput').value.trim();
    if (u) {
        try {
            const loadingAnimation = document.getElementById('bypassLoading');
            const terminalLine = loadingAnimation.querySelector('.terminal-line');
            document.getElementById('btnBypass').disabled = true;
            loadingAnimation.style.display = 'block';
            
            const loadingTexts = [
                'Iniciando secuencia de bypass...',
                'Analizando estructura de URL...',
                'Esquivando medidas de seguridad...',
                'Extrayendo datos objetivo...',
                'Finalizando proceso...'
            ];
            
            let currentText = 0;
            const textInterval = setInterval(() => {
                if (currentText < loadingTexts.length) {
                    terminalLine.textContent = loadingTexts[currentText];
                    currentText++;
                }
            }, 1000);

            const response = await fetch(`${WORKER_DOMAIN}/bypass?url=${encodeURIComponent(u)}`);
            const data = await response.json();
            
            clearInterval(textInterval);
            loadingAnimation.style.display = 'none';
            
            sB(u, data);
            
            if (data.success) {
                displayBypassResult(data.result || 'URL procesada exitosamente', data.steps);
            } else {
                displayBypassResult(`Error: ${data.error || 'No se pudo procesar la URL'}`, data.steps, true);
            }
        } catch (e) {
            console.error('Error al obtener la respuesta:', e);
            displayBypassResult('Error al procesar la solicitud.', [], true);
        } finally {
            document.getElementById('btnBypass').disabled = false;
        }
    } else {
        showNotification("ENTER_VALID_URL");
    }
}

function displayBypassResult(result, steps, isError = false) {
    const resultDiv = document.getElementById('resultado');
    let stepsHtml = '';
    if (steps && steps.length > 0) {
        stepsHtml = '<h4>Pasos del bypass:</h4><ol>';
        steps.forEach((step, index) => {
            stepsHtml += `<li>
                <strong>Paso ${index + 1}:</strong> ${step.description}
                <pre>${step.result}</pre>
            </li>`;
        });
        stepsHtml += '</ol>';
    }
    resultDiv.innerHTML = `
        <h3>${isError ? 'Error' : 'Resultado del Bypass'}</h3>
        ${stepsHtml}
        <h4>Resultado final:</h4>
        <pre>${result}</pre>
        <button id="copyResult">Copiar Resultado</button>
    `;
    resultDiv.style.display = 'block';
    
    document.getElementById('copyResult').addEventListener('click', () => {
        navigator.clipboard.writeText(result)
            .then(() => showNotification("RESULT_COPIED"))
            .catch(err => console.error('Error al copiar: ', err));
    });
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
                <div class="dialog-buttons">
                    <button onclick="cpS('${sc.id}', '${sc.t}')" class="dialog-button">Copiar Script</button>
                    ${sc.isGame ? `<a href="${sc.url}" target="_blank" class="dialog-button">Ir al Juego</a>` : ''}
                </div>
            `);
        }
    }
}

function populateScriptSelector() {
    const selector = document.getElementById('scriptSelector');
    s.forEach(script => {
        const option = document.createElement('option');
        option.value = script.id;
        option.textContent = script.t;
        selector.appendChild(option);
    });
}

function shwSS(scriptId, scriptTitle) {
    document.getElementById('scriptSelector').value = scriptId;
    document.getElementById('sugerenciaTexto').value = '';
    document.getElementById('modal-sugerir-mejora').style.display = 'block';
}

function enviarSugerencia() {
    if (!canPerformAction()) {
        showNotification("WAIT_BEFORE_ACTION");
        return;
    }

    const scriptId = document.getElementById('scriptSelector').value;
    const sugerencia = document.getElementById('sugerenciaTexto').value;
    if (scriptId && sugerencia) {
        const script = s.find(s => s.id === scriptId);
        if (script) {
            sendWebhook('suggestion', { script: script.t, suggestion: sugerencia });
            showNotification("SUGGESTION_SENT");
            document.getElementById('modal-sugerir-mejora').style.display = 'none';
        } else {
            showNotification("SCRIPT_NOT_FOUND");
        }
    } else {
        showNotification("SELECT_SCRIPT_AND_SUGGEST");
    }
}

function enviarPeticion() {
    if (!canPerformAction()) {
        showNotification("WAIT_BEFORE_ACTION");
        return;
    }

    const gameInfo = document.getElementById('gameInput').value;
    const descripcion = document.getElementById('descripcionScript').value;
    if (gameInfo && descripcion) {
        sendWebhook('script_request', { game: gameInfo, description: descripcion });
        showNotification("REQUEST_SENT");
        document.getElementById('modal-pedir-script').style.display = 'none';
    } else {
        showNotification("ENTER_GAME_AND_DESCRIPTION");
    }
}

function canPerformAction() {
    const now = Date.now();
    if (now - lastActionTime < 10000) {
        return false;
    }
    return true;
}

init();
