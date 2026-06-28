// Generates and persists a per-room player token so a player can reconnect
// to an in-progress game after a dropped connection or page refresh.
//
// Stored in sessionStorage (survives refresh, but not opening a brand new
// tab) so multiple players testing on the same machine in different tabs
// don't accidentally share a token.
function generateToken() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getPlayerToken(roomCode) {
    const key = `coup_token_${roomCode}`;
    try {
        let token = sessionStorage.getItem(key);
        if (!token) {
            token = generateToken();
            sessionStorage.setItem(key, token);
        }
        return token;
    } catch {
        // sessionStorage unavailable (e.g. privacy mode) — fall back to an
        // in-memory token for this page load only.
        return generateToken();
    }
}
