"use strict";
/**
 * QR Code Generator for Stealth Addresses
 * Generates QR codes for stealth addresses and transaction data
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStealthAddressQR = generateStealthAddressQR;
exports.generateQRCodeWithLibrary = generateQRCodeWithLibrary;
exports.parseQRCodeData = parseQRCodeData;
/**
 * Generate QR code data URL for a stealth address
 * Uses a simple SVG-based QR code (for production, use a library like qrcode)
 */
function generateStealthAddressQR(data, options = {}) {
    const { size = 256, margin = 4, color = { dark: '#000000', light: '#FFFFFF' }, errorCorrectionLevel = 'M' } = options;
    // Build the data string
    let qrData = `ethereum:${data.stealthAddress}`;
    if (data.amount) {
        qrData += `?value=${data.amount}`;
    }
    if (data.tokenAddress) {
        qrData += `${data.amount ? '&' : '?'}token=${data.tokenAddress}`;
    }
    if (data.chainId) {
        qrData += `${qrData.includes('?') ? '&' : '?'}chainId=${data.chainId}`;
    }
    // For now, return a data URL that can be used with a QR code library
    // In production, integrate with qrcode library: npm install qrcode
    return generateQRCodeSVG(qrData, size, margin, color);
}
/**
 * Generate QR code SVG (simple implementation)
 * For production, use a proper QR code library
 */
function generateQRCodeSVG(data, size, margin, color) {
    const darkColor = color.dark || '#000000';
    const lightColor = color.light || '#FFFFFF';
    // This is a placeholder - in production, use qrcode library
    // For now, return a simple encoded data URL
    const encoded = encodeURIComponent(data);
    // Return a placeholder SVG that can be replaced with actual QR code
    // To use actual QR codes, install: npm install qrcode @types/qrcode
    return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${lightColor}"/>
      <text x="50%" y="50%" text-anchor="middle" font-family="monospace" font-size="12" fill="${darkColor}">
        ${data.substring(0, 20)}...
      </text>
      <text x="50%" y="60%" text-anchor="middle" font-size="10" fill="${darkColor}">
        Install qrcode library for actual QR
      </text>
    </svg>
  `)}`;
}
/**
 * Generate QR code using qrcode library (if available)
 * Install: npm install qrcode @types/qrcode
 */
async function generateQRCodeWithLibrary(data, options = {}) {
    try {
        // Dynamic import of qrcode library
        // @ts-ignore - qrcode types may not be available
        const QRCode = await Promise.resolve().then(() => __importStar(require('qrcode')));
        const qrData = buildQRDataString(data);
        const { size = 256, margin = 4, color = { dark: '#000000', light: '#FFFFFF' }, errorCorrectionLevel = 'M' } = options;
        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.default.toDataURL(qrData, {
            width: size,
            margin: margin,
            color: {
                dark: color.dark,
                light: color.light
            },
            errorCorrectionLevel: errorCorrectionLevel
        });
        return qrCodeDataURL;
    }
    catch (error) {
        // Fallback to SVG if library not available
        console.warn('QRCode library not available, using fallback:', error);
        return generateStealthAddressQR(data, options);
    }
}
/**
 * Build QR code data string from stealth address data
 */
function buildQRDataString(data) {
    let qrData = `ethereum:${data.stealthAddress}`;
    const params = [];
    if (data.amount) {
        params.push(`value=${data.amount}`);
    }
    if (data.tokenAddress) {
        params.push(`token=${data.tokenAddress}`);
    }
    if (data.chainId) {
        params.push(`chainId=${data.chainId}`);
    }
    if (data.memo) {
        params.push(`memo=${encodeURIComponent(data.memo)}`);
    }
    if (params.length > 0) {
        qrData += `?${params.join('&')}`;
    }
    return qrData;
}
/**
 * Parse QR code data back to stealth address data
 */
function parseQRCodeData(qrData) {
    try {
        if (!qrData.startsWith('ethereum:')) {
            return null;
        }
        const [addressPart, queryPart] = qrData.substring(9).split('?');
        const stealthAddress = addressPart;
        const data = {
            stealthAddress
        };
        if (queryPart) {
            const params = new URLSearchParams(queryPart);
            if (params.has('value')) {
                data.amount = params.get('value') || undefined;
            }
            if (params.has('token')) {
                data.tokenAddress = params.get('token');
            }
            if (params.has('chainId')) {
                data.chainId = parseInt(params.get('chainId') || '0');
            }
            if (params.has('memo')) {
                data.memo = decodeURIComponent(params.get('memo') || '');
            }
        }
        return data;
    }
    catch (error) {
        console.error('Failed to parse QR code data:', error);
        return null;
    }
}
