const pdfParse = require('pdf-parse');
const fs = require('fs');

const updateAutomatedCheckingFile = require('./updateAutomatedCheckingFile');
const updateInvoiceInAutomatedCheckingFile = require('./updateInvoiceInAutomatedCheckingFile');



const extractInvoiceDate = async (pdfPath) => {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(dataBuffer);
        // Use a regular expression to find the date pattern after "Date:"
        const regex = /Date:\s*(\d{2}\/\d{2}\/\d{4})/;
        const match = data.text.match(regex);
        if (match) {
            console.log(`Extracted Date from Tax Invoice: ${match[1]}`);
            updateAutomatedCheckingFile(match[1]); // Call the function to update the file
            updateInvoiceInAutomatedCheckingFile(match[1]);

            return match[1];  // Return the date
        } else {
            console.log('Date not found in Tax Invoice.');
            return null;
        }
    } catch (error) {
            console.error(`Error extracting invoice date: ${error.message}`);

            return null;
    }
};

module.exports = extractInvoiceDate;
