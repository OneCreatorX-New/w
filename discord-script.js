const webhookUrl = 'https://discord.com/api/webhooks/1257037127376699462/Jkd-s3fGVfjjfTD8nP4lArEnDUXBcjqebehJn9BVlROkQMcOts6ciJhU3ZJjTPw1ZgWa';
const messagesContainer = document.getElementById('messages');

fetch(webhookUrl)
  .then(response => response.json())
  .then(data => {
    // Procesar los datos del webhook
    data.forEach(message => {
      // Crear un elemento HTML para cada mensaje
      const messageElement = document.createElement('div');
      messageElement.innerHTML = `
        <img src="${message.author.avatar_url}" alt="${message.author.username}">
        <strong>${message.author.username}</strong>
        <p>${message.content}</p>
        <span>${message.timestamp}</span>
      `;
      messagesContainer.appendChild(messageElement);
    });
  })
  .catch(error => console.error('Error fetching messages:', error));
