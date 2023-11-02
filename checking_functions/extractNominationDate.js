const fs = require('fs');
const pdfParse = require('pdf-parse');


const extractNominationDate = async (pdfPath) => {
    try {

        const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);

    // Use a regular expression to find the date pattern after the last "date"
    const regex = /date.*(\d{4}\/\d{2}\/\d{2})/;
    const matches = data.text.matchAll(regex);

    let lastMatch;
    for (const match of matches) {
        lastMatch = match;
    }

    if (lastMatch) {
        const dateInISO = lastMatch[1];
        // Convert from YYYY/MM/DD to DD/MM/YYYY
        const [year, month, day] = dateInISO.split('/');
        return `${day}/${month}/${year}`;
    } else {
        console.log('Date not found in Nomination Form.');
        return null;
    }
    } catch (error) {
        console.error(`Error extracting nomination date: ${error.message}`);
        return null;
    }
};

module.exports = extractNominationDate;
