const contenedorScripts = document.getElementById("scripts-principales");
const busquedaInput = document.getElementById("busqueda");
const anteriorBtn = document.getElementById("anterior");
const siguienteBtn = document.getElementById("siguiente");
const infoPagina = document.getElementById("info-pagina");

const filtroTodosBtn = document.getElementById("filtro-todos");
const filtroUniversalesBtn = document.getElementById("filtro-universales");
const filtroJuegosBtn = document.getElementById("filtro-juegos");
const linkDiscordBtn = document.getElementById("link-discord");
const linkYoutubeBtn = document.getElementById("link-youtube");
const masAntiguosBtn = document.getElementById("mas-antiguos");

let scriptsMostrados = 0;
let scriptsPorPagina = 15;
let scripts = [];
let paginaActual = 0;
let scriptsOriginales = [];
let filtroActual = "todos";

function obtenerInfoJuego(urlJuego) {
    if (urlJuego.includes('roblox.com') || urlJuego.includes('games.roblox.com')) {
        const partesUrl = urlJuego.split('/');
        const nombreJuego = partesUrl[partesUrl.length - 1].replace(/-/g, ' ');
        const juegoId = partesUrl[partesUrl.length - 2];
        return { juegoId, nombreJuego };
    } else {
        return { juegoId: '', nombreJuego: urlJuego };
    }
}

async function obtenerScripts() {
    const response = await fetch("https://raw.githubusercontent.com/OneCreatorX-New/w/gh-pages/scripts.txt");
    const scriptNames = await response.text();
    const scriptNamesArray = scriptNames.split('\n').filter(name => name.trim() !== '').reverse();

    const scriptsConContenido = [];
    for (const name of scriptNamesArray) {
        const { juegoId, nombreJuego } = obtenerInfoJuego(name);

        const rutaScript = `https://raw.githubusercontent.com/OneCreatorX-New/TwoDev/main/${encodeURIComponent(juegoId || nombreJuego)}.lua`; 
        const contenidoScript = `loadstring(game:HttpGet("${rutaScript}"))()`; 

        scriptsConContenido.push({
            titulo: nombreJuego, 
            contenido: contenidoScript,
            url: name, 
            idJuego: juegoId,
            nombreArchivo: `${encodeURIComponent(juegoId || nombreJuego)}.lua`
        });
    }

    return scriptsConContenido;
}

function compartirScript(nombreScript) {
    const urlCompartir = `https://onerepositoryx.online/?script=${encodeURIComponent(nombreScript)}`;
    navigator.clipboard.writeText(urlCompartir)
        .then(() => {
            console.log("URL copiada al portapapeles");
            // Cambiar el texto del botón a "✓ Copiado" temporalmente
            const botonCompartir = event.target; // Obtén el botón actual
            botonCompartir.textContent = "✓ Copiado";
            setTimeout(() => {
                botonCompartir.textContent = "Compartir";
            }, 1000); // Regresar al texto original después de 1 segundo
            enviarInformacionWebhook(nombreScript, 'Compartido');
        })
        .catch(err => {
            console.error("Error al copiar: ", err);
        });
}

function mostrarScripts() {
    contenedorScripts.innerHTML = '';

    const scriptsFiltrados = scripts.filter(script => {
        if (filtroActual === "universales") {
            return !script.url.includes('roblox.com') && !script.url.includes('games.roblox.com');
        } else if (filtroActual === "juegos") {
            return script.url.includes('roblox.com') || script.url.includes('games.roblox.com');
        }
        return true;
    });

    const inicio = paginaActual * scriptsPorPagina;
    const fin = Math.min(inicio + scriptsPorPagina, scriptsFiltrados.length);

    for (let i = inicio; i < fin; i++) {
        const script = scriptsFiltrados[i];
        const divScript = document.createElement("div");
        divScript.classList.add("script");
        divScript.innerHTML = `<h2>${script.titulo}</h2><pre id="script-${i + 1}">${script.contenido}</pre><button onclick="copiarAlPortapapeles(this.previousElementSibling)">Copiar</button><button onclick="compartirScript('${script.titulo}')">Compartir</button>${script.idJuego ? `<a href="https://www.roblox.com/games/${script.idJuego}" target="_blank">Ir al Juego</a>` : ''}`;
        contenedorScripts.appendChild(divScript);

        if ((i + 1) % 1 === 0 && i + 1 < fin) {
            const divAnuncio = document.createElement("div");
            divAnuncio.classList.add("anuncios");
            divAnuncio.innerHTML = `
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-6026238594380398"
                     data-ad-slot="2569100541"
                     data-ad-format="autorelaxed"
                     data-full-width-responsive="true"></ins>
                <script>
                  (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            `;
            contenedorScripts.appendChild(divAnuncio);
        }
    }

    actualizarBotonesNavegacion();
}

