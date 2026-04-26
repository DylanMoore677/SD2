// Main Express app entry point.
// This file wires together:
// - public entry/login/register pages
// - mock-data demo routes under /demo/*
// - live student/admin routes backed by MySQL
// - unauthenticated preview routes for quickly inspecting database content

// Core Node / Express dependencies
const path = require("path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");    // Used to hash passwords on register and verify on login
var app = express();

// Use Pug as the template engine; views live in app/views/
app.set('view engine', 'pug');
app.set("views", path.join(__dirname, "views"));

// Parse URL-encoded form bodies (standard HTML form POST) and JSON bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session middleware — stores the logged-in user object in req.session.user
app.use(session({
    secret: process.env.SESSION_SECRET || 'society-hub-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }    // Session expires after 24 hours
}));

// Database query helper and static mock data for /demo/* routes
const db = require('./services/db');
const previewData = require("./services/preview-data");

// Destructure the mock data exports used by /demo/* and preview routes
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

// Shared path constants — frozen so they can't be accidentally mutated
const demoPaths = Object.freeze({
    login: "/login",
    register: "/register/",
    adminRegister: "/register/admin/",
    studentBase: "/demo/student",
    guestBase: "/demo/guest",
    adminBase: "/demo/admin"
});


// Formats a MySQL datetime into a short human-readable string (e.g. "Mon, Apr 7")
function formatDate(dt) {
    if (!dt) return 'Recent';
    return new Date(dt).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Auth middleware — redirects to /login if session is missing or wrong role
// Pass role = 'student' or 'admin' to enforce a specific role; omit to just require any login
function requireAuth(role) {
    return function(req, res, next) {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }
        // If the user is logged in but the wrong role, redirect them to their own dashboard
        if (role && req.session.user.role !== role) {
            return req.session.user.role === 'student'
                ? res.redirect('/student/')
                : res.redirect('/admin/');
        }
        next();
    };
}

// Looks up a society by ID from the mock data array
function findSampleSociety(id) {
    return sampleSocieties.find((society) => String(society.society_id) === String(id)) || null;
}

// Looks up a student by ID from the mock data array, falling back to sampleUser
function findSampleUser(id) {
    return sampleUsers.find((user) => String(user.student_id) === String(id)) || sampleUser;
}

// Returns nav/logo/role locals shared across all student-role demo pages
function studentSharedLocals(basePath, roleLabel) {
    return {
        navLinks: studentNav(basePath),
        logoPath: `${basePath}/`,
        headerRoleLabel: roleLabel
    };
}

// Returns nav/logo/role locals shared across all admin-role demo pages
function adminSharedLocals(basePath) {
    return {
        navLinks: adminNav(basePath),
        logoPath: `${basePath}/`,
        headerRoleLabel: "Admin"
    };
}

// Returns nav/logo/role locals for the database-backed /preview/* routes
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

// Renders a login/register/landing view with the standard entry-page path locals pre-filled
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

// Registers all student-facing demo routes (home, societies, profile, feed) under basePath.
// Used three times: /demo/student (logged in), /demo/guest (unauthenticated), and indirectly
// for static preview generation.
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

// Registers all admin-facing demo routes (dashboard, create post, manage society, members)
// under basePath using mock data only — no database involvement
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

// ============================================================
// Entry pages
// ============================================================

// Landing page — redirect to the appropriate dashboard if already logged in
app.get("/", function(req, res) {
    if (req.session && req.session.user) {
        return req.session.user.role === 'student'
            ? res.redirect('/student/')
            : res.redirect('/admin/');
    }
    renderEntryView(res, "index");
});

// Login page — redirect away if already logged in; pass error flag from query string
app.get(demoPaths.login, function(req, res) {
    if (req.session && req.session.user) {
        return req.session.user.role === 'student'
            ? res.redirect('/student/')
            : res.redirect('/admin/');
    }
    renderEntryView(res, "login", { loginError: req.query.error === '1' });
});

