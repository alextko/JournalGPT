### JournalGPT


# Set up steps



1. To create your own JournalGPT you must create a ```backend/secrets.json``` file with the following structure. 


    You can create your openai key on openAI's developer page and you can chose whatever flask secret key you would like. 

    {
        "chat_GPT_api_key": "",
        "flask_secret_key": ""

    }

2. Run Frontend on local host

    ```cd frontend```

    ```python3 -m http.server 3000```


3. Run app in backend (hosted on flask)

    ```cd backend```

    ```python3 app.py```

4. Check out journal GPT at 
```http://localhost:3000/login.html```

    FYI - it shows that you are loggin in, but everything is stored locally on your computer so logging in just loads the correct user data - not secure 

    all personal data is blocked by .gitignore


## Journal GPT Preview:


Chat interface  
![chat preview](</extra/Readme_images/Screenshot 2023-07-21 at 1.52.25 PM.png>)

<br>
<br>
<br>

Journal interface  
![jouranl preview](</extra/Readme_images/Screenshot 2023-07-21 at 1.53.10 PM.png>)



## JournalGPT Figma


https://www.figma.com/file/O594gyCobz4lcFPqBIJTVD/JournalGPT-for-export?type=design&node-id=0%3A1&mode=design&t=K8NP2wpWS32SxD3c-1