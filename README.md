# DEVICE EMULATOR #

simple tool to emulate device communication

waiting on port 5000 and sending echo packet each second, if gets "ko"* it will starts data stream 
600B data packet 20 times in sec (12B of data acc-xyz gyro-xyz, grouped by 50 samples, each 0.05s)
stops on "ok"*

*reversed endian

## DEVICE EMULATOR ##
how to run: 

1. clone
2. npm/yarn install
3. node device.js

thats it



##docu from @lakesi ##

[WDP_protocol] wimo device protocol:

packet clafication by size: - 2B = command packet
- 4B = device_id packet (example: 13417383)
- 12B = data packet
- another size = error string data (debug purpose)

Commands (device will response by same data):
"ok" [0x6F,0x6B] = start data transfer (1x per minute to hold device connected)
"ko" [0x6B,0x6F] = stop data transfer (device will turn off after 'timeout' time)
"bt" [0x62,0x74] = get battery level ( + 2B response with batery level)
"id" [0x69,0x64] = get unique device_ID ( + 4B response with batery level)

data packet: data_format = binary (int16_t values)
2B = accX
2B = accY
2B = accZ
2B = gyrX
2B = gyrY
2B = gyrZ