/**
 * guac-telnet.js
 *
 * Telnet window.
 */

function createGuacTelnetWindow() {
    const body = createWindow('Telnet');
    body.innerHTML = `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div style="margin-bottom:8px;">
          <input id="telnet-host" placeholder="Host" />
          <input id="telnet-port" value="23" style="width:60px;" />
          <button id="telnet-connect-btn">Connect</button>
        </div>
        <div class="guac-display" id="telnet-display" style="flex:1;"></div>
      </div>
    `;
  
    const connectBtn = body.querySelector('#telnet-connect-btn');
    connectBtn.addEventListener('click', () => {
      const host = body.querySelector('#telnet-host').value.trim();
      const port = body.querySelector('#telnet-port').value.trim();
  
      const display = body.querySelector('#telnet-display');
      createGuacamoleSession(display, {
        protocol: 'telnet',
        host,
        port
      });
    });
  }  