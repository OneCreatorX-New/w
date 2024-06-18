const contScr = document.getElementById("scripts-principales");
const busqInp = document.getElementById("busqueda");
const antBtn = document.getElementById("anterior");
const sigBtn = document.getElementById("siguiente");
const infoPag = document.getElementById("info-pagina");

const filTodBtn = document.getElementById("filtro-todos");
const filUniBtn = document.getElementById("filtro-universales");
const filJueBtn = document.getElementById("filtro-juegos");
const linkDisBtn = document.getElementById("link-discord");
const linkYouBtn = document.getElementById("link-youtube");
const masAntBtn = document.getElementById("mas-antiguos");

let scrMost = 0;
let scrPorPag = 15;
let scr = [];
let pagAct = 0;
let scrOrig = [];
let filAct = "todos";
let diaSup = null;
let diaApo = null;
let diaInf = null;

function obtInfoJue(urlJue) {
  if (urlJue.includes('roblox.com') || urlJue.includes('games.roblox.com')) {
    const partUrl = urlJue.split('/');
    const nomJue = partUrl[partUrl.length - 1].replace(/-/g, ' ');
    const jueId = partUrl[partUrl.length - 2];
    return { jueId, nomJue };
  } else {
    return { jueId: '', nomJue: urlJue };
  }
}

async function obtScr() {
  const res = await fetch("https://raw.githubusercontent.com/OneCreatorX-New/w/gh-pages/scripts.txt");
  const scrNom = await res.text();
  const scrNomArr = scrNom.split('\n').filter(name => name.trim() !== '').reverse();

  const scrConCont = [];
  for (const name of scrNomArr) {
    const part = name.split("|");
    const scrNom = part[0].trim();
    const pasteDropUrl = part[1]?.trim();
    const desc = part[2]?.trim();

    const { jueId, nomJue } = obtInfoJue(scrNom);

    const rutaScr = `https://raw.githubusercontent.com/OneCreatorX-New/TwoDev/main/${encodeURIComponent(jueId || nomJue)}.lua`;
    const contScr = `loadstring(game:HttpGet("${rutaScr}"))()`;

    scrConCont.push({
      titulo: nomJue,
      contenido: contScr,
      url: scrNom,
      idJuego: jueId,
      nombreArchivo: `${encodeURIComponent(jueId || nomJue)}.lua`,
      pasteDropUrl: pasteDropUrl,
      descripcion: desc
    });
  }

  return scrConCont;
}

function compScr(nomScr, jueId) {
  let urlComp = `https://onerepositoryx.online/?script=${encodeURIComponent(nomScr)}`;
  if (jueId) {
    urlComp = `https://onerepositoryx.online/?script=${encodeURIComponent(jueId)}`;
  }
  navigator.clipboard.writeText(urlComp)
    .then(() => {
      mostrarNotificacion("¡Enlace copiado al portapapeles!");
      envInfoWeb(nomScr, 'Compartido');
    })
    .catch(err => {
      console.error("Error al copiar: ", err);
    });
}

