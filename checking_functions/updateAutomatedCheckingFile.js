const path = require('path');
const fs = require('fs');
const os = require('os');




const updateNominationInAutomatedCheckingFile = async (date) => {
    const automatedCheckingFilePath = path.join(os.homedir(), 'Downloads', 'automated_checking.txt');

    let fileContent;
    try {
        fileContent = fs.readFileSync(automatedCheckingFilePath, 'utf-8');
    } catch (err) {
        console.error(`Failed to read automated_checking.txt: ${err.message}`);
        return;
    }

    if (!fileContent.includes('1. Nomination Form copy.pdf')) {
        const lineToAdd = `1. Nomination Form copy.pdf: date: ${date}, signed: null\n`;
        try {
            fs.appendFileSync(automatedCheckingFilePath, lineToAdd);
            console.log(`Added line to automated_checking.txt: ${lineToAdd}`);
        } catch (err) {
            console.error(`Failed to append to automated_checking.txt: ${err.message}`);
        }
    }
};


module.exports = updateNominationInAutomatedCheckingFile;
