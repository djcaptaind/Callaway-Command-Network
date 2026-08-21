# CCN V18.6 — One-Click GitHub Publish

## First-time setup

Create a **fine-grained GitHub personal access token** for the instructor editor.

Use these restrictions:

- Repository: `djcaptaind/Callaway-Command-Network`
- Repository permission: **Contents — Read and write**
- Do not give the token permissions that CCN does not need.

## Publish an update

1. Open `instructor/editor.html`.
2. Make your CCN changes.
3. Click **Save Local Draft**.
4. Paste your GitHub token.
5. Click **Test GitHub Connection**.
6. Click **Publish Directly to GitHub**.
7. V18.6 updates `docs/shared-content.json` on the `main` branch.
8. Refresh the GitHub Pages TV or Parent View after GitHub Pages has picked up the commit.

## Security

The token is **not saved** to localStorage, shared content, or the repository.
It exists only while the editor page remains open.

If you refresh or close the editor, paste the token again next time.

## Fallback

The **Download Shared Update** workflow is still included if direct publishing is unavailable.
