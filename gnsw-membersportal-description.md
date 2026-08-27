# GNS Members Portal — What It Is

**GNS** stands for **Guild of Nigerian Speechwriters**. It's a professional association for people who write speeches in Nigeria (speechwriters for politicians, executives, diplomats, etc.).

The **GNS Members Portal** is a private, online dashboard where members of this guild can:

- Read articles written by other guild members
- Write and publish their own speeches and articles
- Register for events like workshops, summits, and lectures
- Take educational courses on speechwriting and public speaking
- Manage their profile and account settings
- Search through all content in the portal

**Important:** This is a prototype/demo. There is no real backend server or database. Everything is stored in the browser's local memory (localStorage), and all content is fake sample data. It's meant to show what the real app would look and feel like.

---

# Membership Tiers

There are 3 levels of membership:

| Tier | Abbreviation | Publishing Limit |
|---|---|---|
| Associate | AGNS | 3 articles per month |
| Partner | PGNS | Unlimited |
| Fellow | FGNS | Unlimited |

Higher tiers unlock more features (like certain courses).

---

# All Parts of the App and What They Do

## 1. Login Page
The entry point. Members sign in with email and password. There are 3 test accounts for demo purposes. Once signed in, you go to the dashboard.

## 2. Dashboard (Home Feed)
The main landing page. Shows a feed of articles from guild members, like a news feed. You can filter by:
- **For You** — recommended articles
- **Latest** — newest first
- **Saved** — articles you've bookmarked
- **Categories** — different topics like Speech Writing, Politics, Rhetoric, etc.

## 3. Article Reader
When you click an article from the feed, you can read the full article. It shows the title, author, date, a like button, view count, comments, the full article body, tags, author bio, and links to related articles.

## 4. My Writing (Drafts & Published)
This is where members create and manage their own content. It has two tabs:
- **Drafts** — work-in-progress articles not yet published
- **Published** — articles the member has already published

From here you can create new drafts, edit drafts, publish drafts, unpublish posts, copy links, share, and delete.

## 5. The Editor (Draft Editor)
A full-screen rich text editor for writing articles. It works like a mini Word document with:
- Bold, italic, underline, highlight
- Headings (H2, H3)
- Links, quotes, images
- Bullet and numbered lists
- Tables
- Undo/redo

On the side panel you can add:
- **Tags** — up to 5 keywords
- **Excerpt** — a short summary
- **Category** — what topic it belongs to
- **Cover image** — drag and drop a photo

The editor auto-saves your work as you type.

## 6. Publishing
When you click "Publish," the app checks that:
- There's a title
- At least 1 tag is added
- A category is selected
- There's a cover image (or it grabs the first image from the article)
- The article is at least 100 words long

Once published, it appears in the "Published" tab and can be viewed by other members.

## 7. Events
A page listing guild events like summits, workshops, public lectures, and guild meetings. Members can browse events and RSVP to reserve a spot.

## 8. Learning / Courses
An online course library where members take educational courses on speechwriting, rhetoric, public speaking, etc. Features:
- Courses organized by category
- Search and filter
- Progress tracking (percentage complete)
- "Resume Learning" to continue where you left off
- Some courses are locked for higher-tier members

## 9. Profile
A member's personal page where they can:
- Set their display name and bio
- Upload a profile photo
- Add links to website, Twitter, LinkedIn
- See writing stats (drafts count, published count, total views, total claps)
- See recent activity

## 10. Settings
Where members control their account preferences:
- **Notifications** — what emails they receive
- **Privacy** — whether they appear in the member directory, show writing publicly, etc.
- **Preferences** — font size (small/medium/large)
- **Account** — change password, see membership tier, delete account (simulated)

## 11. Search
A global search that looks through articles, events, courses, and the member directory all at once.

---

# Key Things to Know

- **It's a demo** — all data is fake sample data, not real content
- **No backend** — everything runs in your browser, nothing is sent to a server
- **No real security** — passwords are hardcoded in the code
- **Each browser is isolated** — data on one computer is not shared with another
- **Images are stored as text** — photos are converted to base64 and stored in the browser
- **Everything persists in localStorage** — close the browser and come back, your data is still there