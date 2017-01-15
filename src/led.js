var RpiLeds = require('rpi-leds');
var leds = new RpiLeds();
var InfiniteLoop = require('infinite-loop');
var cmd = require('node-cmd');
var _ = require('lodash');


var il = new InfiniteLoop();

function checkTransmission() {
    cmd.get('/etc/init.d/transmission-daemon status', function(data) {
            if (_.includes(data, 'Active: active (running)')) {
                leds.power.heartbeat();
                console.log('transmission is running...');
            }
            else {
                leds.power.turnOff();
                console.log('transmission dead');
            }
        }
    );
}

il.add(checkTransmission).setInterval(5000).run();
