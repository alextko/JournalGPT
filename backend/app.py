# app.py

from flask import Flask, request, jsonify
import gpt_interface
from flask_cors import CORS, cross_origin
import time

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

global conversation_history 
conversation_history = ""
global user_identity 
user_identity = ""





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

@app.route('/api/load_data', methods=['POST']) 
@cross_origin()
def load_data():
    # This function collects the identity for the active user
    data = request.json
    user = data['user']
    global user_identity
    user_identity = gpt_interface.collect_user_info(user)
    exting_notes = gpt_interface.check_journal(user)
    existing_messages = gpt_interface.check_existing_messages(user)



    response = jsonify({'message': "collecting user info for: " + str(user), "notes": exting_notes, "existing_messages": existing_messages})
 
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
    gpt_interface.save_journal(user, text)

    response = jsonify({'message': "saving jouranl entry for: " + str(user)})
 
    return response



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug = True)