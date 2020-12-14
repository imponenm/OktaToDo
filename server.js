// Load the express and body-parser module
const express = require('express');
const app = express();

var cors = require('cors')
app.use(cors());

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

const OktaJwtVerifier = require('@okta/jwt-verifier');
const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: 'https://dev-6997465.okta.com/oauth2/default'
});



// Middleware to use in request processing pipeline
app.use(bodyParser.json());

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin' , '*' );
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.header("Content-Type", "application/json");
    next();
});

function authenticationRequired(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);
    // The expected audience passed to verifyAccessToken() is required, and can be either a string (direct match) or
    // an array  of strings (the actual aud claim in the token must match one of the strings).
    const expectedAudience = 'api://default';
  
    if (!match) {
      res.status(401);
      return next('Unauthorized');
    }
  
    const accessToken = match[1];
  
    return oktaJwtVerifier.verifyAccessToken(accessToken, expectedAudience)
      .then((jwt) => {
        req.jwt = jwt;
        next();
      })
      .catch((err) => {
        res.status(401).send(err.message);
      });
  };

  app.all('*', authenticationRequired);



// Data placeholder
var todoLists = {'abc':['Mow lawn', 'Laundry'], '00u283t85MSAZJIHZ5d6':['Finish Okta assignment', 'Wash dishes']};

// Returns a user's todo list as an array. If user's list doesns't exist, create it and return back the empty list
app.get('/api/:uid/list', (req, res) => {
    res.header('Access-Control-Allow-Origin' , '*' );

    var id = req.params.uid;
    if (todoLists[id]){
        res.send(todoLists[id]);
    } else{
        todoLists[id] = [];
        res.send(todoLists[id]);
    }
});

// Given a uid and item in the body, add the item to the list
app.post('/api/:uid/list', jsonParser, (req, res) => {
    var id = req.params.uid;
    var text = req.body.item;

    if (!text) {
        res.status(400).send("item is a required argument");
        return;
    }

    if (todoLists[id]){
        todoLists[id].push(text);
        res.json(todoLists[id]);
    } else {
        res.status(404).send('The course with the given ID was not found');
    }
});

// Given a UID and item in the body, delete this item from the list
app.delete('/api/:uid/list', (req, res) => {
    var id = req.params.uid;
    var text = req.body.item;

    // Delete item from user's list
    const i = todoLists[id].indexOf(text);
    todoLists[id].splice(i, 1);

    // Send back the updated list
    res.send(todoLists[id]);
});


// PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));