function mostScr() {
  contScr.innerHTML = '';

  const scrFil = scr.filter(script => {
    if (filAct === "universales") {
      return !script.url.includes('roblox.com') && !script.url.includes('games.roblox.com');
    } else if (filAct === "juegos") {
      return script.url.includes('roblox.com') || script.url.includes('games.roblox.com');
    }
    return true;
  });

  const ini = pagAct * scrPorPag;
  const fin = Math.min(ini + scrPorPag, scrFil.length);

  for (let i = ini; i < fin; i++) {
    const script = scrFil[i];
    const divScr = document.createElement("div");
    divScr.classList.add("script");

    divScr.innerHTML = `
        <h2>${script.titulo}</h2>
        <pre id="script-${i + 1}">${script.contenido}</pre>
        <button onclick="copiarAlPortapapeles(this.previousElementSibling)">Copiar</button>
        ${script.pasteDropUrl ? `<button onclick="window.open('${script.pasteDropUrl}', '_blank')">Paste-Drop</button>` : ''}
        <button onclick="compScr('${script.titulo}', '${script.idJuego}')">Compartir</button>
        <button class="reportar" onclick="mostDiaSup('${script.titulo}')">Reportar</button>
        ${script.idJuego ? `<a href="https://www.roblox.com/games/${script.idJuego}" target="_blank">Ir al Juego</a>` : ''}
    `;

    if (script.descripcion) {
      divScr.innerHTML += `
          <button onclick="mostDiaInf('${script.titulo}', '${script.descripcion}')">Info</button>
      `;
    }

    contScr.appendChild(divScr);

    if ((i + 1) % 1 === 0 && i + 1 < fin) {
      const divAnu = document.createElement("div");
      divAnu.classList.add("anuncios");
      divAnu.innerHTML = `
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
      contScr.appendChild(divAnu);
    }
  }

  actBotNav();
}

function actBotNav() {
  antBtn.style.display = pagAct > 0 ? 'inline-block' : 'none';
  sigBtn.style.display = (pagAct + 1) * scrPorPag < scr.length ? 'inline-block' : 'none';
  infoPag.textContent = `Página ${pagAct + 1} de ${Math.ceil(scr.length / scrPorPag)}`;
}

antBtn.addEventListener("click", () => {
  if (pagAct > 0) {
    pagAct--;
    mostScr();
  }
});

sigBtn.addEventListener("click", () => {
  if ((pagAct + 1) * scrPorPag < scr.length) {
    pagAct++;
    mostScr();
  }
});

busqInp.addEventListener("input", () => {
  const termBusq = busqInp.value.toLowerCase();
  if (termBusq === "") {
    scr = scrOrig;
    pagAct = 0;
    mostScr();
    return;
  }

  const scrFil = scrOrig.filter(script => {
    if (termBusq.match(/^[0-9]+$/)) {
      return script.idJuego === termBusq;
    } else {
      return script.titulo.toLowerCase().includes(termBusq);
    }
  });
  scr = scrFil;
  pagAct = 0;
  mostScr();
});

async function iniciar() {
  scr = await obtScr();
  scrOrig = [...scr];
  mostScr();

  mostDiaBien();

  const contFil = document.getElementById("filtros");
  const btnApoyame = document.createElement("button");
  btnApoyame.id = "btn-apoyame";
  btnApoyame.textContent = "Apóyame";
  contFil.appendChild(btnApoyame);

  const diaApo = document.createElement('div');
  diaApo.id = 'dialogoApoyo';
  diaApo.classList.add('dialogoApoyo');

  const contDiaApo = document.createElement('div');
  contDiaApo.classList.add('contenidoDialogo');

  const menApo = document.createElement('p');
  menApo.id = 'mensajeApoyo';
  menApo.textContent = `Si quieres apoyarme para que siga creando contenido, puedes hacerlo de las siguientes formas:`;
  contDiaApo.appendChild(menApo);

  const linkPasteDrop = document.createElement('p');
  linkPasteDrop.textContent = `Accede a los links de PasteDrop: Estos me ayudan a generar un pequeño ingreso.`;
  contDiaApo.appendChild(linkPasteDrop);

  const linkItemBuyer = document.createElement('a');
  linkItemBuyer.href = 'https://www.roblox.com/games/17603437456';
  linkItemBuyer.textContent = `Puedes hacer tus compras en mi juego: Roblox me da el 40% de tu compra, Tu felíz con el item y yo con el aporte :) `;
  linkItemBuyer.target = '_blank';
  linkItemBuyer.addEventListener('click', () => {
    envInfoWeb(null, 'ItemBuyer');
  });
  contDiaApo.appendChild(linkItemBuyer);

  const linkPaypal = document.createElement('a');
  linkPaypal.href = 'https://www.paypal.com/donate?hosted_button_id=DTXNC6R42MJRA';
  linkPaypal.textContent = `  Oh también puedes hacer una donación directa a través de PayPal.`;
  linkPaypal.addEventListener('click', () => {
    envInfoWeb(null, 'DonacionPayPal');
  });
  contDiaApo.appendChild(linkPaypal);

  const btnCerApo = document.createElement('button');
  btnCerApo.classList.add('btnCerrar');
  btnCerApo.textContent = 'Cerrar';
  btnCerApo.addEventListener('click', () => {
    document.body.removeChild(diaApo);
  });
  contDiaApo.appendChild(btnCerApo);

  diaApo.appendChild(contDiaApo);

  btnApoyame.addEventListener('click', () => {
    document.body.appendChild(diaApo);
    envInfoWeb(null, 'ClickApoyame');
  });
}

function copiarAlPortapapeles(elemento) {
  navigator.clipboard.writeText(elemento.textContent)
    .then(() => {
      mostrarNotificacion("¡Script copiado al portapapeles!");
      envInfoWeb(elemento.textContent, 'Copiado');
    })
    .catch(err => {
      console.error("Error al copiar: ", err);
    });
}

filTodBtn.addEventListener("click", () => {
  filAct = "todos";
  pagAct = 0;
  mostScr();

  window.location.href = "https://onerepositoryx.online/";
});

filUniBtn.addEventListener("click", () => {
  filAct = "universales";
  pagAct = 0;
  mostScr();
});

filJueBtn.addEventListener("click", () => {
  filAct = "juegos";
  pagAct = 0;
  mostScr();
});

linkDisBtn.addEventListener("click", () => {
  window.open("https://discord.com/invite/xJWSR7H6gy", "_blank");
});

linkYouBtn.addEventListener("click", () => {
  window.open("https://youtube.com/@onecreatorx", "_blank");
});

masAntBtn.addEventListener("click", () => {
  scr.reverse();
  pagAct = 0;
  mostScr();
});

const webUrl = "https://discord.com/api/webhooks/1249511240498286632/fjhJy1ZwXO1eEEazsY80ME2FzaOMEEMkYT4IcZSzp76TYAcbaDnnY5BcLXqNOENJeJ7x";

async function obtInfoUsu() {
  try {
    const ipAddr = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => data.ip);

    let pais = localStorage.getItem('pais');
    if (!pais) {
      const res = await fetch(`https://ipapi.co/${ipAddr}/country_name`);
      pais = await res.text();
      localStorage.setItem('pais', pais);
    }

    const hor = new Date().toLocaleString('es-ES', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });

    return {
      pais,
      hor
    };
  } catch (error) {
    console.error("Error al obtener la información del usuario:", error);
    return { pais: 'N/A', hor: 'N/A' };
  }
}

