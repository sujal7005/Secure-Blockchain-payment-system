// Backend/src/services/twoFactorService.js
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

class TwoFactorService {
  // Generate 2FA secret and QR code
  static async generateSecret(email) {
    const secret = speakeasy.generateSecret({
      name: `NETRA PE:${email}`,
      length: 20,
      issuer: 'NETRA PE'
    });
    
    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauthUrl: secret.otpauth_url
    };
  }
  
  // Verify TOTP token
  static verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 steps window for time drift
    });
  }
  
  // Generate backup codes
  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push({
        code: code.match(/.{1,4}/g).join('-'),
        used: false
      });
    }
    return codes;
  }
  
  // Generate TOTP token for testing
  static generateToken(secret) {
    return speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
  }
}

export default TwoFactorService;