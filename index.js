const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const os = require('os');
const pdfParse = require('pdf-parse');
const chokidar = require('chokidar');

// module imports

// checking function imports
const checkAndCreateLogFile = require('./checking_functions/checkAndCreateLogFile');
const extractInvoiceDate = require('./checking_functions/extractPDFData');
const extractNominationDate = require('./checking_functions/extractNominationDate');
const updateNominationInAutomatedCheckingFile = require('./checking_functions/updateAutomatedCheckingFile');



// global constants


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
            x: 300,
            y: 419,
            width: 22,
            height: 19,
            color: grayRectangle,
        });
        const pdfBytesModified = await pdfDoc.save();
        await fsPromises.writeFile(pdfPath, pdfBytesModified);
    } catch (err) {
        console.error("Failed to annotate PDF:", err);
    }
}


// Function to move screenshot from Desktop to Target Folder
const moveScreenshotToTargetFolder = (targetFolderPath) => {
    const desktopItems = fs.readdirSync(desktopPath);
    const screenshot = desktopItems.find((item) => item.includes('Screenshot'));

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

// function to move the compliance form and calculation output to the target folder:

const moveAndRenameFilesFromDownloads = (targetFolderPath) => {
    const filesToMove = ['Compliance Form.pdf', 'Calculation Output (HEERs).pdf'];

    filesToMove.forEach(file => {
        const oldPath = path.join(downloadsPath, file);
        const newPath = path.join(targetFolderPath, file);

        // Move the file
        if (fs.existsSync(oldPath)) {
            try {
                fs.renameSync(oldPath, newPath);
                console.log(`Moved ${file} to ${targetFolderPath}`);
            } catch (err) {
                console.error(`Error moving ${file}: ${err}`);
            }
        } else {
            console.warn(`File ${file} does not exist in the Downloads folder.`);
        }
    });
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
        { condition: 'Screenshot', newName: '0. Nomination form to OES' },
        { condition: 'nominationForm', newName: '1. Nomination Form' },
        { condition: 'Nomination Form', newName: '1. Nomination Form' },
        { condition: 'siteAssessment', newName: '2. Site Assessment' },
        { condition: 'Site Assessment', newName: '2. Site Assessment' },
        { condition: 'site assessment', newName: '2. Site Assessment' },
        { condition: 'SA', newName: '2. Site Assessment' },
        { condition: 'taxInvoice', newName: '3. Tax Invoice' },
        { condition: 'receipt', newName: '4. Proof of Payment' },
        { condition: 'Coc', newName: '5. CoC' },
        { condition: 'postImplementation', newName: '6. Post Implementation' },
        { condition: 'Post Implement Form', newName: '6. Post Implementation' },
        { condition: 'PID', newName: '6. Post Implementation' },
        { condition: 'image2', newName: '7. Proof of Decommission', moveToParent: true },
        { condition: 'Compliance Form', newName: '0. Compliance Form.pdf' },
        { condition: 'Calculation Output', newName: '0. Calculation Output (HEERs)' },
        { condition: 'insta' , newName: '8. Installer Existing System Declaration' },
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

// monitor downlooads folder to annotate the files automatically

const watcher = chokidar.watch(downloadsPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    depth: 99, // depth to watch subdirectories, can be adjusted based on your needs
    awaitWriteFinish: true, // waits until file size does not change for a while before firing event
});

watcher
    .on('add', path => {
        if (!path.endsWith('.zip')) {
            console.log(`File ${path} has been added.`);
            checkAndCreateLogFile(downloadsPath);  // Call the helper function here
            main();
        } else {
            console.log(`Ignoring .zip file: ${path}`);
        }
    })
    .on('unlink', path => {
        if (!path.endsWith('.zip')) {
            console.log(`File ${path} has been removed.`);
            checkAndCreateLogFile(downloadsPath);  // Call the helper function here
            main();
        } else {
            console.log(`Ignoring .zip file: ${path}`);
        }
    });




const main = async () => {


    // renaming functions
    // 1. Find Target Folder
    const targetFolderPath = findTargetFolder(downloadsPath);
    if (!targetFolderPath) {
        console.log('Target folder not found.');
        return;
    }

    // 2. Move and Rename Files
    moveAndRenameFiles(targetFolderPath);

    // 3. Process Folder Contents
    processFiles(targetFolderPath);

    // 4. Rename the Target Folder using PDF data
    renameTargetFolderUsingPDF(targetFolderPath);

    // 5. Annotate PDFs
    // try {
    //     await annotatePDF(targetFolderPath);
    // } catch (err) {
    //     console.error('Failed to annotate PDF:', err);
    // }

    // checking functions

    // 6. Extract invoice date
    const pdfPath = path.join(targetFolderPath, "3. Tax Invoice.pdf");
    const invoiceDate = await extractInvoiceDate(pdfPath);

    // extracting Nomination fomr date

    const nominationPdfPath = path.join(targetFolderPath, "1. Nomination Form.pdf");
    const nominationDate = await extractNominationDate(nominationPdfPath);

    // Update automated_checking.txt
    updateNominationInAutomatedCheckingFile(nominationDate);

}

// Helper Function: Find Target Folder
const findTargetFolder = (dirPath) => {
    const items = fs.readdirSync(dirPath);
    const targetFolder = items.find(item => {
        const itemPath = path.join(dirPath, item);
        return /\d{6}/.test(item) && fs.statSync(itemPath).isDirectory();
    });
    return targetFolder ? path.join(dirPath, targetFolder) : null;
}

// Helper Function: Move and Rename Files
const moveAndRenameFiles = (folderPath) => {
    moveAndRenameFilesFromDownloads(folderPath);
    moveScreenshotToTargetFolder(folderPath);
}

// Helper Function: Rename the Target Folder using data from the PDF
const renameTargetFolderUsingPDF = async (folderPath) => {
    const pdfPath = path.join(folderPath, "3. Tax Invoice.pdf");
    const customerName = await readPDF(pdfPath);
    const folderRegex = /\d{6}/;
    const match = folderPath.match(folderRegex);

    if (customerName && match) {
        const newFolderName = `${customerName} (${match[0]})`;
        const newFolderPath = path.join(downloadsPath, newFolderName);

        try {
            fs.renameSync(folderPath, newFolderPath);
            console.log(`Folder renamed to: ${newFolderName}`);
        } catch (err) {
            console.error("Error renaming folder:", err);
        }
    } else {
        console.warn("Either customerName or match is missing. Folder not renamed.");
    }



}

// Execute the main function
main();