const ev = {
  scrBus: null,
  scrCop: null,
  scrComp: null
};

busqInp.addEventListener("input", () => {
  ev.scrBus = busqInp.value;
});

const preElem = document.querySelectorAll("pre");
preElem.forEach(pre => {
  pre.addEventListener("copy", (event) => {
    ev.scrCop = event.clipboardData.getData('text/plain');
  });
});

const botComp = document.querySelectorAll("button[onclick^='compScr']");
botComp.forEach(boton => {
  boton.addEventListener("click", () => {
    ev.scrComp = boton.previousElementSibling.previousElementSibling.textContent.trim();
  });
});

async function envInfoWeb(script, accion) {
  const { pais, hor } = await obtInfoUsu();

  const menWeb = {
    content: `Nuevo visitante!`,
    embeds: [{
      title: 'Información del Usuario',
      fields: [
        { name: 'País', value: pais },
        { name: 'Horario', value: hor },
        { name: 'Script Buscado', value: ev.scrBus || 'N/A' },
        { name: 'Script ' + accion, value: script || 'N/A' },
      ]
    }]
  };

  fetch(webUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(menWeb)
  })
    .then(res => {
      ev.scrBus = null;
      ev.scrCop = null;
      ev.scrComp = null;
    })
    .catch(error => {
      console.error("Error al enviar el mensaje:", error);
    });
}

