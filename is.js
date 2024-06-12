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

// Modal elements
const scriptModal = document.getElementById('script-modal');
const modalGameTitle = document.getElementById('modal-game-title');
const modalGameImage = document.getElementById('modal-game-image');
const modalScriptContent = document.getElementById('modal-script-content');
const modalCopyButton = document.getElementById('modal-copy-button');
const modalShareButton = document.getElementById('modal-share-button');
const modalScriptDescription = document.getElementById('modal-script-description');
const closeModalButton = document.querySelector('.close-modal');

let scriptsMostrados = 0;
let scriptsPorPagina = 5;
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
    const [titulo, descripcion] = name.split('/'); // Separar título y descripción

    const rutaScript = `https://raw.githubusercontent.com/OneCreatorX-New/TwoDev/main/${encodeURIComponent(juegoId || nombreJuego)}.lua`;
    const contenidoScript = `loadstring(game:HttpGet("${rutaScript}"))()`;

    scriptsConContenido.push({
      titulo: titulo.trim(),
      contenido: contenidoScript,
      url: name,
      idJuego: juegoId,
      nombreArchivo: `${encodeURIComponent(juegoId || nombreJuego)}.lua`,
      descripcion: descripcion ? descripcion.trim() : null // Agregar descripción si existe
    });
  }

  return scriptsConContenido;
}

function compartirScript(nombreScript) {
  const urlCompartir = `https://onerepositoryx.online/?script=${encodeURIComponent(nombreScript)}`;
  navigator.clipboard.writeText(urlCompartir)
    .then(() => {
      console.log("URL copiada al portapapeles");
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
    divScript.classList.add("script-preview");
    divScript.dataset.scriptId = script.idJuego; // Agregar data-script-id para identificar el script
    divScript.innerHTML = `<h2>${script.titulo}</h2>`; // Mostrar solo el título
    contenedorScripts.appendChild(divScript);

    // Agregar evento click al título para abrir la modal
    divScript.addEventListener('click', () => {
      abrirModal(script);
    });
  }

  actualizarBotonesNavegacion();
}

function abrirModal(script) {
  modalGameTitle.textContent = script.titulo;
  modalScriptContent.textContent = script.contenido;

  if (script.idJuego) {
    modalGameImage.src = `https://raw.githubusercontent.com/OneCreatorX-New/TwoDev/main/img/games/${script.idJuego}.png`;
    modalGameImage.style.display = 'block';
  } else {
    modalGameImage.style.display = 'none';
  }

  if (script.url) {
    modalShareButton.style.display = 'block';
    modalShareButton.onclick = () => compartirScript(script.titulo);
  } else {
    modalShareButton.style.display = 'none';
  }

  modalScriptDescription.textContent = script.descripcion || ''; // Mostrar descripción si existe

  scriptModal.style.display = 'block';
}

function cerrarModal() {
  scriptModal.style.display = 'none';
}

closeModalButton.addEventListener('click', cerrarModal);

// Cerrar la modal al hacer clic fuera del contenido
window.onclick = function(event) {
  if (event.target == scriptModal) {
    cerrarModal();
  }
}

modalCopyButton.addEventListener('click', () => {
  navigator.clipboard.writeText(modalScriptContent.textContent)
    .then(() => {
      console.log("Script copiado al portapapeles");
    })
    .catch(err => {
      console.error("Error al copiar: ", err);
    });
});

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
}

function copiarAlPortapapeles(elemento) {
    navigator.clipboard.writeText(elemento.textContent)
        .then(() => {
            console.log("URL copiada al portapapeles");
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

        const response = await fetch(`https://ipapi.co/${ipAddress}/country_name`);
        const pais = await response.text();

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

let scriptBuscado = null;
let scriptCopiado = null;
let scriptCompartido = null;

busquedaInput.addEventListener("input", () => {
    scriptBuscado = busquedaInput.value;
});

const preElementos = document.querySelectorAll("pre");
preElementos.forEach(pre => {
    pre.addEventListener("copy", (event) => {
        scriptCopiado = event.clipboardData.getData('text/plain');
    });
});

const botonesCompartir = document.querySelectorAll("button[onclick^='compartirScript']");
botonesCompartir.forEach(boton => {
    boton.addEventListener("click", () => {
        scriptCompartido = boton.previousElementSibling.previousElementSibling.textContent.trim();
    });
});

async function enviarInformacionWebhook() {
    const { pais, horario } = await obtenerInformacionUsuario();

    const mensajeWebhook = {
        content: `Nuevo visitante!`,
        embeds: [{
            title: 'Información del Usuario',
            fields: [
                { name: 'País', value: pais },
                { name: 'Horario', value: horario },
                { name: 'Script Buscado', value: scriptBuscado || 'N/A' },
                { name: 'Script Copiado', value: scriptCopiado || 'N/A' },
                { name: 'Script Compartido', value: scriptCompartido || 'N/A' },
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
    })
    .catch(error => {
        console.error("Error al enviar el mensaje:", error);
    });
}

window.onload = enviarInformacionWebhook;

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

// Agrega el botón Bypass
const bypassButton = document.createElement("button");
bypassButton.textContent = "Bypass";
bypassButton.addEventListener("click", () => {
  // Crea la ventana modal
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">×</span>
      <h3>Bypass</h3>
      <p>Fluxus, Codex, Delta</p>
      <p>Send Link n wait 1-5 minutes</p>
      <textarea id="bypass-link" placeholder="Ingrese el link"></textarea>
      <button id="send-bypass-link">Enviar</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Agrega el evento para cerrar la ventana modal
  const closeButton = modal.querySelector(".close");
  closeButton.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // Agrega el evento para enviar el link al webhook
  const sendLinkButton = modal.querySelector("#send-bypass-link");
  sendLinkButton.addEventListener("click", () => {
    const bypassLink = modal.querySelector("#bypass-link").value;
    const message = `/bypass link:${bypassLink}`;
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    })
      .then((response) => {
        console.log("Enlace de bypass enviado correctamente");
      })
      .catch((error) => {
        console.error("Error al enviar el enlace de bypass:", error);
      });
    document.body.removeChild(modal);
  });
});

// Agrega el botón al documento
document.body.appendChild(bypassButton);
