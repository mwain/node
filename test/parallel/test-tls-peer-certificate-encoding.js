'use strict';
var common = require('../common');
var assert = require('assert');

if (!common.hasCrypto) {
  common.skip('missing crypto');
  return;
}
var tls = require('tls');

var fs = require('fs');
var util = require('util');
var join = require('path').join;

var options = {
  key: fs.readFileSync(join(common.fixturesDir, 'keys', 'agent5-key.pem')),
  cert: fs.readFileSync(join(common.fixturesDir, 'keys', 'agent5-cert.pem')),
  ca: [ fs.readFileSync(join(common.fixturesDir, 'keys', 'ca2-cert.pem')) ]
};
var verified = false;

var server = tls.createServer(options, function(cleartext) {
  cleartext.end('World');
});
server.listen(0, function() {
  var socket = tls.connect({
    port: this.address().port,
    rejectUnauthorized: false
  }, function() {
    var peerCert = socket.getPeerCertificate();

    console.error(util.inspect(peerCert));
    assert.equal(peerCert.subject.CN, 'Ádám Lippai');
    verified = true;
    server.close();
  });
  socket.end('Hello');
});

process.on('exit', function() {
  assert.ok(verified);
});
