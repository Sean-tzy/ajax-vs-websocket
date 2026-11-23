# AJAX Polling vs WebSockets — Interactive classroom demo

This is a real, locally running web application for showing **how HTTP AJAX polling differs from WebSockets**. It is educational: both sides communicate with the same Node.js server and receive the same announcement.

## Share with teammates on the internet

For actual live sharing (not just a static mockup), this project needs a Node.js backend. GitHub stores the files, and Render runs the HTTP and WebSocket server. **See `DEPLOY_ONLINE.md` for step-by-step instructions and exact Render settings.**

## Easy installation (Windows)

1. Install **Node.js LTS** from https://nodejs.org/ (if you don't already have it).
2. Unzip this folder to your Desktop or another location.
3. Double-click **START-DEMO.bat**. It installs the `ws` package automatically on first run (internet required on first run) and starts the server.
4. Open **http://localhost:3000** if your browser does not open automatically.
5. Leave the black terminal window open; close it or press Ctrl+C when you're finished.

## Run from a terminal (Windows, macOS, Linux)

```bash
npm install
npm start
```

Open http://localhost:3000 in a browser.

## 2-minute live demonstration script

1. Point at the **AJAX Polling** panel: “The browser knocks on the server's door every five seconds. It asks even when there is no news.” Watch the HTTP request counter increase.
2. Point at **WebSockets**: “These two computers already have an open connection, like a phone call. No repeated requests are needed just to ask for news.”
3. Type “No classes tomorrow!” into the announcement board and click **Send update**.
4. See **WebSockets** receive it right away. AJAX Polling receives the same news only at its next scheduled check.
5. Set polling to **10 seconds** and send another announcement. The waiting difference is easier to see.
6. Set polling to **1 second** and watch the AJAX requests climb much faster, even with no announcements.

## What is actually happening?

- **AJAX polling:** Browser `fetch()` sends `GET /api/update` on a repeating timer. The server returns the latest announcement and version. The browser compares the version to decide whether it is new. Repeated HTTP requests happen even when the data is unchanged.
- **WebSockets:** Browser opens a WebSocket connection to `/ws`. The server uses that open connection to **push** each new announcement to all connected browser sessions. No HTTP polling is required for those pushes.
- **Send update:** Instructor UI uses `POST /api/announce` to store the announcement and broadcast it to WebSocket clients. On its next poll the polling client receives the same update.
- The displayed delay is approximately the time between server creation and local browser receipt, and is not a precise network benchmark.
- This is a simple single-machine classroom demonstration. In production, connection management, authentication, scaling, and deployment require additional work. The server binds to `0.0.0.0` so it can also run on hosting services. On your own computer, it is still only reachable from outside if your network/firewall permits access.

## Classroom tips

- Students can open the browser developer tools → **Network** and filter **Fetch/XHR** to see repeated `/api/update` requests.
- Filter **WS** to see the persistent `/ws` connection and incoming frames.
- For smoother presentation, use fullscreen (F11) and a zoom level that shows both panels.

## Tech requirements

- Node.js **18 or newer**
- A recent browser (Chrome, Edge, Firefox)
- An internet connection on the first run to download the `ws` package via npm
- No database, accounts, cloud hosting, or frameworks necessary

## Troubleshooting

- **`node` is not recognized**: Install Node.js LTS, then reopen the terminal or log out and in.
- **`npm install` fails**: Check internet connection and firewall; try `npm install` manually inside this folder.
- **Port 3000 already in use**: Close the other program or from PowerShell run `$env:PORT=3001; npm start` and visit http://localhost:3001.
- **PowerShell won't run npm.ps1**: Use `npm.cmd install`, or double-click START-DEMO.bat.