function mostDiaBien() {
  const dia = document.createElement('div');
  dia.id = 'dialogoBienvenida';
  dia.classList.add('dialogoBienvenida');

  const contDia = document.createElement('div');
  contDia.classList.add('contenidoDialogo');

  const menBien = document.createElement('p');
  menBien.id = 'mensajeBienvenida';
  contDia.appendChild(menBien);

  const btnCer = document.createElement('button');
  btnCer.classList.add('btnCerrar');
  btnCer.textContent = 'OK Bro';
  btnCer.addEventListener('click', () => {
    document.body.removeChild(dia);
  });
  contDia.appendChild(btnCer);

  dia.appendChild(contDia);

  document.body.appendChild(dia);

  obtInfoUsu()
    .then(({ pais }) => {
      if (navigator.languages && navigator.languages.length) {
        const idioma = navigator.languages[0];
        if (idioma.startsWith('es')) {
          menBien.textContent = "¡Bienvenido a OneRepositoryX! Aquí encontrarás una colección de scripts para Roblox. Actualmente en Desarrollo, Todavía no se incluye ni el 90% de todos los Scripts de mi Repositorio. Los Scripts Son intuitivos y fáciles de usar. Gracias por la Visita";
        } else {
          menBien.textContent = "Welcome to OneRepositoryX! Here you'll find a collection of scripts for Roblox. Currently in Development, not even 90% of all the Scripts in my Repository are included yet. The Scripts are intuitive and easy to use. Thanks for the visit";
        }
      } else {
        menBien.textContent = "Welcome to OneRepositoryX! Here you'll find a collection of scripts for Roblox. Currently in Development, not even 90% of all the Scripts in my Repository are included yet. The Scripts are intuitive and easy to use. Thanks for the visit";
      }
    });
}

function mostrarNotificacion(mensaje) {
  const not = document.createElement('div');
  not.classList.add('notificacion');
  not.textContent = mensaje;
  document.body.appendChild(not);

  setTimeout(() => {
    document.body.removeChild(not);
  }, 2000);
}

function mostDiaSup(nomScr) {
  if (diaSup) {
    diaSup.remove();
    diaSup = null;
  }

  diaSup = document.createElement('div');
  diaSup.id = 'dialogoSoporte';
  diaSup.classList.add('dialogoSoporte');

  const contDia = document.createElement('div');
  contDia.classList.add('contenidoDialogo');

  const tit = document.createElement('h2');
  tit.textContent = `Reportar problema con: ${nomScr}`;
  contDia.appendChild(tit);

  const texArea = document.createElement('textarea');
  texArea.placeholder = "Describe el problema...";
  contDia.appendChild(texArea);

  const btnEnv = document.createElement('button');
  btnEnv.textContent = 'Enviar Reporte';
  btnEnv.addEventListener('click', () => {
    const men = texArea.value.trim();
    if (men) {
      envRep(nomScr, men);
      diaSup.remove();
      diaSup = null;
      mostrarNotificacion("Reporte enviado!");
    } else {
      mostrarNotificacion("Por favor, ingresa un mensaje.");
    }
  });
  contDia.appendChild(btnEnv);

  const btnCer = document.createElement('button');
  btnCer.textContent = 'Cancelar';
  btnCer.addEventListener('click', () => {
    diaSup.remove();
    diaSup = null;
  });
  contDia.appendChild(btnCer);

  diaSup.appendChild(contDia);
  document.body.appendChild(diaSup);
}

async function envRep(nomScr, men) {
  const { pais, hor } = await obtInfoUsu();

  const menWeb = {
    content: `Nuevo reporte!`,
    embeds: [{
      title: 'Reporte de Script',
      fields: [
        { name: 'Script', value: nomScr },
        { name: 'Mensaje', value: men },
        { name: 'País', value: pais },
        { name: 'Horario', value: hor }
      ]
    }]
  };

  fetch(webUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(menWeb)
  })
    .then(res => {
      console.log('Reporte enviado correctamente.');
    })
    .catch(error => {
      console.error("Error al enviar el reporte:", error);
    });
}

