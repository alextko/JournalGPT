# app.py

import gpt_interface
from flask_cors import CORS, cross_origin
import time
from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from datetime import timedelta
import json

app = Flask(__name__)
app.config['SESSION_PROTECTION'] = 'strong'
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SESSION_COOKIE_NAME'] = 'JournalGPT'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
app.config['SESSION_COOKIE_SECURE'] = True  # Set to True for HTTPS-only cookie
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Set to True for HTTP-only cookie

# load flask key from secrets file
with open('secrets.json') as file:
    data = json.load(file)
    app.config['SECRET_KEY'] = data["flask_secret_key"]

login_manager = LoginManager()
login_manager.init_app(app)

global conversation_history 
conversation_history = ""
global user_identity 
user_identity = ""

# LOGIN CONFIGURATION

class User(UserMixin):
    def __init__(self, id, email, password):
        self.id = id
        self.email = email
        self.password = password

    def get_id(self):
        return self.id

    def is_authenticated(self):
        return True

@login_manager.user_loader
def load_user(user_id):
    user = User(user_id, 'user@example.com', 'password')
    return user

@app.route('/api/login', methods=['POST'])
def login():
    # Get the email and password from the request
    data = request.json
    email = data['email']
    password = data['pass']
    
    # TODO: Validate the email and password

    # TODO: Authenticate the user
    if password == 'password':
        # Create a User object with the user's information
        id = email.split('@')[0]
        user = User(id, email, password)
        
        # Log the user in
        login_user(user)
        # return redirect(url_for('landing_page'))
        # Return a JSON response indicating success
        return jsonify({'success': True, 'user': id})
    else:
        # Return a JSON response indicating failure
        return jsonify({'success': False , 'error': 'Invalid email or password'})

@app.route('/api/landing_page')
@login_required
def landing_page():
    email = current_user.email
    id = current_user.id

    # user_identity = gpt_interface.collect_user_info(id)
    # exting_notes, curr_page = gpt_interface.check_journal(id)
    # existing_messages = gpt_interface.check_existing_messages(id)

    return render_template('landing_page.html')  

@app.route('/api/logout')
def logout():
    # Log the user out
    logout_user()
    
    # Return a JSON response indicating success
    return jsonify({'success': True})

# Implement the profile function
@app.route('/api/profile')
def profile():
    # Check if the user is logged in
    print("looking for the profile now")
    print(current_user)
    if current_user.is_authenticated:
        # TODO: Retrieve the user's profile information from the database
        email = current_user.email
        # user = "alextko"
        global user_identity
        return jsonify({'email': email, 'id': current_user.id, 'error': "None"})
    else:
        # Return a JSON response indicating that the user is not logged in
        return jsonify({'error': 'User is not logged in'}), 401


@app.route('/api/send_message', methods=['POST']) 
@cross_origin()
def send_message():
    # this message gets a valid response from GPT
    data = request.json
    message = data["message"]
    global conversation_history

    updated_history, r = gpt_interface.send_message(user_identity, conversation_history, message)
    conversation_history = updated_history

    response = jsonify({'message': message, 'r': r})
    print("message: " + message + "\n response: " + r)
    return response


#loading the correct data from the back end
@app.route('/api/load_data', methods=['POST']) 
@cross_origin()
def load_data():
    # This function collects the identity for the active user
    data = request.json
    user = data['user']
    global user_identity
    user_identity = gpt_interface.collect_user_info(user)
    exting_notes, curr_page = gpt_interface.check_journal(user)
    existing_messages = gpt_interface.check_existing_messages(user)



    response = jsonify({'message': "collecting user info for: " + str(user), "notes": exting_notes, "existing_messages": existing_messages, "curr_page": curr_page})
 
    return response



@app.route('/api/save_conversation', methods=['POST']) 
@cross_origin()
def save_conversation():
    # This function collects the identity for the active user
    data = request.json 
    user = data["user"]
    gpt_interface.save_conversation(user, conversation_history)

    response = jsonify({'message': "saving conversation: " + str(user)})
 
    return response



@app.route('/api/save_journal', methods=['POST']) 
@cross_origin()
def save_journal():
    print("saving journal")
    # This function collects the identity for the active user
    data = request.json 
    user = data["user"]
    text = data["text"]
    cur_page = data["cur_page"]
    gpt_interface.save_journal(user, text, cur_page)

    response = jsonify({'message': "saving jouranl entry for: " + str(user), "cur_page": cur_page, "text": text})
 
    return response


@app.route('/api/page_switch', methods=['POST']) 
@cross_origin()
def page_switch():
    # This function collects the identity for the active user
    data = request.json 
    user = data["user"]
    cur_page = data["cur_page"]
    direction = data["direction"]
    text, new_page = gpt_interface.switch_page(user, cur_page, direction)

    if text == None:
        text = "null"

    response = jsonify({'message': "switching page", "text": text, "cur_page": new_page})
 
    return response

@app.route('/api/new_page', methods=['POST']) 
@cross_origin()
def new_page():
    # This function collects the identity for the active user
    data = request.json 
    user = data["user"]
    cur_page = data["cur_page"]
    text, new_page = gpt_interface.new_page(user, cur_page)

    response = jsonify({'message': "creating a new page", "text": text, "cur_page": new_page})
 
    return response



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug = True)