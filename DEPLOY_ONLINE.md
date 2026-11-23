# Put the live AJAX Polling vs WebSockets demo online

This project needs a server. GitHub Pages alone cannot run `node server.js`. Use **GitHub** to store the code and **Render (Web Service)** to run it.

## 1. Upload to a new GitHub repository

1. Sign in at https://github.com/ and select **New repository**.
2. Name it `ajax-polling-vs-websockets-demo` (or a name you prefer). Do not put it inside your unrelated personal portfolio repository.
3. Choose Public or Private (if your GitHub/Render integration supports the chosen visibility). Create the repository.
4. Click **Add file > Upload files**. Unzip this package, open the extracted folder, and drag the **contents** of the folder into GitHub. The root must contain `server.js`, `package.json`, `public/`, and `README.md`.
5. Commit the files. Do not upload `node_modules/` or any secrets.

Alternative: use a local git repo and `git push` if you prefer.

## 2. Run the server on Render

1. Sign in at https://dashboard.render.com/ using your GitHub account or connect GitHub in Render.
2. Click **New > Web Service**.
3. Select the new GitHub repository.
4. Enter these settings:

| Render setting | Value |
| --- | --- |
| Name | `ajax-websocket-demo` (or another available name) |
| Language / Runtime | `Node` |
| Branch | `main` |
| Root Directory | *(leave blank if package.json is at the repo root)* |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | `Free` if available |

5. Click **Deploy Web Service** / **Create Web Service**.
6. When the deployment is live, click its HTTPS URL (for example, `https://your-chosen-name.onrender.com`). That link is created by Render, not GitHub Pages.
7. Share the Render HTTPS URL with teammates. They do not need to install Node.js.

The app listens on `process.env.PORT` and host `0.0.0.0` (required by Render). Its client detects HTTPS and opens `wss://.../ws` automatically.

## 3. Live team test

1. Open the public Render URL in **two different browsers/devices**.
2. On device A, set the polling interval to 10 seconds.
3. On device B, type `Hello, team!` and click **Send update**.
4. Watch: WebSockets receive the message immediately on an open connection; AJAX polling shows it on the next check.
5. Inspect DevTools > Network > Fetch/XHR and WS to see actual traffic.

## Troubleshooting

- **Deploy failed / port not detected:** confirm you uploaded the updated `server.js` that calls `server.listen(PORT, '0.0.0.0', ...)`, and that Render uses `npm start`.
- **GitHub Pages only shows a static screen or API fails:** don't deploy this Node.js program as GitHub Pages; create a Render **Web Service**.
- **Site takes a while to open:** Render free services sleep after about 15 minutes of no incoming traffic, and can take time to wake up.
- **Messages disappear after a restart:** this educational app stores messages only in server memory; they aren't saved to a database.
- **Teammates cannot see the latest announcement:** make sure they use the same Render URL, not different localhost URLs, and check that the WebSocket panel says Connected.

**Privacy/security:** the sample announcement endpoint has no login or access control. Anyone who can reach the public link can send an announcement. Use harmless sample messages, don't post student/private data, and do not treat this as a secure messaging app. If you need a private classroom service, add authentication before public deployment.

Official Render documentation:
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/web-services
- https://render.com/docs/websocket
- https://render.com/docs/free
