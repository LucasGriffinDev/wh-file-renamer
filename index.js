const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const os = require('os');
const pdfParse = require('pdf-parse');


const downloadsPath = path.join(os.homedir(), 'Downloads');
const desktopPath = path.join(os.homedir(), 'Desktop');

// function to annotate the 1. Nomination form to cover the incorrectly ticked box:

async function annotatePDF(targetFolderPath) {
    const pdfPath = path.join(targetFolderPath, '1. Nomination Form.pdf');
    try {
        const pdfBytes = await fsPromises.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const grayCode = 0.92
        const grayRectangle = rgb(grayCode, grayCode, grayCode);
        firstPage.drawRectangle({
            x: 305,
            y: 419,
            width: 20,
            height: 19,
            color: grayRectangle,
        });
        const pdfBytesModified = await pdfDoc.save();
        await fsPromises.writeFile(path.join(targetFolderPath, '1. Nomination Form_annotated.pdf'), pdfBytesModified);
    } catch (err) {
        console.error("Failed to annotate PDF:", err);
    }
}


// Function to move screenshot from Desktop to Target Folder
const moveScreenshotToTargetFolder = (targetFolderPath) => {
    const desktopItems = fs.readdirSync(desktopPath);
    const screenshot = desktopItems.find((item) => item.includes('Screen Shot'));

    if (screenshot) {
        const oldPath = path.join(desktopPath, screenshot);
        const newPath = path.join(targetFolderPath, screenshot);

        try {
            fs.renameSync(oldPath, newPath);
            console.log(`Moved ${screenshot} to ${targetFolderPath}`);
        } catch (err) {
            console.error(`Error moving screenshot: ${err}`);
        }
    }
};

// function to process names of files to correct version
const processFiles = (folderPath) => {
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stats = fs.statSync(itemPath);

        // Handling Directories
        if (stats.isDirectory()) {
            if (item === 'images') {
                processImageFolder(itemPath);
            } else {
                processFiles(itemPath);
            }
            continue;
        }

        // File renaming conditions
        renameFile(item, itemPath, folderPath);
    }
};

//  function to recursively look inside the images folder inside the target folder

const processImageFolder = (folderPath) => {
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
        const itemPath = path.join(folderPath, item);

        // Delete conditions
        if (item.includes('Sign')) {
            fs.unlinkSync(itemPath);
        }

        // Also handle renaming inside 'images' folder
        renameFile(item, itemPath, folderPath);  // Added this line
    }
};

// hash map of renaming conventions
const renameFile = (item, itemPath, folderPath) => {
    const renameMap = [
        { condition: 'Screen Shot', newName: '0. Nomination form to OES' },
        { condition: 'nominationForm', newName: '1. Nomination Form' },
        { condition: 'siteAssessment', newName: '2. Site Assessment' },
        { condition: 'taxInvoice', newName: '3. Tax Invoice' },
        { condition: 'receipt', newName: '4. Proof of Payment' },
        { condition: 'Coc', newName: '5. CoC' },
        { condition: 'postImplementation', newName: '6. Post Implementation' },
        { condition: 'image2', newName: '7. Proof of Decommission', moveToParent: true },
        { condition: 'Compliance Form', newName: '0. Compliance Form.pdf' },
        { condition: 'Calculation Output', newName: '0. Calculation Output (HEERs)' },
    ];

    const mapping = renameMap.find((map) => item.includes(map.condition));
    if (mapping) {
        let newPath;
        if (mapping.moveToParent) {
            const parentFolderPath = path.dirname(folderPath);
            newPath = path.join(parentFolderPath, mapping.newName + path.extname(item));  // Adding file extension
        } else {
            newPath = path.join(folderPath, mapping.newName + path.extname(item));  // Adding file extension
        }

        try {
            fs.renameSync(itemPath, newPath);
        } catch (err) {
            console.error("Error in renaming:", err);
        }
    }



    // Delete conditions
    if (item.includes('nswCOC')) {
        fs.unlinkSync(itemPath);}
};

// read pdf for customer name with the intent of renaming the Target Folder

const readPDF = async (pdfPath) => {
    const dataBuffer = fs.readFileSync(pdfPath);

    try {
        const data = await pdfParse(dataBuffer);
        const regex = /Customer:\s*(.*)/;
        const match = data.text.match(regex);

        if (match) {
            return match[1].trim();
        }
    } catch (err) {
        console.error("Error reading PDF:", err);
    }

    return null;
};

const main = async () => {

    const folders = fs.readdirSync(downloadsPath);
    const targetFolder = folders.find((folder) => /\d{6}/.test(folder));
    console.log("Target Folder: ", targetFolder);  // New line

    if (!targetFolder) {
        console.log('Target folder not found.');
        return;
    }

    const targetFolderPath = path.join(downloadsPath, targetFolder);
    moveScreenshotToTargetFolder(targetFolderPath);  // New line
    processFiles(targetFolderPath);

    // Path to the PDF file
    const pdfPath = path.join(targetFolderPath, "3. Tax Invoice.pdf");

    const customerName = await readPDF(pdfPath);
    const folderRegex = /\d{6}/;
    const match = targetFolder.match(folderRegex);
    // console.log("Extracted Customer Name:", customerName);
    // console.log("Regex Match:", match);


    if (customerName && match) {
        const newFolderName = `${customerName} (${match[0]})`;
        const newFolderPath = path.join(downloadsPath, newFolderName);

        try {
            fs.renameSync(targetFolderPath, newFolderPath);
            console.log(`Folder renamed to: ${newFolderName}`);
        } catch (err) {
            console.error("Error renaming folder:", err);
        }
    } else {
        console.warn("Either customerName or match is missing. Folder not renamed.");
    }

    try {
        await annotatePDF(targetFolderPath);  // Annotate the PDF
    } catch (err) {
        console.error('Failed to annotate PDF:', err);
    }



}
main();