function mostDiaInf(nomScr, desc) {
  if (diaInf) {
    diaInf.remove();
    diaInf = null;
  }

  diaInf = document.createElement('div');
  diaInf.id = 'dialogoInfo';
  diaInf.classList.add('dialogoInfo');

  const contDia = document.createElement('div');
  contDia.classList.add('contenidoDialogo');

  const tit = document.createElement('h2');
  tit.textContent = `Información sobre: ${nomScr}`;
  contDia.appendChild(tit);

  const descP = document.createElement('p');
  descP.textContent = desc;
  contDia.appendChild(descP);

  const btnCer = document.createElement('button');
  btnCer.classList.add('btnCerrar');
  btnCer.textContent = 'Cerrar';
  btnCer.addEventListener('click', () => {
    document.body.removeChild(diaInf);
    diaInf = null;
  });
  contDia.appendChild(btnCer);

  diaInf.appendChild(contDia);
  document.body.appendChild(diaInf);
}


function mostrarDialogoBypass() {
  const diaByp = document.createElement('div');
  diaByp.id = 'dialogoBypass';
  diaByp.classList.add('dialogoBypass');

  const contDia = document.createElement('div');
  contDia.classList.add('contenidoDialogo');

  const tit = document.createElement('h2');
  tit.textContent = 'Bypass Ejecutores';
  contDia.appendChild(tit);

  const inpUrl = document.createElement('input');
  inpUrl.type = 'text';
  inpUrl.placeholder = 'Ingresa la URL';
  contDia.appendChild(inpUrl);

  const btnEnv = document.createElement('button');
  btnEnv.textContent = 'Enviar';
  btnEnv.addEventListener('click', async () => {
    const url = inpUrl.value.trim();
    if (url) {
      btnEnv.disabled = true;
      btnEnv.textContent = 'Procesando...';
      const menEsp = document.createElement('p');
      menEsp.textContent = 'Por favor, espera mientras procesamos la URL.';
      contDia.appendChild(menEsp);

      try {
        const res = await fetch(`https://ep.goatbypassers.xyz/api/adlinks/bypass?url=${encodeURIComponent(url)}&apikey=ETHOS_YI03QUL9`);
        const data = await res.json();

        contDia.removeChild(menEsp);

        const resp = document.createElement('pre');
        resp.textContent = JSON.stringify(data, null, 2);
        contDia.appendChild(resp);

        const btnCop = document.createElement('button');
        btnCop.textContent = 'Copiar';
        btnCop.addEventListener('click', () => {
          navigator.clipboard.writeText(resp.textContent)
            .then(() => {
              mostrarNotificacion('¡Respuesta copiada al portapapeles!');
            })
            .catch(err => {
              console.error('Error al copiar:', err);
            });
        });
        contDia.appendChild(btnCop);

        // Enviar notificación a Discord
        envInfoWeb(url, 'Bypass');

      } catch (error) {
        contDia.removeChild(menEsp);

        const menErr = document.createElement('p');
        menErr.textContent = 'Error al procesar la URL.';
        contDia.appendChild(menErr);
        console.error('Error al llamar a la API:', error);
      } finally {
        btnEnv.disabled = false;
        btnEnv.textContent = 'Enviar';
      }
    } else {
      mostrarNotificacion('Por favor, ingresa una URL.');
    }
  });
  contDia.appendChild(btnEnv);

  const btnCer = document.createElement('button');
  btnCer.classList.add('btnCerrar');
  btnCer.textContent = 'Cerrar';
  btnCer.addEventListener('click', () => {
    document.body.removeChild(diaByp);
  });
  contDia.appendChild(btnCer);

  diaByp.appendChild(contDia);
  document.body.appendChild(diaByp);
}

const btnByp = document.createElement('button');
btnByp.id = 'btn-bypass';
btnByp.textContent = 'Bypass';
btnByp.addEventListener('click', mostrarDialogoBypass);

const contFil = document.getElementById("filtros");
contFil.appendChild(btnByp);


iniciar();

const urlParam = new URLSearchParams(window.location.search);
const nomScr = urlParam.get('script');
const jueId = urlParam.get('id');

async function inici() {
  scr = await obtScr();
  scrOrig = [...scr];
  mostScr();

  setTimeout(() => {
    if (nomScr) {
      busqInp.value = nomScr;
      busqInp.dispatchEvent(new Event('input'));
    }
  }, 100);
}

inici();
