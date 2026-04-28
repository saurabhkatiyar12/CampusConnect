const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');

const generateQRToken = (sessionId, courseId, expiryMinutes = 10) => {
  return jwt.sign(
    { sessionId, courseId, type: 'attendance' },
    process.env.JWT_SECRET,
    { expiresIn: `${expiryMinutes}m` }
  );
};

const generateQRCodeImage = async (token) => {
  try {
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const url = `${clientUrl}/scan?token=${encodeURIComponent(token)}`;
    const qrDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' }
    });
    return { qrDataURL, url };
  } catch (error) {
    throw new Error('Failed to generate QR code: ' + error.message);
  }
};

const verifyQRToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error('QR code expired or invalid');
  }
};

module.exports = { generateQRToken, generateQRCodeImage, verifyQRToken };
