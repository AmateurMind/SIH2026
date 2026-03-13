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
 * Parse PDF file and extract text
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<{text: string, numPages: number, metadata: object}>}
 */
async function parsePDF(buffer) {
    // Import library entry directly to avoid pdf-parse index debug code
    // that tries to read ./test/data/* in serverless bundles.
    const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    try {
        const data = await pdfParse(buffer);
        return {
            text: data.text,
            numPages: data.numpages,
            metadata: data.info || {}
        };
    } catch (firstError) {
        // Some PDFs have malformed xref tables. Re-save once via pdf-lib and retry.
        const pdfLibModule = await import('pdf-lib');
        const { PDFDocument, ParseSpeeds } = pdfLibModule;

        try {
            const repairedDoc = await PDFDocument.load(buffer, {
                ignoreEncryption: true,
                parseSpeed: ParseSpeeds.Fastest,
                throwOnInvalidObject: false,
                capNumbers: false,
            });
            const repairedBytes = await repairedDoc.save({
                useObjectStreams: false,
                addDefaultPage: false,
            });

            const repairedData = await pdfParse(Buffer.from(repairedBytes));
            return {
                text: repairedData.text,
                numPages: repairedData.numpages,
                metadata: repairedData.info || {}
            };
        } catch {
            throw firstError;
        }
    }
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
