'use strict';
// Entry file for hPanel / Phusion Passenger.
// Passenger loads this file with require(), so server/server.js (which only listens
// when run directly) would never start. Here we start it explicitly.
const { server } = require('./server/server');
const { PORT, HOST } = require('./src/domain/shared');

if (!server.listening) {
  server.listen(PORT, HOST, () => console.log(`INPOS v764 listening on ${HOST}:${PORT}`));
}
