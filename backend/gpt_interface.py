import os
import openai
import json
import time
import datetime


context = "\n i want you to act like a therapist, be breif, compassionate, caring, and ask questions \
    about me\n  only ask one question at a time. refrain from mentioning that you are an AI model. Dont say Bot in your response  \n\n"

# load and set the openai API_key
with open('secrets.json') as file:
    data = json.load(file)
    openai.api_key = data["chat_GPT_api_key"]



def collect_user_info(user):
    create_prof_if_not_exists("./context_maps/" + user + ".txt", user)
    f = open("./context_maps/" + user + ".txt")
    user_identity = f.read()
    create_prof_if_not_exists("./context_maps/" + user + "_permanent.json", user)
    f = open("./context_maps/" + user + "_permanent.json")
    permanent_info = json.load(f)

    first_name = permanent_info["first_name"]
    last_name = permanent_info["last_name"]
    email = permanent_info["email"]

    return user_identity, first_name, last_name, email, permanent_info

def update_user_info(user, text):
    file_name = "./context_maps/" + user + ".json"
    with open(file_name, "w") as f:
        f.write(text)

def update_user_info_text(user, text):
    file_name = "./context_maps/" + user + ".txt"
    with open(file_name, "w") as f:
        f.write(text)



def send_message(user_identity, conversation_history, message):

    new_message = message + " ."  #Adding a period prevents GPT from trying to complete your sentences
    completion = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
    {"role": "user", "content": str(user_identity) + context + conversation_history + new_message}
    ]
    )
    
    text_response = completion.choices[0].message.content

    valid, revised_output = check_message_for_invalid_response(conversation_history, text_response)
    time.sleep(2)
    if valid:
        conversation_history += "You: " + message + "\n" + "Bot: " + revised_output + "\n\n"
        return conversation_history ,revised_output


def check_message_for_invalid_response(conversation_history,response):
    valid = True

    if "Bot: " in response:
        response = response.split("Bot: ")[1]
    if "You: " in response:
        response = response.split("You: ")[1]
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
    if response == "":
        response = "Hi, nice to meet you, I am journalGPT. I'd love to get to know you better, tell me about yourself"
    return valid, response

def save_conversation(user, conversation_history, update_user = None):

        
    if conversation_history != "":

        if update_user:
            augment_personal_data(user, None, True)
        # get today's date
        today = datetime.date.today()

        # create a file name using today's date
        create_dir_if_not_exists("history_conversation/" + user + "/")
        file_name = f"history_conversation/{user}/{today.strftime('%Y-%m-%d')}.txt"

        # Check if file exists
        if os.path.isfile(file_name):
            # Read existing text from file
            with open(file_name, "r") as f:
                existing_text = f.read()
                if existing_text != "":
                    mod = existing_text.split("\n")
                    mod = [elem for elem in mod if elem != '']
                
            if existing_text != "" and mod[-1] in conversation_history:
                text_to_add = conversation_history.split(mod[-1])[1]
                if text_to_add.strip() != "":
                    updated_text = existing_text + "\n" + text_to_add
                else:
                    updated_text = existing_text
            else:
                # Append new text to existing text
                if existing_text != "" and conversation_history != "":
                    updated_text = existing_text + "\n" + conversation_history

            # Write updated text back to file
            with open(file_name, "w") as f:
                f.write(updated_text)
        else:
            # File doesn't exist, create new file and write new text
            with open(file_name, "w") as f:
                f.write(conversation_history)
        
        #clear any extra lines
        with open(file_name, 'r') as f:
            lines = f.readlines()
        # remove empty lines from the list of lines
        lines = [line for line in lines if line.strip()]
        with open(file_name, 'w') as f:
            f.writelines(lines)


def save_journal(user, text, cur_page):
    if text:
        create_dir_if_not_exists('history_journal/' + user + "/")
        file_name = f"history_journal/{user}/{cur_page}.txt"

        if os.path.isfile(file_name):
            with open(file_name, "w") as file:
                file.write(text)
        else:
            with open(file_name, "w") as file:
                file.write(text)


def switch_page(user, cur_page, direction):

    #check if page in direction exists
    if direction == "r":
        new_page = cur_page + 1
    else:
        new_page = cur_page - 1
    
    
    file_name = f"history_journal/{user}/{new_page}.txt"
    if os.path.isfile(file_name):
        with open(file_name, "r") as file:
            text = file.read()
            update_last_page(user, new_page)
            return text, new_page
    else:
        return None, cur_page
    
def listdir_without_info(path):
    return [f for f in os.listdir(path) if f != 'info.json']


def new_page(user, cur_page):
    # augment_personal_data(user, cur_page)

    #check if page in direction exists
    new_page = cur_page + 1
    
    file_name = f"history_journal/{user}/{new_page}.txt"
    if os.path.isfile(file_name):  #if this path already exists we have to bump all the pages down 
        update_last_page(user, new_page)
        # Rename all files from index to the end
        for i in range(len(listdir_without_info(f"history_journal/{user}/")), cur_page, -1):
            os.rename(f"history_journal/{user}/" + str(i)+'.txt', f"history_journal/{user}/"+ str(i+1)+'.txt')
        
        # Create the new file at the specified index
        with open(f"history_journal/{user}/" + str(new_page)+'.txt', 'w') as f:
            f.write('')
        
        return "", new_page


    else:  #otherwise we just create the page and leave it empty 
        create_file_if_not_exists(file_name)
        update_last_page(user, new_page)
        return "", new_page
    

