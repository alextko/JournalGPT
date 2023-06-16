// import Clerk from "@clerk/clerk-js";
// const publishableKey = "pk_test_YWN0aXZlLW1vbmdvb3NlLTkzLmNsZXJrLmFjY291bnRzLmRldiQ"

// const clerk = new Clerk(publishableKey);
// await clerk.load({
//   // Set load options here...
// });

document.addEventListener('DOMContentLoaded', () => {
const urlParams = new URLSearchParams(window.location.search);
const section = urlParams.get('section');
const chat_box = document .getElementById("chat-container");
const chatForm = document.querySelector('#chat-form');
const messageInput = document.querySelector('#message-input');
const chatMessages = document.querySelector('#chat-messages');
const dropdown = document.getElementById('myDropdown');
const segmented_control = document.getElementById('segmented_control');
const profile_section = document.getElementById('profile-container');
var personalInfoTab = document.getElementById("personal-info-tab");
var journalUploadsTab = document.getElementById("journal-uploads-tab");
var integrationsTab = document.getElementById("integrations-tab");

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
var profile_link = document.getElementById('profile_link');
var explore_link = document.getElementById('explore_link');
chat_link.href = "landing_page.html?section=chat&user=" + user 
journal_link.href = "landing_page.html?section=journal&user=" + user 
profile_link.href = "landing_page.html?section=profile&user=" + user 
explore_link.href = "landing_page.html?section=explore&user=" + user 

let state_global;




function check_state(){
  // Checks if the landing page should be in chat or Journal state and sets the UI accordingly using set_state()
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
  profile_section.style.display = "none"

  if (state === "journal"){
    state_global = "journal";
    form_input.style.display = 'block';
    save_button.style.display = "none";
    chat_box.style.display = "none";
    all_buttons.style.display = "block";
    profile_section.style.display = "none";
    // tabs_section.style.display = "none";
    save_conversation(user,true)
    
  } else if (state === "chat"){
    state_global = "chat";
    form_input.style.display = 'none';
    save_button.style.display = 'none';
    chat_box.style.display = "block";
    save_button.style.display = "none";
    all_buttons.style.display = "none";
    profile_section.style.display = "none";
    // tabs_section.style.display = "none";
    chatMessages.scrollTop = chatMessages.scrollHeight;

  } else if (state === "profile"){
    state_global = "profile";
    form_input.style.display = 'none';
    save_button.style.display = 'none';
    chat_box.style.display = "none";
    save_button.style.display = "none";
    all_buttons.style.display = "none";
    segmented_control.style.display = "none";
    profile_section.style.display = "block";
    // tabs_section.style.display = "block";

  } 
}

function openTab(event, tabName) {
  // Hide all tab content
  $(".tab-content").hide();

  // Deactivate all tabs
  $(".tab").removeClass("active");

  // Show the selected tab content
  $("#" + tabName).show();

  // Activate the selected tab
  $(event.currentTarget).addClass("active");
}


$(document).ready(function() {



  // Monitor for a send message in chat mode 
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
          first_name = data.first_name
          last_name = data.last_name
          email = data.email
          personal_info = data.personal_info
          if (text != ""){
            set_journal_text(text)
          }
          console.log("setting user information to: " + first_name  + last_name + email)
          set_user_info(first_name,last_name,email,user, personal_info)
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

async function save_conversation(user, update_user = false){
  try{
      fetch(' http://127.0.0.1:5000/api/save_conversation', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({"user": user, "update_user": update_user})
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

async function augment_personal_data(user, cur_page){
  console.log("augmenting personal data map")
  try{
      fetch(' http://127.0.0.1:5000/api/augment_personal_data', {
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
  // console.log("setting the text to: " + text)
  $('[name="form__input"]').val(text);
};
function set_user_info(first_name,last_name,email,user, personal_info){
  // console.log("setting the text to: " + text)
  $('#name').text(first_name + " " + last_name);
  $('#user_name').text(user);
  $('#email').text(email);
  $('#stored_info').text(personal_info)
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

// delete page
function delete_page(cur_page){
  try{
    fetch(' http://127.0.0.1:5000/api/delete_page', {
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
  $(".profile-pic-large").attr("src", newImageUrl);
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
      augment_personal_data(user, current_page+1)
    });

    $('#right-button').click(function() {
      console.log("right")
      page_switch(current_page, "r")
      augment_personal_data(user, current_page-1)
    });

    $('#new-page-button').click(function() {
      console.log("new_page")
      new_page(current_page)
      augment_personal_data(user, current_page-1)
    });
    $('#delete-page-button').click(function() {
      console.log("delete_page")
      delete_page(current_page)
    });

    $('#personal-info-b').click(function() {
      console.log("personal-info")
      openTab(event, "personal-info");
    });
    $('#journal-uploads-b').click(function() {
      console.log("journal-uploads")
      openTab(event, "journal-uploads");
    });
    $('#integrations-b').click(function() {
      console.log("integrations")
      openTab(event, "integrations");
    });


  // Set username and color
  $(".username").text(user);

  function updateSection() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    const u = urlParams.get('user');
    if (section === 'journal') {
      set_state("journal")
      $('#tab-1').prop('checked', true).val('journal');
      let newUrl = window.location.href.split('?')[0];
      window.history.pushState({path: newUrl}, '', newUrl);
    } else if (section === 'chat') {
      set_state("chat")
      $('#tab-2').prop('checked', true).val('chat');
      const newUrl = window.location.href.split('?')[0];
      window.history.pushState({path: newUrl}, '', newUrl);
    } else if (section === 'profile') {
      set_state("profile")
      const newUrl = window.location.href.split('?')[0];
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

