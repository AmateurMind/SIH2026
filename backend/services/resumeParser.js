/**
 * Parse resume from buffer and extract text content
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @returns {Promise<{text: string, numPages: number, metadata: object}>}
 */
function parseResume(buffer, filename) {
    const ext = filename.toLowerCase().split('.').pop();

    try {
        if (ext === 'pdf') {
            return parsePDF(buffer);
        } else if (ext === 'docx') {
            return parseDOCX(buffer);
        } else {
            throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
        }
    } catch (error) {
        console.error('Resume parsing error:', error);
        throw new Error(`Failed to parse resume file: ${error.message}`);
    }
}

/**
 * Parse PDF file and extract text using pdfjs-dist directly
 * (pdf-parse v2 has an ESM/CJS compatibility bug with ./lib/pdf-parse.js)
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<{text: string, numPages: number, metadata: object}>}
 */
async function parsePDF(buffer) {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const path = await import('path');
    const { pathToFileURL } = await import('url');

    // Resolve the bundled worker file as a file:// URL (required by pdfjs-dist ESM in Node.js)
    const workerPath = path.resolve(
        __dirname,
        '../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
    );
    pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        disableFontFace: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const textPages = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map(item => ('str' in item ? item.str : ''))
            .join(' ');
        textPages.push(pageText);
        page.cleanup();
    }

    await pdfDoc.destroy();

    return {
        text: textPages.join('\n'),
        numPages,
        metadata: {}
    };
}

/**
 * Parse DOCX file and extract text
 * @param {Buffer} buffer - DOCX file buffer
 * @returns {Promise<{text: string, numPages: number, metadata: object}>}
 */
async function parseDOCX(buffer) {
    const mammothModule = await import('mammoth');
    const mammoth = mammothModule.default || mammothModule;

    const result = await mammoth.extractRawText({ buffer });
    return {
        text: result.value,
        numPages: 1,
        metadata: {}
    };
}

module.exports = {
    parseResume,
    parsePDF,
    parseDOCX
};
