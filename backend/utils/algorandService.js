const algosdk = require('algosdk');
const crypto = require('crypto');

// Algorand Configuration
const ALGORAND_NETWORK = process.env.ALGORAND_NETWORK || 'testnet'; // 'mainnet' | 'testnet'

// Algod (Node) Configuration
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || '';
const ALGOD_SERVER = process.env.ALGOD_SERVER || 
  ALGORAND_NETWORK === 'mainnet' 
    ? 'https://mainnet-api.algonode.cloud'
    : 'https://testnet-api.algonode.cloud';
// AlgoNode cloud URLs already use HTTPS (port 443) - don't pass port explicitly
// as it causes SDK request failures with algonode cloud endpoints
const ALGOD_PORT = (ALGOD_SERVER.includes('algonode.cloud')) ? '' : (process.env.ALGOD_PORT || '');

// Indexer Configuration (for querying blockchain)
const INDEXER_SERVER = process.env.INDEXER_SERVER || 
  ALGORAND_NETWORK === 'mainnet'
    ? 'https://mainnet-idx.algonode.cloud'
    : 'https://testnet-idx.algonode.cloud';

// Issuer Wallet (the wallet that will "sign" certificates on-chain)
const ISSUER_MNEMONIC = process.env.ALGORAND_ISSUER_MNEMONIC;

class AlgorandCertificateService {
  constructor() {
    try {
      this.algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
      this.indexerClient = new algosdk.Indexer(ALGOD_TOKEN, INDEXER_SERVER, ALGOD_PORT);
      
      // Initialize issuer account if mnemonic provided
      if (ISSUER_MNEMONIC) {
        try {
          this.issuerAccount = algosdk.mnemonicToSecretKey(ISSUER_MNEMONIC);
          console.log('✅ Algorand issuer wallet loaded:', this.issuerAccount.addr);
        } catch (mnemonicError) {
          console.error('❌ Invalid Algorand mnemonic:', mnemonicError.message);
          this.issuerAccount = null;
        }
      } else {
        console.warn('⚠️ No ALGORAND_ISSUER_MNEMONIC set. Blockchain certificate storage disabled.');
        this.issuerAccount = null;
      }
      
      console.log(`🔗 Algorand service initialized (${ALGORAND_NETWORK})`);
    } catch (initError) {
      console.error('❌ Algorand service initialization failed:', initError.message);
      this.algodClient = null;
      this.indexerClient = null;
      this.issuerAccount = null;
    }
  }

  /**
   * Generate a SHA-256 hash of certificate data
   * This creates a unique fingerprint of the certificate content
   */
  generateCertificateHash(certificateData) {
    // Create a canonical JSON representation (sorted keys for consistency)
    const canonicalData = JSON.stringify(certificateData, Object.keys(certificateData).sort());
    return crypto.createHash('sha256').update(canonicalData).digest('hex');
  }

  /**
   * Store certificate hash on Algorand blockchain
   * Uses the "note" field in a 0-ALGO transaction to store the hash
   * This is cost-effective (~0.001 ALGO per transaction)
   */
  async storeCertificateHash(certificateData, metadata = {}) {
    if (!this.issuerAccount) {
      throw new Error('Issuer wallet not configured. Set ALGORAND_ISSUER_MNEMONIC env variable.');
    }

    if (!this.algodClient) {
      throw new Error('Algod client not initialized.');
    }

    try {
      // Generate hash of certificate data
      const certificateHash = this.generateCertificateHash(certificateData);
      
      // Get suggested transaction parameters
      const suggestedParams = await this.algodClient.getTransactionParams().do();

      // Use minimum fee to conserve ALGO (testnet min fee is 0.001 ALGO)
      suggestedParams.fee = algosdk.ALGORAND_MIN_TX_FEE; // 1000 microAlgos = 0.001 ALGO
      suggestedParams.flatFee = true;

      // Prepare note field data - keep it small to minimize costs
      const noteData = {
        type: 'CERTIFICATE_ATTESTATION',
        v: '1.0',
        hash: certificateHash,
        certId: certificateData.certificateId,
        stuId: certificateData.studentId,
        ts: new Date().toISOString(),
        issuer: this.issuerAccount.addr,
        meta: {
          name: metadata.studentName,
          company: metadata.company,
          role: metadata.role
        }
      };

      // Convert to UTF-8 encoded note
      const noteString = JSON.stringify(noteData);
      const note = new Uint8Array(Buffer.from(noteString));
      
      if (note.length > 1000) {
        console.warn('⚠️ Note field is', note.length, 'bytes. Trimming metadata...');
        // If too large, strip metadata to save space
        delete noteData.meta;
        const trimmedNote = new Uint8Array(Buffer.from(JSON.stringify(noteData)));
        if (trimmedNote.length > 1000) {
          throw new Error('Certificate metadata too large for note field');
        }
      }

      // Create 0-ALGO self-transaction for attestation (minimal cost)
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: this.issuerAccount.addr,
        to: this.issuerAccount.addr, // Self-send for attestation
        amount: 0, // 0 ALGO
        note: note,
        suggestedParams
      });

      // Sign transaction
      const signedTxn = txn.signTxn(this.issuerAccount.sk);

      // Send transaction
      const sendResult = await this.algodClient.sendRawTransaction(signedTxn).do();
      const txId = sendResult.txId;

      console.log('📤 Transaction sent:', txId, '(waiting for confirmation...)');

      // Wait for confirmation using SDK utility (cleaner than manual polling)
      const confirmedTxn = await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      console.log('✅ Transaction confirmed in round:', confirmedTxn['confirmed-round']);

