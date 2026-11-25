# Setting up teacher sign-in for Roll Call: Race Day
 
This app is a single HTML file you host yourself (GitHub Pages, a school
server, etc.) — nothing about it runs inside Claude, and no student or
roster data is ever sent anywhere. Everything the app knows (teams,
rosters, questions, race results) stays in the browser's local storage on
whatever device loads the page.
 
"Sign in with Google" is optional and purely local: it lets a teacher
confirm who they are so the app can keep each teacher's race setups
separate on a shared classroom computer, and (if you choose) restrict the
app to your school's Google accounts. It does **not** send anything to a
server of yours — there isn't one. Google only confirms the teacher's
identity to the page itself.
 
If you skip this setup entirely, the app still works fully — it just runs
in a single shared "guest" workspace with no sign-in button shown.
 
## 1. Create a Google Cloud project (one-time)
 
1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   sign in with a Google account you control (your school Google
   Workspace account is fine).
2. Click the project dropdown at the top → **New Project**. Name it
   something like `roll-call-race` and create it.
3. Make sure that new project is selected before continuing.
## 2. Configure the OAuth consent screen
 
1. In the left sidebar: **APIs & Services → OAuth consent screen**.
2. Choose **Internal** if this is a Google Workspace for Education domain
   and you only want people in your district to sign in; choose
   **External** if not (you can still restrict who's allowed later).
3. Fill in the required fields (app name "Roll Call: Race Day", your
   email as support contact). You don't need to add scopes or test users
   for this — the app only asks for basic sign-in, not access to any
   Google data.
4. Save.
## 3. Create the OAuth Client ID
 
1. **APIs & Services → Credentials → Create Credentials → OAuth client
   ID**.
2. Application type: **Web application**.
3. Under **Authorized JavaScript origins**, add the exact URL(s) where
   you'll host this app, for example:
   - `https://ap-csa-java.github.io`
   - `http://localhost:8000` (handy for testing on your own computer)
4. Leave **Authorized redirect URIs** blank — this app doesn't use
   redirects, only the pop-up sign-in.
5. Click **Create**. Copy the **Client ID** that appears (it looks like
   `1234567890-abc123.apps.googleusercontent.com`).
## 4. Drop the Client ID into the app
 
Open `teams.html` in a text editor and find this
block near the top:
 
```html
<script>
  window.ROLLCALL_CONFIG = {
    GOOGLE_CLIENT_ID: "",
    RESTRICT_HOSTED_DOMAIN: ""
  };
</script>
```
 
- Paste your Client ID between the quotes for `GOOGLE_CLIENT_ID`.
- If you want to only allow sign-ins from your school's Google Workspace
  domain (recommended), set `RESTRICT_HOSTED_DOMAIN` to that domain,
  e.g. `"lbschools.net"`. Leave it as `""` to allow any Google account.
Save the file.
 
## 5. Host it
 
Drop `teams.html` into the GitHub repo you host your
other tools from (the same pattern as your `roll-call` repo) and enable
GitHub Pages for it, or upload it to any other web host. Once it's live
at the URL you listed as an authorized origin in step 3, the "Sign in
with Google" button will appear automatically in the top-right corner.
 
## Testing locally before you publish
 
You can test the whole app, sign-in included, on your own computer:
 
1. Add `http://localhost:8000` as an authorized JavaScript origin (step 3).
2. From the folder with the HTML file, run a simple local server, e.g.
   `python3 -m http.server 8000`.
3. Visit `http://localhost:8000/teams.html`.
## Troubleshooting
 
- **No sign-in button appears:** `GOOGLE_CLIENT_ID` is probably still
  blank — the app runs fine without it, just in guest-only mode.
- **"Error 400: redirect_uri_mismatch" or origin errors:** the URL you're
  loading the page from doesn't exactly match an Authorized JavaScript
  origin (check `http` vs `https`, and trailing slashes).
- **Wrong Google account gets rejected:** that's `RESTRICT_HOSTED_DOMAIN`
  working as intended — it only accepts accounts on that domain.
