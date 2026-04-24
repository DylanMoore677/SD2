const path = require("path");
const express = require("express");
var app = express();

app.set('view engine', 'pug');
app.set("views", path.join(__dirname, "views"));

const db = require('./services/db');
const previewData = require("./services/preview-data");

const {
    adminNav,
    eventItems,
    feedItems,
    guestUser,
    latestUpdates,
    postItems,
    sampleMembers,
    sampleSocieties,
    sampleUser,
    sampleUsers,
    societyUpdates,
    studentNav
} = previewData;

const demoPaths = Object.freeze({
    login: "/login",
    register: "/register/",
    adminRegister: "/register/admin/",
    studentBase: "/demo/student",
    guestBase: "/demo/guest",
    adminBase: "/demo/admin"
});

function findSampleSociety(id) {
    return sampleSocieties.find((society) => String(society.society_id) === String(id)) || null;
}

function findSampleUser(id) {
    return sampleUsers.find((user) => String(user.student_id) === String(id)) || sampleUser;
}

function studentSharedLocals(basePath, roleLabel) {
    return {
        navLinks: studentNav(basePath),
        logoPath: `${basePath}/`,
        headerRoleLabel: roleLabel
    };
}

function adminSharedLocals(basePath) {
    return {
        navLinks: adminNav(basePath),
        logoPath: `${basePath}/`,
        headerRoleLabel: "Admin"
    };
}

function databasePreviewLocals() {
    return {
        navLinks: [
            { label: "Societies", href: "/preview/societies", exact: true },
            { label: "Members", href: "/preview/users" },
            { label: "Login", href: demoPaths.login }
        ],
        logoPath: "/preview/societies",
        headerRoleLabel: "Preview"
    };
}

function renderEntryView(res, view, locals) {
    res.render(view, {
        loginPath: demoPaths.login,
        registerPath: demoPaths.register,
        adminRegisterPath: demoPaths.adminRegister,
        guestPath: `${demoPaths.guestBase}/`,
        studentHomePath: `${demoPaths.studentBase}/`,
        adminHomePath: `${demoPaths.adminBase}/`,
        ...locals
    });
}

function registerStudentDemoRoutes(basePath, roleLabel, user, options) {
    const isGuest = Boolean(options && options.isGuest);
    const sharedLocals = studentSharedLocals(basePath, roleLabel);
    const browsePath = `${basePath}/societies`;
    const profilePath = `${basePath}/profile/1`;
    const newsPath = `${basePath}/feed/`;

    app.get(`${basePath}/`, function(req, res) {
        res.render("student-home", {
            ...sharedLocals,
            featuredSocieties: sampleSocieties,
            latestUpdates,
            currentUser: user,
            isGuest,
            browsePath,
            profilePath,
            feedPath: newsPath,
            registerPath: demoPaths.register
        });
    });

    app.get(`${basePath}/societies/`, function(req, res) {
        res.render("societies", {
            ...sharedLocals,
            societies: sampleSocieties,
            societyBasePath: `${basePath}/societies`
        });
    });

    app.get(`${basePath}/societies/:id/`, function(req, res) {
        const society = findSampleSociety(req.params.id);

        if (!society) {
            res.status(404).send("Society not found");
            return;
        }

        res.render("society-detail", {
            ...sharedLocals,
            society,
            members: sampleMembers,
            societyUpdates,
            societiesBasePath: `${basePath}/societies`
        });
    });

    app.get(`${basePath}/profile/:id/`, function(req, res) {
        res.render("profile", {
            ...sharedLocals,
            user: isGuest ? guestUser : findSampleUser(req.params.id),
            isGuest,
            browsePath: `${basePath}/societies/`,
            loginPath: demoPaths.login,
            registerPath: demoPaths.register
        });
    });

    app.get(`${basePath}/feed/`, function(req, res) {
        res.render("student-feed", {
            ...sharedLocals,
            feedItems,
            joinedSocieties: isGuest ? [] : (user.joined_societies || [])
        });
    });
}

