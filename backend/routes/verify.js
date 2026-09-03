const express = require('express');
const router = express.Router();
const { algorandService } = require('../utils/algorandService');
const InternshipPerformancePassport = require('../models/InternshipPerformancePassport');
const fs = require('fs');
const path = require('path');

// Helper: Load JSON Data safely
const loadJsonData = (file) => {
    try {
        const filePath = path.join(__dirname, '../data', file);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        console.error(`Error loading ${file}:`, e.message);
    }
    return [];
};

/**
 * GET /api/verify/certificate/:certificateId
 * Verify a certificate by its ID (looks up in database and optionally blockchain)
 */
router.get('/certificate/:certificateId', async (req, res) => {
    try {
        const { certificateId } = req.params;
        
        // Extract IPP ID from certificate ID (format: CERT-IPP-{studentId}-{internshipId}-{year})
        const ippId = certificateId.replace('CERT-', '');
        
        // Find IPP in database
        let ipp = await InternshipPerformancePassport.findOne({ ippId }).lean();
        
        // Fallback to JSON
        if (!ipp) {
            const jsonIPPs = loadJsonData('ipps.json');
            ipp = jsonIPPs.find(i => i.ippId === ippId);
        }

        if (!ipp) {
            return res.status(404).json({
                verified: false,
                reason: 'Certificate not found in database'
            });
        }

        // Check if certificate exists
        if (!ipp.certificate || !ipp.certificate.certificateId) {
            return res.status(404).json({
                verified: false,
                reason: 'No certificate generated for this IPP'
            });
        }

        // Build verification response
        const verificationResult = {
            verified: true,
            certificate: {
                certificateId: ipp.certificate.certificateId,
                generatedAt: ipp.certificate.generatedAt,
                studentName: ipp.studentDetails?.name || 'Unknown',
                company: ipp.internshipDetails?.company,
                role: ipp.internshipDetails?.role,
                performanceGrade: ipp.summary?.performanceGrade,
                overallRating: ipp.summary?.overallRating
            },
            blockchain: null
        };

        // If blockchain data exists, verify on-chain
        if (ipp.blockchainCertificate && ipp.blockchainCertificate.transactionId) {
            const blockchainVerification = await algorandService.verifyCertificate(
                {
                    certificateId: ipp.certificate.certificateId,
                    ippId: ipp.ippId,
                    studentId: ipp.studentId,
                    studentName: ipp.studentDetails?.name,
                    company: ipp.internshipDetails?.company,
                    role: ipp.internshipDetails?.role,
                    overallRating: ipp.summary?.overallRating,
                    performanceGrade: ipp.summary?.performanceGrade,
                    issuedAt: ipp.certificate.generatedAt
                },
                ipp.blockchainCertificate.transactionId
            );

            verificationResult.blockchain = {
                verified: blockchainVerification.verified,
                transactionId: ipp.blockchainCertificate.transactionId,
                network: ipp.blockchainCertificate.network,
                blockRound: ipp.blockchainCertificate.blockRound,
                certificateHash: ipp.blockchainCertificate.certificateHash,
                storedAt: ipp.blockchainCertificate.storedAt,
                explorerUrl: ipp.blockchainCertificate.algorandExplorerUrl,
                issuerAddress: ipp.blockchainCertificate.issuerAddress,
                details: blockchainVerification.verified ? {
                    hashMatch: blockchainVerification.hashMatch,
                    idMatch: blockchainVerification.idMatch
                } : {
                    reason: blockchainVerification.reason
                }
            };

            // If blockchain verification fails, mark overall as unverified
            if (!blockchainVerification.verified) {
                verificationResult.verified = false;
                verificationResult.reason = 'Blockchain verification failed';
            }
        }

        res.json(verificationResult);

    } catch (error) {
        console.error('Error verifying certificate:', error);
        res.status(500).json({
            verified: false,
            error: 'Verification failed',
            details: error.message
        });
    }
});

/**
 * GET /api/verify/blockchain/:transactionId
 * Direct blockchain verification by transaction ID
 */
