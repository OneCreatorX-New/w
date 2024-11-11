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
            
            if

I'll start by providing the updated HTML file with the requested changes:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OneCreatorX Scripts</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

        :root {
            --primary-color: #00ff00;
            --secondary-color: #0a0a0a;
            --accent-color: #ff00ff;
            --text-color: #ffffff;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Roboto', sans-serif;
            background-color: var(--secondary-color);
            color: var(--text-color);
            min-height: 100vh;
            overflow-x: hidden;
        }

        .christmas-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50" y="50" font-size="70" text-anchor="middle" alignment-baseline="middle" fill="rgba(255,255,255,0.1)">❄</text></svg>') repeat;
        }

        header {
            text-align: center;
            padding: 2rem;
            background-color: rgba(0, 0, 0, 0.8);
            border-bottom: 2px solid var(--primary-color);
            position: relative;
            overflow: hidden;
        }

        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            position: relative;
            display: inline-block;
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }

        .floating-santa {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 3rem;
            animation: float 3s ease-in-out infinite;
        }

        #filtros {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 1rem;
            padding: 1rem;
            background-color: rgba(0, 0, 0, 0.6);
        }

        button, input[type="text"] {
            padding: 0.5rem 1rem;
            border: 2px solid var(--primary-color);
            border-radius: 5px;
            background-color: transparent;
            color: var(--text-color);
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Roboto', sans-serif;
        }

        button:hover {
            background-color: var(--primary-color);
            color: var(--secondary-color);
            transform: translateY(-2px);
            box-shadow: 0 0 10px var(--primary-color);
        }

        input[type="text"] {
            width: 200px;
            background-color: rgba(0, 0, 0, 0.8);
        }

        #scripts-principales {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            padding: 2rem;
        }

        .script {
            background-color: rgba(0, 0, 0, 0.8);
            border: 2px solid var(--primary-color);
            border-radius: 10px;
            padding: 1rem;
            transition: all 0.3s ease;
        }

        .script:hover {
            transform: translateY(-5px);
            box-shadow: 0 0 20px var(--primary-color);
        }

        .script h2 {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
            color: var(--accent-color);
        }

        .script pre {
            background-color: rgba(0, 0, 0, 0.5);
            padding: 0.5rem;
            border-radius: 5px;
            overflow-x: auto;
            border: 1px solid var(--primary-color);
        }

        #navegacion {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background-color: rgba(0, 0, 0, 0.6);
        }

        footer {
            text-align: center;
            padding: 1rem;
            background-color: rgba(0, 0, 0, 0.8);
            border-top: 2px solid var(--primary-color);
        }

        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            overflow-y: auto;
        }

        .modal-content {
            background-color: var(--secondary-color);
            margin: 15% auto;
            padding: 20px;
            border: 2px solid var(--primary-color);
            width: 90%;
            max-width: 500px;
            border-radius: 10px;
            color: var(--text-color);
            box-shadow: 0 0 20px var(--primary-color);
            position: relative;
        }

        .close {
            color: var(--text-color);
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            position: absolute;
            top: 10px;
            right: 15px;
        }

        .close:hover,
        .close:focus {
            color: var(--accent-color);
        }

        .btn-juego {
            display: inline-block;
            padding: 0.5rem 1rem;
            background-color: var(--primary-color);
            color: var(--secondary-color);
            text-decoration: none;
            border-radius: 5px;
            transition: all 0.3s ease;
        }

        .btn-juego:hover {
            background-color: var(--accent-color);
            transform: scale(1.05);
        }

        #modal-bypass input[type="text"],
        #modal-bypass button,
        #modal-sugerir-mejora select,
        #modal-sugerir-mejora textarea,
        #modal-sugerir-mejora button,
        #modal-pedir-script input[type="text"],
        #modal-pedir-script textarea,
        #modal-pedir-script button {
            display: block;
            width: 100%;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid var(--primary-color);
            border-radius: 4px;
            background-color: rgba(0, 0, 0, 0.5);
            color: var(--text-color);
        }

        #modal-bypass button:hover,
        #modal-sugerir-mejora button:hover,
        #modal-pedir-script button:hover {
            background-color: var(--primary-color);
            color: var(--secondary-color);
        }

        #resultado {
            margin-top: 10px;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 4px;
            border: 1px solid var(--primary-color);
        }

        .script button {
            margin-right: 5px;
            margin-bottom: 5px;
            background-color: var(--primary-color);
            color: var(--secondary-color);
        }

        .script button:hover {
            background-color: var(--accent-color);
        }

        .notification {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 255, 0, 0.1);
            border: 2px solid var(--primary-color);
            padding: 20px 40px;
            border-radius: 5px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
            z-index: 2000;
            backdrop-filter: blur(5px);
            min-width: 300px;
            text-align: center;
        }

        .notification-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 1.2rem;
        }

        .notification i {
            color: var(--primary-color);
        }

        .loading-animation {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            width: 80%;
            max-width: 500px;
        }

        .terminal-loader {
            background-color: rgba(0, 0, 0, 0.9);
            border: 2px solid var(--primary-color);
            border-radius: 5px;
            padding: 10px;
        }

        .terminal-header {
            color: var(--primary-color);
            font-family: 'Roboto', sans-serif;
            padding: 5px;
            border-bottom: 1px solid var(--primary-color);
        }

        .terminal-body {
            min-height: 100px;
            padding: 10px;
        }

        .terminal-line {
            position: relative;
            color: var(--primary-color);
            font-family: 'Roboto', sans-serif;
            white-space: nowrap;
            overflow: hidden;
            width: 0;
            animation: typing 1s steps(30, end) infinite;
        }

        .terminal-line::after {
            content: '█';
            animation: blink 1s step-end infinite;
        }

        @keyframes typing {
            from { width: 0 }
            to { width: 100% }
        }

        @keyframes blink {
            50% { opacity: 0 }
        }

        .snowflake {
            color: #fff;
            font-size: 1em;
            font-family: Arial, sans-serif;
            text-shadow: 0 0 5px #000;
            position: fixed;
            top: -10%;
            z-index: 9999;
            user-select: none;
            cursor: default;
            animation: snowfall 5s linear infinite;
        }

        @keyframes snowfall {
            0% {
                transform: translateY(-10%) rotate(0deg);
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
            }
        }

        .modal-shared {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .dialog-content {
            background-color: var(--secondary-color);
            padding: 2rem;
            border-radius: 10px;
            max-width: 90%;
            width: 500px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
            position: relative;
        }

        .dialog-content h2 {
            color: var(--accent-color);
            margin-bottom: 1rem;
        }

        .dialog-content textarea {
            width: 100%;
            min-height: 100px;
            margin-bottom: 1rem;
            padding: 0.5rem;
            background-color: rgba(0, 0, 0, 0.5);
            color: var(--text-color);
            border: 1px solid var(--primary-color);
            border-radius: 5px;
        }

        .dialog-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
        }

        .dialog-button {
            padding: 0.5rem 1rem;
            background-color: var(--primary-color);
            color: var(--secondary-color);
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .dialog-button:hover {
            background-color: var(--accent-color);
        }

        .close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 1.5rem;
            background: none;
            border: none;
            color: var(--text-color);
            cursor: pointer;
        }

        @media (max-width: 768px) {
            .modal-content {
                margin: 10% auto;
                width: 95%;
            }

            #filtros {
                flex-direction: column;
            }

            #filtros button, #filtros input[type="text"] {
                width: 100%;
            }

            .script {
                padding: 0.5rem;
            }

            .script button {
                padding: 0.3rem 0.6rem;
                font-size: 0.9rem;
            }
        }
    </style>
