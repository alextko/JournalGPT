

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
const user = "brad_lev";
let state_global;


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
    state_global = "journal";
    form_input.style.display = 'block';
    save_button.style.display = 'block';
    chat_box.style.display = "none";

  } else if (state === "chat"){
    state_global = "chat";
    form_input.style.display = 'none';
    save_button.style.display = 'none';
    chat_box.style.display = "block";
    save_button.style.display = "none";
    send_button.style.display = "none";
    chatMessages.scrollTop = chatMessages.scrollHeight;

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
  console.log("we are getting this from the textbox: " + form_input.value)
  save_journal(user, form_input.value)
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

async function load_data(user){
  try{
      fetch(' http://127.0.0.1:5000/api/load_data', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"user": user})
      })
      .then(response => {
          return response.json();
      })
      .then(data => {
          console.log(data); 
          message = data.message;
          text = data.notes;
          existing_messages = data.existing_messages
          if (text != ""){
            set_journal_text(text)
          }
          if( existing_messages != ""){
            set_existing_messages(existing_messages)
          }
      })
      .catch(error => {
          console.error("Error fetching data:", error);
          console.log("Response status:", error.status);
      })

  } catch (error) {
      console.error("Error parsing JSON Response");
  }
};

async function save_conversation(user){
  try{
      fetch(' http://127.0.0.1:5000/api/save_conversation', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"user": user})
      })
      .then(response => {
          return response.json();
      })
      .then(data => {
          console.log(data); 
          message = data.message;
      })
      .catch(error => {
          console.error("Error fetching data:", error);
          console.log("Response status:", error.status);
      })

  } catch (error) {
      console.error("Error parsing JSON Response");
  }
};

async function save_journal(user, text){
  try{
      fetch(' http://127.0.0.1:5000/api/save_journal', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"user": user, "text":text})
      })
      .then(response => {
          return response.json();
      })
      .then(data => {
          console.log(data); 
          message = data.message;
      })
      .catch(error => {
          console.error("Error fetching data:", error);
          console.log("Response status:", error.status);
      })

  } catch (error) {
      console.error("Error parsing JSON Response");
  }
};

function set_journal_text(text){
  console.log("setting the text")
  $('[name="form__input"]').text(text);
};

function set_existing_messages(existing_messages) {
  console.log("loading your old messgaes")
  for (let i = 0; i < existing_messages.length; i++) {
    if (existing_messages[i][0] === "sent" ){
      displayMessage("sent", existing_messages[i][1])
    } else if (existing_messages[i][0] === "recieved" ){
      displayMessage('received', existing_messages[i][1])
  }}
  chatMessages.scrollTop = chatMessages.scrollHeight;

};







  // On launch check for the state & load users data
  check_state()
  load_data(user)

  setInterval( async function() { //every 10 seconds save the conversation
    if (state_global === "chat"){
      console.log("doing this")
      save_conversation(user)
    }
    
  }, 60000);


});

