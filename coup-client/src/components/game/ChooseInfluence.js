import React from 'react';

export default function ChooseInfluence({ doneChooseInfluence, name, socket, influences, colorMap }) {
    const selectInfluence = (influence) => {
        socket.emit('g-chooseInfluenceDecision', { influence, playerName: name });
        doneChooseInfluence();
    };

    return (
        <div className="DecisionPanel DecisionPanel--danger">
            <p className="DecisionTitle">Choose an influence to lose</p>
            <div className="TargetGrid">
                {influences.map((influence, index) => (
                    <button
                        key={`${influence}-${index}`}
                        className="TargetBtn"
                        style={{ '--target-color': colorMap[influence] }}
                        onClick={() => selectInfluence(influence)}
                    >
                        {influence}
                    </button>
                ))}
            </div>
        </div>
    );
}
