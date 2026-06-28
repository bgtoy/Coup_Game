import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import Coup from './game/Coup';
import PlayerList from './PlayerList';
import { getBackendUrl } from '../utils/backend';
import { getPlayerToken } from '../utils/playerToken';
import './LobbyStyles.css';

const baseUrl = getBackendUrl();

export default function JoinGame() {
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [players, setPlayers] = useState([]);
    const [isInRoom, setIsInRoom] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isGameStarted, setIsGameStarted] = useState(false);

    const socketRef = useRef(null);
    const tokenRef = useRef('');

    const joinParty = useCallback((code, playerName) => {
        const socket = io(`${baseUrl}/${code}`, {
            reconnection: true,
            reconnectionAttempts: 20,
            reconnectionDelay: 800,
            reconnectionDelayMax: 4000,
        });
        socketRef.current = socket;
        tokenRef.current = getPlayerToken(code);

        socket.emit('setName', playerName, tokenRef.current);

        socket.on('joinSuccess', () => {
            setIsLoading(false);
            setIsInRoom(true);
        });

        socket.on('joinFailed', (err) => {
            setErrorMsg(humanizeJoinError(err));
            setIsLoading(false);
            socket.disconnect();
        });

        socket.on('startGame', () => {
            setIsGameStarted(true);
        });

        socket.on('partyUpdate', (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });

        socket.on('readyConfirm', () => {
            setIsReady(true);
        });

        socket.on('leaderDisconnect', () => {
            setErrorMsg('The host left and the room was closed.');
            setIsInRoom(false);
        });
    }, []);

    const attemptJoinParty = async () => {
        const trimmedName = name.trim();
        const trimmedCode = roomCode.trim().toUpperCase();

        if (trimmedName === '') {
            setErrorMsg('Please enter a name');
            return;
        }
        if (trimmedCode === '') {
            setErrorMsg('Please enter a room code');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');
        try {
            const res = await axios.get(`${baseUrl}/exists/${trimmedCode}`);
            if (res.data.exists) {
                joinParty(trimmedCode, trimmedName);
            } else {
                setIsLoading(false);
                setErrorMsg('No room found with that code.');
            }
        } catch {
            setIsLoading(false);
            setErrorMsg('Could not reach the server. Check your connection and try again.');
        }
    };

    const reportReady = () => {
        socketRef.current.emit('setReady', true);
    };

    if (isGameStarted) {
        return (
            <Coup
                name={name.trim()}
                socket={socketRef.current}
                roomCode={roomCode.trim().toUpperCase()}
                playerToken={tokenRef.current}
            />
        );
    }

    return (
        <div className="LobbyPage">
            <Link to="/" className="LobbyBack">&larr; Back</Link>

            <div className="LobbyCard">
                <p className="label">Join a table</p>
                <h1 className="LobbyTitle">Join Game</h1>

                {!isInRoom && (
                    <>
                        <label className="label LobbyFieldLabel" htmlFor="joinName">Your name</label>
                        <input
                            id="joinName"
                            type="text"
                            placeholder="e.g. Sam"
                            value={name}
                            disabled={isLoading}
                            onChange={(e) => {
                                if (e.target.value.length <= 12) {
                                    setErrorMsg('');
                                    setName(e.target.value);
                                }
                            }}
                        />

                        <label className="label LobbyFieldLabel" style={{ marginTop: 16 }} htmlFor="roomCode">
                            Room code
                        </label>
                        <input
                            id="roomCode"
                            type="text"
                            placeholder="e.g. AB12CD"
                            value={roomCode}
                            disabled={isLoading}
                            style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
                            onChange={(e) => setRoomCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && attemptJoinParty()}
                        />

                        {errorMsg && <p className="error-text LobbyError">{errorMsg}</p>}

                        <button className="btn btn-block LobbyMainBtn" onClick={attemptJoinParty} disabled={isLoading}>
                            {isLoading ? 'Joining…' : 'Join Room'}
                        </button>
                    </>
                )}

                {isInRoom && (
                    <>
                        <p className="LobbyHint">You're in! Tap Ready once you're set.</p>
                        <PlayerList players={players} setPlayers={setPlayers} draggable={false} />

                        {errorMsg && <p className="error-text LobbyError">{errorMsg}</p>}

                        {isReady ? (
                            <p className="LobbyCopiedHint" style={{ marginTop: 18, fontSize: 14 }}>
                                You're ready! Waiting for the host to start…
                            </p>
                        ) : (
                            <button className="btn btn-success btn-block LobbyMainBtn" onClick={reportReady}>
                                I'm Ready
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function humanizeJoinError(err) {
    switch (err) {
        case 'name_taken':
            return 'That name is already taken in this room.';
        case 'party_full':
            return 'This room is full (max 6 players).';
        case 'game_already_started':
            return 'This game has already started.';
        case 'invalid_name':
            return 'Please enter a valid name.';
        default:
            return 'Could not join the room.';
    }
}
