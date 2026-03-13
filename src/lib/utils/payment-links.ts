// ============================================================================
// ManyHandz — Payment Deep Links
// Generates deep links and fallback URLs for popular payment platforms.
// Used in the roommate mode to facilitate easy splitting / reimbursement.
// ============================================================================

export interface PaymentLink {
  url: string;          // deep link URL (app-specific protocol or web URL)
  fallbackUrl: string;  // web fallback if the deep link doesn't work
  platform: string;     // human-readable platform name
}

export type PaymentPlatform = 'venmo' | 'paypal' | 'cashapp' | 'apple_cash';

/**
 * Generates a deep link and fallback URL for a given payment platform.
 *
 * @param platform - one of 'venmo', 'paypal', 'cashapp', 'apple_cash'
 * @param handle - the recipient's username or handle on the platform
 * @param amount - optional dollar amount (e.g. 25 for $25)
 * @param note - optional payment note/memo (defaults to 'ManyHandz')
 */
export function getPaymentLink(
  platform: string,
  handle: string,
  amount?: number,
  note?: string
): PaymentLink {
  const encodedNote = encodeURIComponent(note || 'ManyHandz');
  const amountStr = amount !== undefined && amount > 0 ? String(amount) : '';

  switch (platform) {
    case 'venmo': {
      const venmoParams = [
        'txn=pay',
        `recipients=${encodeURIComponent(handle)}`,
        amountStr ? `amount=${amountStr}` : '',
        `note=${encodedNote}`,
      ]
        .filter(Boolean)
        .join('&');
      return {
        url: `venmo://paycharge?${venmoParams}`,
        fallbackUrl: `https://venmo.com/${encodeURIComponent(handle)}`,
        platform: 'Venmo',
      };
    }

    case 'paypal': {
      const paypalPath = amountStr
        ? `${encodeURIComponent(handle)}/${amountStr}`
        : encodeURIComponent(handle);
      return {
        url: `https://paypal.me/${paypalPath}`,
        fallbackUrl: `https://paypal.me/${encodeURIComponent(handle)}`,
        platform: 'PayPal',
      };
    }

    case 'cashapp': {
      // Cash App handles are prefixed with $ — strip it from input if present
      const cleanHandle = handle.startsWith('$') ? handle.slice(1) : handle;
      const cashappPath = amountStr
        ? `$${cleanHandle}/${amountStr}`
        : `$${cleanHandle}`;
      return {
        url: `https://cash.app/${cashappPath}`,
        fallbackUrl: `https://cash.app/$${cleanHandle}`,
        platform: 'Cash App',
      };
    }

    case 'apple_cash': {
      // Apple Cash does not have a universal deep link scheme
      return {
        url: '',
        fallbackUrl: '',
        platform: 'Apple Cash',
      };
    }

    default:
      return {
        url: '',
        fallbackUrl: '',
        platform,
      };
  }
}

/**
 * Returns all supported payment platforms with their display info.
 */
export function getSupportedPlatforms(): {
  key: PaymentPlatform;
  name: string;
  icon: string;
  hasDeepLink: boolean;
}[] {
  return [
    { key: 'venmo', name: 'Venmo', icon: 'wallet', hasDeepLink: true },
    { key: 'paypal', name: 'PayPal', icon: 'credit-card', hasDeepLink: true },
    { key: 'cashapp', name: 'Cash App', icon: 'banknote', hasDeepLink: true },
    { key: 'apple_cash', name: 'Apple Cash', icon: 'apple', hasDeepLink: false },
  ];
}

/**
 * Validates that a payment handle looks reasonable for a given platform.
 * This is a basic client-side check, not authoritative validation.
 */
export function isValidHandle(platform: string, handle: string): boolean {
  if (!handle || handle.trim().length === 0) return false;

  switch (platform) {
    case 'venmo':
      // Venmo usernames: 5-30 chars, alphanumeric and hyphens
      return /^[a-zA-Z0-9-]{2,30}$/.test(handle);
    case 'paypal':
      // PayPal.me links use the PayPal username or email
      return handle.length >= 2 && handle.length <= 50;
    case 'cashapp':
      // Cash App: $cashtag, 1-20 alphanumeric characters (may include leading $)
      const cleanHandle = handle.startsWith('$') ? handle.slice(1) : handle;
      return /^[a-zA-Z0-9]{1,20}$/.test(cleanHandle);
    case 'apple_cash':
      // Apple Cash uses phone number or Apple ID
      return handle.length >= 2;
    default:
      return handle.length >= 1;
  }
}
