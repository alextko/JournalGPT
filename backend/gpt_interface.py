import os
import openai
import json
import time

openai.api_key = "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"

context = " i want you to act like a therapist, be breif, compassionate, caring, and ask questions \
    about me\n  only ask one question at a time. refrain from mentioning that you are an AI model. Dont say Bot in your response  \n\n"
f = open("./context_maps/alex_reinhart.json")
personal_history = json.load(f)


def send_message(conversation_history, message):
    message += " ."  #Adding a period prevents GPT from trying to complete your sentences
    completion = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
    {"role": "user", "content": str(personal_history) + context + conversation_history + message}
    ]
    )
    
    text_response = completion.choices[0].message.content
    conversation_history += "You: " + message + "\n" + "Bot: " + text_response + "\n\n"
    time.sleep(2)

    valid, revised_output = check_message_for_invalid_response(conversation_history, text_response)
    if valid:
        return conversation_history ,revised_output


def check_message_for_invalid_response(conversation_history,response):
    valid = True

    if "Bot: " in response:
        response = response.split("Bot: ")[1]
    if "language model" in response:
        valid = False
        send_message(conversation_history, "ask what is on my mind.")
    if "AI model" in response:
        valid = False
        send_message(conversation_history, "Tell me that you would like to talk about me and ask me to tell you about myslf.")
    if "journalgpt" in response.lower() or "journal gpt" in response.lower():
        response = "JournalGPT is a place where you can Journal or talk to someone. I as a chatbot therapist am here to \
            listen and support you however I can \n\n JournalGPT allows you to save all these conversations as journal entries as well\
                so feel free to treat this conversation as your personal jounal. "
    return valid, response






# history = ""
# prompt = "who are you"
# hist, response = send_message(history, prompt)
# print(response)