// Login form submission — looks up the user by email, then verifies the bcrypt hash
// Redirects to the appropriate dashboard on success, or back to /login?error=1 on failure
app.post('/login', async function(req, res) {
    const { email, password, role } = req.body;

    try {
        if (role === 'admin') {
            const results = await db.query('SELECT * FROM Society WHERE email = ?', [email]);
            if (results.length > 0 && await bcrypt.compare(password, results[0].password)) {
                req.session.user = {
                    id: results[0].society_id,
                    role: 'admin',
                    email: results[0].email
                };
                return res.redirect('/admin/');
            }
        } else {
            const results = await db.query('SELECT * FROM Student WHERE email = ?', [email]);
            if (results.length > 0 && await bcrypt.compare(password, results[0].password)) {
                req.session.user = {
                    id: results[0].student_id,
                    role: 'student',
                    email: results[0].email,
                    first_name: results[0].first_name,
                    last_name: results[0].last_name
                };
                return res.redirect('/student/');
            }
        }
        res.redirect('/login?error=1');
    } catch (err) {
        console.error('Login error:', err);
        res.redirect('/login?error=1');
    }
});

// ============================================================
// ENTRY + AUTH routes
// These routes handle login/logout/registration before users
// enter either the live dashboards or the mock demo flows.
// ============================================================

// Destroy the session and redirect to the login page
app.get('/logout', function(req, res) {
    req.session.destroy(() => res.redirect('/login'));
});

// Registration page pre-configured to show the student tab by default
app.get(demoPaths.register, function(req, res) {
    renderEntryView(res, "register", {
        defaultRegistrationRole: "student"
    });
});

// Registration page pre-configured to show the admin/society tab by default
app.get(demoPaths.adminRegister, function(req, res) {
    renderEntryView(res, "register", {
        defaultRegistrationRole: "admin"
    });
});

// Student registration — hashes the password with bcrypt before inserting into Student table
app.post('/register', async function(req, res) {
    const { email, first_name, last_name, password } = req.body;
    try {
        const hash = await bcrypt.hash(password || '', 10);
        await db.query(
            'INSERT INTO Student (email, first_name, last_name, password) VALUES (?, ?, ?, ?)',
            [email, first_name || '', last_name || '', hash]
        );
        res.redirect('/login');
    } catch (err) {
        console.error('Register error:', err);
        renderEntryView(res, "register", {
            defaultRegistrationRole: "student",
            registerError: "Registration failed. That email may already be in use."
        });
    }
});

// Society (admin) registration — hashes the password and inserts into Society table
app.post('/register/admin', async function(req, res) {
    const { name, email, about_us_text, password } = req.body;
    try {
        const hash = await bcrypt.hash(password || '', 10);
        await db.query(
            'INSERT INTO Society (name, email, about_us_text, password) VALUES (?, ?, ?, ?)',
            [name || '', email, about_us_text || '', hash]
        );
        res.redirect('/login');
    } catch (err) {
        console.error('Society register error:', err);
        renderEntryView(res, "register", {
            defaultRegistrationRole: "admin",
            registerError: "Registration failed. That email may already be in use."
        });
    }
});

// ============================================================
// DEMO route entry
// Redirects into the mock student dashboard and then registers
// the rest of the demo-only route tree below.
// ============================================================
app.get("/demo/", function(req, res) {
    res.redirect(`${demoPaths.studentBase}/`);
});

// Demo routes (mock data, no auth required)
registerStudentDemoRoutes(demoPaths.studentBase, "Student", sampleUser, { isGuest: false });
registerStudentDemoRoutes(demoPaths.guestBase, "Guest", guestUser, { isGuest: true });
registerAdminDemoRoutes(demoPaths.adminBase);

// ============================================================
// LIVE STUDENT routes — protected, role = student
// ============================================================

const studentBase = '/student';

