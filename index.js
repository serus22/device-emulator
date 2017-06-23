'use strict';

const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const zlib = require('zlib');

let run = false;

let packet = [0,1,2,3,4,5,6,7,8,9,10,11];

let batch = [];
for(var i = 0; i < 50; i++) {
  batch = batch.concat(packet);
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

server.on('error', err => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

  if (msg.toString() === 'ok') {
    console.log(`START`);
    run = true;
  } else if(msg.toString() === 'ko') {
    console.log(`STOP`);
    run = false;
  } else {
    console.log(`UNKNOWN ${msg.toString()}`);
  }

});

server.on('listening', () => {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(5000);

let round = 0;
let msg = new Buffer(batch);

let ip = '192.168.1.105';

setInterval(() => {
  if(run) {
    server.send(msg, 0, 600, 5000, ip);
  } else if(! run && round%50 === 0) {
    console.log(`${round}. send`);
    server.send(new Buffer([1,2,3,4]), 0, 4, 5000, ip);
  }
  round++;
}, 20);
