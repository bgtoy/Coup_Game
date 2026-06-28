import React, { useState } from 'react';

export default function BlockDecision({ closeOtherVotes, doneBlockVote, name, action, socket }) {
    const [isPickingClaim, setIsPickingClaim] = useState(false);
    const [pendingBlock, setPendingBlock] = useState('');

    const block = (blockType, claim = null) => {
        closeOtherVotes('block');
        let resClaim = claim;
        if (!resClaim) {
            if (blockType === 'block_foreign_aid') resClaim = 'duke';
            else if (blockType === 'block_assassinate') resClaim = 'contessa';
        }

        socket.emit('g-blockDecision', {
            prevAction: action,
            counterAction: {
                counterAction: blockType,
                claim: resClaim,
                source: name,
            },
            blockee: action.source,
            blocker: name,
            isBlocking: true,
        });
        doneBlockVote();
    };

    const pickClaim = (blockType) => {
        closeOtherVotes('block');
        setPendingBlock(blockType);
        setIsPickingClaim(true);
    };

    if (isPickingClaim) {
        return (
            <div className="DecisionPanel DecisionPanel--block">
                <p className="DecisionTitle">Claim Ambassador or Captain to block Steal</p>
                <div className="TargetGrid">
                    <button className="TargetBtn" style={{ '--target-color': 'var(--c-ambassador)' }} onClick={() => block(pendingBlock, 'ambassador')}>
                        Ambassador
                    </button>
                    <button className="TargetBtn" style={{ '--target-color': 'var(--c-captain)' }} onClick={() => block(pendingBlock, 'captain')}>
                        Captain
                    </button>
                </div>
            </div>
        );
    }

    let prompt = null;
    if (action.action === 'foreign_aid') {
        prompt = (
            <>
                <p className="DecisionDesc"><b>{action.source}</b> is collecting Foreign Aid</p>
                <button className="btn btn-secondary" onClick={() => block('block_foreign_aid')}>Block with Duke</button>
            </>
        );
    } else if (action.action === 'steal') {
        prompt = (
            <>
                <p className="DecisionDesc"><b>{action.source}</b> is trying to Steal from you</p>
                <button className="btn btn-secondary" onClick={() => pickClaim('block_steal')}>Block Steal</button>
            </>
        );
    } else if (action.action === 'assassinate') {
        prompt = (
            <>
                <p className="DecisionDesc"><b>{action.source}</b> is trying to Assassinate you</p>
                <button className="btn btn-secondary" onClick={() => block('block_assassinate')}>Block with Contessa</button>
            </>
        );
    }

    return (
        <div className="DecisionPanel DecisionPanel--block">
            <p className="DecisionTitle">Block this action?</p>
            {prompt}
        </div>
    );
}
