const socket = io();
const chatBoard = document.getElementById('chatBoard');

//MListen to server message and print
socket.on('message', message => {
    console.log(message);
    printMessage(message);
    chatBoard.scrollTop = chatBoard.scrollHeight;
});
//CHAT FORM
const chatForm = document.getElementById('chatForm');
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.elements.msg.value;
    socket.emit('message', message);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})
function printMessage(msg) {
    const divElem = document.createElement('div');
    divElem.classList.add('message');
    divElem.innerHTML = `<p class='info'>${msg.user} -- ${msg.time}</p><p class='text'>${msg.text}</p>`;
    chatBoard.appendChild(divElem);
}