// Resolves the backend Socket.IO/HTTP server URL.
//
// Priority:
//   1. REACT_APP_BACKEND_URL env var, if explicitly set (production/online deploys).
//   2. Otherwise, auto-detect: assume the backend runs on the same host as the
//      page (great for LAN play - whatever IP/hostname a player used to load
//      the page, the backend is assumed to live on that same host, port 8000).
export function getBackendUrl() {
    const envUrl = process.env.REACT_APP_BACKEND_URL;
    if (envUrl && envUrl.trim() !== '') {
        return envUrl.trim();
    }

    if (typeof window !== 'undefined' && window.location) {
        const { protocol, hostname } = window.location;
        const backendPort = process.env.REACT_APP_BACKEND_PORT || '8000';
        return `${protocol}//${hostname}:${backendPort}`;
    }

    return 'http://localhost:8000';
}
