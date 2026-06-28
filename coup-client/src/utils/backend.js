export function getBackendUrl() {

    const envUrl = process.env.REACT_APP_BACKEND_URL;

    if (envUrl && envUrl.trim() !== '') {
        return envUrl.trim();
    }

    // development fallback only
    return 'http://localhost:8000';
}