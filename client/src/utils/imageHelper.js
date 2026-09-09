// Utility helper for product & catalog image URL formatting and fallbacks

export const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80";

/**
 * Formats image URLs properly:
 * - If null/undefined -> returns FALLBACK_IMAGE
 * - If blob: or data: (e.g. instant preview on file select) -> returns as is
 * - If starts with http:// or https:// -> returns as is
 * - If starts with /uploads/ or uploads/ -> resolves correctly with backend server host
 */
export function getImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== "string") {
    return FALLBACK_IMAGE;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) {
    return FALLBACK_IMAGE;
  }

  // Instant browser preview URLs and data URIs
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Full external URLs
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Ensure leading slash for uploaded static paths
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // Check if we have an explicit backend URL configured in env
  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : "";

  // If backend base URL is known, prefix it; otherwise return relative path (for proxy or same-origin)
  return backendBase ? `${backendBase}${cleanPath}` : cleanPath;
}

/**
 * Safe image onError handler to replace broken images with fallback placeholder
 */
export function handleImageError(e) {
  if (e && e.target && e.target.src !== FALLBACK_IMAGE) {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = FALLBACK_IMAGE;
  }
}
