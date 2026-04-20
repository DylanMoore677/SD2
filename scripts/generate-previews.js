"use strict";

const fs = require("fs");
const path = require("path");
const pug = require("pug");

const rootDir = path.resolve(__dirname, "..");
const viewsDir = path.join(rootDir, "app", "views");
const outputDir = path.join(rootDir, "static", "previews");

fs.mkdirSync(outputDir, { recursive: true });

const sampleSocieties = [
    {
        society_id: 1,
        email: "coding@roehampton.ac.uk",
        about_us_text: "Hackathons, talks, coding challenges, and project nights for students at every level.",
        tags: ["Technology", "Projects", "Community"],
        logo_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80"
    },
    {
        society_id: 2,
        email: "film@roehampton.ac.uk",
        about_us_text: "Weekly screenings, themed discussions, and film recommendations from across different genres.",
        tags: ["Arts", "Culture", "Screenings"],
        logo_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80"
    },
    {
        society_id: 3,
        email: "running@roehampton.ac.uk",
        about_us_text: "Friendly campus runs, training sessions, and wellbeing-focused group meetups every week.",
        tags: ["Sports", "Wellbeing", "Community"],
        logo_url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80"
    }
];

const sampleMembers = [
    { student_id: 1, first_name: "Jane", last_name: "Doe", email: "jane@roehampton.ac.uk" },
    { student_id: 2, first_name: "Amir", last_name: "Khan", email: "amir@roehampton.ac.uk" },
    { student_id: 3, first_name: "Lucy", last_name: "Brown", email: "lucy@roehampton.ac.uk" },
    { student_id: 4, first_name: "Daniel", last_name: "Evans", email: "daniel@roehampton.ac.uk" }
];

const sampleUser = {
    student_id: 1,
    first_name: "Jane",
    last_name: "Doe",
    email: "jane@roehampton.ac.uk",
    favorite_societies: ["Coding Society", "Film Society"],
    joined_societies: ["Coding Society", "Running Society"]
};

const latestUpdates = [
    {
        type: "Announcement",
        title: "Coding Society announced a beginner workshop",
        content: "A guided intro session for students who want to start building small projects.",
        created_at: "Today"
    },
    {
        type: "Event",
        title: "Film Society screening night",
        content: "An evening screening followed by a student discussion on cinematography and storytelling.",
        event_date: "Thursday 6:00 PM"
    }
];

const societyUpdates = [
    {
        type: "Announcement",
        title: "Welcome-back coding meetup",
        content: "Join the first project night of the term and meet other student developers.",
        created_at: "Today"
    },
    {
        type: "Event",
        title: "Weekend hack session",
        description: "Bring your ideas and build with other members in a relaxed group workspace.",
        event_date: "Saturday 2:00 PM"
    }
];

const recentStudentEvents = [
    {
        type: "RSVP",
        title: "Hack Night RSVP confirmed",
        description: "Your place has been saved for the next coding event.",
        event_date: "Friday 7:00 PM"
    },
    {
        type: "Event",
        title: "Film Society discussion evening",
        description: "You are following updates for the next film screening and discussion.",
        created_at: "Updated yesterday"
    }
];

const feedItems = [
    {
        type: "Announcement",
        title: "Coding Society room change",
        content: "Tonight's session has moved to the library collaboration space.",
        society_name: "Coding Society",
        created_at: "Today"
    },
    {
        type: "Event",
        title: "Running Society morning loop",
        description: "A short campus run open to all fitness levels before lectures begin.",
        society_name: "Running Society",
        event_date: "Tomorrow 8:00 AM"
    },
    {
        type: "Poll",
        title: "Film Society genre vote",
        content: "Members are choosing the next screening theme for the month.",
        society_name: "Film Society",
        created_at: "This week"
    }
];

const overviewStats = [
    { value: 12, label: "Posts", helper: "Announcements, polls, and event posts currently in the organiser view." },
    { value: 4, label: "Events", helper: "Upcoming event items being planned across the society." },
    { value: 38, label: "Members", helper: "Current member count visible to organisers in dashboard views." },
    { value: 16, label: "RSVPs", helper: "Attendance responses that can be monitored from organiser tools." }
];

const activityItems = [
    {
        type: "Publishing",
        title: "New announcement drafted",
        description: "A reminder post about the next society meeting is waiting for review.",
        created_at: "1 hour ago"
    },
    {
        type: "Attendance",
        title: "Hack Night RSVP list updated",
        description: "Three new attendees were added to the latest event attendance preview.",
        created_at: "Today"
    }
];

const contentQueue = [
    { type: "Draft", title: "Event follow-up post", description: "A short recap post is waiting to be reviewed before publishing." },
    { type: "Poll", title: "Member feedback poll", description: "A draft poll asking members about future workshop topics." }
];

const quickItems = [
    { kicker: "Directory", title: "Review member records", description: "Jump straight into student records and existing profile pages." },
    { kicker: "Publishing", title: "Create post flow", description: "Move into a dedicated organiser post page for announcements, events, and polls." },
    { kicker: "Profile", title: "Update society details", description: "Use the edit page to keep the public-facing society information up to date." }
];

const postItems = [
    { title: "Welcome meeting reminder", description: "An organiser draft reminding members about the next weekly session." },
    { title: "Term feedback poll", description: "A quick post asking members what they want more of this term." }
];

