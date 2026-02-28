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
export declare function generateStealthAddressQR(data: StealthAddressQRData, options?: QRCodeOptions): string;
/**
 * Generate QR code using qrcode library (if available)
 * Install: npm install qrcode @types/qrcode
 */
export declare function generateQRCodeWithLibrary(data: StealthAddressQRData, options?: QRCodeOptions): Promise<string>;
/**
 * Parse QR code data back to stealth address data
 */
export declare function parseQRCodeData(qrData: string): StealthAddressQRData | null;
