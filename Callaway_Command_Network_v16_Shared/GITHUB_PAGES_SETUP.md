# CCN V16 — GitHub Pages Setup

## One-time setup
1. Create or open your GitHub repository for Callaway Command Network.
2. Upload this project, keeping the `docs` folder intact.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch **main** and folder **/docs**.
6. Save.

Your public links will use this pattern:

- TV: `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`
- Parents: `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/parent.html`

## Every time you update CCN
1. Open `START_INSTRUCTOR_EDITOR.bat`.
2. Make all changes.
3. Click **Download Shared Update**.
4. GitHub will receive a file named `shared-content.json`.
5. In your repository, open the `docs` folder.
6. Replace the existing `shared-content.json` with the newly downloaded file and commit the change.
7. The TV and parent links will use the same published information after GitHub Pages refreshes.

## Important
- Do not publish the `instructor` folder as your Pages source. Publish `/docs` only.
- The instructor editor contains no password or token and does not directly write to GitHub.
- Uploaded event and spotlight photos are embedded in `shared-content.json`, so replacing that one file publishes the pictures too.
