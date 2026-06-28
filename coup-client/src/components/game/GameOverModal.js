import React from 'react';
import ReactModal from 'react-modal';
import '../ModalStyles.css';

export default function GameOverModal({ winner, onPlayAgain, onLeave }) {
    return (
        <ReactModal
            isOpen
            shouldCloseOnOverlayClick={false}
            contentLabel="Game Over"
            overlayClassName="ModalOverlay"
            className="ModalContent GameOverModal"
        >
            <div className="GameOverContent">
                <span className="GameOverCrown">♛</span>
                <p className="label">Game Over</p>
                <h2 className="GameOverTitle">{winner} wins!</h2>
                <button className="btn btn-block" onClick={onPlayAgain}>Play Again</button>
                <button className="btn btn-ghost btn-block" onClick={onLeave} style={{ marginTop: 10 }}>
                    Leave Table
                </button>
            </div>
        </ReactModal>
    );
}

