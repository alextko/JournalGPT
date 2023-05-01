

document.addEventListener('DOMContentLoaded', () => {
const chat_box = document .getElementById("chat-container");
const chatForm = document.querySelector('#chat-form');
const messageInput = document.querySelector('#message-input');
const chatMessages = document.querySelector('#chat-messages');

const send_button = document.getElementById("send-button")
const form_input = document.getElementById("form__input");
const save_button = document.getElementById("save_button");
const radioButtons = document.querySelectorAll('input[name="radio2"]');
let selectedValue;

const openaiApiKey = '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';


function check_state(){
  const radioButtons = document.querySelectorAll('input[name="radio2"]');
  let selectedValue;

  for (const radioButton of radioButtons) {
    if (radioButton.checked) {
      selectedValue = radioButton.value;
      break;
    }
  }
  console.log(selectedValue);
  set_state(selectedValue)
}

function set_state(state) {
  if (state === "journal"){
    form_input.style.display = 'block';
    save_button.style.display = 'block';
    chat_box.style.display = "none";

  } else if (state === "chat"){
    form_input.style.display = 'none';
    save_button.style.display = 'none';
    chat_box.style.display = "block";
    save_button.style.display = "none";
    send_button.style.display = "none";

  } 
}


$(document).ready(function() {
  $('#message-input').on('keydown', async function(event) {
  if (event.key === 'Enter') {
    // This will trigger send when you press enter
    console.log('Enter key pressed');

    const messageInput = document.querySelector('#message-input');
    let message = messageInput.value;
    if (!message) {
      return;
    }
    const response = await sendMessageToChatGPT(message);
    displayMessage('sent', message);
    
    messageInput.value = '';
  }
});
});



$("[name = 'radio2'").click(function(){
  check_state()

});


$("[name = 'save_button'").click(function(){
  const form_input = document.getElementById("form__input");
  console.log("we are getting this from the textbox: " + form__input.value)
});



$("[name = 'chat-form'").click(async function(){
  console.log("detected a button press")
  const messageInput = document.querySelector('#message-input');
  let message = messageInput.value;
  if (!message) {
    return;
  }
  const response = await sendMessageToChatGPT(message);
  displayMessage('sent', message);
  
  messageInput.value = '';
});



function displayMessage(type, message) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container', type);
  const messageText = document.createElement('div');
  messageText.classList.add('message');
  messageText.innerText = message;
  messageContainer.appendChild(messageText);
  chatMessages.appendChild(messageContainer);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}


async function sendMessageToChatGPT(message){

  try{
      fetch(' http://127.0.0.1:5000/api/send_message', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"message": message})
      })
      .then(response => {
          return response.json();
      })
      .then(data => {
          console.log(data); 
          message = data.message;
          response = data.r;
          displayMessage('received', response);
      })
      .catch(error => {
          console.error("Error fetching data:", error);
          console.log("Response status:", error.status);
      })

  } catch (error) {
      console.error("Error parsing JSON Response");
  }


};







  // On launch check for the state 
  check_state()

});

