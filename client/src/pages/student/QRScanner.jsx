import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import api from '../../api/axios';
import { QrCode, CheckCircle, XCircle } from 'lucide-react';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If the user arrived via a link with ?token=xyz (e.g. from an email/notification)
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    
    if (tokenParam) {
      setScanning(false);
      markAttendance(tokenParam);
    } else {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera not supported on this device/browser");
        setScanning(false);
        return;
      }

      // Start QR Scanner camera
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
        supportedScanTypes: ["qr_code"],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      });

      scanner.render(
        (decodedText) => {
          console.log("QR Code detected:", decodedText);
          scanner.clear();
          setScanning(false);
          setScannerStarted(true);
          // decodedText will be the full URL (e.g. http://localhost:5173/scan?token=...)
          try {
            const url = new URL(decodedText);
            const token = url.searchParams.get('token');
            if (token) {
              markAttendance(token);
            } else {
              setError("Invalid QR Code format. No token found.");
            }
          } catch (e) {
            // If it's just the raw token string instead of a URL
            markAttendance(decodedText);
          }
        },
        (errorMessage) => {
          console.log("QR Scanner error:", errorMessage);
          setScannerStarted(true);
          // Only show error if it's not a permission or camera issue
          if (errorMessage.includes("NotAllowedError") || errorMessage.includes("Permission denied")) {
            setError("Camera permission denied. Please allow camera access and refresh the page.");
            setScanning(false);
          } else if (errorMessage.includes("NotFoundError")) {
            setError("No camera found on this device.");
            setScanning(false);
          }
          // ignore other stream errors during scanning
        }
      ).then(() => {
        setScannerStarted(true);
      }).catch((err) => {
        console.error("Failed to start scanner:", err);
        setError("Failed to start camera. Please check permissions and try again.");
        setScanning(false);
        setScannerStarted(true);
      });

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [retryKey]);

  const retryScan = () => {
    setError(null);
    setScanning(true);
    setScannerStarted(false);
    setRetryKey(prev => prev + 1);
  };

  const markAttendance = async (token) => {
    try {
      const res = await api.post('/attendance/mark', { token });
      if (res.data.success) {
        setScanResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance. QR code may be expired.');
    }
  };

  return (
    <DashboardLayout title="Scan QR Code">
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        
        <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', textAlign: 'center' }}>
          
          {scanning && !error && !scanResult && (
            <div>
              <QrCode size={48} className="text-primary mb-4 mx-auto" style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
              <h2 style={{ marginBottom: '8px' }}>Mark Your Attendance</h2>
              <p className="text-muted mb-4" style={{ marginBottom: '24px' }}>
                {scannerStarted ? 'Point your camera at the QR code displayed by the faculty.' : 'Starting camera...'}
              </p>
              
              <div id="reader" style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}></div>
              
              {!scannerStarted && (
                <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  If camera doesn't start, check browser permissions or try refreshing the page.
                </div>
              )}
            </div>
          )}

          {scanResult && (
            <div className="animate-fade-in">
              <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={48} color="var(--success)" />
              </div>
              <h2 style={{ marginBottom: '12px', color: 'var(--success)' }}>Attendance Marked!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{scanResult.message}</p>
              <button className="btn btn-primary" onClick={() => navigate('/student')} style={{ width: '100%', justifyContent: 'center' }}>
                Return to Dashboard
              </button>
            </div>
          )}

          {error && (
            <div className="animate-fade-in">
              <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <XCircle size={48} color="var(--danger)" />
              </div>
              <h2 style={{ marginBottom: '12px', color: 'var(--danger)' }}>Camera Error</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={retryScan} style={{ flex: 1, justifyContent: 'center' }}>
                  Try Again
                </button>
                <button className="btn" onClick={() => navigate('/student')} style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}>
                  Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
};

export default QRScanner;
