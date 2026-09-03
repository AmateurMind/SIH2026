# Algorand Blockchain Certificate Configuration

This document describes how to configure the Algorand blockchain integration for certificate verification.

## Overview

The blockchain certificate feature stores a SHA-256 hash of each generated certificate on the Algorand blockchain. This provides:

- **Tamper-proof verification**: Certificate data cannot be altered without detection
- **Public verification**: Anyone can verify certificate authenticity
- **Permanent record**: Blockchain storage is immutable
- **Trust**: Third parties can independently verify credentials

## Environment Variables

Add these variables to your `.env` file:

```bash
# Algorand Network Configuration
ALGORAND_NETWORK=testnet  # Use 'mainnet' for production

# Issuer Wallet (REQUIRED)
# Generate a new wallet using the admin endpoint or manually
ALGORAND_ISSUER_MNEMONIC=your_twenty_five_word_mnemonic_here_keep_this_secret_and_secure

# Optional: Custom Node Configuration (defaults to AlgoNode)
# ALGOD_SERVER=https://testnet-api.algonode.cloud
# ALGOD_PORT=
# ALGOD_TOKEN=
# INDEXER_SERVER=https://testnet-idx.algonode.cloud
```

## Setup Instructions

### 1. Generate an Issuer Wallet

**Option A: Using the API (Development)**

```bash
curl -X POST http://localhost:5000/api/verify/generate-wallet
```

**Save the mnemonic securely!** This is the only time it will be displayed.

**Option B: Using Pera Algo Wallet**

1. Download [Pera Algo Wallet](https://perawallet.app/)
2. Create a new account
3. Backup the 25-word mnemonic
4. Copy the mnemonic to your `.env` file

### 2. Fund the Wallet

**For Testnet:**
- Use the [AlgoExplorer Testnet Dispenser](https://testnet.algoexplorer.io/dispenser)
- Or use the [Pera Wallet Faucet](https://dispenser.testnet.aws.algodev.network/)

**For Mainnet:**
- Purchase ALGO from an exchange
- Transfer to your issuer wallet address
- Minimum balance: ~0.1 ALGO per certificate (for transaction fees)

### 3. Test the Configuration

```bash
curl http://localhost:5000/api/verify/status
```

Expected response:
```json
{
  "configured": true,
  "network": "testnet",
  "hasIssuerWallet": true,
  "algodServer": "https://testnet-api.algonode.cloud",
  "indexerServer": "https://testnet-idx.algonode.cloud"
}
```

## How It Works

### Certificate Generation Flow

1. Student completes internship and submits documentation
2. Faculty approves the IPP (Internship Performance Passport)
3. System generates PDF certificate
4. System calculates SHA-256 hash of certificate data
5. Hash is stored on Algorand blockchain via 0-ALGO transaction with note field
6. Transaction ID and hash are saved in the database
7. QR code contains verification link with blockchain reference

### Verification Flow

1. User scans QR code or visits verification URL
2. Frontend displays certificate details
3. System queries blockchain to verify hash matches
4. Verification status displayed with blockchain explorer link

## API Endpoints

### Verify by Certificate ID
```
GET /api/verify/certificate/:certificateId
```

### Verify by Blockchain Transaction
```
GET /api/verify/blockchain/:transactionId
```

### Check Service Status
```
GET /api/verify/status
```

### Generate Wallet (Admin only)
```
POST /api/verify/generate-wallet
```

## Security Considerations

### Wallet Security

- **NEVER commit the mnemonic to git**
- Store mnemonic in secure environment variables
- For production, consider:
  - Multi-signature wallets
  - Hardware Security Modules (HSM)
  - Key management services (AWS KMS, HashiCorp Vault)

### Data Privacy

- Only the **hash** of certificate data is stored on blockchain
- No personal information is stored publicly
- Certificate data remains private in your database

## Cost Estimation

Algorand transaction fees are minimal:

- Standard transaction fee: **0.001 ALGO**
- Per-certificate cost: ~**0.001 ALGO** (~$0.0003 USD at current prices)

**Example costs:**
- 1,000 certificates: ~1 ALGO (~$0.30 USD)
- 10,000 certificates: ~10 ALGO (~$3.00 USD)

## Troubleshooting

### "Issuer wallet not configured"
- Check that `ALGORAND_ISSUER_MNEMONIC` is set in `.env`
- Restart the server after updating `.env`

### "Transaction not confirmed"
- Check network connection to Algorand nodes
- Verify wallet has sufficient balance
- Check Algorand network status

### "Certificate not found on blockchain"
- Transaction may still be processing (wait 4-5 seconds)
- Check transaction ID in Algorand explorer
- Verify you're querying the correct network (testnet vs mainnet)

## Pera Wallet Integration (Future)

For student wallet integration (optional):

```javascript
import { PeraWalletConnect } from '@pera-wallet/connect';

const peraWallet = new PeraWalletConnect({
  projectId: 'your-project-id'
});

// Allow students to claim certificates to their own wallet
```

## Support

- [Algorand Developer Portal](https://developer.algorand.org/)
- [Pera Wallet Documentation](https://docs.perawallet.app/)
- [AlgoNode API Docs](https://algonode.io/api/)
