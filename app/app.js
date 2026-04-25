const path = require("path");
const express = require("express");
const session = require("express-session");
var app = express();

app.set('view engine', 'pug');
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'society-hub-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

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

// Derive a display name from a society email (e.g. "coding@..." -> "Coding Society")
function formatSocietyName(email) {
    if (!email) return 'Society';
    const localPart = email.split('@')[0];
    const words = localPart.split(/[._-]/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1));
    return (words.join(' ') || 'Society') + ' Society';
}

function formatDate(dt) {
    if (!dt) return 'Recent';
    return new Date(dt).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Auth middleware — redirects to /login if session is missing or wrong role
function requireAuth(role) {
    return function(req, res, next) {
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }
        if (role && req.session.user.role !== role) {
            return req.session.user.role === 'student'
                ? res.redirect('/student/')
                : res.redirect('/admin/');
        }
        next();
    };
}

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

// ============================================================
// Entry pages
// ============================================================

app.get("/", function(req, res) {
    if (req.session && req.session.user) {
        return req.session.user.role === 'student'
            ? res.redirect('/student/')
            : res.redirect('/admin/');
    }
    renderEntryView(res, "index");
});

app.get(demoPaths.login, function(req, res) {
    if (req.session && req.session.user) {
        return req.session.user.role === 'student'
            ? res.redirect('/student/')
            : res.redirect('/admin/');
    }
    renderEntryView(res, "login", { loginError: req.query.error === '1' });
});

