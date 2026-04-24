"use strict";

// Frontend-only demo data used by the /demo/* routes and the preview generator.
function formatSocietyName(email) {
    const localPart = email ? email.split("@")[0] : "society";
    const words = localPart.split(/[._-]/).filter(Boolean).map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return `${words.join(" ") || "Society"} Society`;
}

function studentNav(basePath) {
    return [
        { label: "Home", href: `${basePath}/`, exact: true },
        { label: "Societies", href: `${basePath}/societies/` },
        { label: "News", href: `${basePath}/feed/` },
        { label: "Profile", href: `${basePath}/profile/1/`, icon: "profile" }
    ];
}

function adminNav(basePath) {
    return [
        { label: "Dashboard", href: `${basePath}/`, exact: true },
        { label: "Manage Society", href: `${basePath}/manage-society/` },
        { label: "Create Post", href: `${basePath}/create-post/` },
        { label: "Members", href: `${basePath}/members/` }
    ];
}

// Student-facing placeholder societies used across home, directory, profile, and feed pages.
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

const sampleUsers = sampleMembers.map((member, index) => {
    const joined = sampleSocieties
        .filter((_, societyIndex) => societyIndex === index % sampleSocieties.length || societyIndex === 0)
        .map((society) => formatSocietyName(society.email));

    return {
        ...member,
        favorite_societies: sampleSocieties.slice(0, 2).map((society) => formatSocietyName(society.email)),
        joined_societies: joined
    };
});

const sampleUser = sampleUsers[0];

const guestUser = {
    first_name: "Guest",
    last_name: "",
    email: "guest@preview",
    joined_societies: []
};

// Placeholder content blocks that keep the current live frontend populated.
const latestUpdates = [
    {
        type: "Announcement",
        society_name: "Coding Society",
        title: "Coding Society announced a beginner workshop",
        content: "A guided intro session for students who want to start building small projects.",
        created_at: "Today 2:15 PM"
    },
    {
        type: "Event",
        society_name: "Film Society",
        title: "Film Society screening night",
        content: "An evening screening followed by a student discussion on cinematography and storytelling.",
        event_date: "Thursday 6:00 PM"
    },
    {
        type: "News",
        society_name: "Running Society",
        title: "Running Society weekend loop",
        content: "A relaxed social run is open to students across all experience levels.",
        created_at: "This week"
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

const feedItems = [
    {
        type: "Announcement",
        title: "Coding Society room change",
        content: "Tonight's session has moved to the library collaboration space.",
        society_name: "Coding Society",
        image_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
        created_at: "Today"
    },
    {
        type: "Event",
        title: "Running Society morning loop",
        description: "A short campus run open to all fitness levels before lectures begin.",
        society_name: "Running Society",
        image_url: "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=900&q=80",
        event_date: "Tomorrow 8:00 AM"
    },
    {
        type: "Poll",
        title: "Film Society genre vote",
        content: "Members are choosing the next screening theme for the month.",
        society_name: "Film Society",
        image_url: "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=900&q=80",
        created_at: "This week"
    },
    {
        type: "Announcement",
        title: "Film Society post-screening discussion",
        content: "A new discussion circle has been added after Thursday's screening.",
        society_name: "Film Society",
        image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
        created_at: "This week"
    }
];

const postItems = [
    { type: "Announcement", title: "Welcome meeting reminder", description: "A reminder post for the next weekly society session." },
    { type: "Event", title: "Term workshop drop", description: "An event item announcing the next coding workshop." },
    { type: "Poll", title: "Member feedback poll", description: "A quick poll asking students which topics they want next." }
];

const eventItems = [
    { title: "Intro Workshop", description: "A practical beginner session for new members.", event_date: "Wednesday 5:00 PM" },
    { title: "Hack Night", description: "An evening build session for society members.", event_date: "Friday 7:00 PM" }
];

module.exports = {
    adminNav,
    eventItems,
    feedItems,
    formatSocietyName,
    guestUser,
    latestUpdates,
    postItems,
    sampleMembers,
    sampleSocieties,
    sampleUser,
    sampleUsers,
    societyUpdates,
    studentNav
};
