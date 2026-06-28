import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Coup from './game/Coup';
import { getBackendUrl } from '../utils/backend';
import { clearGameSession } from '../utils/gameSession';

const baseUrl = getBackendUrl();

// Shown briefly while we attempt to reconnect to an in-progress game using
// a session saved in this browser tab. If reconnecting fails for any
// reason (room gone, game never actually started, etc.) we fall back to
// the normal home screen via onGiveUp.
export default function Rejoin({ session, onGiveUp }) {
    const [status, setStatus] = useState('connecting'); // 'connecting' | 'success'
    const socketRef = useRef(null);

    useEffect(() => {
        let settled = false;
        let socket = null;
        let failTimer = null;

        const giveUp = () => {
            if (settled) return;
            settled = true;
            clearGameSession();
            if (socket) socket.disconnect();
            onGiveUp();
        };

        // Check the room still exists before opening a socket at all — if it
        // doesn't, Socket.IO would otherwise silently create a fresh, empty
        // namespace with no listeners and hang forever waiting for a reply.
        axios
            .get(`${baseUrl}/exists/${session.roomCode}`)
            .then((res) => {
                if (settled) return;
                if (!res.data.exists) {
                    giveUp();
                    return;
                }
                connectSocket();
            })
            .catch(() => {
                if (settled) return;
                giveUp();
            });

        function connectSocket() {
            socket = io(`${baseUrl}/${session.roomCode}`, {
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 800,
                reconnectionDelayMax: 4000,
                timeout: 8000,
            });
            socketRef.current = socket;

            socket.once('connect', () => {
                socket.emit('setName', session.name, session.token);
            });

            socket.once('rejoinedGame', () => {
                if (settled) return;
                settled = true;
                clearTimeout(failTimer);
                setStatus('success');
            });

            socket.once('joinFailed', () => {
                // The room exists but this token doesn't match a seated
                // player (e.g. the game already ended, or a stale token) —
                // nothing to rejoin.
                giveUp();
            });

            failTimer = setTimeout(giveUp, 9000);
        }

        return () => {
            clearTimeout(failTimer);
            if (socket) {
                socket.off();
                if (status !== 'success') {
                    socket.disconnect();
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (status === 'success') {
        return (
            <Coup
                name={session.name}
                socket={socketRef.current}
                roomCode={session.roomCode}
                playerToken={session.token}
            />
        );
    }

    return (
        <div className="RejoinScreen">
            <div className="RejoinSpinner"></div>
            <p>Reconnecting to your game…</p>
        </div>
    );
}
