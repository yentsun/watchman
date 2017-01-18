const plan = require('flightplan');
const fs = require('fs');

plan.target('media', {
    host: 'media',
    username: 'root',
    agent: process.env.SSH_AUTH_SOCK
}, {
    dir: 'projects/led'
});


plan.local(function(local) {
    local.silent();
    local.log('uploading updates...');
    const filesToCopy = local.exec('git ls-files', {
        silent: true
    });
    local.transfer(filesToCopy, plan.runtime.options.dir);
});

plan.remote(function(remote) {

    remote["with"]("cd " + plan.runtime.options.dir, () => {
        remote.log('installing dependencies...');
        remote.exec('npm install');
        remote.log('pruning dependencies...');
        remote.exec('npm prune');
        remote.log('reloading process...');
        remote.exec('pm2 reload pm2.json --env ' + plan.runtime.target);
    });
});
