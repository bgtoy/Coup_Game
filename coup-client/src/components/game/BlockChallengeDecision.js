import React from 'react';

export default function BlockChallengeDecision({ closeOtherVotes, doneBlockChallengeVote, name, prevAction, counterAction, socket }) {
    const vote = (isChallenging) => {
        closeOtherVotes('challenge-block');
        socket.emit('g-blockChallengeDecision', {
            counterAction,
            prevAction,
            isChallenging,
            challengee: counterAction.source,
            challenger: name,
        });
        doneBlockChallengeVote();
    };

    return (
        <div className="DecisionPanel DecisionPanel--challenge">
            <p className="DecisionTitle">Challenge the block?</p>
            <p className="DecisionDesc">
                <b>{counterAction.source}</b> is blocking <b>{prevAction.source}</b>'s {formatAction(prevAction.action)} by claiming <b>{capitalize(counterAction.claim)}</b>
            </p>
            <button className="btn btn-danger" onClick={() => vote(true)}>Challenge</button>
        </div>
    );
}

function formatAction(action) {
    return action.replace('_', ' ');
}
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
