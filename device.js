'use strict';

const dgram = require('dgram');
const server = dgram.createSocket('udp4');

// -----------------------------------------------------------------------------

const ACC_TMP_GYR = "01020336040506";
const DEVICE_ID = 'CC8040'; // deviceID
const BT_DATA = 'aa'; // battery level
const MAG = "070809";

const DATA_PACKET = DEVICE_ID + ACC_TMP_GYR + MAG + ACC_TMP_GYR.repeat(49);


const PORT = 54321;
const COMMANDS = {
  ok: 'ko',
  ko: 'ok',
  id: 'di',
  bt: 'tb'
};

let SEND_DATA = null;
let LOOP_COUNT = 0;
let LAST_CMD = null;

// -----------------------------------------------------------------------------

function messageHandler (msg, rinfo) {

  let val = msg.toString();

  if (val.length !== 2) {
    return;
  }

  LAST_CMD = Date.now();

  let TARGET = rinfo.address;
  
  switch(val) {
    case COMMANDS.ok:
      console.log(`START ${TARGET}`);
      SEND_DATA = TARGET;
      break;
      
    case COMMANDS.ko:
      console.log(`STOP`);
      SEND_DATA = null;
      break;
    
    case COMMANDS.bt:
      if (SEND_DATA) {
        console.log(`SEND BT`);
        // send
        let msg = Buffer.from("bt" + BT_DATA);
        server.send(msg, PORT, TARGET);
      }
      break;
    
    case COMMANDS.id:
      if(SEND_DATA) {
        // send
        let msg = Buffer.from("id" + DEVICE_ID);
        console.log(`SEND ID`);
        server.send(msg, PORT, TARGET);
      }
      break;

    default:
        server.send(new Buffer('ee', 'hex'), 0, 1, PORT, TARGET);
        console.log(`UNKNOWN ${val}`);

  }
}

// -----------------------------------------------------------------------------

function started () {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
}

// -----------------------------------------------------------------------------

function handleError(err) {
  console.log(`server error:\n${err.stack}`);
  server.close();
}

// -----------------------------------------------------------------------------

server.on('message', messageHandler);
server.on('error', handleError);
server.on('listening', started);
server.bind(PORT);

// -----------------------------------------------------------------------------


setInterval(() => {
  if(SEND_DATA) {
    if ((Date.now() - LAST_CMD) - 180000) { // after 3min of inactivity - stop
      SEND_DATA = null;
      return;
    }
    let msg  = Buffer.from(DATA_PACKET);
    server.send(msg, PORT, SEND_DATA);
  } else if(! SEND_DATA && ! (LOOP_COUNT % 50)) {
    LOOP_COUNT = 0;
    console.log(`id sent`);
    let msg = Buffer.from("id" + DEVICE_ID);
    server.send(msg, PORT, SEND_DATA);
  }
  LOOP_COUNT++;
}, 50);