function actualizarBotonesNavegacion() {
    anteriorBtn.style.display = paginaActual > 0 ? 'inline-block' : 'none';
    siguienteBtn.style.display = (paginaActual + 1) * scriptsPorPagina < scripts.length ? 'inline-block' : 'none';
    infoPagina.textContent = `Página ${paginaActual + 1} de ${Math.ceil(scripts.length / scriptsPorPagina)}`;
}

anteriorBtn.addEventListener("click", () => {
    if (paginaActual > 0) {
        paginaActual--;
        mostrarScripts();
    }
});

siguienteBtn.addEventListener("click", () => {
    if ((paginaActual + 1) * scriptsPorPagina < scripts.length) {
        paginaActual++;
        mostrarScripts();
    }
});

busquedaInput.addEventListener("input", () => {
    const terminoBusqueda = busquedaInput.value.toLowerCase();
    if (terminoBusqueda === "") {
        scripts = scriptsOriginales;
        paginaActual = 0;
        mostrarScripts();
        return;
    }

    const scriptsFiltrados = scriptsOriginales.filter(script =>
        script.titulo.toLowerCase().includes(terminoBusqueda)
    );
    scripts = scriptsFiltrados;
    paginaActual = 0;
    mostrarScripts();
});

async function iniciar() {
    scripts = await obtenerScripts();
    scriptsOriginales = [...scripts];
    mostrarScripts();

    // Mostrar el cuadro de diálogo de bienvenida
    mostrarDialogoBienvenida();
}

function copiarAlPortapapeles(elemento) {
    navigator.clipboard.writeText(elemento.textContent)
        .then(() => {
            console.log("URL copiada al portapapeles");
            // Cambiar el texto del botón a "✓ Copiado" temporalmente
            const botonCopiar = event.target; // Obtén el botón actual
            botonCopiar.textContent = "✓ Copiado";
            setTimeout(() => {
                botonCopiar.textContent = "Copiar";
            }, 1000); // Regresar al texto original después de 1 segundo
            enviarInformacionWebhook(elemento.textContent, 'Copiado');
        })
        .catch(err => {
            console.error("Error al copiar: ", err);
        });
}

filtroTodosBtn.addEventListener("click", () => {
    filtroActual = "todos";
    paginaActual = 0;
    mostrarScripts();
});

filtroUniversalesBtn.addEventListener("click", () => {
    filtroActual = "universales";
    paginaActual = 0;
    mostrarScripts();
});

filtroJuegosBtn.addEventListener("click", () => {
    filtroActual = "juegos";
    paginaActual = 0;
    mostrarScripts();
});

linkDiscordBtn.addEventListener("click", () => {
    window.open("https://discord.com/invite/xJWSR7H6gy", "_blank"); 
});

linkYoutubeBtn.addEventListener("click", () => {
    window.open("https://youtube.com/@onecreatorx", "_blank"); 
});

masAntiguosBtn.addEventListener("click", () => {
    scripts.reverse();
    paginaActual = 0;
    mostrarScripts();
});

const webhookUrl = "https://discord.com/api/webhooks/1249511240498286632/fjhJy1ZwXO1eEEazsY80ME2FzaOMEEMkYT4IcZSzp76TYAcbaDnnY5BcLXqNOENJeJ7x";

async function obtenerInformacionUsuario() {
    try {
        const ipAddress = await fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => data.ip);

        // Usar cache para el país
        let pais = localStorage.getItem('pais');
        if (!pais) {
            const response = await fetch(`https://ipapi.co/${ipAddress}/country_name`);
            pais = await response.text();
            localStorage.setItem('pais', pais);
        }

        const horario = new Date().toLocaleString('es-ES', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }); 

        return {
            pais,
            horario
        };
    } catch (error) {
        console.error("Error al obtener la información del usuario:", error);
        return { pais: 'N/A', horario: 'N/A' };
    }
}

