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





@app.route('/api/send_message', methods=['POST']) 
@cross_origin()
def send_message():

    data = request.json
    message = data["message"]
    global conversation_history

    updated_history, r = gpt_interface.send_message(conversation_history, message)
    conversation_history = updated_history

    response = jsonify({'message': message, 'r': r})
    print( 'message: ', message, ' r: ', r)
    return response



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug = True)