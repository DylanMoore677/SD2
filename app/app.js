// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Set up Pug as the view engine
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// Get the functions in the db.js file to use
// const db = require('./services/db'); // TEMPORARILY DISABLED FOR FRONTEND PREVIEW

// Create a route for root - /
app.get("/", function(req, res) {
    res.send("Hello world!");
});

// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results)
    });
});

// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

// --- Mock Frontend Routes ---
app.get("/preview/profile", function(req, res) {
    // Fake data instead of database fetching
    const mockUser = {
        name: "Johnny Student",
        email: "johnny@roehampton.ac.uk",
        course: "Computer Science",
        bio: "I love coding and joining societies!"
    };
    // Renders the 'profile.pug' file in the 'views' folder
    res.render("profile", { user: mockUser });
});

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});