</head>
<body>
    <div class="loading-bar" id="loadingBar"></div>
    <div class="christmas-bg"></div>
    <header>
        <h1 id="mainTitle">OneCreatorX Scripts</h1>
        <div class="floating-santa">🎅</div>
    </header>

    <nav id="filtros">
        <input type="text" id="busqueda" placeholder="Buscar scripts...">
        <button id="filtro-todos"><i class="fas fa-globe"></i> Todos</button>
        <button id="filtro-universales"><i class="fas fa-universal-access"></i> Universales</button>
        <button id="filtro-juegos"><i class="fas fa-gamepad"></i> Juegos</button>
        <button id="mas-antiguos"><i class="fas fa-history"></i> Más Antiguos</button>
        <button id="btn-apoyame" class="floating"><i class="fas fa-heart"></i> Apóyame</button>
        <button id="btn-bypass-general"><i class="fas fa-unlock"></i> Bypass General</button>
        <button id="btn-sugerir-mejora"><i class="fas fa-lightbulb"></i> Sugerir Mejora</button>
        <button id="btn-pedir-script"><i class="fas fa-code"></i> Pedir Script</button>
    </nav>

    <main>
        <div id="scripts-principales"></div>
        <div id="navegacion">
            <button id="anterior"><i class="fas fa-chevron-left"></i> Anterior</button>
            <span id="info-pagina"></span>
            <button id="siguiente">Siguiente <i class="fas fa-chevron-right"></i></button>
        </div>
    </main>

    <footer>
        <button id="link-discord"><i class="fab fa-discord"></i> Discord</button>
        <button id="link-youtube"><i class="fab fa-youtube"></i> YouTube</button>
    </footer>

    <div id="modal-apoyame" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2><i class="fas fa-heart"></i> Apóyame</h2>
            <p>Si quieres apoyarme para que siga creando contenido, puedes hacerlo de las siguientes formas:</p>
            <ul>
                <li><i class="fas fa-link"></i> Accede a los links de PasteDrop: Estos me ayudan a generar un pequeño ingreso.</li>
                <li><i class="fas fa-gamepad"></i> <a href="https://www.roblox.com/games/17603437456" target="_blank">Haz tus compras en mi juego de Roblox</a></li>
                <li><i class="fab fa-paypal"></i> <a href="https://www.paypal.com/donate?hosted_button_id=DTXNC6R42MJRA" target="_blank">Haz una donación directa a través de PayPal</a></li>
            </ul>
        </div>
    </div>

    <div id="modal-bypass" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2><i class="fas fa-unlock-alt"></i> Bypass Executores or Links</h2>
            <input type="text" id="urlInput" placeholder="URL here e.g: https://gateway.platoboost.com/a/2569?id=123456789">
            <button id="btnBypass"><i class="fas fa-key"></i> Bypass</button>
            <div id="resultado"></div>
        </div>
    </div>

    <div id="modal-sugerir-mejora" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2><i class="fas fa-lightbulb"></i> Sugerir Mejora</h2>
            <select id="scriptSelector">
                <option value="">Selecciona un script</option>
            </select>
            <textarea id="sugerenciaTexto" placeholder="Describe tu sugerencia de mejora..."></textarea>
            <button id="enviarSugerencia">Enviar Sugerencia</button>
            <button id="cancelarSugerencia">Cancelar</button>
        </div>
    </div>

    <div id="modal-pedir-script" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2><i class="fas fa-code"></i> Pedir Nuevo Script</h2>
            <input type="text" id="gameInput" placeholder="ID del juego, URL o nombre">
            <textarea id="descripcionScript" placeholder="Describe lo que quieres que haga el script..."></textarea>
            <button id="enviarPeticion">Enviar Petición</button>
            <button id="cancelarPeticion">Cancelar</button>
        </div>
    </div>

    <div class="notification" id="notification">
        <div class="notification-content">
            <i class="fas fa-info-circle"></i>
            <span class="notification-text"></span>
        </div>
    </div>

    <div class="loading-animation" id="bypassLoading">
        <div class="terminal-loader">
            <div class="terminal-header">
                [root@matrix] ~ # Executing bypass.sh</div>
            <div class="terminal-body">
                <div class="terminal-line"></div>
            </div>
        </div>
    </div>

    <script src="main.js"></script>
    <script>
        function createSnowflake() {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            snowflake.textContent = '❄';
            snowflake.style.left = Math.random() * 100 + 'vw';
            snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
            snowflake.style.opacity = Math.random();
            snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
            
            document.body.appendChild(snowflake);
            
            setTimeout(() => {
                snowflake.remove();
            }, 5000);
        }

        setInterval(createSnowflake, 50);

        const mainTitle = document.getElementById('mainTitle');
        let direction = 1;
        let position = 0;

        function animateTitle() {
            position += direction * 0.5;
            if (position > 5 || position < -5) {
                direction *= -1;
            }
            mainTitle.style.transform = `translateY(${position}px)`;
            requestAnimationFrame(animateTitle);
        }

        animateTitle();

        window.addEventListener('load', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const scriptId = urlParams.get('script');
            if (scriptId) {
                showSharedScriptModal(scriptId);
            }
        });

        function showSharedScriptModal(scriptId) {
            const script = s.find(s => s.id === scriptId);
            if (script) {
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
        }
    </script>
</body>
</html>
