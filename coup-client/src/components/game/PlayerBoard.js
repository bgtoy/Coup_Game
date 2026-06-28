import React from 'react';
import './PlayerBoardStyles.css';

export default function PlayerBoard({ players, currentPlayer, myName }) {
    if (players.length < 2) {
        return null;
    }

    return (
        <div className="PlayerBoardContainer">
            {players.map((player) => (
                <div
                    key={player.name}
                    className={`PlayerCard ${player.name === currentPlayer ? 'is-active' : ''} ${
                        player.name === myName ? 'is-me' : ''
                    } ${player.isConnected === false ? 'is-offline' : ''}`}
                    style={{ '--player-color': player.color }}
                >
                    <div className="PlayerCardTop">
                        <span className="PlayerCardName">{player.name}</span>
                        {player.name === myName && <span className="PlayerCardYouTag">You</span>}
                        {player.isConnected === false && (
                            <span className="PlayerCardOfflineTag" title="Disconnected">⚡</span>
                        )}
                    </div>
                    <div className="PlayerCardStats">
                        <span className="PlayerCardCoins">🪙 {player.money}</span>
                        <span className="PlayerCardInfluences">
                            {Array.from({ length: player.influences.length }).map((_, i) => (
                                <span key={i} className="InfluencePip"></span>
                            ))}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
