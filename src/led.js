import RpiLeds from 'rpi-leds';
import InfiniteLoop from 'infinite-loop';
import cmd from 'node-cmd';
import {includes} from 'lodash';
import mqtt from 'mqtt';
import moment from 'moment';

const isaax  = mqtt.connect('mqtt://api.isaax.io', {
    username: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaXNoIjpbImRldmljZS80MjBlNWNiMS0zYTAxLTRjNjItOGU1YS1mNzEzN2E4NWVmMTIvKyIsImRldmljZS84Y2M4MmUxNy1kODAyLTQzYjktOGFkZi0xMTYyMGZlZTE4YTUvKyJdLCJzdWJzY3JpYmUiOlsiY2xvdWQvNDIwZTVjYjEtM2EwMS00YzYyLThlNWEtZjcxMzdhODVlZjEyLysiLCJjbG91ZC8yMmE0ZjAzOS0zYzZiLTQ0YzItYThmMC1iMWM0NmU2NzFlZDIvKyIsImNsb3VkLzhjYzgyZTE3LWQ4MDItNDNiOS04YWRmLTExNjIwZmVlMThhNS8rIl0sInAiOiI4Y2M4MmUxNy1kODAyLTQzYjktOGFkZi0xMTYyMGZlZTE4YTUiLCJvIjoiOTZhMzBmOTktNTMzNi00YTQ4LWE0MTItZTA0NjQwOTI0MWZhIiwiaWF0IjoxNDc5Njk2NDYxfQ.bkv5Om2SSqBnSv-St9-7sSw5ifbQYPozOMr6YkxZBlA',
    clean: false,
    clientId: '8cc82e17-d802-43b9-8adf-11620fee18a5',
    // will: {
    //     topic: 'device/8cc82e17-d802-43b9-8adf-11620fee18a5/agentlog',
    //     payload: {
    //         datetime: moment().format(),
    //         payload: {message: 'device connection failure'}
    //     }
    // }

});

isaax.on('error', (error) => {
    console.log('connection error:', error.message);
});
isaax.on('reconnect', () => {
    console.log('reconnecting to isaax...');
});


const statusLED = new RpiLeds().power;
const il = new InfiniteLoop();
let status = {transmission: true, hdd: true};

const check = () => {
    cmd.get('/etc/init.d/transmission-daemon status', (data) => {
            if (!includes(data, 'Active: active (running)')) {
                statusLED.blink();
                console.log('transmission is dead');
            } else {
                console.log('sending to isaax...');
                isaax.publish('device/420e5cb1-3a01-4c62-8e5a-f7137a85ef12/applog', JSON.stringify({
                    datetime: moment().format(),
                    payload: {message: 'transmission is running...'}
                }));
                statusLED.heartbeat();
            }
        }
    );
    cmd.get('df', (data) => {
            if (!includes(data, '/mnt/toshiba')) {
                statusLED.turnOff();
                console.log('hdd unmount');
            }
        }
    );
};

isaax.on('connect', () => {
    console.log('connected to ISAAX');
    il.add(check).setInterval(5000).run();
});

