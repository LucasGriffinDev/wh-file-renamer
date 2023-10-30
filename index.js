const fs = require('fs');
const path = require('path');
const os = require('os');
const pdfParse = require('pdf-parse');

const downloadsPath = path.join(os.homedir(), 'Downloads');

const parsePDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const lines = data.text.split('\n');
    const customerLine = lines.find(line => line.startsWith('Customer:'));
    if (customerLine) {
        const customerName = customerLine.replace('Customer:', '').trim();
        console.log(`Extracted customer name: ${customerName}`);
        return customerName;
    }
    return null;
};

const renameFolder = (oldFolderPath, customerName) => {
    // Extracting the 6-digit number from the old folder name
    const match = oldFolderPath.match(/\d{6}/);
    if (!match) return;

    const sixDigitNumber = match[0];
    const newFolderName = `${customerName} (${sixDigitNumber})`;
    const newFolderPath = path.join(path.dirname(oldFolderPath), newFolderName);

    // Rename the folder
    fs.renameSync(oldFolderPath, newFolderPath);
    return newFolderPath;
};

const getChromagenFolder = () => {
    try {
        const folders = fs.readdirSync(downloadsPath);
        return folders.find(folder => /\d{6}/.test(folder));
    } catch (err) {
        console.error(`Error reading the directory: ${err}`);
    }
};

const handleFiles = async (folderPath) => {
    const items = fs.readdirSync(folderPath);

    for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stats = fs.statSync(itemPath);

        if (item.includes("3. Tax Invoice")) {
            const customerName = await parsePDF(itemPath);
            if (customerName) return customerName;        }

        // If item is a directory, recurse into it
        if (stats.isDirectory()) {
            handleFiles(itemPath);
            return;
        }



        // Rename conditions
        if (item.includes("Screen Shot")) fs.renameSync(itemPath, path.join(folderPath, "0. Nomination form to OES.png"));
        else if (item.includes("nominationForm")) fs.renameSync(itemPath, path.join(folderPath, "1. Nomination Form.pdf"));
        else if (item.includes("siteAssessment")) fs.renameSync(itemPath, path.join(folderPath, "2. Site Assessment.pdf"));
        else if (item.includes("taxInvoice")) fs.renameSync(itemPath, path.join(folderPath, "3. Tax Invoice.pdf"));
        else if (item.includes("receipt")) fs.renameSync(itemPath, path.join(folderPath, "4. Receipt.pdf"));
        else if (item.includes("Coc")) fs.renameSync(itemPath, path.join(folderPath, "5. CoC.pdf"));
        else if (item.includes("postImplementation")) fs.renameSync(itemPath, path.join(folderPath, "6. Post Implementation.pdf"));
        else if (item.includes("image2")) fs.renameSync(itemPath, path.join(folderPath, "7. Proof of Decommission.pdf"));
        else if (item.includes("Compliance Form")) fs.renameSync(itemPath, path.join(folderPath, "0. Compliance Form.pdf"));
        else if (item.includes("Calculation Output")) fs.renameSync(itemPath, path.join(folderPath, "0. Calculation Output (HEERs).pdf"));

        // Delete conditions
        else if (item.includes("nswCOC")) fs.unlinkSync(itemPath);
        else if (folderPath.includes('images') && item.includes('Sign')) fs.unlinkSync(itemPath);
    };
};

const main = async () => {
    const chromagenFolder = getChromagenFolder();
    if (!chromagenFolder) {
        console.log("Chromagen folder not found");
        return;
    }

    let chromagenFolderPath = path.join(downloadsPath, chromagenFolder);
    const customerName = await handleFiles(chromagenFolderPath);
    if (customerName) {
        chromagenFolderPath = renameFolder(chromagenFolderPath, customerName);
    }

};

main()
