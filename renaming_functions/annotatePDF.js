const {PDFDocument, rgb} = require("pdf-lib");

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