const eventItems = [
    { title: "Intro Workshop", description: "A practical beginner session for new members.", event_date: "Wednesday 5:00 PM" },
    { title: "Hack Night", description: "An evening build session for society members.", event_date: "Friday 7:00 PM" }
];

const rsvpItems = [
    { student_name: "Jane Doe", event_name: "Hack Night", status: "Going", note: "Arriving early" },
    { student_name: "Amir Khan", event_name: "Intro Workshop", status: "Interested", note: "Needs room details" }
];

const draftItems = [
    { type: "Draft", title: "Workshop reminder", description: "Pending organiser message for the weekend build session." },
    { type: "Poll", title: "Future topics survey", description: "A draft poll to gather ideas for new workshops." }
];

const previewPages = [
    {
        template: "index.pug",
        output: "student-home.html",
        title: "Student Home",
        locals: {
            featuredSocieties: sampleSocieties,
            latestUpdates
        }
    },
    {
        template: "societies.pug",
        output: "browse-societies.html",
        title: "Browse Societies",
        locals: {
            societies: sampleSocieties,
            prototypeMessage: "Preview page using sample data."
        }
    },
    {
        template: "society-detail.pug",
        output: "single-society.html",
        title: "Single Society",
        locals: {
            society: sampleSocieties[0],
            members: sampleMembers,
            societyUpdates,
            prototypeMessage: "Preview page using sample data."
        }
    },
    {
        template: "profile.pug",
        output: "student-profile.html",
        title: "Student Profile",
        locals: {
            user: sampleUser,
            recentStudentEvents,
            showPrototypeNotice: true
        }
    },
    {
        template: "student-feed.pug",
        output: "student-feed.html",
        title: "Student Feed",
        locals: {
            feedItems,
            joinedSocieties: sampleUser.joined_societies
        }
    },
    {
        template: "login.pug",
        output: "organiser-access.html",
        title: "Organiser Access",
        locals: {}
    },
    {
        template: "users.pug",
        output: "member-directory.html",
        title: "Member Directory",
        locals: {
            users: sampleMembers,
            prototypeMessage: "Preview page using sample data."
        }
    },
    {
        template: "admin-dashboard.pug",
        output: "admin-dashboard.html",
        title: "Admin Dashboard",
        locals: {
            postsCount: 12,
            eventsCount: 4,
            membersCount: 38,
            rsvpCount: 16,
            quickItems
        }
    },
    {
        template: "manage-society.pug",
        output: "manage-society.html",
        title: "Manage Society",
        locals: {
            society: sampleSocieties[0],
            members: sampleMembers,
            postItems,
            eventItems
        }
    },
    {
        template: "create-post.pug",
        output: "create-post.html",
        title: "Create Post",
        locals: {
            selectedPostType: "event"
        }
    },
    {
        template: "members-rsvp.pug",
        output: "members-rsvp.html",
        title: "Members and RSVP",
        locals: {
            members: sampleMembers,
            rsvpItems
        }
    },
    {
        template: "edit-society-profile.pug",
        output: "edit-society-profile.html",
        title: "Edit Society Profile",
        locals: {
            society: sampleSocieties[0]
        }
    },
    {
        template: "organiser-dashboard.pug",
        output: "organiser-dashboard.html",
        title: "Organiser Dashboard",
        locals: {
            overviewStats,
            activityItems,
            contentQueue
        }
    },
    {
        template: "organiser-workspace.pug",
        output: "organiser-workspace.html",
        title: "Organiser Workspace",
        locals: {
            members: sampleMembers,
            rsvpItems,
            draftItems
        }
    }
];

function compilePreview(page) {
    const templatePath = path.join(viewsDir, page.template);
    const html = pug.compileFile(templatePath)(page.locals);
    fs.writeFileSync(path.join(outputDir, page.output), html, "utf8");
}

function buildPreviewHub() {
    const links = previewPages.map((page) => {
        return `
          <article class="info-card">
            <p class="card-kicker">Fake Data Preview</p>
            <h3 class="card-title">${page.title}</h3>
            <p class="card-text">${page.output}</p>
            <div class="btn-row">
              <a class="btn btn-outline" href="/previews/${page.output}">Open Preview</a>
            </div>
          </article>`;
    }).join("");

    const hubHtml = `<!doctype html>
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
            <h1 class="page-title">Open the site with fake data</h1>
            <p class="page-subtitle">These preview pages are compiled from your Pug templates into static HTML and served through the existing app, so you can review unrouted pages without changing backend logic.</p>
            <div class="btn-row">
              <a class="btn btn-primary" href="/">Open Live Home</a>
              <a class="btn btn-outline" href="/preview/societies">Open Live Societies</a>
              <a class="btn btn-outline" href="/login">Open Live Login</a>
            </div>
          </header>

          <section class="section-block">
            <div class="section-heading">
              <p class="eyebrow">How This Works</p>
              <h2>Frontend previews with sample data</h2>
              <p>Use these links to preview pages that are not yet routed or pages that need richer mock data than your current backend provides.</p>
            </div>
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

    fs.writeFileSync(path.join(outputDir, "index.html"), hubHtml, "utf8");
}

previewPages.forEach(compilePreview);
buildPreviewHub();

console.log(`Generated ${previewPages.length} preview pages in ${outputDir}`);
