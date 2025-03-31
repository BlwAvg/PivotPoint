# PivotPoint

Running the Application

1. Install Node.js (v14+ recommended).
2. Clone (or manually create) all files in a folder named pivotpoint.
3. Obtain or generate SSL certs:

If testing locally, run the openssl command mentioned above to create server.key and server.crt in certs/.
If production, place your real TLS certs there.



4. Install dependencies:
```
cd pivotpoint
npm install
```

5. Run:
```
npm start
```

6. Open your browser to https://localhost/ if running on port 443, or https://localhost:443/.

If you used a self-signed cert, you’ll have to accept the browser’s warning.

---
Folder Structure
```
pivotpoint/
 ├─ certs/
 │   ├─ server.key
 │   └─ server.crt
 ├─ data/
 │   ├─ notes.json
 │   └─ sessions.json
 ├─ public/
 │   ├─ guacamole/
 │   │   └─ guacamole-common-min.js  <-- from Apache Guacamole or guac-lite distribution
 │   ├─ index.html
 │   ├─ style.css
 │   ├─ desktop.js
 │   ├─ notepad.js
 │   ├─ guac-common.js
 │   ├─ guac-rdp.js
 │   ├─ guac-vnc.js
 │   ├─ guac-ssh.js
 │   ├─ guac-telnet.js
 ├─ server.js
 └─ package.json
```

Certificates
1. certs/server.key – your private key
2. certs/server.crt – your certificate
```
opensll req -x509 -newkey rsa:2048 -nodes -keyout server.key -out server.crt -days 365
````

# Guacamole Backend
This relies entirely on the hard work of the apache guac team.
