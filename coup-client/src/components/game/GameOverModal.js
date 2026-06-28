import React from 'react';
import ReactModal from 'react-modal';
import '../ModalStyles.css';

export default function GameOverModal({ winner, onPlayAgain }) {
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
            </div>
        </ReactModal>
    );
}
