'use strict';
const $ = id => document.getElementById(id);
let intervalSeconds = 5, timer = null, ws = null;
let pollRequests = 0, pollUpdates = 0, wsUpdates = 0, wsConnections = 0;
let pollVersion = -1, wsVersion = -1;
let lastSentVersion = 0;
const timeNow = () => new Date().toLocaleTimeString([], { hour12: false });
function log(which, message) {
  const root = $(which + 'Events');
  const item = document.createElement('li');
  const time = document.createElement('time');
  time.textContent = timeNow();
  item.append(time, document.createTextNode(message));
  root.prepend(item);
  while (root.children.length > 12) root.lastElementChild.remove();
}
function flash(id) { const el = $(id); el.classList.remove(id === 'wsTunnel' ? 'pulse' : 'flash'); void el.offsetWidth; el.classList.add(id === 'wsTunnel' ? 'pulse' : 'flash'); setTimeout(() => el.classList.remove('pulse', 'flash'), 750); }
function updateMessage(which, data) {
  const target = $(which + 'Message');
  target.querySelector('strong').textContent = data.message;
  target.classList.remove('new'); void target.offsetWidth; target.classList.add('new');
  const delayMs = Math.max(0, Date.now() - data.timestamp);
  $(which + 'Delay').textContent = delayMs < 1000 ? `${delayMs}ms` : `${(delayMs/1000).toFixed(1)}s`;
}
async function poll() {
  pollRequests++;
  $('pollCount').textContent = pollRequests;
  $('pollHeadline').textContent = 'Browser asks: “Any new announcements?”';
  $('pollExplanation').textContent = 'This is a real HTTP GET request to /api/update.';
  flash('pollRequest');
  log('poll', `📤 Asking server (request #${pollRequests})`);
  try {
    const res = await fetch('/api/update', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    flash('pollResponse');
    if (data.version > pollVersion) {
      if (pollVersion !== -1 || data.version > 0) {
        pollUpdates++;
        $('pollNewCount').textContent = pollUpdates;
        updateMessage('poll', data);
        log('poll', `✅ Found update #${data.version}: ${data.message}`);
        $('pollHeadline').textContent = 'New announcement found! 🎉';
        $('pollExplanation').textContent = 'The news arrived on the next scheduled HTTP check — not automatically.';
      } else {
        log('poll', '📥 Server says: no new announcement yet');
        $('pollHeadline').textContent = 'No new announcement yet.';
        $('pollExplanation').textContent = 'Browser will wait, then send another HTTP request.';
      }
      pollVersion = data.version;
    } else {
      log('poll', '📥 Server says: nothing new');
      $('pollHeadline').textContent = 'No news. Waiting to ask again…';
      $('pollExplanation').textContent = 'Even though nothing changed, this request still happened.';
    }
  } catch (err) {
    log('poll', `❌ Request failed: ${err.message}`);
    $('pollHeadline').textContent = 'Server unavailable';
  }
}
function resetTimer() {
  if (timer) clearInterval(timer);
  timer = setInterval(poll, intervalSeconds * 1000);
  $('intervalLabel').textContent = `${intervalSeconds} second${intervalSeconds === 1 ? '' : 's'}`;
  $('pollExplanation').textContent = `The browser checks every ${intervalSeconds} seconds even if nothing changes.`;
  log('poll', `⏱️ Checking every ${intervalSeconds} second${intervalSeconds === 1 ? '' : 's'}`);
}
function connectWs() {
  const scheme = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const socket = new WebSocket(`${scheme}//${location.host}/ws`);
  ws = socket;
  socket.addEventListener('open', () => {
    wsConnections++;
    $('wsConnects').textContent = wsConnections;
    $('wsState').textContent = '● Connected';
    $('wsHeadline').textContent = 'Connection stays open! 🔗';
    $('wsExplanation').textContent = 'The server can send new information at any moment without a new HTTP poll.';
    log('ws', '🔗 Opened one WebSocket connection');
  });
  socket.addEventListener('message', event => {
    let data;
    try { data = JSON.parse(event.data); } catch { return; }
    if (data.type === 'hello') {
      wsVersion = data.version;
      if (data.version > 0) updateMessage('ws', data);
      log('ws', '👋 Server greeted the newly connected browser');
    } else if (data.type === 'update' && data.version > wsVersion) {
      wsVersion = data.version;
      wsUpdates++;
      $('wsCount').textContent = wsUpdates;
      updateMessage('ws', data);
      flash('wsTunnel');
      $('wsHeadline').textContent = 'New announcement pushed instantly! ⚡';
      $('wsExplanation').textContent = 'The server sent it through the already-open connection — no polling required.';
      log('ws', `⚡ Server PUSHED update #${data.version}: ${data.message}`);
    }
  });
  socket.addEventListener('close', () => {
    $('wsState').textContent = '● Disconnected';
    $('wsHeadline').textContent = 'Connection closed. Reconnecting…';
    log('ws', '⚠️ Connection closed; reconnecting');
    setTimeout(connectWs, 1800);
  });
  socket.addEventListener('error', () => log('ws', '❌ WebSocket error'));
}
$('interval').addEventListener('input', event => { intervalSeconds = Number(event.target.value); resetTimer(); });
$('announceForm').addEventListener('submit', async event => {
  event.preventDefault();
  const message = $('announcement').value.trim();
  if (!message) return;
  $('announceButton').disabled = true;
  try {
    const res = await fetch('/api/announce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    lastSentVersion = data.version;
    log('poll', '📣 Teacher posted news. Browser must wait until its next check.');
    log('ws', '📣 Teacher posted news. Server is pushing it now!');
  } catch (err) { alert(`Could not send message: ${err.message}`); }
  finally { $('announceButton').disabled = false; }
});
$('resetCounters').addEventListener('click', () => {
  pollRequests = pollUpdates = wsUpdates = 0;
  $('pollCount').textContent = '0'; $('pollNewCount').textContent = '0'; $('wsCount').textContent = '0';
  $('pollEvents').replaceChildren(); $('wsEvents').replaceChildren();
  log('poll', '🧽 Display counters reset'); log('ws', '🧽 Display counters reset');
});
log('poll', '🏁 Demonstration started');
connectWs();
poll();
resetTimer();
