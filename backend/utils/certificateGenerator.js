const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Generate certificate PDF
const generateCertificate = async (ippData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 50
            });

            // Create certificates directory if it doesn't exist
            const certDir = path.join(__dirname, '../certificates');
            if (!fs.existsSync(certDir)) {
                fs.mkdirSync(certDir, { recursive: true });
            }

            const fileName = `CERT-${ippData.ippId}.pdf`;
            const filePath = path.join(certDir, fileName);

            // Pipe PDF to file
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Certificate design
            const centerX = doc.page.width / 2;
            const centerY = doc.page.height / 2;

            // Background gradient effect
            doc.save();
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');
            doc.restore();

            // Border
            doc.save();
            doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
                .lineWidth(3)
                .stroke('#1f2937');
            doc.restore();

            // Header
            doc.fontSize(36)
                .font('Helvetica-Bold')
                .fillColor('#1f2937')
                .text('INTERNSHIP PERFORMANCE CERTIFICATE', 0, 80, {
                    align: 'center',
                    width: doc.page.width
                });

            // Certificate ID
            doc.fontSize(14)
                .font('Helvetica')
                .fillColor('#6b7280')
                .text(`Certificate ID: CERT-${ippData.ippId}`, 0, 140, {
                    align: 'center',
                    width: doc.page.width
                });

            // Main content
            doc.fontSize(16)
                .font('Helvetica')
                .fillColor('#1f2937')
                .text('This is to certify that', 0, 200, {
                    align: 'center',
                    width: doc.page.width
                });

            // Student name
            doc.fontSize(28)
                .font('Helvetica-Bold')
                .fillColor('#3b82f6')
                .text(ippData.studentDetails?.name || 'Student Name', 0, 240, {
                    align: 'center',
                    width: doc.page.width
                });

            // Internship details
            doc.fontSize(16)
                .font('Helvetica')
                .fillColor('#1f2937')
                .text('has successfully completed an internship as', 0, 290, {
                    align: 'center',
                    width: doc.page.width
                });

            doc.fontSize(22)
                .font('Helvetica-Bold')
                .fillColor('#059669')
                .text(ippData.internshipDetails?.role || 'Internship Role', 0, 320, {
                    align: 'center',
                    width: doc.page.width
                });

            doc.fontSize(16)
                .font('Helvetica')
                .fillColor('#1f2937')
                .text(`at ${ippData.internshipDetails?.company || 'Company Name'}`, 0, 360, {
                    align: 'center',
                    width: doc.page.width
                });

            // Performance details
            const performanceY = 420;
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('#1f2937')
                .text('Performance Summary:', 100, performanceY);

            if (ippData.summary) {
                doc.fontSize(12)
                    .font('Helvetica')
                    .fillColor('#374151')
                    .text(`Overall Rating: ${ippData.summary.overallRating}/10`, 100, performanceY + 30)
                    .text(`Performance Grade: ${ippData.summary.performanceGrade}`, 100, performanceY + 50)
                    .text(`Employability Score: ${ippData.summary.employabilityScore}`, 100, performanceY + 70);
            }

            // Dates
            const datesY = performanceY;
            const rightX = doc.page.width - 300;

            doc.fontSize(12)
                .font('Helvetica')
                .fillColor('#6b7280')
                .text(`Internship Period:`, rightX, datesY)
                .text(`${new Date(ippData.internshipDetails?.startDate).toLocaleDateString()} - ${new Date(ippData.internshipDetails?.endDate).toLocaleDateString()}`, rightX, datesY + 20)
                .text(`Certificate Issued: ${new Date().toLocaleDateString()}`, rightX, datesY + 50);

            // Footer
            const footerY = doc.page.height - 120;


            // Signature lines
            const sigY = footerY + 40;
            doc.moveTo(100, sigY).lineTo(250, sigY).stroke('#6b7280');
            doc.moveTo(doc.page.width - 250, sigY).lineTo(doc.page.width - 100, sigY).stroke('#6b7280');

            doc.fontSize(10)
                .fillColor('#6b7280')
                .text('Placement Officer', 100, sigY + 10, { width: 150, align: 'center' })
                .text('Faculty Mentor', doc.page.width - 250, sigY + 10, { width: 150, align: 'center' });

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve({
                    fileName,
                    filePath,
                    certificateId: `CERT-${ippData.ippId}`,
                    downloadUrl: `/certificates/${fileName}`
                });
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

// Generate QR code data URL
const generateQRCode = async (certificateId, ippId) => {
    try {
        const qrData = JSON.stringify({
            certificateId,
            ippId,
            verificationUrl: `${process.env.FRONTEND_URL}/verify/${certificateId}`,
            issuedAt: new Date().toISOString()
        });

        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('Error generating QR code:', error);
        // Return a placeholder if QR generation fails
        return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    }
};

module.exports = {
    generateCertificate,
    generateQRCode
};