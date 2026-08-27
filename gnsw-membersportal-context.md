# GNS Members Portal — Complete Project Context for AI Models

## 1. WHAT IS GNS?

**GNS** stands for **"Guild of Nigerian Speechwriters"** — a professional guild/organization for speechwriters in Nigeria. The GNS Members Portal is a **private, members-only web application** that serves as the digital hub for guild members to:

- Read articles and writing from fellow members
- Write, draft, and publish their own speeches and articles
- Register for guild events (summits, workshops, public lectures, guild meetings)
- Take educational courses and masterclasses on speechwriting, rhetoric, and public speaking
- Manage their member profile and account settings
- Connect with other guild members

The portal uses a **tiered membership system** with three levels:
- **Associate (AGNS)** — Entry-level members with limited privileges (e.g., can publish max 3 articles/month)
- **Partner (PGNS)** — Full members with unlimited publishing
- **Fellow (FGNS)** — Senior members/institutional authorities with unlimited publishing

The app is built as a **Vue 3 (Composition API) + Vite + Tailwind CSS v4** single-page application with **client-side routing** and **localStorage-based persistence** (i.e., no backend — all data is mock data stored in the browser).

---

## 2. TECH STACK

| Technology | Purpose |
|---|---|
| **Vue 3** (Composition API with `<script setup>`) | Frontend framework |
| **Vite** | Build tool and dev server |
| **Vue Router 5** (with `createWebHistory`) | Client-side routing |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **Tiptap** (Vue 3 integration) | Rich text editor (for draft/article writing) |
| **Iconify** (`@iconify/vue`) | Icon library |
| **localStorage** | Data persistence (no backend/database) |
| **@faker-js/faker** | Generating mock data |

---

## 3. PROJECT STRUCTURE

```
gns-membersportal/
├── index.html              # Entry HTML
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── jsconfig.json           # JS config
├── README.md
├── public/
│   └── favicon.ico
└── src/
    ├── main.js             # Vue app bootstrap
    ├── App.vue              # Root component (provides user auth state via provide/inject)
    ├── assets/
    │   └── main.css         # Global styles (Tailwind)
    ├── router/
    │   └── index.js         # All route definitions & auth guard
    ├── layout/
    │   └── portallayout.vue # Main portal layout (Header + Sidebar + RouterView)
    ├── pages/               # Page-level components (each mapped to a route)
    │   ├── Login.vue
    │   ├── Dashboard.vue
    │   ├── Article.vue
    │   ├── MyWriting.vue
    │   ├── DraftEditor.vue
    │   ├── DraftPreview.vue
    │   ├── PublishedPost.vue
    │   ├── Events.vue
    │   ├── Learning.vue
    │   ├── CourseDetail.vue
    │   ├── Lesson.vue
    │   ├── Profile.vue
    │   ├── Settings.vue
    │   └── SearchResults.vue
    ├── components/          # Reusable components
    │   ├── article/
    │   │   └── ArticleBody.vue
    │   ├── events/
    │   │   └── Eventdetail.vue
    │   ├── feed/
    │   │   ├── ArticleCard.vue
    │   │   ├── FeedTabs.vue
    │   │   └── RightSidebar.vue
    │   ├── header/
    │   │   └── Header.vue
    │   ├── sidebar/
    │   │   └── Sidebar.vue
    │   └── ui/
    │       ├── EmptyState.vue
    │       └── PageLoading.vue
    └── data/                # Data stores & mock data
        ├── mockUsers.js     # User accounts & tier definitions
        ├── mockArticles.js  # Feed articles with full bodies (content blocks)
        ├── mockDrafts.js    # Seed drafts & published posts
        ├── mockEvents.js    # Guild events
        ├── mockCourses.js   # Learning courses & lessons
        ├── courses.js       # Course data access functions
        ├── events.js        # Events data access functions
        ├── feedActions.js   # Feed filtering & saved articles
        ├── writing.js       # Drafts & published writing CRUD
        ├── userProfile.js   # Profile & settings persistence
        └── search.js        # Search functionality
```

