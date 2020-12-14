// Load the express and body-parser module
const express = require('express');
const app = express();

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();


// Middleware to use in request processing pipeline
app.use(bodyParser.json());

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin' , '*' );
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.header("Content-Type", "application/json");
    next();
});


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