// Objeto para almacenar los eventos
const eventos = {
    scriptBuscado: null,
    scriptCopiado: null,
    scriptCompartido: null
};

busquedaInput.addEventListener("input", () => {
    eventos.scriptBuscado = busquedaInput.value;
});

const preElementos = document.querySelectorAll("pre");
preElementos.forEach(pre => {
    pre.addEventListener("copy", (event) => {
        eventos.scriptCopiado = event.clipboardData.getData('text/plain');
    });
});

const botonesCompartir = document.querySelectorAll("button[onclick^='compartirScript']");
botonesCompartir.forEach(boton => {
    boton.addEventListener("click", () => {
        eventos.scriptCompartido = boton.previousElementSibling.previousElementSibling.textContent.trim();
    });
});

async function enviarInformacionWebhook(script, accion) {
    const { pais, horario } = await obtenerInformacionUsuario();

    const mensajeWebhook = {
        content: `Nuevo visitante!`,
        embeds: [{
            title: 'Información del Usuario',
            fields: [
                { name: 'País', value: pais },
                { name: 'Horario', value: horario },
                { name: 'Script Buscado', value: eventos.scriptBuscado || 'N/A' },
                { name: 'Script ' + accion, value: script || 'N/A' },
            ]
        }]
    };

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mensajeWebhook)
    })
    .then(response => {
        console.log("Mensaje enviado correctamente");
        // Reiniciar los eventos después de enviar
        eventos.scriptBuscado = null;
        eventos.scriptCopiado = null;
        eventos.scriptCompartido = null;
    })
    .catch(error => {
        console.error("Error al enviar el mensaje:", error);
    });
}

// Función para mostrar el cuadro de diálogo de bienvenida
function mostrarDialogoBienvenida() {
    // Crea un div para el cuadro de diálogo
    const dialogo = document.createElement('div');
    dialogo.id = 'dialogoBienvenida';
    dialogo.classList.add('dialogoBienvenida');

    // Crea un div para el contenido del cuadro de diálogo
    const contenidoDialogo = document.createElement('div');
    contenidoDialogo.classList.add('contenidoDialogo');

    // Agrega el mensaje de bienvenida traducido
    const mensajeBienvenida = document.createElement('p');
    mensajeBienvenida.id = 'mensajeBienvenida';
    contenidoDialogo.appendChild(mensajeBienvenida);

    // Crea un botón para cerrar el diálogo
    const btnCerrar = document.createElement('button');
    btnCerrar.classList.add('btnCerrar');
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.addEventListener('click', () => {
        document.body.removeChild(dialogo);
    });
    contenidoDialogo.appendChild(btnCerrar);

    // Agrega el contenido al cuadro de diálogo
    dialogo.appendChild(contenidoDialogo);

    // Agrega el cuadro de diálogo al cuerpo del documento
    document.body.appendChild(dialogo);

    // Obtiene el país del usuario
    obtenerInformacionUsuario()
        .then(({ pais }) => {
            // Traduce el mensaje de bienvenida según el país
            let mensaje = '';
            switch (pais) {
                case 'Spain':
                    mensaje = "¡Bienvenido a OneRepositoryX! Aquí encontrarás una colección de scripts para Roblox. Actualmente en Desarrollo, Agregando los Viejos y Nuevos Scripts";
                    break;
                case 'United States':
                    mensaje = "Welcome to OneRepositoryX! Here you'll find a collection of scripts for Roblox. Currently in Development, Adding Old and New";
                    break;
                default:
                    mensaje = "Welcome to OneRepositoryX! Here you'll find a collection of scripts for Roblox. Currently in Development, Adding Old and New";
                    break;
            }
            mensajeBienvenida.textContent = mensaje;
        });
}

// Iniciar la aplicación
iniciar();

const urlParams = new URLSearchParams(window.location.search);
const nombreScript = urlParams.get('script');

async function inici() {
    scripts = await obtenerScripts();
    scriptsOriginales = [...scripts];
    mostrarScripts();

    setTimeout(() => {
        if (nombreScript) {
            busquedaInput.value = nombreScript;
            busquedaInput.dispatchEvent(new Event('input'));
        }
    }, 500);
}

inici();