function registerAdminDemoRoutes(basePath) {
    const sharedLocals = adminSharedLocals(basePath);

    app.get(`${basePath}/`, function(req, res) {
        res.render("admin-dashboard", {
            ...sharedLocals,
            postsCount: postItems.length,
            eventsCount: eventItems.length,
            membersCount: sampleMembers.length,
            rsvpCount: 16,
            postItems,
            createPostPath: `${basePath}/create-post/`,
            manageSocietyPath: `${basePath}/manage-society/`
        });
    });

    app.get(`${basePath}/create-post/`, function(req, res) {
        res.render("create-post", {
            ...sharedLocals,
            dashboardPath: `${basePath}/`
        });
    });

    app.get(`${basePath}/manage-society/`, function(req, res) {
        res.render("manage-society", {
            ...sharedLocals,
            society: sampleSocieties[0],
            members: sampleMembers,
            eventItems,
            dashboardPath: `${basePath}/`
        });
    });

    app.get(`${basePath}/members/`, function(req, res) {
        res.render("users", {
            ...sharedLocals,
            users: sampleMembers,
            profileBasePath: `${demoPaths.studentBase}/profile`,
            dashboardPath: `${basePath}/`,
            publicSocietiesPath: `${demoPaths.studentBase}/societies/`,
            directoryResetPath: `${basePath}/members/`
        });
    });
}

// Frontend entry pages keep their existing UI, but the mock experience now lives under /demo/*.
app.get("/", function(req, res) {
    renderEntryView(res, "index");
});

app.get(demoPaths.login, function(req, res) {
    renderEntryView(res, "login");
});

app.get(demoPaths.register, function(req, res) {
    renderEntryView(res, "register", {
        defaultRegistrationRole: "student"
    });
});

app.get(demoPaths.adminRegister, function(req, res) {
    renderEntryView(res, "register", {
        defaultRegistrationRole: "admin"
    });
});

app.get("/demo/", function(req, res) {
    res.redirect(`${demoPaths.studentBase}/`);
});

// Frontend demo routes use preview data only and stay separate from database-backed routes.
registerStudentDemoRoutes(demoPaths.studentBase, "Student", sampleUser, { isGuest: false });
registerStudentDemoRoutes(demoPaths.guestBase, "Guest", guestUser, { isGuest: true });
registerAdminDemoRoutes(demoPaths.adminBase);

// Database-backed scaffold routes remain separate so real integration work does not depend on preview data.
app.get("/preview/societies", function(req, res) {
    var sql = 'SELECT * FROM Society';
    db.query(sql).then(results => {
        res.render("societies", {
            ...databasePreviewLocals(),
            societies: results,
            societyBasePath: "/preview/societies"
        });
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
                ...databasePreviewLocals(),
                society: societyResults[0],
                members: memberResults,
                societiesBasePath: "/preview/societies"
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
        res.render("users", {
            ...databasePreviewLocals(),
            users: results,
            profileBasePath: "/preview/profile",
            publicSocietiesPath: "/preview/societies",
            directoryResetPath: "/preview/users"
        });
    }).catch(err => {
        res.send("Database error: " + err.message);
    });
});

// Single user profile from database
app.get("/preview/profile/:id", function(req, res) {
    var sql = 'SELECT * FROM Student WHERE student_id = ?';
    db.query(sql, [req.params.id]).then(results => {
        res.render("profile", {
            ...databasePreviewLocals(),
            user: results[0],
            browsePath: "/preview/societies",
            loginPath: demoPaths.login,
            registerPath: demoPaths.register
        });
    }).catch(err => {
        res.send("Database error: " + err.message);
    });
});

app.use(express.static("static"));

const port = Number(process.env.PORT) || 3000;

app.listen(port, function(){
    console.log(`Server running at http://127.0.0.1:${port}/`);
});