router.get('/blockchain/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        // Get certificate data from request body or query (optional)
        const certificateData = req.body.certificateData || req.query;

        if (!certificateData || !certificateData.certificateId) {
            // Try to lookup transaction info without verification
            try {
                const txnInfo = await algorandService.indexerClient.lookupTransactionByID(transactionId).do();
                
                if (!txnInfo || !txnInfo.transaction) {
                    return res.status(404).json({
                        found: false,
                        reason: 'Transaction not found on blockchain'
                    });
                }

                const txn = txnInfo.transaction;
                let noteData = null;
                
                try {
                    const noteBuffer = Buffer.from(txn.note, 'base64');
                    noteData = JSON.parse(noteBuffer.toString());
                } catch (e) {
                    return res.status(400).json({
                        found: true,
                        verified: false,
                        reason: 'Transaction found but note data is invalid'
                    });
                }

                return res.json({
                    found: true,
                    verified: noteData.type === 'CERTIFICATE_ATTESTATION',
                    transactionId,
                    blockRound: txn['confirmed-round'],
                    timestamp: txn['round-time'],
                    network: process.env.ALGORAND_NETWORK || 'testnet',
                    certificateHash: noteData.certificateHash || noteData.hash,
                    certificateId: noteData.certificateId || noteData.certId,
                    studentId: noteData.studentId || noteData.stuId,
                    issuedAt: noteData.timestamp || noteData.ts,
                    issuer: noteData.issuer,
                    explorerUrl: algorandService.getExplorerUrl(transactionId),
                    metadata: noteData.metadata || noteData.meta
                });

            } catch (error) {
                return res.status(404).json({
                    found: false,
                    reason: 'Transaction lookup failed',
                    error: error.message
                });
            }
        }

        // Full verification with provided data
        const verificationResult = await algorandService.verifyCertificate(certificateData, transactionId);
        
        res.json({
            ...verificationResult,
            explorerUrl: algorandService.getExplorerUrl(transactionId)
        });

    } catch (error) {
        console.error('Error in blockchain verification:', error);
        res.status(500).json({
            verified: false,
            error: 'Blockchain verification failed',
            details: error.message
        });
    }
});

/**
 * POST /api/verify/hash
 * Verify certificate by hash lookup
 */
router.post('/hash', async (req, res) => {
    try {
        const { certificateHash } = req.body;
        
        if (!certificateHash) {
            return res.status(400).json({
                error: 'Certificate hash is required'
            });
        }

        // Search for certificate in database first
        let ipp = await InternshipPerformancePassport.findOne({
            'blockchainCertificate.certificateHash': certificateHash
        }).lean();

        // Fallback to JSON
        if (!ipp) {
            const jsonIPPs = loadJsonData('ipps.json');
            ipp = jsonIPPs.find(i => 
                i.blockchainCertificate && 
                i.blockchainCertificate.certificateHash === certificateHash
            );
        }

        if (ipp) {
            return res.json({
                found: true,
                source: 'database',
                certificate: {
                    certificateId: ipp.certificate?.certificateId,
                    studentName: ipp.studentDetails?.name,
                    company: ipp.internshipDetails?.company,
                    role: ipp.internshipDetails?.role,
                    transactionId: ipp.blockchainCertificate?.transactionId,
                    storedAt: ipp.blockchainCertificate?.storedAt
                }
            });
        }

        // Search on blockchain
        const blockchainResult = await algorandService.findCertificateByHash(certificateHash);
        
        res.json({
            found: blockchainResult.found,
            source: blockchainResult.found ? 'blockchain' : null,
            transactions: blockchainResult.transactions || []
        });

    } catch (error) {
        console.error('Error in hash verification:', error);
        res.status(500).json({
            error: 'Hash verification failed',
            details: error.message
        });
    }
});

/**
 * GET /api/verify/status
 * Check Algorand service configuration status
 */
router.get('/status', async (req, res) => {
    try {
        const config = algorandService.isConfigured();
        const params = await algorandService.getTransactionParams();

        res.json({
            configured: config.hasIssuerWallet,
            network: config.network,
            algodServer: config.algodServer,
            indexerServer: config.indexerServer,
            hasIssuerWallet: config.hasIssuerWallet,
            transactionParams: params,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to check status',
            details: error.message
        });
    }
});

/**
 * POST /api/verify/generate-wallet
 * Generate a new issuer wallet (for admin setup)
 * WARNING: This is for initial setup only!
 */
router.post('/generate-wallet', async (req, res) => {
    try {
        // In production, this should be protected by admin authentication
        const wallet = algorandService.constructor.generateWallet();
        
        res.json({
            address: wallet.address,
            warning: wallet.warning,
            message: 'SAVE THE MNEMONIC SECURELY! This is the only time it will be shown.',
            fundUrl: process.env.ALGORAND_NETWORK === 'testnet' 
                ? 'https://testnet.algoexplorer.io/dispenser'
                : null
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate wallet',
            details: error.message
        });
    }
});

module.exports = router;
