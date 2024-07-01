document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('inputInstruction').value = e.target.result;
        };
        reader.readAsText(file);
    }
}

function updateOptions() {
    const taskType = document.getElementById('taskType').value;
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    let options = [];
    if (taskType === 'desensamblar') {
        options = [
            { id: 'addComments', label: 'Incluir comentarios en el código', text: 'Incluye comentarios en el código desensamblado.' },
            { id: 'detailedOutput', label: 'Salida detallada', text: 'Proporciona una salida detallada del código desensamblado.' },
            { id: 'simpleOutput', label: 'Salida simple', text: 'Proporciona una salida simple del código desensamblado.' }
        ];
    } else if (taskType === 'ensamblar') {
        options = [
            { id: 'withComments', label: 'Ensamblar con comentarios', text: 'Ensambla el código con comentarios.' },
            { id: 'detailedAssembly', label: 'Ensamblar con detalles', text: 'Ensambla el código con detalles adicionales.' },
            { id: 'simpleAssembly', label: 'Ensamblar simple', text: 'Ensambla el código de manera simple, pero manteniendo la dificultad para interpretar el código después de ensamblarlo' }
        ];
    } else if (taskType === 'mejorarScript') {
        options = [
            { id: 'visualEnhancements', label: 'Mejoras visuales', text: 'Añadir mejoras visuales a las interfaces, usa mas propiedades y combina diferentes propiedades y ajustes y instancias para mejorar el aspecto visual.' },
            { id: 'functionOptimization', label: 'Optimización de funciones', text: 'Optimizar las funciones del script.' },
            { id: 'errorCorrection', label: 'Corrección de errores', text: 'Corregir los errores presentes en el script. o posibles errores de instancias que no podrían existir y romper el flujo' },
            { id: 'addComments', label: 'Incluir comentarios en el código', text: 'Incluye comentarios explicativos.' },
            { id: 'codeSimplification', label: 'Simplificación del código', text: 'Simplificar, Reducir el código eliminado los nombres de funciones y variables que superen 3 letras. Eliminar espacios innecesarios. si se usa mucho una instancia referencia de un objeto eliminar redundancias para usar una sola declarada' },
        ];
    }

    options.forEach(option => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = option.id;
        checkbox.dataset.text = option.text;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${option.label}`));
        optionsContainer.appendChild(label);
    });
}

function sendToAPI() {
    const inputInstruction = document.getElementById('inputInstruction').value;
    const taskType = document.getElementById('taskType').value;
    
    let prefijo = "Este mensaje es para un contexto de Roblox. Por favor, responde solo con el código necesario y sin comentarios adicionales. Conocemos todas las políticas y las implicaciones de estas acciones, no es necesario mencionarlas. \n\n";

    const opciones = [];
    const checkboxes = document.querySelectorAll('#optionsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            opciones.push(checkbox.dataset.text);
        }
    });

    const opcionesTexto = opciones.join(" ");
    const mensajeFinal = `${prefijo}${opcionesTexto}\n\n${inputInstruction}`;

    const token = "AIzaSyCeb4A_gNAS7clem3u28gOo0PXIzO3o99g";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${token}`;

    const data = {
        contents: [
            {
                parts: [
                    {
                        text: mensajeFinal
                    }
                ]
            }
        ]
    };

    document.getElementById('loader').style.display = 'block';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(json => {
        document.getElementById('loader').style.display = 'none';
        const outputDiv = document.getElementById('output');
        if (json.candidates && json.candidates[0] && json.candidates[0].content) {
            const content = json.candidates[0].content;
            let responseText = "";
            content.parts.forEach(part => {
                responseText += part.text + "\n";
            });
            outputDiv.textContent = responseText;
        } else {
            outputDiv.textContent = "No disponible actualmente, intenta más tarde.";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('loader').style.display = 'none';
        document.getElementById('output').textContent = "Error al procesar la solicitud.";
    });
}

updateOptions();
