const contenedorScripts = document.getElementById("scripts-principales");
const busquedaInput = document.getElementById("busqueda");
const anteriorBtn = document.getElementById("anterior");
const siguienteBtn = document.getElementById("siguiente");
const infoPagina = document.getElementById("info-pagina");

let scriptsMostrados = 0;
let scriptsPorPagina = 5;
let scripts = [];
let paginaActual = 0;
let scriptsOriginales = [];

async function obtenerScripts() {
  const response = await fetch("https://raw.githubusercontent.com/OneCreatorX-New/w/gh-pages/scripts.txt");
  const scriptNames = await response.text();
  const scriptNamesArray = scriptNames.split('\n').filter(name => name.trim() !== '').reverse();

  const scriptsConContenido = [];
  for (const name of scriptNamesArray) {
    const rutaScript = `https://raw.githubusercontent.com/OneCreatorX-New/TwoDev/main/${encodeURIComponent(name)}.lua`; 
    const contenidoScript = `loadstring(game:HttpGet("${rutaScript}"))()`;

    scriptsConContenido.push({
      titulo: name,
      contenido: contenidoScript,
      url: `https://github.com/OneCreatorX-New/TwoDev/blob/main/${name}.lua`
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

  const inicio = paginaActual * scriptsPorPagina;
  const fin = Math.min(inicio + scriptsPorPagina, scripts.length);

  for (let i = inicio; i < fin; i++) {
    const script = scripts[i];
    const divScript = document.createElement("div");
    divScript.classList.add("script");
    divScript.innerHTML = `
      <h2>${script.titulo}</h2>
      <pre id="script-${i + 1}">${script.contenido}</pre>
      <button onclick="copiarAlPortapapeles(this.previousElementSibling)">Copiar</button>
      <button onclick="compartirScript('${script.titulo}')">Compartir</button>
    `;
    contenedorScripts.appendChild(divScript);

    // Espacio para el anuncio
    if ((i + 1) % 1 === 0 && i + 1 < fin) {
      const divAnuncio = document.createElement("div");
      divAnuncio.classList.add("anuncios");
      // Aquí se agrega el código de AdSense
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
  const scriptsFiltrados = scriptsOriginales.filter(script => script.titulo.toLowerCase().includes(terminoBusqueda));
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
      console.log("Texto copiado al portapapeles");
    })
    .catch(err => {
      console.error("Error al copiar: ", err);
    });
}

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
