const child = require('child_process');

let commandStack = [];

function next() {
    let command = commandStack.shift();
    if (command) {
        let childProcess = child.spawn(command);
        childProcess.stderr.on('data', (data) => {
            console.log(data);
        });
        childProcess.stdout.on('data', (data) => {
            console.log(data);
        });

        childProcess.on('close', (code)=> {
            if (code == 0) {
                next();
            }
        })
    }
}

function command(command) {
    commandStack.push(command);
    if (commandStack.length == 1) {
        next();
    }
}

module.exports = command;
