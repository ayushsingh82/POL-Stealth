/**
 * Payment Request (receiver-initiated) flow
 * Build shareable payment links and QR for "Request POL"
 */

import type { StealthAddressQRData } from '../../../src/utils/qrCodeGenerator';
import { generateStealthAddressQR } from '../../../src/utils/qrCodeGenerator';

export interface PaymentRequestOptions {
  /** Stealth address to receive payment */
  stealthAddress: `0x${string}`;
  /** Amount in POL (optional) */
  amount?: string;
  /** Base URL of the app (e.g. window.location.origin) for the /pay page */
  baseUrl: string;
  /** Path to pay page (default: /pay) */
  payPath?: string;
}

export interface PaymentRequestResult {
  /** Same stealth address */
  stealthAddress: string;
  /** Full URL to open: baseUrl/pay?to=0x...&amount=... */
  paymentLink: string;
  /** Data URL for QR image (encode payment link so scanner opens pay page) */
  qrDataUrl: string;
}

/**
 * Build payment request link and QR for the Request flow.
 * Receiver generates a stealth address, then calls this to get a shareable link and QR.
 */
export function buildPaymentRequest(options: PaymentRequestOptions): PaymentRequestResult {
  const { stealthAddress, amount, baseUrl, payPath = '/pay' } = options;
  const params = new URLSearchParams({ to: stealthAddress });
  if (amount != null && amount.trim() !== '' && !Number.isNaN(parseFloat(amount))) {
    params.set('amount', amount.trim());
  }
  const path = payPath.startsWith('/') ? payPath : `/${payPath}`;
  const paymentLink = `${baseUrl.replace(/\/$/, '')}${path}?${params.toString()}`;

  const qrData: StealthAddressQRData = {
    stealthAddress,
    amount: amount?.trim(),
    chainId: 80002,
  };
  const qrDataUrl = generateStealthAddressQR(qrData);

  return {
    stealthAddress,
    paymentLink,
    qrDataUrl,
  };
}

/**
 * Build only the payment link (no QR). Use when you generate QR elsewhere.
 */
export function buildPaymentLink(
  stealthAddress: string,
  amount: string | undefined,
  baseUrl: string,
  payPath: string = '/pay'
): string {
  const params = new URLSearchParams({ to: stealthAddress });
  if (amount != null && amount.trim() !== '' && !Number.isNaN(parseFloat(amount))) {
    params.set('amount', amount.trim());
  }
  const path = payPath.startsWith('/') ? payPath : `/${payPath}`;
  return `${baseUrl.replace(/\/$/, '')}${path}?${params.toString()}`;
}

/**
 * Parse pay page query params (to, amount) from a URL or search string.
 */
export function parsePaymentRequestUrl(searchOrUrl: string): { to?: string; amount?: string } {
  let search: string;
  if (searchOrUrl.startsWith('http')) {
    try {
      search = new URL(searchOrUrl).search;
    } catch {
      return {};
    }
  } else {
    search = searchOrUrl.startsWith('?') ? searchOrUrl : `?${searchOrUrl}`;
  }
  const params = new URLSearchParams(search);
  return {
    to: params.get('to') || undefined,
    amount: params.get('amount') || undefined,
  };
}
