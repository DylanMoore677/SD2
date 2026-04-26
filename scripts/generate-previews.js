"use strict";

// Static preview generator.
// Compiles the live Pug templates into standalone HTML files under static/previews
// using the same mock data that powers the /demo/* routes.

const fs = require("fs");
const path = require("path");
const pug = require("pug");
const previewData = require("../app/services/preview-data");

const rootDir = path.resolve(__dirname, "..");
const viewsDir = path.join(rootDir, "app", "views");
const previewDir = path.join(rootDir, "static", "previews");
const legacyGeneratedDirs = [
    path.join(rootDir, "static", "student"),
    path.join(rootDir, "static", "guest"),
    path.join(rootDir, "static", "admin"),
    path.join(rootDir, "static", "register")
];

// Shared demo route map used when compiling links into the standalone previews.
const demoPaths = Object.freeze({
    login: "/login",
    register: "/register/",
    adminRegister: "/register/admin/",
    studentBase: "/demo/student",
    guestBase: "/demo/guest",
    adminBase: "/demo/admin"
});

// Preview output is rebuilt from scratch, and old generated route folders are removed
// so stale HTML cannot shadow live routes or confuse reviewers.
[previewDir, ...legacyGeneratedDirs].forEach((dir) => {
    fs.rmSync(dir, { recursive: true, force: true });
});
fs.mkdirSync(previewDir, { recursive: true });

// Small filesystem helpers used by the preview compilation steps below.
function ensureDir(targetDir) {
    fs.mkdirSync(targetDir, { recursive: true });
}

function writePreview(relativePath, html) {
    const outputPath = path.join(previewDir, relativePath);
    ensureDir(path.dirname(outputPath));
    fs.writeFileSync(outputPath, html, "utf8");
}

function compileTemplate(template, locals) {
    return pug.compileFile(path.join(viewsDir, template))(locals);
}

// Mock content shared with the routed /demo/* experience.
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
    societyUpdates,
    studentNav
} = previewData;

