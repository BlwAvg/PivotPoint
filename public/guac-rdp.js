/**
 * guac-rdp.js
 * 
 * Creates an RDP window. Collects host/port/user/pass, then calls
 * createGuacamoleSession(container, { protocol: 'rdp', ... }).
 */

function createGuacRDPWindow() {
    const body = createWindow('RDP');
    body.innerHTML = `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div style="margin-bottom:8px;">
          <input id="rdp-host" placeholder="Host" />
          <input id="rdp-port" value="3389" style="width:70px;" />
          <input id="rdp-user" placeholder="Username" />
          <input id="rdp-pass" placeholder="Password" type="password" />
          <input id="rdp-security" placeholder="(nla, tls, rdp, any)" style="width:80px;" />
          <input id="rdp-resolution" value="1024x768" style="width:90px;" />
          <button id="rdp-connect-btn">Connect</button>
        </div>
        <div class="guac-display" id="rdp-display" style="flex:1;"></div>
      </div>
    `;
  
    const connectBtn = body.querySelector('#rdp-connect-btn');
    connectBtn.addEventListener('click', () => {
      const host = body.querySelector('#rdp-host').value.trim();
      const port = body.querySelector('#rdp-port').value.trim();
      const username = body.querySelector('#rdp-user').value.trim();
      const password = body.querySelector('#rdp-pass').value;
      const security = body.querySelector('#rdp-security').value.trim();
      const resolution = body.querySelector('#rdp-resolution').value.trim();
  
      const display = body.querySelector('#rdp-display');
      createGuacamoleSession(display, {
        protocol: 'rdp',
        host,
        port,
        username,
        password,
        security,
        resolution
      });
    });
  }