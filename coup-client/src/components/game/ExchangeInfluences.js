import React, { useState } from 'react';

export default function ExchangeInfluences({ doneExchangeInfluence, name, influences, socket, colorMap }) {
    const [pool, setPool] = useState(influences);
    const [kept, setKept] = useState([]);
    const totalInf = influences.length;
    const keepCount = totalInf - 2;

    const selectInfluence = (index) => {
        const nextPool = [...pool];
        const [picked] = nextPool.splice(index, 1);
        const nextKept = [...kept, picked];

        setPool(nextPool);
        setKept(nextKept);

        if (nextKept.length === keepCount) {
            socket.emit('g-chooseExchangeDecision', {
                playerName: name,
                kept: nextKept,
                putBack: nextPool,
            });
            doneExchangeInfluence();
        }
    };

    return (
        <div className="DecisionPanel">
            <p className="DecisionTitle">Choose {keepCount} influence{keepCount > 1 ? 's' : ''} to keep</p>
            <p className="DecisionDesc">Picked {kept.length} of {keepCount}</p>
            <div className="TargetGrid">
                {pool.map((influence, index) => (
                    <button
                        key={`${influence}-${index}`}
                        className="TargetBtn"
                        style={{ '--target-color': colorMap[influence] }}
                        onClick={() => selectInfluence(index)}
                    >
                        {influence}
                    </button>
                ))}
            </div>
        </div>
    );
}
