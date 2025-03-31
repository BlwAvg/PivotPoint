/**
 * guac-vnc.js
 *
 * Creates a VNC window. Typically host/port/password/resolution.
 */

function createGuacVNCWindow() {
    const body = createWindow('VNC');
    body.innerHTML = `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div style="margin-bottom:8px;">
          <input id="vnc-host" placeholder="Host" />
          <input id="vnc-port" value="5900" style="width:70px;" />
          <input id="vnc-pass" placeholder="Password" type="password" />
          <input id="vnc-resolution" value="1024x768" style="width:90px;" />
          <button id="vnc-connect-btn">Connect</button>
        </div>
        <div class="guac-display" id="vnc-display" style="flex:1;"></div>
      </div>
    `;
  
    const connectBtn = body.querySelector('#vnc-connect-btn');
    connectBtn.addEventListener('click', () => {
      const host = body.querySelector('#vnc-host').value.trim();
      const port = body.querySelector('#vnc-port').value.trim();
      const password = body.querySelector('#vnc-pass').value;
      const resolution = body.querySelector('#vnc-resolution').value.trim();
  
      const display = body.querySelector('#vnc-display');
      createGuacamoleSession(display, {
        protocol: 'vnc',
        host,
        port,
        password,
        resolution
      });
    });
  }  