// Builds a simple hub page that links to each generated preview file.
function buildPreviewHub() {
    const links = [
        { title: "Welcome Page", href: "/", description: "Frontend entry screen that links into the demo experience." },
        { title: "Login", href: demoPaths.login, description: "Login UI wired into the isolated demo routes." },
        { title: "Register", href: demoPaths.register, description: "Registration UI that stays in the frontend demo flow." },
        { title: "Student Demo", href: `${demoPaths.studentBase}/`, description: "Student dashboard, societies, news, and profile demo." },
        { title: "Guest Demo", href: `${demoPaths.guestBase}/`, description: "Guest browsing flow using the same student-facing UI." },
        { title: "Admin Demo", href: `${demoPaths.adminBase}/`, description: "Organiser dashboard, member directory, and management pages." }
    ].map((item) => {
        return `
          <article class="info-card">
            <p class="card-kicker">Preview</p>
            <h3 class="card-title">${item.title}</h3>
            <p class="card-text">${item.description}</p>
            <div class="btn-row">
              <a class="btn btn-outline" href="${item.href}">Open</a>
            </div>
          </article>`;
    }).join("");

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Society Hub Preview Hub</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="crossorigin" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" />
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div class="page-shell">
      <main class="content">
        <div class="page-container content-stack">
          <header class="page-header">
            <p class="eyebrow">Preview Hub</p>
            <h1 class="page-title">Open the frontend with demo data</h1>
            <p class="page-subtitle">Use these links to review the current frontend UI without mixing preview content into the main application routes.</p>
          </header>
          <section class="section-block">
            <div class="card-grid cols-3">
              ${links}
            </div>
          </section>
        </div>
      </main>
    </div>
    <script src="/site.js"></script>
  </body>
</html>`;

    writePreview("index.html", html);
}

// Compiles each standalone preview page using the same view templates as the app.
function buildStandalonePreviews() {
    const previews = [
        {
            file: "welcome.html",
            template: "index.pug",
            locals: {
                registerPath: demoPaths.register,
                loginPath: demoPaths.login,
                guestPath: `${demoPaths.guestBase}/`,
                studentHomePath: `${demoPaths.studentBase}/`,
                adminHomePath: `${demoPaths.adminBase}/`,
                adminRegisterPath: demoPaths.adminRegister
            }
        },
        {
            file: "login.html",
            template: "login.pug",
            locals: {
                registerPath: demoPaths.register,
                guestPath: `${demoPaths.guestBase}/`,
                studentHomePath: `${demoPaths.studentBase}/`,
                adminHomePath: `${demoPaths.adminBase}/`,
                adminRegisterPath: demoPaths.adminRegister
            }
        },
        {
            file: "register-student.html",
            template: "register.pug",
            locals: {
                defaultRegistrationRole: "student",
                loginPath: demoPaths.login,
                guestPath: `${demoPaths.guestBase}/`,
                studentHomePath: `${demoPaths.studentBase}/`,
                adminHomePath: `${demoPaths.adminBase}/`
            }
        },
        {
            file: "register-admin.html",
            template: "register.pug",
            locals: {
                defaultRegistrationRole: "admin",
                loginPath: demoPaths.login,
                guestPath: `${demoPaths.guestBase}/`,
                studentHomePath: `${demoPaths.studentBase}/`,
                adminHomePath: `${demoPaths.adminBase}/`
            }
        },
        {
            file: "student-home.html",
            template: "student-home.pug",
            locals: {
                featuredSocieties: sampleSocieties,
                latestUpdates,
                currentUser: sampleUser,
                navLinks: studentNav(demoPaths.studentBase),
                logoPath: `${demoPaths.studentBase}/`,
                headerRoleLabel: "Student",
                browsePath: `${demoPaths.studentBase}/societies`,
                profilePath: `${demoPaths.studentBase}/profile/1`,
                feedPath: `${demoPaths.studentBase}/feed/`,
                registerPath: demoPaths.register
            }
        },
        {
            file: "guest-home.html",
            template: "student-home.pug",
            locals: {
                featuredSocieties: sampleSocieties,
                latestUpdates,
                isGuest: true,
                currentUser: guestUser,
                navLinks: studentNav(demoPaths.guestBase),
                logoPath: `${demoPaths.guestBase}/`,
                headerRoleLabel: "Guest",
                browsePath: `${demoPaths.guestBase}/societies`,
                profilePath: `${demoPaths.guestBase}/profile/1`,
                feedPath: `${demoPaths.guestBase}/feed/`,
                registerPath: demoPaths.register
            }
        },
        {
            file: "browse-societies.html",
            template: "societies.pug",
            locals: {
                societies: sampleSocieties,
                societyBasePath: `${demoPaths.studentBase}/societies`,
                navLinks: studentNav(demoPaths.studentBase),
                logoPath: `${demoPaths.studentBase}/`,
                headerRoleLabel: "Student"
            }
        },
        {
            file: "single-society.html",
            template: "society-detail.pug",
            locals: {
                society: sampleSocieties[0],
                members: sampleMembers,
                societyUpdates,
                societiesBasePath: `${demoPaths.studentBase}/societies`,
                navLinks: studentNav(demoPaths.studentBase),
                logoPath: `${demoPaths.studentBase}/`,
                headerRoleLabel: "Student"
            }
        },
        {
            file: "student-profile.html",
            template: "profile.pug",
            locals: {
                user: sampleUser,
                browsePath: `${demoPaths.studentBase}/societies/`,
                loginPath: demoPaths.login,
                registerPath: demoPaths.register,
                navLinks: studentNav(demoPaths.studentBase),
                logoPath: `${demoPaths.studentBase}/`,
                headerRoleLabel: "Student"
            }
        },
        {
            file: "student-feed.html",
            template: "student-feed.pug",
            locals: {
                feedItems,
                joinedSocieties: sampleUser.joined_societies,
                navLinks: studentNav(demoPaths.studentBase),
                logoPath: `${demoPaths.studentBase}/`,
                headerRoleLabel: "Student"
            }
        },
        {
            file: "admin-dashboard.html",
            template: "admin-dashboard.pug",
            locals: {
                postsCount: postItems.length,
                eventsCount: eventItems.length,
                membersCount: sampleMembers.length,
                rsvpCount: 16,
                postItems,
                createPostPath: `${demoPaths.adminBase}/create-post/`,
                manageSocietyPath: `${demoPaths.adminBase}/manage-society/`,
                navLinks: adminNav(demoPaths.adminBase),
                logoPath: `${demoPaths.adminBase}/`,
                headerRoleLabel: "Admin"
            }
        },
        {
            file: "create-post.html",
            template: "create-post.pug",
            locals: {
                dashboardPath: `${demoPaths.adminBase}/`,
                navLinks: adminNav(demoPaths.adminBase),
                logoPath: `${demoPaths.adminBase}/`,
                headerRoleLabel: "Admin"
            }
        },
        {
            file: "manage-society.html",
            template: "manage-society.pug",
            locals: {
                society: sampleSocieties[0],
                members: sampleMembers,
                eventItems,
                dashboardPath: `${demoPaths.adminBase}/`,
                navLinks: adminNav(demoPaths.adminBase),
                logoPath: `${demoPaths.adminBase}/`,
                headerRoleLabel: "Admin"
            }
        },
        {
            file: "member-directory.html",
            template: "users.pug",
            locals: {
                users: sampleMembers,
                profileBasePath: `${demoPaths.studentBase}/profile`,
                dashboardPath: `${demoPaths.adminBase}/`,
                publicSocietiesPath: `${demoPaths.studentBase}/societies/`,
                directoryResetPath: `${demoPaths.adminBase}/members/`,
                navLinks: adminNav(demoPaths.adminBase),
                logoPath: `${demoPaths.adminBase}/`,
                headerRoleLabel: "Admin"
            }
        }
    ];

    previews.forEach((page) => {
        writePreview(page.file, compileTemplate(page.template, page.locals));
    });
}

buildPreviewHub();
buildStandalonePreviews();

console.log(`Generated preview pages in ${previewDir}`);
console.log("Removed legacy generated route folders from static/student, static/guest, static/admin, and static/register");