// Builds the nav/logo locals for live student pages using the session user's ID for the profile link
function liveStudentLocals(req) {
    const user = req.session.user;
    return {
        navLinks: [
            { label: 'Home', href: `${studentBase}/`, exact: true },
            { label: 'Societies', href: `${studentBase}/societies/` },
            { label: 'News', href: `${studentBase}/feed/` },
            { label: 'Profile', href: `${studentBase}/profile/${user.id}/`, icon: 'profile' },
            { label: 'Logout', href: '/logout' }
        ],
        logoPath: `${studentBase}/`,
        headerRoleLabel: 'Student'
    };
}

// Student home — loads joined societies, filters out joined ones from the discovery section,
// fetches the 5 most recent posts from joined societies, and checks RSVP status
app.get(`${studentBase}/`, requireAuth('student'), async function(req, res) {
    const user = req.session.user;
    try {
        const allSocieties = await db.query('SELECT * FROM Society');
        const joinedRows = await db.query(
            'SELECT Society.* FROM Society JOIN Members ON Society.society_id = Members.society_id WHERE Members.student_id = ?',
            [user.id]
        );
        const joinedIds = new Set(joinedRows.map(s => s.society_id));

        let latestPostRows = [];
        if (joinedRows.length > 0) {
            const ids = joinedRows.map(s => s.society_id);
            const placeholders = ids.map(() => '?').join(',');
            latestPostRows = await db.query(
                `SELECT Post.*, Society.name AS society_name FROM Post JOIN Society ON Post.society_id = Society.society_id WHERE Post.society_id IN (${placeholders}) AND Post.type != 'poll' ORDER BY Post.created_at DESC LIMIT 5`,
                ids
            );
        }

        const rsvpRows = await db.query('SELECT post_id FROM RSVP WHERE student_id = ?', [user.id]);
        const rsvpSet = new Set(rsvpRows.map(r => r.post_id));

        const latestUpdates = latestPostRows.map(p => ({
            post_id: p.post_id,
            type: p.type.charAt(0).toUpperCase() + p.type.slice(1),
            title: p.title || '',
            content: p.content,
            society_name: p.society_name || '',
            created_at: formatDate(p.created_at),
            rsvped: rsvpSet.has(p.post_id)
        }));

        res.render('student-home', {
            ...liveStudentLocals(req),
            featuredSocieties: allSocieties.filter(s => !joinedIds.has(s.society_id)),
            latestUpdates,
            currentUser: {
                ...user,
                joined_societies: joinedRows.map(s => s.name || '')
            },
            isGuest: false,
            browsePath: `${studentBase}/societies`,
            profilePath: `${studentBase}/profile/${user.id}/`,
            feedPath: `${studentBase}/feed/`,
            registerPath: null,
            rsvpBase: `${studentBase}/rsvp`
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Society directory — lists all societies from the database
app.get(`${studentBase}/societies/`, requireAuth('student'), async function(req, res) {
    try {
        const societies = await db.query('SELECT * FROM Society');
        res.render('societies', {
            ...liveStudentLocals(req),
            societies,
            societyBasePath: `${studentBase}/societies`
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Society detail page — loads the society, its members, its posts, and the student's RSVP state
app.get(`${studentBase}/societies/:id/`, requireAuth('student'), async function(req, res) {
    const user = req.session.user;
    try {
        const societyRows = await db.query('SELECT * FROM Society WHERE society_id = ?', [req.params.id]);
        if (!societyRows.length) return res.status(404).send('Society not found');

        const members = await db.query(
            'SELECT Student.* FROM Student JOIN Members ON Student.student_id = Members.student_id WHERE Members.society_id = ?',
            [req.params.id]
        );

        const posts = await db.query(
            'SELECT * FROM Post WHERE society_id = ? ORDER BY created_at DESC LIMIT 10',
            [req.params.id]
        );

        const isMember = members.some(m => m.student_id === user.id);

        const rsvpRows2 = await db.query('SELECT post_id FROM RSVP WHERE student_id = ?', [user.id]);
        const rsvpSet2 = new Set(rsvpRows2.map(r => r.post_id));

        const societyUpdates = posts.map(p => ({
            post_id: p.post_id,
            type: p.type.charAt(0).toUpperCase() + p.type.slice(1),
            title: p.title || '',
            content: p.content,
            created_at: formatDate(p.created_at),
            rsvped: rsvpSet2.has(p.post_id)
        }));

        res.render('society-detail', {
            ...liveStudentLocals(req),
            society: societyRows[0],
            members,
            societyUpdates,
            isMember,
            joinPath: `${studentBase}/societies/${req.params.id}/join`,
            leavePath: `${studentBase}/societies/${req.params.id}/leave`,
            rsvpBase: `${studentBase}/rsvp`,
            societiesBasePath: `${studentBase}/societies`
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Student profile — students can only view their own profile; redirects if the ID doesn't match
app.get(`${studentBase}/profile/:id/`, requireAuth('student'), async function(req, res) {
    const user = req.session.user;
    if (String(req.params.id) !== String(user.id)) {
        return res.redirect(`${studentBase}/profile/${user.id}/`);
    }
    try {
        const userRows = await db.query('SELECT * FROM Student WHERE student_id = ?', [user.id]);
        if (!userRows.length) return res.status(404).send('User not found');

        const joinedSocieties = await db.query(
            'SELECT Society.* FROM Society JOIN Members ON Society.society_id = Members.society_id WHERE Members.student_id = ?',
            [user.id]
        );

        res.render('profile', {
            ...liveStudentLocals(req),
            user: {
                ...userRows[0],
                joined_societies: joinedSocieties.map(s => s.name || '')
            },
            joinedSocietyObjects: joinedSocieties,
            isGuest: false,
            browsePath: `${studentBase}/societies/`,
            loginPath: '/login',
            registerPath: '/register'
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Delete student account — removes the student's RSVPs, memberships, and account row, then logs out
app.post(`${studentBase}/account/delete`, requireAuth('student'), async function(req, res) {
    const user = req.session.user;
    try {
        await db.query('DELETE FROM RSVP WHERE student_id = ?', [user.id]);
        await db.query('DELETE FROM Members WHERE student_id = ?', [user.id]);
        await db.query('DELETE FROM Student WHERE student_id = ?', [user.id]);
        req.session.destroy(() => res.redirect('/login'));
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Join a society — inserts a Members row if one doesn't already exist
app.post(`${studentBase}/societies/:id/join`, requireAuth('student'), async function(req, res) {
    const user = req.session.user;
    try {
        const existing = await db.query(
            'SELECT 1 FROM Members WHERE student_id = ? AND society_id = ?',
            [user.id, req.params.id]
        );
        if (!existing.length) {
            await db.query(
                'INSERT INTO Members (student_id, society_id) VALUES (?, ?)',
                [user.id, req.params.id]
            );
        }
        res.redirect(`${studentBase}/societies/${req.params.id}/`);
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Leave a society — removes the student's RSVPs for that society's events first,
// then removes the Members row to avoid orphaned RSVP records
app.post(`${studentBase}/societies/:id/leave`, requireAuth('student'), async function(req, res) {
    const user = req.session.user;
    try {
        await db.query(
            'DELETE RSVP FROM RSVP JOIN Post ON RSVP.post_id = Post.post_id WHERE RSVP.student_id = ? AND Post.society_id = ?',
            [user.id, req.params.id]
        );
        await db.query(
            'DELETE FROM Members WHERE student_id = ? AND society_id = ?',
            [user.id, req.params.id]
        );
        res.redirect(`${studentBase}/societies/${req.params.id}/`);
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// RSVP toggle — inserts an RSVP row if one doesn't exist, removes it if it does
// Redirects back to wherever the student came from (referer header)
app.post(`${studentBase}/rsvp/:post_id`, requireAuth('student'), async function(req, res) {
    const user = req.session.user;
    const postId = req.params.post_id;
    try {
        const existing = await db.query(
            'SELECT 1 FROM RSVP WHERE student_id = ? AND post_id = ?',
            [user.id, postId]
        );
        if (existing.length > 0) {
            await db.query('DELETE FROM RSVP WHERE student_id = ? AND post_id = ?', [user.id, postId]);
        } else {
            await db.query('INSERT INTO RSVP (student_id, post_id) VALUES (?, ?)', [user.id, postId]);
        }
        res.redirect(req.headers.referer || `${studentBase}/feed/`);
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// News feed — shows posts from joined societies; falls back to all posts if not a member of any
app.get(`${studentBase}/feed/`, requireAuth('student'), async function(req, res) {
    const user = req.session.user;
    try {
        const joinedRows = await db.query(
            'SELECT Society.* FROM Society JOIN Members ON Society.society_id = Members.society_id WHERE Members.student_id = ?',
            [user.id]
        );

        let postRows;
        if (joinedRows.length > 0) {
            const ids = joinedRows.map(s => s.society_id);
            const placeholders = ids.map(() => '?').join(',');
            postRows = await db.query(
                `SELECT Post.*, Society.name AS society_name FROM Post JOIN Society ON Post.society_id = Society.society_id WHERE Post.society_id IN (${placeholders}) AND Post.type != 'poll' ORDER BY Post.created_at DESC`,
                ids
            );
        } else {
            postRows = await db.query(
                "SELECT Post.*, Society.name AS society_name FROM Post JOIN Society ON Post.society_id = Society.society_id WHERE Post.type != 'poll' ORDER BY Post.created_at DESC"
            );
        }

        const rsvpRows = await db.query('SELECT post_id FROM RSVP WHERE student_id = ?', [user.id]);
        const rsvpSet = new Set(rsvpRows.map(r => r.post_id));

        const feedItems = postRows.map(p => ({
            post_id: p.post_id,
            type: p.type.charAt(0).toUpperCase() + p.type.slice(1),
            title: p.title || '',
            content: p.content,
            description: p.content,
            society_name: p.society_name || '',
            created_at: formatDate(p.created_at),
            rsvped: rsvpSet.has(p.post_id)
        }));

        res.render('student-feed', {
            ...liveStudentLocals(req),
            feedItems,
            joinedSocieties: joinedRows.map(s => s.name || ''),
            rsvpBase: `${studentBase}/rsvp`
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// ============================================================
// LIVE ADMIN routes — protected, role = admin
// ============================================================

const adminBase = '/admin';

// Returns nav/logo locals for all live admin pages
function liveAdminLocals() {
    return {
        navLinks: [
            { label: 'Dashboard', href: `${adminBase}/`, exact: true },
            { label: 'Manage Society', href: `${adminBase}/manage-society/` },
            { label: 'Create Post', href: `${adminBase}/create-post/` },
            { label: 'Members', href: `${adminBase}/members/` },
            { label: 'Logout', href: '/logout' }
        ],
        logoPath: `${adminBase}/`,
        headerRoleLabel: 'Admin'
    };
}

// Admin dashboard — loads the society's posts and maps RSVP counts onto event posts
app.get(`${adminBase}/`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    try {
        const posts = await db.query('SELECT * FROM Post WHERE society_id = ? ORDER BY created_at DESC', [user.id]);
        const rsvpCounts = await db.query(
            'SELECT RSVP.post_id, COUNT(*) AS count FROM RSVP JOIN Event ON RSVP.post_id = Event.post_id JOIN Post ON Event.post_id = Post.post_id WHERE Post.society_id = ? GROUP BY RSVP.post_id',
            [user.id]
        );
        const rsvpMap = {};
        rsvpCounts.forEach(r => { rsvpMap[r.post_id] = r.count; });

        res.render('admin-dashboard', {
            ...liveAdminLocals(),
            postItems: posts.map(p => ({
                post_id: p.post_id,
                type: p.type.charAt(0).toUpperCase() + p.type.slice(1),
                title: p.title || '',
                description: p.content,
                rsvp_count: p.type === 'event' ? (rsvpMap[p.post_id] || 0) : null,
                created_at: formatDate(p.created_at)
            })),
            createPostPath: `${adminBase}/create-post/`,
            manageSocietyPath: `${adminBase}/manage-society/`
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Create post page — shows a success message if redirected back with ?success=1
app.get(`${adminBase}/create-post/`, requireAuth('admin'), function(req, res) {
    res.render('create-post', {
        ...liveAdminLocals(),
        dashboardPath: `${adminBase}/`,
        createPostPath: `${adminBase}/create-post/`,
        postCreated: req.query.success === '1'
    });
});

// Create post submission — inserts the Post row, then also inserts an Event stub row
// for event-type posts because the RSVP table has a FK to Event.post_id
app.post(`${adminBase}/create-post/`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    const { title, content, type } = req.body;
    const postType = type || 'announcement';
    try {
        const result = await db.query(
            'INSERT INTO Post (society_id, type, title, content) VALUES (?, ?, ?, ?)',
            [user.id, postType, title || '', content || '']
        );
        if (postType === 'event') {
            await db.query('INSERT INTO Event (post_id) VALUES (?)', [result.insertId]);
        }
        res.redirect(`${adminBase}/create-post/?success=1`);
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Edit post page — fetches the post by ID, scoped to the logged-in society to prevent cross-society edits
app.get(`${adminBase}/posts/:post_id/edit`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    try {
        const rows = await db.query('SELECT * FROM Post WHERE post_id = ? AND society_id = ?', [req.params.post_id, user.id]);
        if (!rows.length) return res.status(404).send('Post not found');
        res.render('edit-post', {
            ...liveAdminLocals(),
            post: rows[0],
            updatePath: `${adminBase}/posts/${req.params.post_id}/update`,
            cancelPath: `${adminBase}/`
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Update post — saves new title and content, scoped to the society to prevent unauthorised edits
app.post(`${adminBase}/posts/:post_id/update`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    const { title, content } = req.body;
    try {
        await db.query(
            'UPDATE Post SET title = ?, content = ? WHERE post_id = ? AND society_id = ?',
            [title || '', content || '', req.params.post_id, user.id]
        );
        res.redirect(`${adminBase}/`);
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Delete post — cascades to Event and RSVP rows via the FK chain defined in the schema
app.post(`${adminBase}/posts/:post_id/delete`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    try {
        await db.query('DELETE FROM Post WHERE post_id = ? AND society_id = ?', [req.params.post_id, user.id]);
        res.redirect(`${adminBase}/`);
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Manage society page — loads the society profile, member list, and events with RSVP counts
app.get(`${adminBase}/manage-society/`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    try {
        const societyRows = await db.query('SELECT * FROM Society WHERE society_id = ?', [user.id]);
        const members = await db.query(
            'SELECT Student.* FROM Student JOIN Members ON Student.student_id = Members.student_id WHERE Members.society_id = ?',
            [user.id]
        );
        const events = await db.query(
            `SELECT Post.post_id, Post.title, Post.created_at,
                    (SELECT COUNT(*) FROM RSVP WHERE RSVP.post_id = Post.post_id) AS rsvp_count
             FROM Post
             WHERE Post.society_id = ? AND Post.type = 'event'
             ORDER BY Post.created_at DESC`,
            [user.id]
        );

        const eventItems = events.map(e => ({
            post_id: e.post_id,
            title: e.title || 'Untitled event',
            created_at: formatDate(e.created_at),
            rsvp_count: e.rsvp_count
        }));

        res.render('manage-society', {
            ...liveAdminLocals(),
            society: societyRows[0] || {},
            members,
            eventItems,
            dashboardPath: `${adminBase}/`,
            profileUpdated: req.query.success === '1'
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Update society profile — saves name and about_us_text, redirects with ?success=1 for the success banner
app.post(`${adminBase}/manage-society/update`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    const { name, about_us_text } = req.body;
    try {
        await db.query(
            'UPDATE Society SET name = ?, about_us_text = ? WHERE society_id = ?',
            [name || '', about_us_text || '', user.id]
        );
        res.redirect(`${adminBase}/manage-society/?success=1`);
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Delete society account — removes the Society row (cascades to Members and Posts) then logs out
app.post(`${adminBase}/account/delete`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    try {
        await db.query('DELETE FROM Society WHERE society_id = ?', [user.id]);
        req.session.destroy(() => res.redirect('/login'));
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Remove a member from the society and redirect back to the members page
app.post(`${adminBase}/manage-society/members/:student_id/remove`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    try {
        await db.query(
            'DELETE FROM Members WHERE student_id = ? AND society_id = ?',
            [req.params.student_id, user.id]
        );
        res.redirect(`${adminBase}/members/`);
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Members list — shows all students who have joined this society, ordered alphabetically
app.get(`${adminBase}/members/`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    try {
        const members = await db.query(
            'SELECT Student.* FROM Student JOIN Members ON Student.student_id = Members.student_id WHERE Members.society_id = ? ORDER BY Student.last_name, Student.first_name',
            [user.id]
        );
        res.render('users', {
            ...liveAdminLocals(),
            members,
            dashboardPath: `${adminBase}/`
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// Individual member profile view — read-only view of a student's profile from the admin side
app.get(`${adminBase}/members/:id/`, requireAuth('admin'), async function(req, res) {
    try {
        const userRows = await db.query('SELECT * FROM Student WHERE student_id = ?', [req.params.id]);
        if (!userRows.length) return res.status(404).send('User not found');

        const joinedSocieties = await db.query(
            'SELECT Society.* FROM Society JOIN Members ON Society.society_id = Members.society_id WHERE Members.student_id = ?',
            [req.params.id]
        );

        res.render('profile', {
            ...liveAdminLocals(),
            user: {
                ...userRows[0],
                joined_societies: joinedSocieties.map(s => s.name || '')
            },
            isGuest: false,
            browsePath: `${studentBase}/societies/`,
            loginPath: '/login',
            registerPath: null
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// ============================================================
// Database-backed preview routes (no auth, kept for reference)
// These keep the database visible during development without
// needing to log in as a student or organiser first.
// ============================================================

app.get("/preview/societies", function(req, res) {
    db.query('SELECT * FROM Society').then(results => {
        res.render("societies", {
            ...databasePreviewLocals(),
            societies: results,
            societyBasePath: "/preview/societies"
        });
    }).catch(err => res.send("Database error: " + err.message));
});

app.get("/preview/societies/:id", function(req, res) {
    db.query('SELECT * FROM Society WHERE society_id = ?', [req.params.id]).then(societyResults => {
        db.query(
            'SELECT Student.* FROM Student JOIN Members ON Student.student_id = Members.student_id WHERE Members.society_id = ?',
            [req.params.id]
        ).then(memberResults => {
            res.render("society-detail", {
                ...databasePreviewLocals(),
                society: societyResults[0],
                members: memberResults,
                societiesBasePath: "/preview/societies"
            });
        });
    }).catch(err => res.send("Database error: " + err.message));
});

app.get("/preview/users", function(req, res) {
    db.query('SELECT * FROM Student').then(results => {
        res.render("users", {
            ...databasePreviewLocals(),
            users: results,
            profileBasePath: "/preview/profile",
            publicSocietiesPath: "/preview/societies",
            directoryResetPath: "/preview/users"
        });
    }).catch(err => res.send("Database error: " + err.message));
});

app.get("/preview/profile/:id", function(req, res) {
    db.query('SELECT * FROM Student WHERE student_id = ?', [req.params.id]).then(results => {
        res.render("profile", {
            ...databasePreviewLocals(),
            user: results[0],
            browsePath: "/preview/societies",
            loginPath: demoPaths.login,
            registerPath: demoPaths.register
        });
    }).catch(err => res.send("Database error: " + err.message));
});

app.use(express.static("static"));

const port = Number(process.env.PORT) || 3000;

app.listen(port, function(){
    console.log(`Server running at http://127.0.0.1:${port}/`);
});
