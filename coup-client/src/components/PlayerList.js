import React, { useState } from 'react';
import './LobbyStyles.css';

// Lightweight native drag-and-drop reordering — no external dependency needed.
export default function PlayerList({ players, setPlayers, draggable = false }) {
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);

    const handleDrop = (dropIndex) => {
        if (dragIndex === null || dragIndex === dropIndex) {
            setDragIndex(null);
            setOverIndex(null);
            return;
        }
        const next = [...players];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(dropIndex, 0, moved);
        setPlayers(next);
        setDragIndex(null);
        setOverIndex(null);
    };

    if (players.length === 0) {
        return (
            <div className="PlayerListEmpty">
                <p>Waiting for players to join…</p>
            </div>
        );
    }

    return (
        <ul className="PlayerList">
            {players.map((player, index) => (
                <li
                    key={player.name}
                    className={`PlayerRow ${player.isReady ? 'is-ready' : 'is-waiting'} ${
                        overIndex === index ? 'is-dragover' : ''
                    }`}
                    draggable={draggable}
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setOverIndex(index);
                    }}
                    onDragEnd={() => {
                        setDragIndex(null);
                        setOverIndex(null);
                    }}
                    onDrop={() => handleDrop(index)}
                >
                    {draggable && <span className="PlayerRowHandle" aria-hidden="true">⠿</span>}
                    <span className="PlayerRowOrder">{index + 1}</span>
                    <span className="PlayerRowName">{player.name}</span>
                    <span className={`PlayerRowStatus ${player.isReady ? 'is-ready' : ''}`}>
                        {player.isReady ? 'Ready' : 'Not ready'}
                    </span>
                </li>
            ))}
        </ul>
    );
}
