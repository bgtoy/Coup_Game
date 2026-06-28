// Persists the full game session (room code, player name, and reconnect
// token) so that reloading the page can rejoin an in-progress game
// automatically instead of dropping the player back to the home screen.
//
// Stored in sessionStorage: survives a page refresh, but is scoped to this
// browser tab/window, which is exactly the boundary a reconnecting player
// should have (a different tab is treated as a different seat).

const STORAGE_KEY = 'coup_session';

function generateToken() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function saveGameSession({ roomCode, name, token }) {
    try {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ roomCode, name, token })
        );
    } catch {
        // sessionStorage unavailable (e.g. privacy mode) — reconnect-after-
        // reload simply won't work in that case, which is an acceptable
        // degradation rather than a crash.
    }
}

export function getGameSession() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.roomCode || !parsed.name || !parsed.token) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function clearGameSession() {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
}

// Returns an existing token for this tab, or creates and saves a new one.
// Used before a session is fully established (i.e. before the player has
// successfully joined a room).
export function getOrCreateToken() {
    const existing = getGameSession();
    if (existing && existing.token) return existing.token;
    return generateToken();
}
