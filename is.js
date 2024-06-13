
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

const rutaScript = `https://raw.githubusercontent.com/OneCreatorX-New/TwoDev/main/${encodeURIComponent(juegoId || nombreJuego)}.lua`; const contenidoScript = `loadstring(game:HttpGet("${rutaScript}"))()`; scriptsConContenido.push({ titulo: nombreJuego, contenido: contenidoScript, url: name, idJuego: juegoId, nombreArchivo: `${encodeURIComponent(juegoId || nombreJuego)}.lua` }); 

content_copyUse code with caution.

}

return scriptsConContenido;
content_copy
Use code with caution.

}

function compartirScript(nombreScript, idJuego) {
let urlCompartir = https://onerepositoryx.online/?script=${encodeURIComponent(nombreScript)};
if (idJuego) {
urlCompartir = https://onerepositoryx.online/?script=${encodeURIComponent(nombreScript)}&id=${encodeURIComponent(idJuego)};
}
navigator.clipboard.writeText(urlCompartir)
.then(() => {
mostrarNotificacion("¡Enlace copiado al portapapeles!");
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
divScript.innerHTML = <h2>${script.titulo}</h2><pre id="script-${i + 1}">${script.contenido}</pre><button onclick="copiarAlPortapapeles(this.previousElementSibling)">Copiar</button><button onclick="compartirScript('${script.titulo}', '${script.idJuego}')">Compartir</button>${script.idJuego ? Ir al Juego : ''}<button id="reportar-${i + 1}">Reportar</button>;
contenedorScripts.appendChild(divScript);

const reportarBtn = document.getElementById(`reportar-${i + 1}`); reportarBtn.addEventListener('click', () => { mostrarFormularioReporte(script); }); if ((i + 1) % 1 === 0 && i + 1 < fin) { const divAnuncio = document.createElement("div"); divAnuncio.classList.add("anuncios"); divAnuncio.innerHTML = ` <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-6026238594380398" data-ad-slot="2569100541" data-ad-format="autorelaxed" data-full-width-responsive="true"></ins> <script> (adsbygoogle = window.adsbygoogle || []).push({}); </script> `; contenedorScripts.appendChild(divAnuncio); } 

content_copyUse code with caution.

}

actualizarBotonesNavegacion();
content_copy
Use code with caution.

}

function mostrarFormularioReporte(script) {
const formularioReporte = document.createElement('div');
formularioReporte.classList.add('formularioReporte');

const textarea = document.createElement('textarea');
textarea.placeholder = 'Escribe tu reporte aquí...';

const enviarBtn = document.createElement('button');
enviarBtn.textContent = 'Enviar';
enviarBtn.addEventListener('click', () => {
const reporte = textarea.value;
if (reporte.trim() !== '') {
enviarInformacionWebhook(reporte, 'Reporte', script);
formularioReporte.remove();
} else {
mostrarNotificacion('Por favor, escribe un reporte.');
}
});

const cerrarBtn = document.createElement('button');
cerrarBtn.textContent = 'Cancelar';
cerrarBtn.addEventListener('click', () => {
formularioReporte.remove();
});

formularioReporte.appendChild(textarea);
formularioReporte.appendChild(enviarBtn);
formularioReporte.appendChild(cerrarBtn);

contenedorScripts.appendChild(formularioReporte);
content_copy
Use code with caution.

}

function actualizarBotonesNavegacion() {
anteriorBtn.style.display = paginaActual > 0 ? 'inline-block' : 'none';
siguienteBtn.style.display = (paginaActual + 1) * scriptsPorPagina < scripts.length ? 'inline-block' : 'none';
infoPagina.textContent = Página ${paginaActual + 1} de ${Math.ceil(scripts.length / scriptsPorPagina)};
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
content_copy
Use code with caution.

});

async function iniciar() {
scripts = await obtenerScripts();
scriptsOriginales = [...scripts];
mostrarScripts();

mostrarDialogoBienvenida();
content_copy
Use code with caution.

}

function copiarAlPortapapeles(elemento) {
navigator.clipboard.writeText(elemento.textContent)
.then(() => {
mostrarNotificacion("¡Script copiado al portapapeles!");
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

window.location.href = "https://onerepositoryx.online/";
content_copy
Use code with caution.

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

let pais = localStorage.getItem('pais');
if (!pais) {
const response = await fetch(https://ipapi.co/${ipAddress}/country_name);
pais = await response.text();
localStorage.setItem('pais', pais);
}

const horario = new Date().toLocaleString('es-ES', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }); return { pais, horario }; 

content_copyUse code with caution.

} catch (error) {
console.error("Error al obtener la información del usuario:", error);
return { pais: 'N/A', horario: 'N/A' };
}
content_copy
Use code with caution.

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

async function enviarInformacionWebhook(reporte, accion, script) {
const { pais, horario } = await obtenerInformacionUsuario();

const mensajeWebhook = {
content: Nuevo visitante!,
embeds: [{
title: 'Información del Usuario',
fields: [
{ name: 'País', value: pais },
{ name: 'Horario', value: horario },
{ name: 'Script Buscado', value: eventos.scriptBuscado || 'N/A' },
{ name: 'Script ' + accion, value: script.titulo || 'N/A' },
{ name: 'Reporte', value: reporte || 'N/A' },
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
content_copy
Use code with caution.

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
content_copy
Use code with caution.

}

function mostrarNotificacion(mensaje) {
const notificacion = document.createElement('div');
notificacion.classList.add('notificacion');
notificacion.textContent = mensaje;
document.body.appendChild(notificacion);

setTimeout(() => {
document.body.removeChild(notificacion);
}, 2000);
content_copy
Use code with caution.

}

iniciar();

const urlParams = new URLSearchParams(window.location.search);
const nombreScript = urlParams.get('script');
const idJuego = urlParams.get('id');

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
content_copy
Use code with caution.

}

inici();

