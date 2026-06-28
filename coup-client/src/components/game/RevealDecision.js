import React from 'react';

const ACTION_MAP = {
    tax: ['duke'],
    assassinate: ['assassin'],
    exchange: ['ambassador'],
    steal: ['captain'],
    block_foreign_aid: ['duke'],
    block_steal: ['ambassador', 'captain'],
    block_assassinate: ['contessa'],
};

export default function RevealDecision({ doneReveal, name, socket, res, influences, colorMap }) {
    const act = res.isBlock ? res.counterAction.counterAction : res.action.action;
    const validInfluences = ACTION_MAP[act] || [];

    const selectInfluence = (influence) => {
        socket.emit('g-revealDecision', {
            revealedCard: influence,
            prevAction: res.action,
            counterAction: res.counterAction,
            challengee: res.challengee,
            challenger: res.challenger,
            isBlock: res.isBlock,
        });
        doneReveal();
    };

    return (
        <div className="DecisionPanel DecisionPanel--danger">
            <p className="DecisionTitle">You've been challenged!</p>
            <p className="DecisionDesc">
                Reveal <b>{validInfluences.map(capitalize).join(' or ')}</b> to prove your claim,
                or you'll lose an influence of your choice.
            </p>
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

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
