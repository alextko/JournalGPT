document.addEventListener('DOMContentLoaded', () => {

    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        $('#error-message').text("")

        const email = $('#email').val();
        const password = $('#password').val();
        login(email,password)
    });


    function login(email, pass){

        try{
            fetch(' http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"email": email, "pass": pass})
            })
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(data); 
                success = data.success;
                user = data.user
                if (success === true){
                    window.location.href = '/landing_page.html?user='+ user;
                    console.log("login sucessful, now we do soemthing")
                } else {
                    $('#error-message').text(data.error)
                }
                // location.reload();
                
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                console.log("Response status:", error.status);
                $('#error-message').text(data.error)
            })
    
        } catch (error) {
            console.error("Error parsing JSON Response");
        }
    
    
    };




});
    