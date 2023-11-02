const path = require('path');
const fs = require('fs');


const checkAndCreateLogFile = (folderPath) => {

    const logFilePath = path.join(folderPath, 'automated_checking.txt');
    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, '');  // create an empty text file
        console.log('Created automated_checking.txt.');
    } else {
        console.log('automated_checking.txt already exists.');
    }
};

module.exports =  checkAndCreateLogFile;