function updatePrivateInfo() {
    document.getElementById('signup-form').addEventListener('submit', function(event) {
        var fnameInput = document.getElementById("inputFirstName");
        var fname = fnameInput.value;
        if (fname === "") {
            event.preventDefault();
            alert('First name is empty. Please enter your first name');
            fnameInput.focus();
            return;
        } else if (!/^[a-zA-Z]+$/.test(fname)) {
            event.preventDefault();
            alert('First name must contain letters only!');
            fnameInput.focus();
            return;
        }

        var lnameInput = document.getElementById("inputLastName");
        var lname = lnameInput.value;
        if (lname === "") {
            event.preventDefault();
            alert('Last name is empty. Please enter a valid email');
            lnameInput.focus();
            return;
        } else if (!/^[a-zA-Z]+$/.test(lname)) {
            event.preventDefault();
            alert('Last name must contain letters only!');
            lnameInput.focus();
            return;
        }

        // Perform custom form validation
        var emailInput = document.getElementById('inputEmail');
        var email = emailInput.value;

        // Example validation: Check if email is valid
        if (email === "") {
            event.preventDefault();
            alert('Email is empty. Please enter a valid email.');
            emailInput.focus();  // Set focus to email input field
            return;  // Stop further execution
        } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            event.preventDefault();
            alert('Invalid email address. Please enter a valid email.');
            emailInput.focus();  // Set focus to email input field
            return;  // Stop further execution
        }

        var passwordInput = document.getElementById('passwordForm');
        var password = passwordInput.value;
        if (password === "") {
            event.preventDefault();
            alert('Password is empty');
            passwordInput.focus();  // Set focus to email input field
            return;  // Stop further execution
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/.test(password)) {
            event.preventDefault();
            alert('Your password must be have at least 8 characters long, 1 uppercase & 1 lowercase character, 1 number');
            passwordInput.focus();  // Set focus to email input field
            return;  // Stop further execution
        }
    })
}

function updateAccountInfo() {
    document.getElementById('accountInfo-form').addEventListener('submit', function(event) {
        var usernameInput = document.getElementById("inputUsername");
        var username = usernameInput.value;
        if (username === "") {
            event.preventDefault();
            alert('Username is empty. Please enter your username');
            usernameInput.focus();
            return;
        } else if (/[^a-zA-Z0-9]/.test(username)) {
            event.preventDefault();
            alert('Username must not contain special characters!');
            usernameInput.focus();
            return;
        }
    })
}



