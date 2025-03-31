/**
 * guac-common.js
 *
 * Provides a helper function to create a Guacamole session using a
 * POST to /api/guac-token, returning a token. Then we connect with
 * wss://yourdomain/guac/?token=xxx
 */

async function createGuacamoleSession(containerElement, creds) {
    // 1) Fetch a token from the server
    const resp = await fetch('/api/guac-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    if (!resp.ok) {
      containerElement.innerHTML = 'Error obtaining token from server.';
      return;
    }
    const { token } = await resp.json();
    if (!token) {
      containerElement.innerHTML = 'No token returned - check server logs.';
      return;
    }
  
    // 2) Build the wss:// URL with ?token=...
    const baseWS = location.origin.replace(/^http/, 'ws');
    const wsUrl = `${baseWS}/guac/?token=${token}`;
  
    // 3) Standard Guacamole client setup
    const tunnel = new Guacamole.WebSocketTunnel(wsUrl);
    const guacClient = new Guacamole.Client(tunnel);
  
    // Clear container, attach display
    containerElement.innerHTML = '';
    containerElement.appendChild(guacClient.getDisplay().getElement());
  
    // Mouse
    const mouse = new Guacamole.Mouse(guacClient.getDisplay().getElement());
    mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = (state) => {
      guacClient.sendMouseState(state);
    };
  
    // Keyboard
    const keyboard = new Guacamole.Keyboard(document);
    keyboard.onkeydown = (keysym) => {
      guacClient.sendKeyEvent(1, keysym);
      return false;
    };
    keyboard.onkeyup = (keysym) => {
      guacClient.sendKeyEvent(0, keysym);
      return false;
    };
  
    // Connect
    guacClient.connect();
  
    // If user closes tab, disconnect
    window.addEventListener('beforeunload', () => {
      guacClient.disconnect();
    });
  
    return guacClient;
  }
  