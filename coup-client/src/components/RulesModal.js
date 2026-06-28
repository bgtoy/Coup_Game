import React, { useState } from 'react';
import ReactModal from 'react-modal';
import './ModalStyles.css';

const InfluenceRule = ({ name, color, action, desc, blockNote }) => (
    <div className="RuleCard">
        <div className="RuleCardHeader">
            <span className="RuleCardDot" style={{ backgroundColor: color }}></span>
            <h3>{name}</h3>
        </div>
        <p>
            <b style={{ color }}>{action}</b>: {desc}
        </p>
        {blockNote && <p className="RuleCardNote">{blockNote}</p>}
    </div>
);

export default function RulesModal({ home }) {
    const [isOpen, setIsOpen] = useState(false);

    const trigger = (
        <button
            className={home ? 'HomeRulesBtn' : 'GameRulesBtn'}
            onClick={() => setIsOpen(true)}
            type="button"
        >
            <span className="InfoIconCircle">i</span>
            <span>Rules</span>
        </button>
    );

    return (
        <>
            {trigger}
            <ReactModal
                isOpen={isOpen}
                onRequestClose={() => setIsOpen(false)}
                shouldCloseOnOverlayClick
                contentLabel="Rules"
                overlayClassName="ModalOverlay"
                className="ModalContent"
            >
                <button className="ModalCloseBtn" onClick={() => setIsOpen(false)} aria-label="Close">
                    &times;
                </button>

                <div className="ModalScroll">
                    <h2 className="ModalTitle">How to Play</h2>
                    <p className="ModalLead">2–6 players. Be the last one with influence remaining.</p>

                    <p>
                        On your turn, choose an action. Some actions require a specific influence
                        you may or may not actually have &mdash; that's where the bluffing comes in.
                        Other players can <b>challenge</b> your claim, or <b>block</b> certain actions.
                    </p>

                    <div className="RuleSection">
                        <h3 className="RuleSectionTitle">Challenge</h3>
                        <p>
                            Any player can challenge a claimed influence. If you're challenged and you
                            really have it, the challenger loses an influence. If you don't, you lose
                            the influence instead.
                        </p>
                    </div>

                    <div className="RuleSection">
                        <h3 className="RuleSectionTitle">Block</h3>
                        <p>
                            Foreign Aid, Steal, and Assassinate can be blocked by claiming the right
                            influence. Blocks can also be challenged. If the block fails, the original
                            action goes through.
                        </p>
                    </div>

                    <div className="RuleSection">
                        <h3 className="RuleSectionTitle">Influences</h3>
                        <div className="RuleCardGrid">
                            <InfluenceRule
                                name="Duke"
                                color="var(--c-duke)"
                                action="Tax"
                                desc="Collect 3 coins. Cannot be blocked."
                                blockNote="Can block Foreign Aid."
                            />
                            <InfluenceRule
                                name="Assassin"
                                color="var(--text)"
                                action="Assassinate"
                                desc="Pay 3 coins, target loses an influence."
                                blockNote="Blockable by Contessa."
                            />
                            <InfluenceRule
                                name="Captain"
                                color="var(--c-captain)"
                                action="Steal"
                                desc="Take 2 coins from a target."
                                blockNote="Blockable by Captain or Ambassador. Can block Steal."
                            />
                            <InfluenceRule
                                name="Ambassador"
                                color="var(--c-ambassador)"
                                action="Exchange"
                                desc="Draw 2 cards, return any 2 to the deck."
                                blockNote="Can block Steal."
                            />
                            <InfluenceRule
                                name="Contessa"
                                color="var(--c-contessa)"
                                action="Block Assassination"
                                desc="Cannot be blocked itself."
                            />
                        </div>
                    </div>

                    <div className="RuleSection">
                        <h3 className="RuleSectionTitle">Actions for everyone</h3>
                        <p><b>Income</b> &mdash; collect 1 coin. Always available, never challenged.</p>
                        <p><b>Foreign Aid</b> &mdash; collect 2 coins. Blockable by Duke.</p>
                        <p><b>Coup</b> &mdash; pay 7 coins, target loses an influence. Not blockable. Mandatory once you hold 10+ coins.</p>
                    </div>

                    <p className="ModalFootnote">
                        Lose your last influence and you're out. Last player standing wins the table.
                    </p>
                </div>
            </ReactModal>
        </>
    );
}
