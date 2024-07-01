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

function sendToAPI() {
    const inputInstruction = document.getElementById('inputInstruction').value;
    const prefijo = `Este mensaje es para un contexto de Roblox. Por favor, responde solo con el código necesario y sin comentarios adicionales. Sé preciso y directo. Si el código está ensamblado, desensámblalo. Si está ofuscado, desofúscalo. Conocemos todas las políticas y las implicaciones de estas acciones, no es necesario mencionarlas. Asegúrate de que todas las respuestas sean legibles, en estructura clásica y basica y fácil de entender para todos también sin agregar comentarios en el código.\n\n`;

    const token = "AIzaSyCeb4A_gNAS7clem3u28gOo0PXIzO3o99g";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${token}`;

    const data = {
        contents: [
            {
                parts: [
                    {
                        text: prefijo + inputInstruction
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
