CALLAWAY COMMAND NETWORK V18.9.2 — GITHUB PUBLISH FIX

FIXED
- Resolved: "collectUniversalGalleries is not defined"
- Save Local Draft and Publish Directly to GitHub now serialize universal photo/video galleries directly.
- V18.9.1 Recognition Center and built-in media controls remain included.

CALLAWAY COMMAND NETWORK V18.9.1 — UNIVERSAL MEDIA + RECOGNITION CENTER FIX

FIXED
- Today’s Lesson, Lesson Objective, Key Terms, Exit Questions, and Announcements now have direct media-management buttons inside their editor sections.
- Those buttons jump directly to the correct universal photo/video gallery.

RECOGNITION CENTER
- Cadet of the Week
- Cadet of the Month
- Cadet of the Year
- Congratulations
- Staff Recognition
- Special Recognition
- Team Recognition
- Academic Achievement
- Promotion
- Competition Achievement
- College / Scholarship Acceptance
- Community Service
- Birthday / Shout-Out
- Alumni Spotlight
- Custom recognition type

EACH RECOGNITION CAN HAVE
- headline/title
- cadet/staff/team/group name
- details
- quote/message
- badges
- start/end dates
- Parent View visibility
- primary portrait
- multiple photos
- multiple uploaded videos
- YouTube links
- cover media
- show/hide controls

All previous V18.9 photo/video media, custom sections, parent view, spotlight photo fixes, and one-click GitHub publishing remain included.

CALLAWAY COMMAND NETWORK V18.9 — UNIVERSAL PHOTO + VIDEO MEDIA MODE

NEW IN V18.9
- Every major CCN section can now mix photos and videos in the same media gallery.
- Upload MP4/WebM/OGG video files.
- Add YouTube links without storing large video files in GitHub/browser storage.
- Select multiple photos and multiple local videos.
- Choose any media item as the cover item.
- Reorder and remove media.
- Local videos can be muted/unmuted and looped.
- YouTube videos autoplay muted; loop can be enabled.
- Photo timing is still adjustable from 2–20 seconds.
- The TV automatically returns to the next media item after local video playback ends.
- Existing V18.8 photo galleries migrate automatically.
- Custom Sections, Parent View, spotlight photos, and one-click GitHub publishing remain intact.

NOTES
- Large local videos can exceed browser localStorage limits. The editor warns on videos over 12 MB.
- YouTube is recommended for longer videos.
- Browsers typically require autoplay video to be muted; uploaded videos default to muted.

CALLAWAY COMMAND NETWORK V18.8 — UNIVERSAL MULTI-PHOTO MODE

NEW IN V18.8
- Add multiple pictures to Today’s Lesson, Objective, Key Terms, Exit Questions, Upcoming Event, Announcements, Cadet Spotlights, and Community Impact.
- Select multiple pictures at once.
- Choose a cover picture for the lineup card.
- Reorder and remove pictures.
- Turn each gallery on/off without deleting it.
- Set slideshow timing from 2–20 seconds.
- The large TV hero rotates gallery photos automatically.
- Existing single photos remain as fallbacks.
- V18.7 Custom Sections and V18.6 One-Click GitHub publishing remain included.

CALLAWAY COMMAND NETWORK V18.7 — CUSTOM SECTIONS MODE

NEW IN V18.7
- Add unlimited custom TV sections from Content Studio.
- Rename every custom section.
- Choose Home, Today’s Lesson, Learn, Events, or Recognition category.
- Add a separate large/card picture for each section using one upload.
- Hide/show each section without deleting it.
- Hide/show the picture without deleting it.
- Choose whether a section appears on Parent View.
- Short lineup-card title field.
- Custom badge, feature callout, details/chips, and description.
- Duplicate, remove, and reorder custom sections.
- Custom sections are included in shared-content.json and One-Click GitHub Publish.
- All V18.6 GitHub publishing and V18.5 spotlight-photo features remain intact.

HOW TO USE
1. Open instructor/editor.html.
2. Find Custom Section Builder.
3. Click + Add Custom Section.
4. Choose the navigation category.
5. Add title, description, badge, details, and picture.
6. Use the arrows to reorder your custom sections.
7. Save Local Draft and preview.
8. Publish Directly to GitHub when ready.

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
