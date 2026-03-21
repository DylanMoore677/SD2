const express = require("express");
var app = express();
app.use(express.static("static"));

app.set('view engine', 'pug');
app.set('views', __dirname + '/Views');

// const db = require('./services/db'); // TEMPORARILY DISABLED

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/preview/profile", function(req, res) {
    const mockUser = {
        name: "Johnny Student",
        email: "johnny@roehampton.ac.uk",
        course: "Computer Science",
        bio: "I love coding and joining societies!"
    };
    res.render("profile", { user: mockUser });
});

app.get("/preview/users", function(req, res) {
    const mockUsers = [
        {id: 1, name: "Johnny Student", email: "johnny@roehampton.ac.uk", course: "Computer Science"},
        {id: 2, name: "Emily Chen", email: "emily@roehampton.ac.uk", course: "Business"},
        {id: 3, name: "Liam OConnor", email: "liam@roehampton.ac.uk", course: "Software Engineering"},
    ];
    res.render("users", { users: mockUsers });
});

app.get("/preview/societies", function(req, res) {
    const mockSocieties = [
        {id: 1, name: "Chess Club", category: "Games", description: "Weekly chess matches for all levels", members: 24},
        {id: 2, name: "Coding Society", category: "Tech", description: "Hackathons, talks and project nights", members: 58},
        {id: 3, name: "Film Club", category: "Arts", description: "Watch and discuss classic and indie films", members: 31},
        {id: 4, name: "Running Club", category: "Sport", description: "Morning runs around campus", members: 45},
    ];
    res.render("societies", { societies: mockSocieties });
});

app.get("/preview/societies/:id", function(req, res) {
    const mockSociety = {
        id: req.params.id,
        name: "Coding Society",
        category: "Tech",
        description: "Hackathons, talks and project nights for all skill levels.",
        members: 58,
        tags: ["coding", "hackathon", "tech", "beginner-friendly"],
        posts: [
            {title: "Hackathon this Friday!", date: "2026-03-20", type: "Event"},
            {title: "New members welcome", date: "2026-03-18", type: "Announcement"},
        ]
    };
    res.render("society-detail", { society: mockSociety });
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.listen(3000, function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});