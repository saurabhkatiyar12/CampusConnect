import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api/axios';
import { QrCode, CheckCircle, XCircle } from 'lucide-react';

const QRScanner = () => {
  const [status, setStatus] = useState('starting');
  const [message, setMessage] = useState('Initializing camera...');
  const [scanResult, setScanResult] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const scannerRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        if (tokenFromUrl) {
          setStatus('submitting');
          setMessage('Attendance link detected, marking attendance...');
          await markAttendance(parseToken(tokenFromUrl));
          return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported on this device/browser.');
        }

        setStatus('starting');
        setMessage('Waiting for camera permission...');

        if (scannerRef.current) {
          await scannerRef.current.stop().catch(() => {});
          await scannerRef.current.clear().catch(() => {});
        }

        const html5QrCode = new Html5Qrcode('reader');
        scannerRef.current = html5QrCode;

        const onScanSuccess = async (decodedText) => {
          if (!decodedText) return;
          await stopScanner();
          setStatus('submitting');
          setMessage('QR detected, marking attendance...');

          const token = parseToken(decodedText);
          await markAttendance(token);
        };

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        };

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras?.length) {
          throw new Error('No camera found. Please attach a camera and refresh.');
        }

        const backCamera = cameras.find((camera) => /back|rear|environment|wide/i.test(camera.label));
        const cameraConfig = backCamera
          ? { deviceId: { exact: backCamera.id } }
          : { deviceId: { exact: cameras[0].id } };

        await html5QrCode.start(cameraConfig, config, onScanSuccess, () => {});

        setStatus('ready');
        setMessage('Point your camera at the attendance QR code.');
      } catch (err) {
        const errorMessage = err?.message || 'Unable to start camera.';
        setStatus('error');
        setMessage(errorMessage);
      }
    };

    const stopScanner = async () => {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        await scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };

    const parseToken = (rawText) => {
      const trimmed = rawText?.trim?.();
      if (!trimmed) return '';
      try {
        const url = new URL(trimmed);
        return url.searchParams.get('token') || trimmed;
      } catch {
        return trimmed;
      }
    };

    const markAttendance = async (token) => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid QR code. Please scan a valid attendance QR code.');
        return;
      }

      try {
        const res = await api.post('/attendance/mark', { token });
        if (res.data?.success) {
          setStatus('success');
          setScanResult(res.data?.message || 'Attendance marked successfully.');
        } else {
          setStatus('error');
          setMessage(res.data?.message || 'Unable to mark attendance.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Attendance submission failed. Please try again.');
      }
    };

    initializeScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [retryCount, tokenFromUrl]);

  const retryScan = () => {
    setStatus('starting');
    setMessage('Restarting scanner...');
    setScanResult(null);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <DashboardLayout title="Scan QR Code">
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '32px', textAlign: 'center' }}>
          <QrCode size={48} style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '12px' }}>Scan to Mark Attendance</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>{message}</p>

          {(status === 'starting' || status === 'ready') && (
            <div>
              <div id="reader" style={{ width: '100%', minHeight: '360px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}></div>
              {status === 'starting' && (
                <p className="text-muted" style={{ marginTop: '16px' }}>Waiting for camera access...</p>
              )}
            </div>
          )}

          {status === 'submitting' && (
            <div style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p className="text-muted">Submitting attendance...</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={48} color="var(--success)" />
              </div>
              <h3 style={{ marginBottom: '12px', color: 'var(--success)' }}>Attendance Marked!</h3>
              <p className="text-muted" style={{ marginBottom: '24px' }}>{scanResult}</p>
              <button className="btn btn-primary" onClick={() => navigate('/student')} style={{ width: '100%' }}>
                Go to Dashboard
              </button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={48} color="var(--danger)" />
              </div>
              <h3 style={{ marginBottom: '12px', color: 'var(--danger)' }}>Unable to Scan</h3>
              <p className="text-muted" style={{ marginBottom: '24px' }}>{message}</p>
              <div style={{ display: 'grid', gap: '12px' }}>
                <button className="btn btn-primary" onClick={retryScan} style={{ width: '100%' }}>
                  Retry
                </button>
                <button className="btn" onClick={() => navigate('/student')} style={{ width: '100%', background: 'rgba(255,255,255,0.1)' }}>
                  Back to Dashboard
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