---

## 4. ROUTES & AUTHENTICATION

### Authentication
- Uses **localStorage** (`gns_user` key) to persist the logged-in user
- Global **auth guard** in the router: all routes except `/login` require authentication
- If a user is already logged in and visits `/login`, they are redirected to `/dashboard`
- Auth state is managed in `App.vue` using Vue 3's **provide/inject** pattern:
  - `currentUser` — reactive user object (or null)
  - `setCurrentUser` — function to log in (saves to localStorage)
  - `handleSignout` — function to log out (clears localStorage)

### Route Map

| Path | Name | Component | Notes |
|---|---|---|---|
| `/login` | Login | Login.vue | Public route |
| `/` | Dashboard | Dashboard.vue | Main feed |
| `/events` | Events | Events.vue | Event listings |
| `/events/:id` | EventDetail | Eventdetail.vue | Single event |
| `/article/:id` | Article | Article.vue | Read published article (from feed) |
| `/my-writing` | MyWriting | MyWriting.vue | Manage drafts & published |
| `/my-writing/new` | DraftNew | DraftEditor.vue | New draft (full screen) |
| `/my-writing/:id/edit` | DraftEdit | DraftEditor.vue | Edit existing draft (full screen) |
| `/my-writing/:id/preview` | DraftPreview | DraftPreview.vue | Preview draft before publishing |
| `/published/:id` | PublishedPost | PublishedPost.vue | View user-published post |
| `/learning` | Learning | Learning.vue | Course library |
| `/learning/:courseId` | CourseDetail | CourseDetail.vue | Course overview |
| `/learning/:courseId/lesson/:lessonId` | Lesson | Lesson.vue | Individual lesson |
| `/search` | Search | SearchResults.vue | Global search |
| `/profile` | Profile | Profile.vue | User profile |
| `/settings` | Settings | Settings.vue | User settings |

### Layout
- Full-screen routes (DraftEditor, DraftPreview) have no layout wrapper
- All other authenticated routes render inside **PortalLayout** which includes:
  - **Header** — Top bar with logo, navigation, notifications bell, user avatar, and sign-out
  - **Sidebar** — Collapsible left sidebar with navigation links
  - **Main content area** — `<RouterView />` with responsive padding

---

## 5. MEMBERSHIP TIERS

Defined in `src/data/mockUsers.js`:

| Tier | Role Value | Label | Abbreviation | Monthly Article Limit |
|---|---|---|---|---|
| `ROLE_ASSOCIATE` | 1 | Associate | AGNS | 3 |
| `ROLE_MEMBER` | 2 | Partner | PGNS | Unlimited |
| `ROLE_FELLOW` | 3 | Fellow | FGNS | Unlimited |

The `canAccessTier(userTier, requiredTier)` function determines if a user can access content restricted to a certain tier level.

### Test Accounts (for development/demo)

| Name | Email | Password | Tier |
|---|---|---|---|
| Adaeze Okoye | adaeze@gns.ng | associate123 | Associate |
| Emeka Nwosu | emeka@gns.ng | partner123 | Partner |
| Dr. Funmi Adeyemi | funmi@gns.ng | fellow123 | Fellow |

---

## 6. FEATURES IN DETAIL

### 6.1 Dashboard / Article Feed
- **Path:** `/` (Dashboard.vue)
- Shows a paginated feed of articles from guild members
- **Tabs:** "For You", "Latest", "Saved", plus category-specific tabs
- Each article card shows title, excerpt, author (with credentials like AGNS/PGNS/FGNS), read time, date, claps, and views
- "Load more" button for pagination (6 articles per page)
- Right sidebar shows trending articles and writing tips