app.post('/login', async function(req, res) {
    const { email, password, role } = req.body;

    try {
        if (role === 'admin') {
            const results = await db.query(
                'SELECT * FROM Society WHERE email = ? AND password = ?',
                [email, password]
            );
            if (results.length > 0) {
                req.session.user = {
                    id: results[0].society_id,
                    role: 'admin',
                    email: results[0].email
                };
                return res.redirect('/admin/');
            }
        } else {
            const results = await db.query(
                'SELECT * FROM Student WHERE email = ? AND password = ?',
                [email, password]
            );
            if (results.length > 0) {
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

app.get('/logout', function(req, res) {
    req.session.destroy(() => res.redirect('/login'));
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

app.post('/register', async function(req, res) {
    const { email, first_name, last_name, password } = req.body;
    try {
        await db.query(
            'INSERT INTO Student (email, first_name, last_name, password) VALUES (?, ?, ?, ?)',
            [email, first_name || '', last_name || '', password || '']
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

app.post('/register/admin', async function(req, res) {
    const { email, about_us_text, password } = req.body;
    try {
        await db.query(
            'INSERT INTO Society (email, about_us_text, password) VALUES (?, ?, ?)',
            [email, about_us_text || '', password || '']
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

app.get("/demo/", function(req, res) {
    res.redirect(`${demoPaths.studentBase}/`);
});

// Demo routes (mock data, no auth required)
registerStudentDemoRoutes(demoPaths.studentBase, "Student", sampleUser, { isGuest: false });
registerStudentDemoRoutes(demoPaths.guestBase, "Guest", guestUser, { isGuest: true });
registerAdminDemoRoutes(demoPaths.adminBase);

// ============================================================
// STUDENT routes — protected, role = student
// ============================================================

const studentBase = '/student';

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
                `SELECT Post.*, Society.email AS society_email FROM Post JOIN Society ON Post.society_id = Society.society_id WHERE Post.society_id IN (${placeholders}) AND Post.type != 'poll' ORDER BY Post.created_at DESC LIMIT 5`,
                ids
            );
        }

        const rsvpRows = await db.query('SELECT post_id FROM RSVP WHERE student_id = ?', [user.id]);
        const rsvpSet = new Set(rsvpRows.map(r => r.post_id));

        const latestUpdates = latestPostRows.map(p => ({
            post_id: p.post_id,
            type: p.type.charAt(0).toUpperCase() + p.type.slice(1),
            title: p.content.length > 60 ? p.content.substring(0, 60) + '...' : p.content,
            content: p.content,
            society_name: formatSocietyName(p.society_email),
            created_at: formatDate(p.created_at),
            rsvped: rsvpSet.has(p.post_id)
        }));

        res.render('student-home', {
            ...liveStudentLocals(req),
            featuredSocieties: allSocieties.filter(s => !joinedIds.has(s.society_id)),
            latestUpdates,
            currentUser: {
                ...user,
                joined_societies: joinedRows.map(s => formatSocietyName(s.email))
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
            title: p.content.length > 60 ? p.content.substring(0, 60) + '...' : p.content,
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
                joined_societies: joinedSocieties.map(s => formatSocietyName(s.email))
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
                `SELECT Post.*, Society.email AS society_email FROM Post JOIN Society ON Post.society_id = Society.society_id WHERE Post.society_id IN (${placeholders}) AND Post.type != 'poll' ORDER BY Post.created_at DESC`,
                ids
            );
        } else {
            postRows = await db.query(
                "SELECT Post.*, Society.email AS society_email FROM Post JOIN Society ON Post.society_id = Society.society_id WHERE Post.type != 'poll' ORDER BY Post.created_at DESC"
            );
        }

        const rsvpRows = await db.query('SELECT post_id FROM RSVP WHERE student_id = ?', [user.id]);
        const rsvpSet = new Set(rsvpRows.map(r => r.post_id));

        const feedItems = postRows.map(p => ({
            post_id: p.post_id,
            type: p.type.charAt(0).toUpperCase() + p.type.slice(1),
            title: p.content.length > 60 ? p.content.substring(0, 60) + '...' : p.content,
            content: p.content,
            description: p.content,
            society_name: formatSocietyName(p.society_email),
            created_at: formatDate(p.created_at),
            rsvped: rsvpSet.has(p.post_id)
        }));

        res.render('student-feed', {
            ...liveStudentLocals(req),
            feedItems,
            joinedSocieties: joinedRows.map(s => formatSocietyName(s.email)),
            rsvpBase: `${studentBase}/rsvp`
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

// ============================================================
// ADMIN routes — protected, role = admin
// ============================================================

const adminBase = '/admin';

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

app.get(`${adminBase}/`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    try {
        const posts = await db.query('SELECT * FROM Post WHERE society_id = ? ORDER BY created_at DESC', [user.id]);
        const events = await db.query(
            'SELECT Event.*, Post.content FROM Event JOIN Post ON Event.post_id = Post.post_id WHERE Post.society_id = ?',
            [user.id]
        );
        const memberRows = await db.query('SELECT COUNT(*) AS count FROM Members WHERE society_id = ?', [user.id]);
        const rsvpRows = await db.query(
            'SELECT COUNT(*) AS count FROM RSVP WHERE post_id IN (SELECT post_id FROM Post WHERE society_id = ?)',
            [user.id]
        );

        res.render('admin-dashboard', {
            ...liveAdminLocals(),
            postsCount: posts.length,
            eventsCount: events.length,
            membersCount: memberRows[0].count,
            rsvpCount: rsvpRows[0].count,
            postItems: posts.map(p => ({
                type: p.type.charAt(0).toUpperCase() + p.type.slice(1),
                title: p.content.length > 60 ? p.content.substring(0, 60) + '...' : p.content,
                description: p.content
            })),
            createPostPath: `${adminBase}/create-post/`,
            manageSocietyPath: `${adminBase}/manage-society/`
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

app.get(`${adminBase}/create-post/`, requireAuth('admin'), function(req, res) {
    res.render('create-post', {
        ...liveAdminLocals(),
        dashboardPath: `${adminBase}/`,
        createPostPath: `${adminBase}/create-post/`,
        postCreated: req.query.success === '1'
    });
});

app.post(`${adminBase}/create-post/`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    const { content, type } = req.body;
    try {
        await db.query(
            'INSERT INTO Post (society_id, type, content) VALUES (?, ?, ?)',
            [user.id, type || 'announcement', content || '']
        );
        res.redirect(`${adminBase}/create-post/?success=1`);
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

app.get(`${adminBase}/manage-society/`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    try {
        const societyRows = await db.query('SELECT * FROM Society WHERE society_id = ?', [user.id]);
        const members = await db.query(
            'SELECT Student.* FROM Student JOIN Members ON Student.student_id = Members.student_id WHERE Members.society_id = ?',
            [user.id]
        );
        const events = await db.query(
            'SELECT Event.*, Post.content FROM Event JOIN Post ON Event.post_id = Post.post_id WHERE Post.society_id = ?',
            [user.id]
        );

        const eventItems = events.map(e => ({
            title: e.content.length > 60 ? e.content.substring(0, 60) + '...' : e.content,
            description: e.content,
            event_date: e.event_date ? formatDate(e.event_date) : 'Date TBD'
        }));

        res.render('manage-society', {
            ...liveAdminLocals(),
            society: societyRows[0] || {},
            members,
            eventItems,
            dashboardPath: `${adminBase}/`
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

app.post(`${adminBase}/manage-society/members/:student_id/remove`, requireAuth('admin'), async function(req, res) {
    const user = req.session.user;
    try {
        await db.query(
            'DELETE FROM Members WHERE student_id = ? AND society_id = ?',
            [req.params.student_id, user.id]
        );
        res.redirect(`${adminBase}/manage-society/`);
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

app.get(`${adminBase}/members/`, requireAuth('admin'), async function(req, res) {
    try {
        const users = await db.query('SELECT * FROM Student ORDER BY last_name, first_name');
        res.render('users', {
            ...liveAdminLocals(),
            users,
            profileBasePath: `${adminBase}/members`,
            dashboardPath: `${adminBase}/`,
            publicSocietiesPath: `${studentBase}/societies/`,
            directoryResetPath: `${adminBase}/members/`
        });
    } catch (err) {
        res.send('Database error: ' + err.message);
    }
});

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
                joined_societies: joinedSocieties.map(s => formatSocietyName(s.email))
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
