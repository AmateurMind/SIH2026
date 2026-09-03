import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  QrCode, 
  ExternalLink, 
  Clock, 
  Hash, 
  User, 
  Building2, 
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

// Strip trailing /api from VITE_API_URL since verify endpoints already include /api/verify
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get('tx');

  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyCertificate();
  }, [certificateId, txId]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError(null);

      let url;
      if (txId) {
        // Direct blockchain verification by transaction ID
        url = `${API_BASE_URL}/api/verify/blockchain/${txId}`;
      } else if (certificateId) {
        // Verify by certificate ID
        url = `${API_BASE_URL}/api/verify/certificate/${certificateId}`;
      } else {
        setError('No certificate ID or transaction ID provided');
        setLoading(false);
        return;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setVerificationResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying certificate on blockchain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-red-800">What this means:</p>
                  <p className="text-sm text-red-700 mt-1">
                    The certificate could not be verified. This may be due to an invalid ID, 
                    network issues, or the certificate not being registered on the blockchain yet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!verificationResult || !verificationResult.verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Verified</h1>
            <p className="text-gray-600 mb-6">
              {verificationResult?.reason || 'This certificate could not be verified.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { certificate, blockchain } = verificationResult;
  const isBlockchainVerified = blockchain && blockchain.verified;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Certificate Verified
          </h1>
          <p className="text-gray-600">
            This certificate has been verified on the Algorand blockchain
          </p>
        </div>

        {/* Main Certificate Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Internship Performance Certificate</h2>
                  <p className="text-blue-100 text-sm">Verified Credential</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-mono text-sm">{certificate.certificateId}</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Recipient Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recipient</p>
                  <p className="text-lg font-semibold text-gray-900">{certificate.studentName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Organization</p>
                  <p className="text-lg font-semibold text-gray-900">{certificate.company}</p>
                </div>
              </div>
            </div>

            {/* Role & Grade */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Position</p>
                <p className="text-lg font-semibold text-gray-900">{certificate.role}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Performance Grade</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">{certificate.performanceGrade}</span>
                  <span className="text-gray-600">({certificate.overallRating}/10)</span>
                </div>
              </div>
            </div>

            {/* Issued Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Clock className="w-4 h-4" />
              <span>Issued on {new Date(certificate.generatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>

            {/* Blockchain Verification Section */}
            {blockchain && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Blockchain Verification</h3>
                  {isBlockchainVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Not Verified
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Network</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{blockchain.network}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Block Round</span>
                    <span className="text-sm font-mono text-gray-900">{blockchain.blockRound?.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transaction ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-900 truncate max-w-[150px]">
                        {blockchain.transactionId}
                      </span>
                      <a 
                        href={blockchain.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stored At</span>
                    <span className="text-sm text-gray-900">
                      {new Date(blockchain.storedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-start gap-2">
                      <Hash className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Certificate Hash (SHA-256)</p>
                        <p className="text-xs font-mono text-gray-700 break-all">
                          {blockchain.certificateHash}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={blockchain.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Algorand Explorer
                  </a>

                  {blockchain.details?.hashMatch && (
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Hash Match Verified
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>
            This certificate is secured by Algorand blockchain technology. 
            The hash of this certificate is permanently stored on the blockchain, 
            ensuring its authenticity and preventing tampering.
          </p>
        </div>
      </div>
    </div>
  );
}
