/**
 * resolveMediaUrl: Converts relative media paths (such as /uploads/voice/... or /uploads/documents/...)
 * into fully qualified URLs pointing to the live backend server.
 * Handles:
 * - Data URLs (data:audio/...) -> preserved as-is (0ms latency, 100% persistent)
 * - Blob URLs (blob:http...) -> preserved as-is
 * - Full URLs (http://, https://) -> preserved as-is
 * - Relative paths (/uploads/...) -> resolved against VITE_API_URL if configured, or preserved for proxy
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();

  // Already a self-contained or absolute URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Resolve relative path against configured backend API base URL
  const rawApiUrl = import.meta.env.VITE_API_URL || '';
  if (rawApiUrl) {
    const backendOrigin = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${backendOrigin}${cleanPath}`;
  }

  return trimmed;
}

export default resolveMediaUrl;
