/**
 * QR Code Generator for Stealth Addresses
 * Generates QR codes for stealth addresses and transaction data
 */

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface StealthAddressQRData {
  stealthAddress: `0x${string}`;
  amount?: string;
  tokenAddress?: `0x${string}`;
  chainId?: number;
  memo?: string;
}

/**
 * Generate QR code data URL for a stealth address
 * Uses a simple SVG-based QR code (for production, use a library like qrcode)
 */
export function generateStealthAddressQR(
  data: StealthAddressQRData,
  options: QRCodeOptions = {}
): string {
  const {
    size = 256,
    margin = 4,
    color = { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel = 'M'
  } = options;

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
function generateQRCodeSVG(
  data: string,
  size: number,
  margin: number,
  color: { dark?: string; light?: string }
): string {
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
export async function generateQRCodeWithLibrary(
  data: StealthAddressQRData,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    // Dynamic import of qrcode library
    // @ts-ignore - qrcode types may not be available
    const QRCode = await import('qrcode');
    
    const qrData = buildQRDataString(data);
    
    const {
      size = 256,
      margin = 4,
      color = { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel = 'M'
    } = options;

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
  } catch (error) {
    // Fallback to SVG if library not available
    console.warn('QRCode library not available, using fallback:', error);
    return generateStealthAddressQR(data, options);
  }
}

/**
 * Build QR code data string from stealth address data
 */
function buildQRDataString(data: StealthAddressQRData): string {
  let qrData = `ethereum:${data.stealthAddress}`;
  const params: string[] = [];
  
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
export function parseQRCodeData(qrData: string): StealthAddressQRData | null {
  try {
    if (!qrData.startsWith('ethereum:')) {
      return null;
    }

    const [addressPart, queryPart] = qrData.substring(9).split('?');
    const stealthAddress = addressPart as `0x${string}`;

    const data: StealthAddressQRData = {
      stealthAddress
    };

    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      
      if (params.has('value')) {
        data.amount = params.get('value') || undefined;
      }
      
      if (params.has('token')) {
        data.tokenAddress = params.get('token') as `0x${string}` | undefined;
      }
      
      if (params.has('chainId')) {
        data.chainId = parseInt(params.get('chainId') || '0');
      }
      
      if (params.has('memo')) {
        data.memo = decodeURIComponent(params.get('memo') || '');
      }
    }

    return data;
  } catch (error) {
    console.error('Failed to parse QR code data:', error);
    return null;
  }
}

