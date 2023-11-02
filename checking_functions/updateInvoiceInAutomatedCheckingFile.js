const path = require('path');
const os = require('os');
const fs = require('fs');


const updateInvoiceInAutomatedCheckingFile = async (date) => {
    const automatedCheckingFilePath = path.join(os.homedir(), 'Downloads', 'automated_checking.txt');

    let fileContent;
    try {
        fileContent = fs.readFileSync(automatedCheckingFilePath, 'utf-8');
    } catch (err) {
        console.error(`Failed to read automated_checking.txt: ${err.message}`);
        return;
    }

    if (!fileContent.includes('3. Tax Invoice.pdf')) {
        const lineToAdd = `3. Tax Invoice.pdf: date: ${date}\n`;
        try {
            fs.appendFileSync(automatedCheckingFilePath, lineToAdd);
            console.log(`Added line to automated_checking.txt: ${lineToAdd}`);
        } catch (err) {
            console.error(`Failed to append to automated_checking.txt: ${err.message}`);
        }
    }
};

module.exports = updateInvoiceInAutomatedCheckingFile;