      return {
        success: true,
        transactionId: txId,
        certificateHash,
        blockRound: confirmedTxn['confirmed-round'],
        timestamp: new Date().toISOString(),
        network: ALGORAND_NETWORK,
        algorandExplorerUrl: this.getExplorerUrl(txId)
      };

    } catch (error) {
      console.error('❌ Error storing certificate hash on Algorand:', error.message);
      
      // Provide helpful error messages
      let userMessage = error.message;
      if (error.message.includes('overspend') || error.message.includes('below min')) {
        userMessage = 'Insufficient ALGO balance. Please fund the issuer wallet via testnet faucet.';
      } else if (error.message.includes('mnemonic')) {
        userMessage = 'Invalid issuer mnemonic. Check ALGORAND_ISSUER_MNEMONIC env variable.';
      }

      return {
        success: false,
        error: userMessage,
        details: error.message
      };
    }
  }

  /**
   * Verify a certificate against the blockchain
   * Re-hashes the certificate data and compares with stored hash
   */
  async verifyCertificate(certificateData, transactionId) {
    try {
      if (!this.indexerClient) {
        throw new Error('Indexer client not initialized.');
      }

      // Generate current hash from provided data
      const currentHash = this.generateCertificateHash(certificateData);

      // Fetch the transaction from blockchain
      const txnInfo = await this.indexerClient.lookupTransactionByID(transactionId).do();
      
      if (!txnInfo || !txnInfo.transaction) {
        return {
          verified: false,
          reason: 'Transaction not found on blockchain'
        };
      }

      const txn = txnInfo.transaction;

      // Parse note field
      let storedData;
      try {
        const noteBuffer = Buffer.from(txn.note, 'base64');
        storedData = JSON.parse(noteBuffer.toString());
      } catch (e) {
        return {
          verified: false,
          reason: 'Invalid note data in transaction'
        };
      }

      // Verify data matches (support both old and new field names)
      if (storedData.type !== 'CERTIFICATE_ATTESTATION') {
        return {
          verified: false,
          reason: 'Not a certificate attestation transaction'
        };
      }

      // Support both old format (certificateHash) and new compact format (hash)
      const storedHash = storedData.certificateHash || storedData.hash;
      const storedId = storedData.certificateId || storedData.certId;

      const hashMatches = storedHash === currentHash;
      const idMatches = storedId === certificateData.certificateId;

      return {
        verified: hashMatches && idMatches,
        hashMatch: hashMatches,
        idMatch: idMatches,
        storedHash,
        currentHash,
        transactionId,
        blockRound: txn['confirmed-round'],
        timestamp: storedData.timestamp || storedData.ts,
        issuer: storedData.issuer,
        network: ALGORAND_NETWORK,
        metadata: storedData.metadata || storedData.meta
      };

    } catch (error) {
      console.error('Error verifying certificate:', error);
      return {
        verified: false,
        reason: error.message,
        error: error.stack
      };
    }
  }

  /**
   * Look up certificate by hash (find attestation transaction)
   */
  async findCertificateByHash(certificateHash) {
    try {
      if (!this.indexerClient || !this.issuerAccount) {
        return { found: false, error: 'Service not configured' };
      }

      // Search for transactions from the issuer address
      const response = await this.indexerClient
        .searchForTransactions()
        .address(this.issuerAccount.addr)
        .txType('pay')
        .do();

      const matchingTxns = (response.transactions || []).filter(txn => {
        if (!txn.note) return false;
        try {
          const noteData = JSON.parse(Buffer.from(txn.note, 'base64').toString());
          const storedHash = noteData.certificateHash || noteData.hash;
          return storedHash === certificateHash;
        } catch {
          return false;
        }
      });

      return {
        found: matchingTxns.length > 0,
        transactions: matchingTxns.map(txn => ({
          transactionId: txn.id,
          blockRound: txn['confirmed-round'],
          timestamp: txn['round-time'],
          note: JSON.parse(Buffer.from(txn.note, 'base64').toString())
        }))
      };

    } catch (error) {
      console.error('Error finding certificate:', error);
      return {
        found: false,
        error: error.message
      };
    }
  }

  /**
   * Get Algorand explorer URL for transaction
   */
  getExplorerUrl(txId) {
    const baseUrl = ALGORAND_NETWORK === 'mainnet' 
      ? 'https://allo.info/tx/'
      : 'https://testnet.explorer.perawallet.app/tx/';
    return `${baseUrl}${txId}`;
  }

  /**
   * Check if service is properly configured
   */
  isConfigured() {
    return {
      hasIssuerWallet: !!this.issuerAccount,
      network: ALGORAND_NETWORK,
      algodServer: ALGOD_SERVER,
      indexerServer: INDEXER_SERVER,
      issuerAddress: this.issuerAccount?.addr || null
    };
  }

  /**
   * Generate a new issuer wallet (for setup purposes)
   * WARNING: Save the mnemonic securely!
   */
  static generateWallet() {
    const account = algosdk.generateAccount();
    const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
    
    return {
      address: account.addr,
      mnemonic,
      warning: 'SAVE THIS MNEMONIC SECURELY! It cannot be recovered if lost.'
    };
  }

  /**
   * Get suggested transaction parameters for fee estimation
   */
  async getTransactionParams() {
    try {
      if (!this.algodClient) return null;
      
      const params = await this.algodClient.getTransactionParams().do();
      return {
        minFee: algosdk.ALGORAND_MIN_TX_FEE, // 1000 microAlgos = 0.001 ALGO
        flatFee: true,
        firstRound: params.firstRound,
        lastRound: params.lastRound,
        genesisId: params.genesisID,
        genesisHash: params.genesisHash
      };
    } catch (error) {
      console.error('Error getting transaction params:', error);
      return null;
    }
  }
}

// Export singleton instance
const algorandService = new AlgorandCertificateService();

module.exports = {
  AlgorandCertificateService,
  algorandService
};
