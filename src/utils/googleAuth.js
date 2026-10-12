/**
 * googleAuth.js
 * High-reliability Google Identity Services (GIS) OAuth integration for SkillSwap PK.
 *
 * Provides genuine Google OAuth account selection and consent flow via Google Identity Services:
 * - Opens authentic Google account picker popup (prompt: 'select_account')
 * - Returns verified OAuth tokens to backend for identity verification and account creation
 * - Handles cancellations, popups closed by user, network errors, and missing credentials gracefully
 */

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
}

export function isGoogleAuthConfigured() {
  const clientId = getGoogleClientId();
  return Boolean(clientId && !clientId.includes('your-google-client-id'));
}

/**
 * Ensures Google Identity Services script is loaded.
 */
function waitForGoogleScript(timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2 || window.google?.accounts?.id) {
      return resolve(window.google);
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2 || window.google?.accounts?.id) {
        clearInterval(interval);
        return resolve(window.google);
      }
      if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        reject(
          new Error(
            'Google Sign-In SDK is still loading or was blocked by a browser extension. Please check your connection and disable any ad blockers blocking accounts.google.com.'
          )
        );
      }
    }, 100);
  });
}

/**
 * Initiates the genuine Google Account Selection & Consent popup flow.
 * Returns a promise resolving with { access_token } or rejecting with user-friendly error.
 */
export async function triggerGoogleOAuth() {
  const clientId = getGoogleClientId();

  if (!clientId || clientId.includes('your-google-client-id')) {
    throw new Error(
      'Google Sign-In is not configured yet. Please set VITE_GOOGLE_CLIENT_ID in your environment variables to connect your Google Cloud Console project.'
    );
  }

  // Ensure GIS library is ready
  const google = await waitForGoogleScript();

  return new Promise((resolve, reject) => {
    try {
      if (!google.accounts?.oauth2?.initTokenClient) {
        throw new Error('Google Identity Services oauth2 client is not available in the current browser.');
      }

      let isSettled = false;

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: (response) => {
          if (isSettled) return;
          isSettled = true;

          if (response.error) {
            if (response.error === 'access_denied') {
              return reject(new Error('Google sign-in was cancelled. Permissions were not granted.'));
            }
            if (response.error === 'popup_closed_by_user') {
              return reject(new Error('Google sign-in popup was closed before completing authentication.'));
            }
            return reject(new Error(`Google authentication failed: ${response.error}`));
          }

          if (response.access_token) {
            resolve({ access_token: response.access_token });
          } else {
            reject(new Error('No access token received from Google authentication flow.'));
          }
        },
        error_callback: (err) => {
          if (isSettled) return;
          isSettled = true;

          if (err.type === 'popup_closed') {
            return reject(new Error('Google sign-in popup was closed before completing authentication.'));
          }
          if (err.type === 'popup_failed_to_open') {
            return reject(new Error('Google sign-in popup was blocked by your browser. Please allow popups for this site.'));
          }
          reject(new Error(err.message || 'Google sign-in popup error.'));
        }
      });

      // Prompt account selection to ensure user can select their actual Google account
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      reject(err);
    }
  });
}
