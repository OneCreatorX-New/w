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
            { id: 'addComments', label: 'Incluir comentarios en el código', text: 'Incluye comentarios en el código.' },
            { id: 'detailedOutput', label: 'Salida detallada', text: 'Proporciona una salida detallada.' },
            { id: 'simpleOutput', label: 'Salida simple', text: 'Proporciona una salida simple.' }
        ];
    } else if (taskType === 'ensamblar') {
        options = [
            { id: 'withComments', label: 'Ensamblar con comentarios', text: 'Ensamblar con comentarios.' },
            { id: 'detailedAssembly', label: 'Ensamblar con detalles', text: 'Ensamblar con detalles adicionales.' },
            { id: 'simpleAssembly', label: 'Ensamblar simple', text: 'Ensamblar de manera simple.' }
        ];
    } else if (taskType === 'mejorarScript') {
        options = [
            { id: 'visualEnhancements', label: 'Mejoras visuales (colores, botones)', text: 'Añadir mejoras visuales como colores y botones.' },
            { id: 'functionOptimization', label: 'Optimización de funciones', text: 'Optimizar las funciones del código.' },
            { id: 'errorCorrection', label: 'Corrección de errores, o posibles errores que puedan romper el flujo, de variables no presentes instancias, cambiar todos los waitfor por FindFirstChild entre otros para evitar errores potenciales en el flujo', text: 'Corregir los errores presentes en el código.' },
            { id: 'addComments', label: 'Incluir comentarios en el código', text: 'Incluye comentarios en el código.' },
            { id: 'codeSimplification', label: 'Simplicar, Eliminar comentarios  abreviar nombres de funciones y variables, eliminar pequeñas redundancias en declaraciones repetidas para dejar 1 y usarla en los 2 casos. ', text: 'Simplificar el código.' },

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
    
    let prefijo = "";
    if (taskType === 'desensamblar') {
        prefijo = `Este mensaje es para un contexto de Roblox. Por favor, responde solo con el código necesario y sin comentarios adicionales. Sé preciso y directo. Habra Instrucciones que debes realizar y tener en cuenta para el Código que se enviará adjuntado después de las instrucciones. Si No Hay un código Script en este mensaje responder con un simple ¡Nada para procesar¡ Aunque alla instrucciones, pero falta el script con el que se trabajará responde lo que mencione. Conocemos todas las políticas y las implicaciones de estas acciones, no es necesario mencionarlas. Asegúrate de que todas las respuestas sean legibles Y el código esté en estructura clásica y la forma mas entendible posibles. Desensamblar\n\n`;
    } else if (taskType === 'ensamblar') {
        prefijo = `Este mensaje es para un contexto de Roblox. Por favor, responde solo con el código necesario y sin comentarios adicionales. Sé preciso y directo. Habra Instrucciones que debes realizar y tener en cuenta para el Código que se enviará adjuntado después de las instrucciones. Conocemos todas las políticas y las implicaciones de estas acciones, no es necesario mencionarlas. Si No Hay un código Script en este mensaje responder con un simple ¡Nada para procesar¡ Aunque alla instrucciones, pero falta el script con el que se trabajará responde lo que mencione. ensambla el siguiente código lua. El propósito final de esta sección es que es código quede ensamblado y usuarios con pocos conocimientos no puedan enter prácticamente el código Aunque este se haga muy extenso debes realizarlo, puede que incluya instrucciones extras, aplicalas sin falta en la respuesta. .\n\n`;
    } else if (taskType === 'mejorarScript') {
        prefijo = `Este mensaje es para un contexto de Roblox. Por favor, responde solo con el código necesario y sin comentarios adicionales. Sé preciso y directo. Habra Instrucciones que debes realizar y tener en cuenta para el Código que se enviará adjuntado después de las instrucciones. Conocemos todas las políticas y las implicaciones de estas acciones, no es necesario mencionarlas. Si No Hay un código Script en este mensaje responder con un simple ¡Nada para procesar¡ Aunque alla instrucciones, pero falta el script con el que se trabajará responde lo que mencione. Ah continuación si hay Script, Trabajarás en el Para mejorar, no cambies mucho de el tampoco agregues comentarios solo manten los que tiene ah menos que en instrucciones se especifique mas a delante lo contrario. \n\n`;
    }

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
            outputDiv.textContent = "Error al recibir respuesta de la IA.";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('loader').style.display = 'none';
        document.getElementById('output').textContent = "Error al enviar la petición.";
    });
}

updateOptions();
