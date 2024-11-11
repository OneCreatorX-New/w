const WORKER_DOMAIN = 'https://bypasss.brunotoledo526.workers.dev';
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
    document.getElementById('filtro-todos').addEventListener('click', () => fS("todos"));
    document.getElementById('filtro-universales').addEventListener('click', () => fS("universales"));
    document.getElementById('filtro-juegos').addEventListener('click', () => fS("juegos"));
    document.getElementById('mas-antiguos').addEventListener('click', tO);
    document.getElementById('busqueda').addEventListener('input', bS);
    document.getElementById('anterior').addEventListener('click', () => cP(-1));
    document.getElementById('siguiente').addEventListener('click', () => cP(1));
    document.getElementById('btn-apoyame').addEventListener('click', () => document.getElementById('modal-apoyame').style.display = 'block');
    document.getElementById('btn-bypass-general').addEventListener('click', () => document.getElementById('modal-bypass').style.display = 'block');
    document.getElementById('btnBypass').addEventListener('click', rB);
    document.getElementById('btn-sugerir-mejora').addEventListener('click', shwMS);
    document.getElementById('btn-pedir-script').addEventListener('click', shwMP);
    document.getElementById('enviarSugerencia').addEventListener('click', enviarSugerencia);
    document.getElementById('enviarPeticion').addEventListener('click', enviarPeticion);
    document.getElementById('cancelarSugerencia').addEventListener('click', () => document.getElementById('modal-sugerir-mejora').style.display = 'none');
    document.getElementById('cancelarPeticion').addEventListener('click', () => document.getElementById('modal-pedir-script').style.display = 'none');
    document.querySelectorAll('.close').forEach(el => {
        el.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    document.getElementById('link-discord').addEventListener('click', () => window.open('https://discord.gg/onecreatorx', '_blank'));
    document.getElementById('link-youtube').addEventListener('click', () => window.open('https://www.youtube.com/@OneCreatorX', '_blank'));
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

function getP() {
    return s.slice(sM, sM + sPP);
}

function updN() {
    const tS = s.length;
    const cP = Math.floor(sM / sPP) + 1;
    const tP = Math.ceil(tS / sPP);
    document.getElementById('info-pagina').textContent = `Página ${cP} de ${tP}`;
    document.getElementById('anterior').disabled = sM === 0;
    document.getElementById('siguiente').disabled = sM + sPP >= tS;
}

function cP(d) {
    sM += d * sPP;
    if (sM < 0) sM = 0;
    if (sM >= s.length) sM = Math.floor((s.length - 1) / sPP) * sPP;
    updS();
}

function fS(t) {
    fA = t;
    if (t === "todos") {
        s = [...sO];
    } else if (t === "universales") {
        s = sO.filter(script => !script.isGame);
    } else if (t === "juegos") {
        s = sO.filter(script => script.isGame);
    }
    sM = 0;
    updS();
}

function tO() {
    s.reverse();
    sM = 0;
    updS();
}

function bS() {
    const q = document.getElementById('busqueda').value.toLowerCase();
    s = sO.filter(script => script.t.toLowerCase().includes(q) || (script.d && script.d.toLowerCase().includes(q)));
    sM = 0;
    updS();
}

function cpS(id, title) {
    const script = s.find(s => s.id === id);
    if (script) {
        navigator.clipboard.writeText(script.loader)
            .then(() => showNotification(`Script "${title}" copiado al portapapeles`))
            .catch(err => console.error('Error al copiar: ', err));
    }
}

function shS(title, id) {
    const url = `${window.location.origin}${window.location.pathname}?script=${id}`;
    navigator.clipboard.writeText(url)
        .then(() => showNotification(`Enlace del script "${title}" copiado al portapapeles`))
        .catch(err => console.error('Error al copiar: ', err));
}

function shwDR(title) {
    const reportText = prompt(`Reportar problema con el script "${title}":`);
    if (reportText) {
        sendWebhook('report', { script: title, report: reportText });
        showNotification("Reporte enviado. ¡Gracias por tu feedback!");
    } else if (reportText !== null) {
        showNotification("Por favor, describe el problema antes de enviar.");
    }
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
        showNotification('Por favor, ingrese una URL válida.');
    }
}

function displayBypassResult(result, steps, isError = false) {
    const resultDiv = document.getElementById('resultado');
    let content = `<h3>${isError ? 'Error' : 'Resultado del Bypass'}</h3>`;
    
    if (steps && steps.length > 0) {
        steps.forEach((step, index) => {
            content += `<h4>Paso ${index + 1}: ${step.description}</h4>`;
            content += `<pre>${step.result}</pre>`;
            
            if (step.description === 'URL limpia detectada, realizando auto-bypass') {
                content += `<h4>Resultado del auto-bypass:</h4>`;
                content += `<pre>${steps[index + 1].result}</pre>`;
            }
        });
    }
    
    content += `<h4>Resultado final:</h4><pre>${result}</pre>`;
    content += `<button id="copyResult">Copiar Resultado</button>`;
    
    resultDiv.innerHTML = content;
    resultDiv.style.display = 'block';
    
    document.getElementById('copyResult').addEventListener('click', () => {
        navigator.clipboard.writeText(result)
            .then(() => showNotification('Resultado copiado al portapapeles'))
            .catch(err => console.error('Error al copiar: ', err));
    });
}

function sB(url, data) {
    sendWebhook('bypass', { url, result: data });
}

function shwMS() {
    document.getElementById('modal-sugerir-mejora').style.display = 'block';
}

function shwMP() {
    document.getElementById('modal-pedir-script').style.display = 'block';
}

function shwSS(scriptId, scriptTitle) {
    document.getElementById('scriptSelector').value = scriptId;
    document.getElementById('sugerenciaTexto').value = '';
    document.getElementById('modal-sugerir-mejora').style.display = 'block';
}

function enviarSugerencia() {
    if (!canPerformAction()) {
        showNotification("Por favor, espera un momento antes de realizar otra acción.");
        return;
    }

    const scriptId = document.getElementById('scriptSelector').value;
    const sugerencia = document.getElementById('sugerenciaTexto').value;
    if (scriptId && sugerencia) {
        const script = s.find(s => s.id === scriptId);
        if (script) {
            sendWebhook('suggestion', { script: script.t, suggestion: sugerencia });
            showNotification("Sugerencia enviada. ¡Gracias por tu aporte!");
            document.getElementById('modal-sugerir-mejora').style.display = 'none';
        } else {
            showNotification("Error: Script no encontrado.");
        }
    } else {
        showNotification("Por favor, selecciona un script y escribe tu sugerencia.");
    }
}

function enviarPeticion() {
    if (!canPerformAction()) {
        showNotification("Por favor, espera un momento antes de realizar otra acción.");
        return;
    }

    const gameInfo = document.getElementById('gameInput').value;
    const descripcion = document.getElementById('descripcionScript').value;
    if (gameInfo && descripcion) {
        sendWebhook('request', { game: gameInfo, description: descripcion });
        showNotification("Petición de script enviada. ¡Gracias por tu solicitud!");
        document.getElementById('modal-pedir-script').style.display = 'none';
    } else {
        showNotification("Por favor, ingresa la información del juego y la descripción del script.");
    }
}

function sendWebhook(type, data) {
    fetch(`${WORKER_DOMAIN}/webhook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, ...data }),
    }).catch(error => console.error('Error:', error));
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = notification.querySelector('.notification-text');
    notificationText.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function canPerformAction() {
    const now = Date.now();
    if (now - lastActionTime < 2000) {
        return false;
    }
    lastActionTime = now;
    return true;
}

function populateScriptSelector() {
    const selector = document.getElementById('scriptSelector');
    selector.innerHTML = '<option value="">Selecciona un script</option>';
    s.forEach(script => {
        const option = document.createElement('option');
        option.value = script.id;
        option.textContent = script.t;
        selector.appendChild(option);
    });
}

function chkUP() {
    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get('script');
    if (scriptId) {
        const script = s.find(s => s.id === scriptId);
        if (script) {
            showSharedScriptModal(script);
        }
    }
}

function showSharedScriptModal(script) {
    const modal = document.createElement('div');
    modal.className = 'modal-shared';
    modal.innerHTML = `
        <div class="dialog-content">
            <h2>${script.t}</h2>
            ${script.d ? `<p>${script.d}</p>` : ''}
            <div class="dialog-buttons">
                <button onclick="cpS('${script.id}', '${script.t}')" class="dialog-button">Copiar Script</button>
                ${script.isGame ? `<a href="${script.url}" target="_blank" class="dialog-button">Ir al Juego</a>` : ''}
            </div>
            <button class="close-button" onclick="this.closest('.modal-shared').remove()">×</button>
        </div>
    `;
    document.body.appendChild(modal);
}
