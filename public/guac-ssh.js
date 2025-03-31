/**
 * guac-ssh.js
 *
 * SSH window.
 */

function createGuacSSHWindow() {
    const body = createWindow('SSH');
    body.innerHTML = `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div style="margin-bottom:8px;">
          <input id="ssh-host" placeholder="Host" />
          <input id="ssh-port" value="22" style="width:60px;" />
          <input id="ssh-user" placeholder="Username" />
          <input id="ssh-pass" placeholder="Password" type="password" />
          <button id="ssh-connect-btn">Connect</button>
        </div>
        <div class="guac-display" id="ssh-display" style="flex:1;"></div>
      </div>
    `;
  
    const connectBtn = body.querySelector('#ssh-connect-btn');
    connectBtn.addEventListener('click', () => {
      const host = body.querySelector('#ssh-host').value.trim();
      const port = body.querySelector('#ssh-port').value.trim();
      const username = body.querySelector('#ssh-user').value.trim();
      const password = body.querySelector('#ssh-pass').value;
  
      const display = body.querySelector('#ssh-display');
      createGuacamoleSession(display, {
        protocol: 'ssh',
        host,
        port,
        username,
        password
      });
    });
  }