def delete_page(user, cur_page):
    #cur page is the new page
    
    #check if there are pages after they must be shifted back 1
    next_page = cur_page + 1
    file_name = f"history_journal/{user}/{next_page}.txt"
    if os.path.isfile(file_name):  #if this path already exists we have to bump all the pages down 
        # Rename all files from index to the end
        for i in range( next_page, len(listdir_without_info(f"history_journal/{user}/"))+1, 1):
            os.rename(f"history_journal/{user}/" + str(i)+'.txt', f"history_journal/{user}/"+ str(i-1)+'.txt')
        
        #return the text from new cur page 
        return_file = f"history_journal/{user}/{cur_page}.txt"
        with open(return_file, "r") as file:
            text = file.read()
            update_last_page(user, cur_page)
            return text, cur_page
        
    else:  
        if cur_page == 1: # we clear the page but stay on the same page
            update_last_page(user, cur_page)
            return "", cur_page
        
        else: #otherwhise we need to delete the current page and go back a page

            new_page = cur_page-1
            #get the text from the new page
            file_name = f"history_journal/{user}/{new_page}.txt"
            with open(file_name, "r") as file:
                text = file.read()
            #delete the old page 
            file_name = f"history_journal/{user}/{cur_page}.txt"
            os.remove(file_name)
            update_last_page(user, cur_page)
            return text, new_page
    



def create_dir_if_not_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)

def create_file_if_not_exists(file):
    if os.path.isfile(file):
        return
    else:
        with open(file, "w") as f:
            f.write(" ")
            return
def create_prof_if_not_exists(file, user):
    if os.path.isfile(file):
        return
    else:
        with open(file, 'w') as f:
            # Dump the JSON object to the file
            json.dump({"user": user}, f)
        

def update_last_page(user, last_page):
    create_dir_if_not_exists('history_journal/' + user + "/")
    file_name = f"history_journal/{user}/info.json"
    d = {"last_page": last_page}
    with open(file_name, "w") as outfile:
        json.dump(d, outfile)



def check_journal(user):

    create_dir_if_not_exists('history_journal/' + user + "/")
    file_name = f"history_journal/{user}/info.json"
    if os.path.isfile(file_name):
        f = open(file_name)
        d = json.load(f)
        last_page = d["last_page"]
    else:
        last_page = 1
        d = {"last_page": last_page}
        with open(file_name, "w") as outfile:
            json.dump(d, outfile)

    file_name = f"history_journal/{user}/{last_page}.txt"

    if os.path.isfile(file_name):
        with open(file_name, "r") as file:
            text = file.read()
            return text, last_page
    else:
        return "", last_page
    
def check_existing_messages(user):
    #load 10 most recent messages 
    today = datetime.date.today()

    # create a file name using today's date
    create_dir_if_not_exists('history_conversation/' + user + "/")
    file_name = f"history_conversation/{user}/{today.strftime('%Y-%m-%d')}.txt"

    if os.path.isfile(file_name):
        with open(file_name, "r") as file:
            text = file.read()
        if text != None:
            text = text.split("\n")[::-1]
            text_to_show = text[0:10][::-1]
            parsed_list = []
            for i in text_to_show:
                l = i.split(":")
                if l[0] == "Bot":
                    parsed_list.append(('recieved', l[1]))
                elif l[0] == "You":
                    parsed_list.append(('sent', l[1]))
            return parsed_list
        else:
            return ""
    else:
        return ""
    

def augment_personal_data(user, cur_page = None, conversation = False):
    user_info, none, none, none, permanent_info = collect_user_info(user)
    today = datetime.date.today()

    if conversation != False:
        create_dir_if_not_exists('history_conversation/' + user + "/")
        recent_conversations = f"history_conversation/{user}/{today.strftime('%Y-%m-%d')}.txt"
        if os.path.isfile(recent_conversations):
            with open(recent_conversations, "r") as file:
                recent_conversation_data = file.read()
        else:
            recent_conversation_data = ""
    else:
        recent_conversation_data = ""

    if cur_page != None:
        create_dir_if_not_exists('history_journal/' + user + "/")
        recent_journal_entries = f"history_journal/{user}/{cur_page}.txt"
        if os.path.isfile(recent_journal_entries):
            with open(recent_journal_entries, "r") as file:
                recent_journal_entry_data = file.read()
        else:
            recent_journal_entry_data = ""
    else:
        recent_journal_entry_data = ""

    if recent_conversation_data != "" or recent_journal_entry_data != "":

        completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
        {"role": "user", "content": "Write a description containing the following information, the speaker is " + str(permanent_info) + " \n\n" + str(user_info) + " \n and \n " + recent_conversation_data  + "\n" + recent_journal_entry_data +  "\n\"\"\""}
        ]
        )
        
        text_response = completion.choices[0].message.content

        print(" \n" + text_response +" \n\n\n")

        update_user_info_text(user, text_response)


    
        
        




    

