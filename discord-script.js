const messagesContainer = document.getElementById('messages');

// URL del canal de Discord y del webhook (ajustado según los datos proporcionados)
const discordChannelUrl = 'https://discord.com/api/v9/channels/1198408771362361355/messages';
const webhookToken = 'Jkd-s3fGVfjjfTD8nP4lArEnDUXBcjqebehJn9BVlROkQMcOts6ciJhU3ZJjTPw1ZgWa';

// URL para la solicitud JSONP
const fetchUrl = `${discordChannelUrl}?token=${webhookToken}&jsonp=true`;

// Función para procesar los mensajes obtenidos
function processMessages(data) {
  data.forEach(message => {
    // Crear un elemento HTML para cada mensaje
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
      <img src="${message.author.avatar_url}" alt="${message.author.username}" width="50" height="50">
      <div class="username">${message.author.username}</div>
      <div class="timestamp">${new Date(message.timestamp).toLocaleString()}</div>
      <div class="text">${message.content}</div>
    `;
    messagesContainer.appendChild(messageElement);
  });
}

// Hacer la solicitud JSONP
fetchJsonp(fetchUrl)
  .then(response => response.json())
  .then(data => {
    // Procesar los datos obtenidos
    processMessages(data);
  })
  .catch(error => console.error('Error fetching messages:', error));
