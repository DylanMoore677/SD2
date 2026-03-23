const path = require("path");
const express = require("express");
var app = express();
app.use(express.static("static"));

app.set('view engine', 'pug');
app.set("views", path.join(__dirname, "views"));

const db = require('./services/db');

// Home page
app.get("/", function(req, res) {
    res.render("index");
});

// All societies from database
app.get("/preview/societies", function(req, res) {
    var sql = 'SELECT * FROM Society';
    db.query(sql).then(results => {
        res.render("societies", { societies: results });
    }).catch(err => {
        res.send("Database error: " + err.message);
    });
});

// Single society from database
app.get("/preview/societies/:id", function(req, res) {
    var societySql = 'SELECT * FROM Society WHERE society_id = ?';
    var membersSql = 'SELECT Student.* FROM Student JOIN Members ON Student.student_id = Members.student_id WHERE Members.society_id = ?';
    
    db.query(societySql, [req.params.id]).then(societyResults => {
        db.query(membersSql, [req.params.id]).then(memberResults => {
            res.render("society-detail", { 
                society: societyResults[0],
                members: memberResults
            });
        });
    }).catch(err => {
        res.send("Database error: " + err.message);
    });
});

// All users from database
app.get("/preview/users", function(req, res) {
    var sql = 'SELECT * FROM Student';
    db.query(sql).then(results => {
        res.render("users", { users: results });
    }).catch(err => {
        res.send("Database error: " + err.message);
    });
});

// Single user profile from database
app.get("/preview/profile/:id", function(req, res) {
    var sql = 'SELECT * FROM Student WHERE student_id = ?';
    db.query(sql, [req.params.id]).then(results => {
        res.render("profile", { user: results[0] });
    }).catch(err => {
        res.send("Database error: " + err.message);
    });
});

// Login page
app.get("/login", function(req, res) {
    res.render("login");
});

app.listen(3000, function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});
