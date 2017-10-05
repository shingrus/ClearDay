// set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongo = require('mongoose').set('debug', true);                     // mongoose for mongodb

var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

var mongoUrl = (isHeroku()) ? process.env.PROD_MONGODB : "mongodb://localhost/test"


app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());


//heroku port
var port = process.env.PORT || 8080;


// define model =================

var Todo = mongo.model('Todo', {
    text : String,
    dateToDone: Date,
    done: Boolean
});




// api ---------------------------------------------------------------------
var getTodo = function (req, res) {
    var currentDate;
    var unixtime = parseInt(req.params.date);
    if (isNaN(unixtime)) {
        currentDate = new Date();

    }
    else {
        currentDate = new Date(unixtime)
    }

    currentDate.setHours(0, 0, 0, 0);

    console.log("work with date:" + currentDate);


    // use mongoose to get all todos in the database
    // var query = Todo.find();

    var query = Todo.find({dateToDone: currentDate});
    query.exec(function (err, todos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err);
        // console.log(todos);

        res.json(todos); // return all todos in JSON format
    })
};

// routes ======================================================================

// get all todos

app.get('/api/todos', getTodo);
app.get('/api/todos/:date', getTodo);



// create todo and send back all todos after creation
app.post('/api/todos/:date', function(req, res) {

    console.log("Date from req:" + req.params.date)

    var unixtime = parseInt(req.params.date);
    if(isNaN(unixtime)) {
        res.status(500)
        res.render('error', {error: "Invalid Date"})
        return;
    }
    var dateToInsert = new Date(unixtime);
    dateToInsert.setHours(0,0,0,0);

    // create a todo, information comes from AJAX request from Angular
    var todo = new Todo ({
        text : req.body.text,
            done : false,
            dateToDone: dateToInsert
    });
    todo.save(function (err) {
        if(err)
            res.send(err);
        else {
            todos = null;
            Todo.find({dateToDone: dateToInsert},function (err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
            });
        }
    });
});

//set done
app.post('/api/setDone/:todo_id/:doneStatus', function (req,res) {

    console.log("update by id: " + req.params.todo_id)
    Todo.update({ _id: req.params.todo_id }, { $set: { done: req.params.doneStatus}},  function (err, raw) {
        if (err) return handleError(err);
        console.log('The raw response from Mongo was ', raw);
    })

})

// delete a todo
app.delete('/api/todos/:todo_id', function(req, res) {

    Todo.findByIdAndRemove(req.params.todo_id,{}, function (err, removedTodo) {
        if (err)
            res.send(err);

        if (removedTodo == null)
            res.json();

        var currentDate = removedTodo.dateToDone;
        currentDate.setHours(0,0,0,0);
        console.log("removed doc from date:" + currentDate);
        // get and return all the todos after you create another
        Todo.find({dateToDone:currentDate},function(err, todos) {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });

});

// application -------------------------------------------------------------
app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});



var promise = mongo.connect(mongoUrl,{useMongoClient: true});

mongo.connection.on('error', function (err) {

    console.log("Error: "  + err);
});
mongo.connection.on('connect', function () {
    console.log("Connected");
});

promise.then(function () {
    app.listen(port);
   console.log("App listening on port " + port);
})

// listen (start app with node server.js) ======================================


//additional functions
function isHeroku() {
    return process.env.NODE && ~process.env.NODE.indexOf("heroku") ? true : false;
}