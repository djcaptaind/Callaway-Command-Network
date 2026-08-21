CALLAWAY COMMAND NETWORK V18.6 — ONE-CLICK GITHUB PUBLISH

NEW IN V18.6
- Publish shared CCN content directly from instructor/editor.html to GitHub.
- No manual replacement of docs/shared-content.json is required.
- GitHub token is never stored in CCN files or localStorage.
- Token is cleared when the editor tab is refreshed or closed.
- Built-in Test GitHub Connection button.
- Manual Download Shared Update remains available as a fallback.
- All V18.5 Spotlight Photo Fix and Beyond Mode features remain intact.

DIRECT PUBLISH SETUP
1. Create a fine-grained GitHub personal access token.
2. Restrict it to: djcaptaind/Callaway-Command-Network
3. Repository permission required: Contents — Read and write.
4. Open instructor/editor.html.
5. Paste the token into the GitHub Publish section.
6. Click Test GitHub Connection.
7. Edit CCN and click Publish Directly to GitHub.
8. The editor updates docs/shared-content.json on main.

SECURITY
Never paste your token into content.js, shared-content.json, README, GitHub issues, or any other project file.
The V18.6 editor intentionally keeps it only in the current JavaScript page memory.

CALLAWAY COMMAND NETWORK V18.5 — SPOTLIGHT PHOTO FIX

FIXED IN V18.5
- Uploaded Cadet of the Year photo now displays on the large recognition feature.
- Uploaded Cadet of the Week and Cadet of the Month photos use the same behavior.
- The uploaded cadet portrait is also used on the small Today’s Lineup card.
- “Show its photo” still hides the picture without deleting the saved portrait.
- All V18.4 Readable Lineup Mode features remain intact.

CALLAWAY COMMAND NETWORK V18.4 — READABLE LINEUP MODE

NEW IN V18.4
- Today’s Lesson and Lesson Objective can have short lineup-card titles.
- Full detailed titles remain on the large feature screens.
- If the Lesson card title is blank, CCN automatically creates a shorter readable fallback.
- The Objective lineup card defaults to “Lesson Objective” unless you enter a custom short title.
- Lineup-card text has a larger minimum size for a 55-inch classroom TV.
- V18.3 Objective Priority Mode and all existing editor/publishing features remain intact.

CALLAWAY COMMAND NETWORK V18.3 — OBJECTIVE PRIORITY MODE

CALLAWAY COMMAND NETWORK V18.2 — ADAPTIVE CLASSROOM MODE

CALLAWAY COMMAND NETWORK V18.1 — 55-INCH TV OPTIMIZED

CALLAWAY COMMAND NETWORK — V18 BEYOND COMPLETE

THIS IS THE COMPLETE V18 TEST BUILD.

WHAT IS INCLUDED
- Beyond Mode TV display in docs/index.html
- Matching V18 instructor Content Studio in instructor/editor.html
- Shared TV + Parent workflow
- Lesson, Objective, Key Terms, Exit Questions
- Upcoming Event + event photo controls
- Announcements
- Cadet Spotlight Gallery: Week / Month / Year + separate photos
- Hide/show controls
- Parent View
- GitHub Pages /docs deployment structure

LOCAL TEST
1. Double-click START_TV_LOCAL.bat for the TV screen.
2. Double-click START_INSTRUCTOR_EDITOR.bat for the Content Studio.
3. Update content and click Save Local Draft.
4. Refresh the TV preview.

PUBLISHING
When V18 is approved, upload the full docs and instructor folders plus the launch/setup files to GitHub. GitHub Pages should publish from main /docs.

IMPORTANT
Do not replace V17 on GitHub until you have tested this package locally.
