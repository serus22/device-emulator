'use strict';

const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const zlib = require('zlib');

let run = false;
let addBt = false;
let addId = false;
let dataPacket = 'aa11aa22aa33ee11ee22ee33'.repeat(50);
let deviceId = 'abcdef01';
let deviceBt = 'f1f1';

let IP = '192.168.1.106';

server.on('error', err => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {

  console.log(`${(new Date()).toISOString().substr(11,8)} server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

  if (msg.toString() === 'ko') {
    console.log(`START ${rinfo.address}`);
    IP = rinfo.address;
    run = true;
  } else if(msg.toString() === 'ok') {
    console.log(`STOP`);
    run = false;
  } else if(msg.toString() === 'tb') {
    if (run) {
      server.send(new Buffer(deviceBt, 'hex'), 0, deviceBt.length, 5000 / 2, rinfo.address);
    } else {
      addBt = true;
    }
  } else if(msg.toString() === 'di') {
    if(run) {
      server.send(new Buffer(deviceId, 'hex'), 0, deviceId.length / 2, 5000, rinfo.address);
    } else {
      addId = true;
    }
  } else {
    server.send(new Buffer('ee', 'hex'), 0, 1, 5000, rinfo.address);
    console.log(`UNKNOWN ${msg.toString()}`);
  }

});

server.on('listening', () => {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(5000);

let round = 0;

setInterval(() => {
  if(run) {
    let data = dataPacket;
    if(addBt) {
      //data += deviceBt;
    } else if(addId) {
      //data += deviceId;
    }
    server.send(new Buffer(data, 'hex'), 0, data.length / 2, 5000, IP);
  } else if(! run && round%50 === 0) {
    console.log(`${round/50} id sent`);
    server.send(new Buffer(deviceId, 'hex'), 0, deviceId.length / 2, 5000, IP);
  }
  round++;
}, 50);
