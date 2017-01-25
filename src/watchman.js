import RpiLeds from 'rpi-leds';
import {series} from 'async';
import InfiniteLoop from 'infinite-loop';
import cmd from 'node-cmd';
import {includes} from 'lodash';
import Isaax from 'isaax-agent-js';

const isaax = Isaax({
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaXNoIjpbImRldmljZS80MjBlNWNiMS0zYTAxLTRjNjItOGU1YS1mNzEzN2E4NWVmMTIvKyIsImRldmljZS84Y2M4MmUxNy1kODAyLTQzYjktOGFkZi0xMTYyMGZlZTE4YTUvKyJdLCJzdWJzY3JpYmUiOlsiY2xvdWQvNDIwZTVjYjEtM2EwMS00YzYyLThlNWEtZjcxMzdhODVlZjEyLysiLCJjbG91ZC8yMmE0ZjAzOS0zYzZiLTQ0YzItYThmMC1iMWM0NmU2NzFlZDIvKyIsImNsb3VkLzhjYzgyZTE3LWQ4MDItNDNiOS04YWRmLTExNjIwZmVlMThhNS8rIl0sInAiOiI4Y2M4MmUxNy1kODAyLTQzYjktOGFkZi0xMTYyMGZlZTE4YTUiLCJvIjoiOTZhMzBmOTktNTMzNi00YTQ4LWE0MTItZTA0NjQwOTI0MWZhIiwiaWF0IjoxNDc5Njk2NDYxfQ.bkv5Om2SSqBnSv-St9-7sSw5ifbQYPozOMr6YkxZBlA',
    deviceId: '8cc82e17-d802-43b9-8adf-11620fee18a5',
    clusterId: '420e5cb1-3a01-4c62-8e5a-f7137a85ef12',
    projectId: '22a4f039-3c6b-44c2-a8f0-b1c46e671ed2'
});

const statusLED = new RpiLeds().power;
const il = new InfiniteLoop();
let status = {transmission: true, hdd: true};

const check = () => {
    cmd.get('service transmission-daemon status', (data) => {
            if (!includes(data, 'Active: active (running)')) {
                isaax.log('transmission is dead');
                statusLED.blink();
            } else {
                statusLED.heartbeat();
            }
            if (includes(data, 'Network is unreachable')) {
                isaax.log('transmission web-interface down, restarting...');
                cmd.run('service transmission-daemon restart');
            }
        }
    );
    cmd.get('df', (data) => {
            if (!includes(data, '/mnt/toshiba')) {
                statusLED.turnOff();
                isaax.log('hdd unmount');
            }
        }
    );
};

series([
    (ntpDone) => {cmd.get('ntpdate kh.pool.ntp.org', ntpDone)},
    (timeData, loopStarted) => {
        isaax.log(timeData);
        isaax.log('starting main loop...');
        il.add(check).setInterval(5000).run();
        loopStarted();
    }
]);

