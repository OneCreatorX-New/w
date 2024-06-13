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
let formularioReporteAbierto = false;

let scriptMasCopiado = null;
let scriptMasCompartido = null;
let contadorCopias = {};
let contadorCompartidos = {};

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

function compartirScript(nombreScript, idJuego) {
  let urlCompartir = `https://onerepositoryx.online/?script=${encodeURIComponent(nombreScript)}`;
  if (idJuego) {
    urlCompartir = `https://onerepositoryx.online/?script=${encodeURIComponent(nombreScript)}&id=${encodeURIComponent(idJuego)}`;
  }
  navigator.clipboard.writeText(urlCompartir)
  .then(() => {
    mostrarNotificacion("¡Enlace copiado al portapapeles!");
    enviarInformacionWebhook(urlCompartir, 'Compartido', null, 'webhook-compartido'); 
    actualizarEstadisticasCompartidos(nombreScript);
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
    divScript.innerHTML = `<h2>${script.titulo}</h2><pre id="script-${i + 1}">${script.contenido}</pre><button onclick="copiarAlPortapapeles(this.previousElementSibling)">Copiar</button><button onclick="compartirScript('${script.titulo}', '${script.idJuego}')">Compartir</button>${script.idJuego ? `<a href="https://www.roblox.com/games/${script.idJuego}" target="_blank">Ir al Juego</a>` : ''}<button id="reportar-${i + 1}">Reportar</button>`;
    contenedorScripts.appendChild(divScript);

    const reportarBtn = document.getElementById(`reportar-${i + 1}`);
    reportarBtn.addEventListener('click', () => {
      mostrarFormularioReporte(script);
    });

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

function mostrarFormularioReporte(script) {
  if (formularioReporteAbierto) return;
  formularioReporteAbierto = true;

  const formularioReporte = document.createElement('div');
  formularioReporte.classList.add('formularioReporte');

  const titulo = document.createElement('h3');
  titulo.textContent = `Reporte para "${script.titulo}"`;
  formularioReporte.appendChild(titulo);

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Escribe tu reporte aquí...';
  formularioReporte.appendChild(textarea);

  const enviarBtn = document.createElement('button');
  enviarBtn.textContent = 'Enviar';
  enviarBtn.addEventListener('click', () => {
    const reporte = textarea.value;
    if (reporte.trim() !== '') {
      enviarInformacionReporte(reporte, script);
      formularioReporte.remove();
      formularioReporteAbierto = false;
    } else {
      mostrarNotificacion('Por favor, escribe un reporte.');
    }
  });
  formularioReporte.appendChild(enviarBtn);

  const cerrarBtn = document.createElement('button');
  cerrarBtn.textContent = 'Cancelar';
  cerrarBtn.addEventListener('click', () => {
    formularioReporte.remove();
    formularioReporteAbierto = false;
  });
  formularioReporte.appendChild(cerrarBtn);

  contenedorScripts.appendChild(formularioReporte);
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

  mostrarDialogoBienvenida();

  const urlParams = new URLSearchParams(window.location.search);
  const nombreScriptBuscado = urlParams.get('script');
  if (nombreScriptBuscado) {
    enviarInformacionWebhook(nombreScriptBuscado, 'Buscado', null, 'webhook-busqueda'); 
  }
}

function copiarAlPortapapeles(elemento) {
  navigator.clipboard.writeText(elemento.textContent)
  .then(() => {
    mostrarNotificacion("¡Script copiado al portapapeles!");
    enviarInformacionWebhook(elemento.textContent, 'Copiado', null, 'webhook-copiado');
    actualizarEstadisticasCopias(elemento.textContent);
  })
  .catch(err => {
    console.error("Error al copiar: ", err);
  });
}

filtroTodosBtn.addEventListener("click", () => {
  filtroActual = "todos";
  paginaActual = 0;
  mostrarScripts();

  window.location.href = "https://onerepositoryx.online/";
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

const webhookUrlCopiado = "https://discord.com/api/webhooks/1250959335757185104/WXU2Gbz5UI8Q4Haa3XuR17S5mzC1JUjlJZLKWnYhhwHD1SVCsSUI8ldzvl47GKX4gOPf";
const webhookUrlCompartido = "https://discord.com/api/webhooks/1250959335757185104/WXU2Gbz5UI8Q4Haa3XuR17S5mzC1JUjlJZLKWnYhhwHD1SVCsSUI8ldzvl47GKX4gOPf";
const webhookUrlBusqueda = "https://discord.com/api/webhooks/1250960409473847426/LxO-7_iV7JaSlaBD6PM_0PO-O78q3cYC1YmwcrNUArXF0_WQZou1ZuH6oqXlkCHYJvue";

async function obtenerInformacionUsuario() {
  try {
    const ipAddress = await fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => data.ip);

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

async function enviarInformacionWebhook(reporte, accion, script, webhookUrl) {
  const { pais, horario } = await obtenerInformacionUsuario();

  const mensajeWebhook = {
    content: `Nuevo visitante!`,
    embeds: [{
      title: 'Información del Usuario',
      fields: [
        { name: 'País', value: pais },
        { name: 'Horario', value: horario },
        { name: 'Script Buscado', value: eventos.scriptBuscado || 'N/A' },
        { name: 'Script ' + accion, value: reporte || 'N/A' },
        { name: 'Reporte', value: script?.titulo || 'N/A' },
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
    eventos.scriptBuscado = null;
    eventos.scriptCopiado = null;
    eventos.scriptCompartido = null;
  })
  .catch(error => {
    console.error("Error al enviar el mensaje:", error);
  });
}

async function enviarInformacionReporte(reporte, script) {
  const { pais, horario } = await obtenerInformacionUsuario();

  // Aquí puedes usar un webhook diferente para reportes
  const webhookUrlReporte = 'https://discord.com/api/webhooks/1250960694338392064/6Z6N__TPIHWlaYS82ymNQYIca-ptdeuPiQ_aGRIJJm_4CUJ9Yjl_F_x21Aj-kpXB0Yhh';

  const mensajeWebhook = {
    content: `Nuevo visitante!`,
    embeds: [{
      title: 'Información del Usuario',
      fields: [
        { name: 'País', value: pais },
        { name: 'Horario', value: horario },
        { name: 'Script Reportado', value: script.titulo },
        { name: 'Reporte', value: reporte },
      ]
    }]
  };

  fetch(webhookUrlReporte, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(mensajeWebhook)
  })
  .then(response => {
    // Manejo de respuesta
  })
  .catch(error => {
    console.error("Error al enviar el mensaje:", error);
  });
}

function mostrarDialogoBienvenida() {
  const dialogo = document.createElement('div');
  dialogo.id = 'dialogoBienvenida';
  dialogo.classList.add('dialogoBienvenida');

  const contenidoDialogo = document.createElement('div');
  contenidoDialogo.classList.add('contenidoDialogo');

  const mensajeBienvenida = document.createElement('p');
  mensajeBienvenida.id = 'mensajeBienvenida';
  contenidoDialogo.appendChild(mensajeBienvenida);

  const btnCerrar = document.createElement('button');
  btnCerrar.classList.add('btnCerrar');
  btnCerrar.textContent = 'OK Bro';
  btnCerrar.addEventListener('click', () => {
    document.body.removeChild(dialogo);
  });
  contenidoDialogo.appendChild(btnCerrar);

  dialogo.appendChild(contenidoDialogo);

  document.body.appendChild(dialogo);

  obtenerInformacionUsuario()
    .then(({ pais }) => {
      if (navigator.languages && navigator.languages.length) {
        const idioma = navigator.languages[0];
        if (idioma.startsWith('es')) {
          mensajeBienvenida.textContent = "¡Bienvenido a OneRepositoryX! Aquí encontrarás una colección de scripts para Roblox. Actualmente en Desarrollo, Todavía no se incluye ni el 90% de todos los Scripts de mi Repositorio. Los Scripts Son intuitivos y fáciles de usar. Gracias por la Visita";
        } else {
          mensajeBienvenida.textContent = "Welcome to OneRepositoryX! Here you'll find a collection of scripts for Roblox. Currently in Development, not even 90% of all the Scripts in my Repository are included yet. The Scripts are intuitive and easy to use. Thanks for the visit";
        }
      } else {
        mensajeBienvenida.textContent = "Welcome to OneRepositoryX! Here you'll find a collection of scripts for Roblox. Currently in Development, not even 90% of all the Scripts in my Repository are included yet. The Scripts are intuitive and easy to use. Thanks for the visit";
      }
    });
}

function mostrarNotificacion(mensaje) {
  const notificacion = document.createElement('div');
  notificacion.classList.add('notificacion');
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);

  setTimeout(() => {
    document.body.removeChild(notificacion);
  }, 2000);
}

function actualizarEstadisticasCopias(scriptCopiado) {
  if (scriptCopiado in contadorCopias) {
    contadorCopias[scriptCopiado]++;
  } else {
    contadorCopias[scriptCopiado] = 1;
  }

  if (!scriptMasCopiado || contadorCopias[scriptCopiado] > contadorCopias[scriptMasCopiado]) {
    scriptMasCopiado = scriptCopiado;
    enviarInformacionWebhook(`Script más copiado: ${scriptMasCopiado}`, 'Actualización', null, 'webhook-copiado');
  }
}

function actualizarEstadisticasCompartidos(scriptCompartido) {
  if (scriptCompartido in contadorCompartidos) {
    contadorCompartidos[scriptCompartido]++;
  } else {
    contadorCompartidos[scriptCompartido] = 1;
  }

  if (!scriptMasCompartido || contadorCompartidos[scriptCompartido] > contadorCompartidos[scriptMasCompartido]) {
    scriptMasCompartido = scriptCompartido;
    enviarInformacionWebhook(`Script más compartido: ${scriptMasCompartido}`, 'Actualización', null, 'webhook-compartido');
  }
}

iniciar();
