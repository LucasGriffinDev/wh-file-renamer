const fs = require('fs');
const path = require('path');
const os = require('os');

const downloadsPath = path.join(os.homedir(), 'Downloads');

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

const processImageFolder = (folderPath) => {
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
        const itemPath = path.join(folderPath, item);

        // Delete conditions
        if (item.includes('Sign')) {
            fs.unlinkSync(itemPath);
        }
    }
};

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
        console.log("Item Path:", itemPath);
        console.log("New Path:", newPath);

        try {
            fs.renameSync(itemPath, newPath);
        } catch (err) {
            console.error("Error in renaming:", err);
        }
    }

    // Delete conditions
    if (item.includes('nswCOC')) {
        fs.unlinkSync(itemPath);
    }
};

const main = () => {

    const folders = fs.readdirSync(downloadsPath);
    const targetFolder = folders.find((folder) => /\d{6}/.test(folder));
    console.log("Target Folder: ", targetFolder);  // New line

    if (!targetFolder) {
        console.log('Target folder not found.');
        return;
    }

    const targetFolderPath = path.join(downloadsPath, targetFolder);
    processFiles(targetFolderPath);
};

main();
