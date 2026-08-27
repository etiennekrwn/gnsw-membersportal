# GNSW Members Portal — QA Test List

Status legend: `[ ]` not run · `[x]` passed · `[!]` failed (note in comments)

---

## 1. Subscription / Membership
- [ ] Membership page `/membership` loads for a logged-in member (via Sidebar → Membership).
- [ ] Subscription card shows current tier, next payment, status badge.
- [ ] Upgrade buttons appear only for tiers that can upgrade; clicking shows success message.
- [ ] Cancel flow: confirm → cancels → shows "cancelled" + access-until text.
- [ ] Grace period / inactive banners render for `past_due`/`expired` subs.
- [ ] Sidebar nav includes "Membership" and navigates.
- [ ] Header profile menu includes "Membership".
- [ ] Feed shows the compact "Your membership → Manage" strip (not the full card).
- [ ] Settings → "Membership" card links to `/membership`.
- [ ] Tier benefits panel lists correct items for your tier.

## 2. Author profiles & following
- [ ] Clicking an author name on a feed card opens `/author/:id`.
- [ ] Clicking an author avatar opens the same profile.
- [ ] Article page header byline + bio card both link to author profile.
- [ ] Author profile shows avatar, name, role/credential, bio, stats (articles/claps/views).
- [ ] Follow/unfollow button toggles state and persists after reload.
- [ ] "Following" feed tab shows only articles from followed authors.
- [ ] Guests opening a profile can see it (public route) but Follow triggers the login wall.

## 3. Feed / algorithm / likes / mute
- [ ] Feed tabs: For You, Trending, Following, Latest, Featured, Saved all render.
- [ ] "Trending" ranks high-engagement articles first (claps/comments/views).
- [ ] Muting an author hides their articles across all tabs.
- [ ] Save/un-save article toggles bookmark & persists.
- [ ] Clap on article page persists "liked" state after reload and updates count.
- [ ] Like on a guest account opens the login wall.
- [ ] Empty states show contextual messages (Saved / Following / Trending).

## 4. Courses / Learning / Lessons
- [ ] `/learning` lists courses with search + category filter.
- [ ] Course cards show correct progress %.
- [ ] Locked courses (tier) show lock overlay and are not clickable into content.
- [ ] `/learning/:courseId` shows modules + Continue/Start based on progress.
- [ ] Lesson page opens with real lesson title + body (not the placeholder).
- [ ] "Mark complete & continue" advances progress and moves to next lesson.
- [ ] Progress % reflects after completing lessons (persists on reload).

## 5. Events / RSVP
- [ ] `/events` lists events with type filter + Reserved tab.
- [ ] Event detail shows type/date/time/location + What to Expect.
- [ ] RSVP reserves seat; "Reserved" tab shows RSVP'd events; cancel works.
- [ ] Member-only event RSVP as a guest opens the login wall.

## 6. Notifications
- [ ] Bell in header shows unread count badge.
- [ ] Clicking bell opens dropdown of notifications.
- [ ] Opening the bell marks notifications read (badge clears).
- [ ] "Manage notifications" links to Settings.
- [ ] Seed notifications display icon + text + time.

## 7. Search
- [ ] Header search returns articles, courses, events, drafts, published.
- [ ] No results state shows with clear-filters action.
- [ ] Empty query shows the "search the portal" hint.

## 8. Navigation / responsiveness
- [ ] Sidebar collapses on mobile with overlay; closes on nav.
- [ ] Right sidebar (events/recommended) shows on lg screens.
- [ ] Feed/article/profile/lesson layouts wrap cleanly at ≤360px without overflow.
- [ ] Header search + bell + profile menu usable on narrow screens.
- [ ] Dropdowns/menus close on outside click and Escape.
- [ ] Tap targets ≥ 44px on primary buttons.

## 9. Auth / session
- [ ] Guest can browse feed + article preview + author profiles.
- [ ] Member-only actions (save/follow/clap/comment/write) open login wall.
- [ ] 401 on API clears `portal_token`/`portal_user` and redirects to `/login`.
- [ ] Sign out clears state; /login not shown when logged in.

## 10. Quality / build
- [ ] `npm run build` completes with exit 0.
- [ ] No console errors on page load / actions.
- [ ] Dates display consistently (day-month-year) where applicable.