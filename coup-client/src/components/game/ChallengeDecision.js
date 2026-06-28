import React from 'react';

const ACTION_TEXT = {
    steal: (source, target) => <> <b>{source}</b> claims Captain to steal from <b>{target}</b></>,
    tax: (source) => <> <b>{source}</b> claims Duke to collect Tax (+3 coins)</>,
    assassinate: (source, target) => <> <b>{source}</b> claims Assassin to assassinate <b>{target}</b></>,
    exchange: (source) => <> <b>{source}</b> claims Ambassador to Exchange influences</>,
};

export default function ChallengeDecision({ closeOtherVotes, doneChallengeVote, name, action, socket }) {
    const vote = (isChallenging) => {
        closeOtherVotes('challenge');
        socket.emit('g-challengeDecision', {
            action,
            isChallenging,
            challengee: action.source,
            challenger: name,
        });
        doneChallengeVote();
    };

    const textFn = ACTION_TEXT[action.action];

    return (
        <div className="DecisionPanel DecisionPanel--challenge">
            <p className="DecisionTitle">Challenge?</p>
            <p className="DecisionDesc">{textFn ? textFn(action.source, action.target) : null}</p>
            <button className="btn btn-danger" onClick={() => vote(true)}>Challenge</button>
        </div>
    );
}
