

document.addEventListener('DOMContentLoaded', () => {
const urlParams = new URLSearchParams(window.location.search);
const section = urlParams.get('section');
const chat_box = document .getElementById("chat-container");
const chatForm = document.querySelector('#chat-form');
const messageInput = document.querySelector('#message-input');
const chatMessages = document.querySelector('#chat-messages');
const dropdown = document.getElementById('myDropdown');

const send_button = document.getElementById("send-button")
const form_input = document.getElementById("form__input");
const save_button = document.getElementById("save_button");
const all_buttons = document.getElementById("btn-group");
const radioButtons = document.querySelectorAll('input[name="radio2"]');
let selectedValue;
let dropdown_state = false;
let current_page = 2;


let user = "default";
// let user = getcurrentUser();
set_user();
// set the links to the appropriate values based on the current user
var chat_link = document.getElementById('chat_link');
var journal_link = document.getElementById('journal_link');
chat_link.href = "landing_page.html?section=chat&user=" + user 
journal_link.href = "landing_page.html?section=journal&user=" + user 

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
  set_state(selectedValue)
}

function set_state(state) {
  console.log("setting state to "  + state)

  if (state === "journal"){
    state_global = "journal";
    form_input.style.display = 'block';
    save_button.style.display = "none";
    chat_box.style.display = "none";
    all_buttons.style.display = "block";


  } else if (state === "chat"){
    state_global = "chat";
    form_input.style.display = 'none';
    save_button.style.display = 'none';
    chat_box.style.display = "block";
    save_button.style.display = "none";
    send_button.style.display = "none";
    all_buttons.style.display = "none";
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
  save_journal(user, form_input.value, current_page)
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

function getcurrentUser(){
  let u = null  
  try{
      fetch(' http://127.0.0.1:5000/api/profile', {
          method: 'GET'
      })
      .then(response => {
          return response.json();
      })
      .then(data => {
          console.log(data); 
          email = data.email;
          userid = data.id;
          error = data.error
          if (error === "None"){
            u = userid
          } else {
            u = "default"
          }
          u = "default"
      })
      .catch(error => {
          console.error("Error fetching data:", error);
          console.log("Response status:", error.status);
          u = "default";
      })

  } catch (error) {
      console.error("Error parsing JSON Response");
  }
  console.log(u)
  return 


};

function load_data(user){
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
          curr_page = data.curr_page
          current_page = curr_page
          if (text != ""){
            set_journal_text(text)
          }
          if( existing_messages != ""){
            set_existing_messages(existing_messages)
          }
          load_image(user)
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

async function save_journal(user, text, cur_page){
  try{
      fetch(' http://127.0.0.1:5000/api/save_journal', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"user": user, "text":text, "cur_page": cur_page})
      })
      .then(response => {
          return response.json();
      })
      .then(data => {
          console.log(data); 
          message = data.message;
          cur_page = data.cur_page
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
  console.log("setting the text to: " + text)
  $('[name="form__input"]').val(text);
};

function page_switch(cur_page, direction){
  try{
    fetch(' http://127.0.0.1:5000/api/page_switch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"user": user, "cur_page": cur_page, "direction":direction})
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data); 
        message = data.message;
        cur_page = data.cur_page
        text = data.text;
        if ( text !== "null"){
          set_journal_text(text)
          current_page = cur_page
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

// create new page
function new_page(cur_page){
  try{
    fetch(' http://127.0.0.1:5000/api/new_page', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"user": user, "cur_page": cur_page})
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data); 
        message = data.message;
        cur_page = data.cur_page
        text = data.text;
        
        set_journal_text(text)
        current_page = cur_page

        
        
    })
    .catch(error => {
        console.error("Error fetching data:", error);
        console.log("Response status:", error.status);
    })

} catch (error) {
    console.error("Error parsing JSON Response");
}

};

function load_image(user){
  // Change user image
  var newImageUrl = "/profile_picture/"+user+".jpeg"; // Replace with new image URL
  $(".profile-pic").attr("src", newImageUrl);
}

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
      save_conversation(user)
      
    }
    if (state_global  === "journal"){
      const form_input = document.getElementById("form__input");
      save_journal(user, form_input.value, current_page)
    }
    
  }, 3000);

  // Show dropdown on click
  $('.dropdown').click(function() {
    if (dropdown_state === true) {
      dropdown.style.display = 'none';
      dropdown_state = false;

    } else {
      dropdown.style.display= 'block';
      dropdown_state = true;

    }
  });

    // left click
    $('#left-button').click(function() {
      console.log("left")
      page_switch(current_page, "l")
    });
    $('#right-button').click(function() {
      console.log("right")
      page_switch(current_page, "r")
    });
    $('#new-page-button').click(function() {
      console.log("new_page")
      new_page(current_page)
    });

  // Set username and color
  $(".username").text(user);

  function updateSection() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    const u = urlParams.get('user');
    console.log(" right now we think the user is: " + u + " and the section is " + section)
    if (section === 'journal') {
      set_state("journal")
      $('#tab-1').prop('checked', true).val('journal');
      let newUrl = window.location.href.split('?')[0];
      // let newUrl = newUrl1 + '?user='+ u;
      window.history.pushState({path: newUrl}, '', newUrl);
    } else if (section === 'chat') {
      set_state("chat")
      $('#tab-2').prop('checked', true).val('chat');
      const newUrl = window.location.href.split('?')[0];
      // let newUrl = newUrl1 + '?user='+ u;
      window.history.pushState({path: newUrl}, '', newUrl);
    }
  }


  function set_user() {
    try{
      const urlParams = new URLSearchParams(window.location.search);
      const u = urlParams.get('user');
      console.log("user is " + u)
      if(u){
        user = u
        load_image(user)
      }
      
    } catch{
      console.log("no user provided, setting the user to default")
    }

    
  }

  $(document).ready(function() {
    updateSection();
    window.onpopstate = function(event) {
      updateSection();
    };
  });
  
  


    $('#logout_link').on('click', function(event) {
      try{
        fetch(' http://127.0.0.1:5000/api/logout', {
            method: 'GET'
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data); 
            
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            console.log("Response status:", error.status);
        })
    
    } catch (error) {
        console.error("Error parsing JSON Response");
    }
      
  });


});

