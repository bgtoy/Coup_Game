import React, { useState } from 'react';
import ReactModal from 'react-modal';
import './ModalStyles.css';

const rows = [
    { action: 'Income', card: '—', coins: '+1', blockable: 'No', challengeable: 'No' },
    { action: 'Foreign Aid', card: '—', coins: '+2', blockable: 'Duke', challengeable: 'No' },
    { action: 'Coup', card: '—', coins: '−7', blockable: 'No', challengeable: 'No' },
    { action: 'Tax', card: 'Duke', coins: '+3', blockable: 'No', challengeable: 'Yes' },
    { action: 'Assassinate', card: 'Assassin', coins: '−3', blockable: 'Contessa', challengeable: 'Yes' },
    { action: 'Steal', card: 'Captain', coins: '+2', blockable: 'Captain / Ambassador', challengeable: 'Yes' },
    { action: 'Exchange', card: 'Ambassador', coins: '—', blockable: 'No', challengeable: 'Yes' },
];

export default function CheatSheetModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button className="GameRulesBtn" onClick={() => setIsOpen(true)} type="button">
                <span className="InfoIconCircle">i</span>
                <span>Cheat Sheet</span>
            </button>
            <ReactModal
                isOpen={isOpen}
                onRequestClose={() => setIsOpen(false)}
                shouldCloseOnOverlayClick
                contentLabel="Cheat Sheet"
                overlayClassName="ModalOverlay"
                className="ModalContent ModalContent--wide"
            >
                <button className="ModalCloseBtn" onClick={() => setIsOpen(false)} aria-label="Close">
                    &times;
                </button>
                <div className="ModalScroll">
                    <h2 className="ModalTitle">Cheat Sheet</h2>
                    <p className="ModalLead">Quick reference for every action in the game.</p>

                    <div className="CheatTableWrap">
                        <table className="CheatTable">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>Requires</th>
                                    <th>Coins</th>
                                    <th>Blockable by</th>
                                    <th>Challengeable</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.action}>
                                        <td className="CheatTableAction">{r.action}</td>
                                        <td>{r.card}</td>
                                        <td>{r.coins}</td>
                                        <td>{r.blockable}</td>
                                        <td>{r.challengeable}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ReactModal>
        </>
    );
}
