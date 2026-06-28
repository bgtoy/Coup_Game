import React, { useState } from 'react';

const ACTIONS = [
    {
        key: 'income',
        label: 'Income',
        icon: '💰',
        desc: '+1 coin',
        color: 'var(--text-dim)'
    },

    {
        key: 'foreign_aid',
        label: 'Foreign Aid',
        icon: '🏦',
        desc: '+2 coins',
        color: 'var(--text-dim)'
    },

    {
        key: 'tax',
        label: 'Tax',
        icon: '👑',
        desc: '+3 coins',
        color: 'var(--c-duke)',
        claim: ' Duke'
    },

    {
        key: 'steal',
        label: 'Steal',
        icon: '🗡',
        desc: 'Take 2 coins',
        color: 'var(--c-captain)',
        claim: ' Captain',
        needsTarget: true
    },

    {
        key: 'exchange',
        label: 'Exchange',
        icon: '🔄',
        desc: 'Swap influences',
        color: 'var(--c-ambassador)',
        claim: ' Ambassador'
    },

    {
        key: 'assassinate',
        label: 'Assassinate',
        icon: '☠',
        desc: 'Cost 3 coins',
        color: 'var(--text)',
        claim: ' Assassin',
        needsTarget: true,
        cost: 3
    },

    {
        key: 'coup',
        label: 'Coup',
        icon: '💥',
        desc: 'Cost 7 coins',
        color: 'var(--crimson)',
        needsTarget: true,
        cost: 7
    }
];

export default function ActionDecision({ doneAction, deductCoins, name, socket, money, players }) {
    const [isPickingTarget, setIsPickingTarget] = useState(false);
    const [targetAction, setTargetAction] = useState('');
    const [actionError, setActionError] = useState('');

    const chooseAction = (actionKey, target = null) => {
        socket.emit('g-actionDecision', {
            action: { action: actionKey, target, source: name },
        });
        doneAction();
    };

    const handleActionClick = (actionKey) => {
        if (actionKey === 'assassinate') {
            if (money >= 3) {
                deductCoins(3);
                setTargetAction('assassinate');
                setIsPickingTarget(true);
                setActionError('');
            } else {
                setActionError('Not enough coins to assassinate.');
            }
            return;
        }
        if (actionKey === 'coup') {
            if (money >= 7) {
                deductCoins(7);
                setTargetAction('coup');
                setIsPickingTarget(true);
                setActionError('');
            } else {
                setActionError('Not enough coins to coup.');
            }
            return;
        }
        if (actionKey === 'steal') {
            setTargetAction('steal');
            setIsPickingTarget(true);
            setActionError('');
            return;
        }
        chooseAction(actionKey);
    };

    if (isPickingTarget) {
        const targets = players.filter((p) => !p.isDead && p.name !== name);
        return (
            <div className="DecisionPanel">
                <p className="DecisionTitle">Choose a target</p>
                <div className="TargetGrid">
                    {targets.map((p) => (
                        <button
                            key={p.name}
                            className="TargetBtn"
                            style={{ '--target-color': p.color }}
                            onClick={() => chooseAction(targetAction, p.name)}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const mustCoup = money >= 10;

    return (
        <div className="DecisionPanel">
            <p className="DecisionTitle">Choose your action</p>
            {mustCoup && (
                <p className="DecisionHint">You have 10+ coins — you must Coup this turn.</p>
            )}
            <div className="ActionGrid">
                {(mustCoup ? ACTIONS.filter((a) => a.key === 'coup') : ACTIONS).map((a) => (
                    <button
                        key={a.key}
                        className="ActionCard"
                        style={{ '--action-color': a.color }}
                        onClick={() => handleActionClick(a.key)}
                    >
						
                        <span className="ActionCardLabel">
							<span className="ActionIcon">{a.icon} </span>{a.label}</span>
                        <span className="ActionCardDesc">{a.desc}</span>
						
                       {a.claim && (<div className="ActionClaim">Claim<b>{a.claim}</b></div>)}
                    </button>
                ))}
            </div>
            {actionError && <p className="error-text" style={{ marginTop: 10 }}>{actionError}</p>}
        </div>
    );
}
