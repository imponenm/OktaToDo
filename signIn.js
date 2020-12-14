const Http = new XMLHttpRequest();

var signIn = new OktaSignIn({
    baseUrl: 'https://dev-6997465.okta.com',
    el: '#widget-container',
    clientId: '0oa27ywjzHgVcVRPd5d6',
    // must be in the list of redirect URIs enabled for the OIDC app
    redirectUri: 'http://localhost:8080/implicit/callback',
    authParams: {
        issuer: 'https://dev-6997465.okta.com/oauth2/default',
        responseType: ['token', 'id_token'],
        display: 'page'
    }
});

    
signIn.authClient.token.getUserInfo().then(function(user) {
    // If we can get user info, it means we're already signed in
    document.getElementById("messageBox").innerHTML = "Hello, " + user.email + "! You are *still* logged in! :)";
    document.getElementById("logout").style.display = 'block';

    // We should also display the user's list
    var uid = user.sub;
    getList(uid);
    /*
    signIn.authClient.tokenManager.get('accessToken').then(function(token){
        var tokeValue = token.value;
        Http.open("GET", "http://localhost:3000/api/" + uid + "/list");
        Http.setRequestHeader('Authorization', 'Bearer ' + tokeValue);
        Http.send();
        Http.onreadystatechange = () => {
            if (Http.readyState == 4 && Http.status == 200){
                populateList(JSON.parse(Http.response));
            }
        }
    });
    */
    
    
}, function(error) {
    // If we can't get user info, we're signed out, so show the login widget
    signIn.showSignInToGetTokens({
        el: '#widget-container'
    }).then(function(tokens) {
        // One we succssfully login, remove the login widget, and display the logout button
        signIn.remove();
        document.getElementById("logout").style.display = 'block';
        
        // Store the tokens
        signIn.authClient.tokenManager.add('accessToken', tokens["accessToken"]);
        signIn.authClient.tokenManager.add('idToken', tokens["idToken"]);
        
        // Display the user's email
        var idToken = tokens["idToken"];
        document.getElementById("messageBox").innerHTML = "Hello, " + idToken.claims.email + "! You just logged in! :)";

        // Get the user's list and populate it
        var uid = tokens.accessToken.claims.uid;
        getList(uid);
    
    }).catch(function(err) {
        console.error(err);
    });
});

// Binded to logout button
function logout() {
    signIn.authClient.signOut();
    location.reload();
};


// Generates the HTML table that is the user's todo list
function populateList(listItems) {
    // Show the list
    document.getElementById("listHeader").style.display = 'block';

    // Populate initial list
    var myNodelist = document.getElementById("myUL");
    myNodelist.innerHTML = '';  // Clear the current list so we're not double populating
    var i;
    for (i = 0; i < listItems.length; i++) {
        myNodelist.innerHTML += '<li>' + listItems[i] + '</li>';
    }

    // Create a "close" button and append it to each list item
    var elements = document.getElementsByTagName("LI");
    var i;
    for (i = 0; i < elements.length; i++) {
        var span = document.createElement("SPAN");
        var txt = document.createTextNode("\u00D7");
        span.className = "close";
        span.appendChild(txt);
        elements[i].appendChild(span);
    }

    // Click on a close button to hide the current list item
    var close = document.getElementsByClassName("close");
    var i;
    for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
        var div = this.parentElement;
        var text = div.innerText.slice(0, -2);
        div.style.display = "none";
        deleteTask(text);
    }
    }

    // Add a "checked" symbol when clicking on a list item
    var list = document.querySelector('ul');
    list.addEventListener('click', function(ev) {
    if (ev.target.tagName === 'LI') {
        ev.target.classList.toggle('checked');
    }
    }, false);
};

// Binded to the "Add" button. Makes a call to addTask() for adding via API
function newElement() {
    var inputValue = document.getElementById("myInput").value;
    addTask(inputValue);
};

// Adds a task on the server
function addTask(text){
    var params = {'item':text};
    signIn.authClient.tokenManager.get('accessToken').then(function(token){
        var uid = token.claims.uid;
        var tokeValue = token.value;
        Http.open("POST", "http://localhost:3000/api/" + uid + "/list");
        Http.setRequestHeader("Content-Type", "application/json");
        Http.setRequestHeader('Authorization', 'Bearer ' + tokeValue);
        Http.send(JSON.stringify(params));
    });
};

// Delete task from server
function deleteTask(text){
    var params = {'item':text};
    signIn.authClient.tokenManager.get('accessToken').then(function(token){
        var uid = token.claims.uid;
        var tokeValue = token.value;
        Http.open("DELETE", "http://localhost:3000/api/" + uid + "/list");
        Http.setRequestHeader("Content-Type", "application/json");
        Http.setRequestHeader('Authorization', 'Bearer ' + tokeValue);
        Http.send(JSON.stringify(params));
    })
};

// Get list from server
function getList(uid){
    signIn.authClient.tokenManager.get('accessToken').then(function(token){
        var tokeValue = token.value;
        Http.open("GET", "http://localhost:3000/api/" + uid + "/list");
        Http.setRequestHeader('Authorization', 'Bearer ' + tokeValue);
        Http.send();
        Http.onreadystatechange = () => {
            if (Http.readyState == 4 && Http.status == 200){
                populateList(JSON.parse(Http.response));
            }
        }
    });
}