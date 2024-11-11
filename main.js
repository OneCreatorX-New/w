const WORKER_DOMAIN = 'https://bypass.api-x.site';
let sM = 0, sPP = 110, s = [], pA = 0, sO = [], fA = "todos";
let lastActionTime = 0;
let clientIdentifier = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
    s = await getS();
    sO = [...s];
    setEL();
    updS();
    populateScriptSelector();
    handleUrlParams();
    await generateClientIdentifier();
}

async function generateClientIdentifier() {
    clientIdentifier = 'client_' + Math.random().toString(36).substr(2, 9);
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

async function cpS(id, title) {
    const script = s.find(s => s.id === id);
    if (script) {
        try {
            await navigator.clipboard.writeText(script.loader);
            showNotification('SCRIPT_COPIED');
            await sendWebhook('copy', { scriptName: title, clientIp: clientIdentifier });
        } catch (err) {
            console.error('Error al copiar: ', err);
        }
    }
}

async function shS(title, id) {
    const url = `${window.location.origin}${window.location.pathname}?script=${id}`;
    try {
        await navigator.clipboard.writeText(url);
        showNotification('LINK_COPIED');
        await sendWebhook('share', { scriptName: title, sharedUrl: url, clientIp: clientIdentifier });
    } catch (err) {
        console.error('Error al copiar: ', err);
    }
}

async function shwDR(title) {
    const modal = document.getElementById('modal-report');
    modal.style.display = 'block';
    document.getElementById('reportText').value = '';
    document.getElementById('enviarReporte').onclick = async function() {
        const reportText = document.getElementById('reportText').value;
        if (reportText) {
            await sendWebhook('report', { script: title, report: reportText, clientIp: clientIdentifier });
            showNotification('REPORT_SENT');
            modal.style.display = 'none';
        } else {
            showNotification('DESCRIBE_PROBLEM');
        }
    };
    document.getElementById('cancelarReporte').onclick = function() {
        modal.style.display = 'none';
    };
}

async function rB() {
    const u = document.getElementById('urlInput').value.trim();
    if (u) {
        try {
            const loadingAnimation = document.getElementById('bypassLoading');
            const terminalLine = loadingAnimation.querySelector('.terminal-line');
            document.getElementById('btnBypass').disabled = true;
            loadingAnimation.style.display = 'block';
            
            const loadingTexts = await getBypassLoadingTexts();
            
            let currentText = 0;
            const textInterval = setInterval(() => {
                if (currentText < loadingTexts.length) {
                    terminalLine.textContent = loadingTexts[currentText];
                    currentText++;
                }
            }, 1000);

            let result = await performBypass(u);
            clearInterval(textInterval);
            loadingAnimation.style.display = 'none';
            
            if (result.success) {
                await displayBypassResult(result.result);
                await attemptAutoBypass(result.result);
            } else {
                displayBypassResult({ error: result.error || await getNotificationText('URL_PROCESS_FAILED') });
            }
        } catch (e) {
            console.error('Error al obtener la respuesta:', e);
            displayBypassResult({ error: await getNotificationText('REQUEST_PROCESS_ERROR') });
        } finally {
            document.getElementById('btnBypass').disabled = false;
        }
    } else {
        showNotification('ENTER_VALID_URL');
    }
}

async function performBypass(url, retryCount = 0) {
    try {
        const response = await fetch(`${WORKER_DOMAIN}/bypass?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        if (!data.success && retryCount < 10) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return performBypass(url, retryCount + 1);
        }
        return data;
    } catch (error) {
        if (retryCount < 10) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return performBypass(url, retryCount + 1);
        }
        throw error;
    }
}

async function attemptAutoBypass(result) {
    if (isValidUrl(result)) {
        showNotification('AUTO_BYPASS_ATTEMPT');
        try {
            const autoBypassResult = await performBypass(result);
            if (autoBypassResult.success) {
                await displayBypassResult(autoBypassResult.result, true);
            }
        } catch (error) {
            console.error('Error en auto-bypass:', error);
        }
    }
}

async function displayBypassResult(result, isAutoBypass = false) {
    const resultDiv = document.getElementById('resultado');
    let content = resultDiv.innerHTML;
    
    if (typeof result === 'object' && result.error) {
        content += `<h3>${await getNotificationText('ERROR')}</h3><p>${result.error}</p>`;
    } else {
        const title = isAutoBypass ? await getNotificationText('AUTO_BYPASS_RESULT') : await getNotificationText('BYPASS_RESULT');
        content += `
            <div class="bypass-result">
                <h3>${title}</h3>
                <p class="result-text">${result}</p>
                <button class="copy-result" data-result="${result}">${await getNotificationText('COPY_RESULT')}</button>
            </div>
        `;
    }
    
    resultDiv.innerHTML = content;
    resultDiv.style.display = 'block';
    
    document.querySelectorAll('.copy-result').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(button.dataset.result);
                showNotification('RESULT_COPIED');
            } catch (err) {
                console.error('Error al copiar: ', err);
            }
        });
    });
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function sB(url, data) {
    sendWebhook('bypass', { url, result: data, clientIp: clientIdentifier });
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

async function enviarSugerencia() {
    if (!canPerformAction()) {
        showNotification('WAIT_BEFORE_ACTION');
        return;
    }

    const scriptId = document.getElementById('scriptSelector').value;
    const sugerencia = document.getElementById('sugerenciaTexto').value;
    if (scriptId && sugerencia) {
        const script = s.find(s => s.id === scriptId);
        if (script) {
            await sendWebhook('suggestion', { script: script.t, suggestion: sugerencia, clientIp: clientIdentifier });
            showNotification('SUGGESTION_SENT');
            document.getElementById('modal-sugerir-mejora').style.display = 'none';
        } else {
            showNotification('SCRIPT_NOT_FOUND');
        }
    } else {
        showNotification('SELECT_SCRIPT_AND_SUGGEST');
    }
}

async function enviarPeticion() {
    if (!canPerformAction()) {
        showNotification('WAIT_BEFORE_ACTION');
        return;
    }

    const gameInfo = document.getElementById('gameInput').value;
    const descripcion = document.getElementById('descripcionScript').value;
    if (gameInfo && descripcion) {
        await sendWebhook('request', { game: gameInfo, description: descripcion, clientIp: clientIdentifier });
        showNotification('REQUEST_SENT');
        document.getElementById('modal-pedir-script').style.display = 'none';
    } else {
        showNotification('ENTER_GAME_AND_DESCRIPTION');
    }
}

async function sendWebhook(type, data) {
    try {
        const response = await fetch(`${WORKER_DOMAIN}/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, ...data }),
        });
        if (!response.ok) {
            throw new Error('Failed to send webhook');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function showNotification(key) {
    const notification = document.getElementById('notification');
    const notificationText = notification.querySelector('.notification-text');
    notificationText.textContent = await getNotificationText(key);
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

function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get('script');
    if (scriptId) {
        const script = s.find(s => s.id === scriptId);
        if (script) {
            showSharedScriptModal(script);
        }
    }
}

async function showSharedScriptModal(script) {
    const modal = document.createElement('div');
    modal.className = 'modal-shared';
    modal.innerHTML = `
        <div class="dialog-content">
            <h2>${script.t}</h2>
            ${script.d ? `<p>${script.d}</p>` : ''}
            <textarea readonly>${script.c}</textarea>
            <div class="dialog-buttons">
                <button onclick="cpS('${script.id}', '${script.t}')" class="dialog-button">${await getNotificationText('COPY_SCRIPT')}</button>
                ${script.isGame ? `<a href="${script.url}" target="_blank" class="dialog-button">${await getNotificationText('GO_TO_GAME')}</a>` : ''}
            </div>
            <button class="close-button" onclick="this.closest('.modal-shared').remove()">×</button>
        </div>
    `;
    document.body.appendChild(modal);
}

async function getNotificationText(key) {
    try {
        const response = await fetch(`${WORKER_DOMAIN}/notification?key=${key}`);
        if (!response.ok) {
            throw new Error('Failed to fetch notification text');
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching notification text:', error);
        return key;
    }
}

async function getBypassLoadingTexts() {
    try {
        const response = await fetch(`${WORKER_DOMAIN}/bypass-loading-texts`);
        if (!response.ok) {
            throw new Error('Failed to fetch bypass loading texts');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching bypass loading texts:', error);
        return [
            'Iniciando secuencia de bypass...',
            'Analizando estructura de URL...',
            'Esquivando medidas de seguridad...',
            'Extrayendo datos objetivo...',
            'Finalizando proceso...'
        ];
    }
}
