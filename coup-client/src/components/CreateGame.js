import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import Coup from './game/Coup';
import PlayerList from './PlayerList';
import { getBackendUrl } from '../utils/backend';
import { getOrCreateToken, saveGameSession, clearGameSession } from '../utils/gameSession';
import './LobbyStyles.css';

const baseUrl = getBackendUrl();

export default function CreateGame() {
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [isInRoom, setIsInRoom] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [players, setPlayers] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [startError, setStartError] = useState('');

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
        tokenRef.current = getOrCreateToken();

        socket.emit('setName', playerName, tokenRef.current);

        socket.on('joinSuccess', () => {
            setIsLoading(false);
            setIsInRoom(true);
            saveGameSession({ roomCode: code, name: playerName, token: tokenRef.current });
        });

        socket.on('joinFailed', (err) => {
            setIsLoading(false);
            setErrorMsg(humanizeJoinError(err));
        });

        socket.on('partyUpdate', (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });

        socket.on('startGame', () => {
            setIsGameStarted(true);
        });

        socket.on('startGameFailed', () => {
            setStartError('Everyone needs to be Ready before you can start.');
        });

        socket.on('leaderDisconnect', () => {
            setErrorMsg('The room was closed.');
            clearGameSession();
        });
    }, []);

    const createParty = async () => {
        const trimmed = name.trim();
        if (trimmed === '') {
            setErrorMsg('Please enter a name');
            return;
        }
        setIsLoading(true);
        setErrorMsg('');
        try {
            const res = await axios.get(`${baseUrl}/createNamespace`);
            const code = res.data.namespace;
            setRoomCode(code);
            joinParty(code, trimmed);
        } catch (err) {
            setIsLoading(false);
            setErrorMsg('Could not reach the server. Check your connection and try again.');
        }
    };

    const startGame = () => {
        if (!socketRef.current) return;
        setStartError('');
        socketRef.current.emit('startGameSignal', players);
    };

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(roomCode);
        } catch {
            const dummy = document.createElement('textarea');
            document.body.appendChild(dummy);
            dummy.value = roomCode;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    if (isGameStarted) {
        return (
            <Coup
                name={name.trim()}
                socket={socketRef.current}
                roomCode={roomCode}
                playerToken={tokenRef.current}
            />
        );
    }

    const readyCount = players.filter((p) => p.isReady).length;
    const canStart = players.length >= 2 && readyCount === players.length;

    return (
        <div className="LobbyPage">
            <Link to="/" className="LobbyBack">&larr; Back</Link>

            <div className="LobbyCard">
                <p className="label">Create a table</p>
                <h1 className="LobbyTitle">New Game</h1>

                {!isInRoom && (
                    <>
                        <label className="label LobbyFieldLabel" htmlFor="hostName">Your name</label>
                        <input
                            id="hostName"
                            type="text"
                            placeholder="e.g. Ethan"
                            value={name}
                            disabled={isLoading}
                            onChange={(e) => {
                                if (e.target.value.length <= 12) {
                                    setErrorMsg('');
                                    setName(e.target.value);
                                }
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && createParty()}
                        />
                        {errorMsg && <p className="error-text LobbyError">{errorMsg}</p>}
                        <button className="btn btn-block LobbyMainBtn" onClick={createParty} disabled={isLoading}>
                            {isLoading ? 'Creating room…' : 'Create Room'}
                        </button>
                    </>
                )}

                {isInRoom && (
                    <>
                        <p className="label LobbyFieldLabel">Room code &mdash; share this with players</p>
                        <button className="RoomCodeChip" onClick={copyCode} type="button">
                            <span>{roomCode}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                                <path d="M5 15V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </button>
                        {copied && <p className="LobbyCopiedHint">Copied to clipboard ✓</p>}

                        <p className="LobbyHint">Drag players to set the turn order. Everyone must tap Ready.</p>

                        <PlayerList players={players} setPlayers={setPlayers} draggable />

                        {startError && <p className="error-text LobbyError">{startError}</p>}

                        <button
                            className="btn btn-success btn-block LobbyMainBtn"
                            onClick={startGame}
                            disabled={!canStart}
                        >
                            {canStart ? 'Start Game' : `Waiting for players (${readyCount}/${players.length} ready)`}
                        </button>
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
