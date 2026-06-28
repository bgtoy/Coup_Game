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

    <div className="PlayerAvatar">

        {player.name.substring(0,1).toUpperCase()}

        <div
            className={`PlayerStatus ${
                player.isConnected === false ? 'offline' : 'online'
            }`}
        />

    </div>

    <div className="PlayerCardName">

        {player.name}

    </div>

    {player.name === myName && (

        <div className="PlayerCardYouTag">

            YOU

        </div>

    )}

    <div className="PlayerCardStats">

        <div className="PlayerCardCoins">

            🪙 {player.money}

        </div>

        <div className="PlayerCardInfluences">

            {Array.from({
                length: player.influences.length
            }).map((_, i) => (

                <span
                    key={i}
                    className="InfluencePip"
                />

            ))}

        </div>

    </div>

</div>
            ))}
        </div>
    );
}