### 6.2 Article Reading
- **Path:** `/article/:id` (Article.vue)
- Full article view with:
  - Category badge, publication date, read time
  - Author info (name, credential, role, bio)
  - Engagement bar (like/heart, view count, comment count, share)
  - Featured image
  - Article body rendered via ArticleBody.vue
  - Tags section
  - Author bio card
  - Comments section with comment posting
  - Related articles section
  - Share functionality (native share API with clipboard fallback)

### 6.3 Writing / Drafts
- **Path:** `/my-writing` (MyWriting.vue)
- **Draft Editor:** `/my-writing/new` or `/my-writing/:id/edit` (DraftEditor.vue)
  - Full-screen rich text editor using **Tiptap** with:
    - Bold, italic, underline, highlight
    - Headings (H2, H3)
    - Links, blockquotes, images
    - Bullet & ordered lists
    - Horizontal rules, tables
    - Undo/redo
  - Sidebar with metadata fields:
    - **Tags** (up to 5, comma/enter to add)
    - **Excerpt** (short summary)
    - **Category** (dropdown multi-select from: Speech Writing, Rhetoric, Public Speaking, Politics, Leadership, Communication, Culture, Opinion, Analysis)
    - **Cover Image** (drag-and-drop upload, auto-resized to max 1200px wide, max 2MB, JPEG/PNG/WebP/GIF)
  - Auto-save to localStorage (debounced 800ms)
  - Unsaved changes detection with confirmation dialog
  - Smart cover image extraction from first image in body content
- **Publishing:** After clicking "Publish", validation checks for:
  - Title required
  - At least 1 tag
  - Cover image (can auto-extract from body)
  - At least 1 category
  - Minimum 100 words
  - Valid drafts publish via `publishDraft()` in `writing.js`
- **Draft Preview:** `/my-writing/:id/preview` (DraftPreview.vue)
  - Preview how the draft will look when published

### 6.4 Published Posts (User's Own)
- **Path:** `/published/:id` (PublishedPost.vue)
- View for a single published post created by the current user
- Shows title, date, read time, views, claps, and full content
- Tracks whether the current user is the author

### 6.5 Events
- **Path:** `/events` (Events.vue)
- Lists guild events with filter tabs: All, Featured Summit, Workshop, Public Lecture, Guild Meeting
- "Reserved" tab shows events the user has RSVP'd to
- Each event shows: date, type badge, title, location, thumbnail image
- Clicking an event goes to `/events/:id` (Eventdetail.vue) for details and RSVP

### 6.6 Learning / Courses
- **Path:** `/learning` (Learning.vue)
- Course library with search and category filtering
- "Resume Learning" section (highlights in-progress course with progress bar)
- Courses are tier-locked (some courses require Partner or Fellow level)
- Each course shows: thumbnail, category badge, title, instructor, duration, modules count, progress %
- Locked courses show a lock overlay
- Clicking a course goes to `/learning/:courseId` (CourseDetail.vue)
- Individual lessons at `/learning/:courseId/lesson/:lessonId` (Lesson.vue)

### 6.7 Profile
- **Path:** `/profile` (Profile.vue)
- Display/edit profile with:
  - Avatar (upload as base64, stored in localStorage)
  - Display name
  - Guild tier badge
  - Bio
  - Social/contact links (website, Twitter, LinkedIn)
  - Member since date
- Writing stats: drafts count, published count, total views, total claps
- Recent activity (last 3 published articles)

### 6.8 Settings
- **Path:** `/settings` (Settings.vue)
- Sections:
  - **Notifications:** Email notifications, weekly digest, new article alerts, comment alerts, member announcements
  - **Privacy:** Show in member directory, show writing activity publicly, show email to members
  - **Preferences:** Font size (small/medium/large)
  - **Account:** Change password, membership info, delete account (simulated)
- All settings persisted to localStorage

### 6.9 Search
- **Path:** `/search` (SearchResults.vue)
- Global search across articles, events, courses, and member directory

---

## 7. DATA PERSISTENCE STRATEGY

**There is no backend or API.** All data is stored in the browser's `localStorage`. The data layer works as follows:

1. **Seed data** — Mock data files (`mockArticles.js`, `mockDrafts.js`, `mockEvents.js`, `mockCourses.js`) provide initial content
2. **CRUD wrappers** — Each data domain (writing.js, userProfile.js, courses.js, events.js) has functions that:
   - Load from localStorage (falling back to seed data)
   - Save back to localStorage
   - Merge user-created data with seed data
3. **Key prefixes** — All localStorage keys use the `gns_` prefix (e.g., `gns_user`, `gns_drafts`, `gns_published`, `gns_settings`, `gns_profile`)

### How Drafts Work Specifically:
- Draft CRUD operations are in `writing.js`
- When a draft is created, it gets an `id` like `draft-{timestamp}`
- Unpublished drafts are stored in the `gns_drafts` key
- When published, the draft moves to `gns_published` with an `id` like `published-{timestamp}` and gets a `draftId` reference
- Some draft IDs can be "hidden" (soft-deleted) via the `gns_hidden_draft_ids` key
- Published posts can be "unpublished", which moves them back to drafts with a new draft ID
- Word count is calculated by stripping HTML tags from the body content
- Read time is calculated as `Math.ceil(wordCount / 200)` minutes
- Minimum requirements to publish: title, at least 1 tag, cover image (auto-extracted if possible), at least 1 category, minimum 50 words

---

## 8. KEY TECHNICAL PATTERNS

### State Management
- No Vuex/Pinia — uses Vue 3's **provide/inject** for global auth state
- Component-level `ref()` and `computed()` for local state
- `localStorage` for persistence across sessions

### Navigation Guards
- Route-level `meta.requiresAuth` flag
- `router.beforeEach` checks for `gns_user` in localStorage
- Login redirect if not authenticated; dashboard redirect if already logged in

### Editor Technology
- Tiptap (based on ProseMirror) for rich text editing
- Content stored as HTML strings
- Image handling: files are read as base64 data URLs (resized client-side to max 1200px width)
- Auto-save with debounce (800ms)

### UI/Design
- Tailwind CSS v4 for all styling
- Custom color scheme: dark text (`#111418`), guild red (`#8b1e21`), warm gray backgrounds (`#faf9f5`, `#eae8e4`)
- Playfair Display font for the GNS logo/brand
- Source Serif 4 / Georgia serif font for the article editor body
- Responsive design (mobile-first approach)
- Iconify for icons (Lucide iconset primarily)

---

## 9. IMPORTANT CONTEXTUAL NOTES FOR AI MODELS

1. **This is a prototype/demo application** — All data is mock data. There is no real backend, no database, no API calls. Everything is client-side JavaScript with localStorage.

2. **No real authentication** — Passwords are checked against hardcoded mock user objects. There's no JWT, no session management, no real security.

3. **Content is not shared between users** — Since everything is localStorage, each browser instance has its own isolated data. User A cannot see User B's drafts.

4. **Images are base64 encoded** — Images uploaded through the editor or profile avatar are stored as base64 data URLs in localStorage. This has storage limitations.

5. **The app name "GNS" is pronounced as individual letters** (G-N-S-W) or as "Guild of Nigerian Speechwriters."

6. **Tier abbreviations** — AGNS = Associate of the Guild of Nigerian Speechwriters, PGNS = Partner of the Guild of Nigerian Speechwriters, FGNS = Fellow of the Guild of Nigerian Speechwriters.

7. **The portal is meant to be private** — All non-login routes require authentication. The login page lists test credentials for development purposes.

8. **Vue Router is version 5.x** — This uses Vue Router 4-style API but is the v5 package for Vue 3 compatibility.

9. **Tailwind CSS v4** — Uses the new Tailwind v4 configuration system (CSS-based config via `@import "tailwindcss"` in main.css, no `tailwind.config.js` file).

10. **The project uses `@faker-js/faker`** for generating realistic mock data (author names, article content, etc.).