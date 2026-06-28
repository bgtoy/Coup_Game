import React, { useState, useEffect, useRef, useCallback } from 'react';
import ActionDecision from './ActionDecision';
import ChallengeDecision from './ChallengeDecision';
import BlockChallengeDecision from './BlockChallengeDecision';
import PlayerBoard from './PlayerBoard';
import RevealDecision from './RevealDecision';
import BlockDecision from './BlockDecision';
import ChooseInfluence from './ChooseInfluence';
import ExchangeInfluences from './ExchangeInfluences';
import EventLog from './EventLog';
import InfluenceHand from './InfluenceHand';
import GameOverModal from './GameOverModal';
import CheatSheetModal from '../CheatSheetModal';
import RulesModal from '../RulesModal';
import TopBar from "./TopBar";
import './CoupStyles.css';


const influenceColorMap = {
    duke: 'var(--c-duke)',
    captain: 'var(--c-captain)',
    assassin: 'var(--c-assassin)',
    contessa: 'var(--c-contessa)',
    ambassador: 'var(--c-ambassador)',
};

export default function Coup({ name, socket, roomCode, playerToken }) {
    const [players, setPlayers] = useState([]);
    const [playerIndex, setPlayerIndex] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState('');
    const [isDead, setIsDead] = useState(false);
    const [isChooseAction, setIsChooseAction] = useState(false);
    const [action, setAction] = useState(null);
    const [blockChallengeRes, setBlockChallengeRes] = useState(null);
    const [blockingAction, setBlockingAction] = useState(null);
    const [revealingRes, setRevealingRes] = useState(null);
    const [isChoosingInfluence, setIsChoosingInfluence] = useState(false);
    const [exchangeInfluence, setExchangeInfluence] = useState(null);
    const [winner, setWinner] = useState('');
    const [showGameOver, setShowGameOver] = useState(false);
    const [logs, setLogs] = useState([]);
    const [connectionState, setConnectionState] = useState('connected'); // 'connected' | 'reconnecting' | 'failed'

    const playersRef = useRef(players);
    playersRef.current = players;

    useEffect(() => {
        const onDisconnect = (reason) => {
            // 'io client disconnect' means we disconnected on purpose; anything
            // else is a dropped connection that socket.io will try to recover.
            if (reason !== 'io client disconnect') {
                setConnectionState('reconnecting');
            }
        };

        const onConnect = () => {
            // Fires on the *initial* connect too, but re-emitting setName here
            // is harmless — the server only treats it as a reconnect once a
            // game is already in progress with a matching token.
            socket.emit('setName', name, playerToken);
        };

        const onRejoinedGame = () => setConnectionState('connected');

        const onReconnectFailed = () => setConnectionState('failed');

        const onGameOver = (winnerName) => {
            setWinner(winnerName);
            setShowGameOver(true);
        };

        const onUpdatePlayers = (incomingPlayers) => {
            setShowGameOver(false);
            const alive = incomingPlayers.filter((x) => !x.isDead);
            const myIndex = alive.findIndex((p) => p.name === name);
            setIsDead(myIndex === -1);
            setPlayerIndex(myIndex === -1 ? null : myIndex);
            setPlayers(alive);
        };

        const onUpdateCurrentPlayer = (p) => setCurrentPlayer(p);

        const onAddLog = (log) => {
            const coloredLog = log.split(' ').map((word) => {
                const found = playersRef.current.find((p) => p.name === word);
                return found ? { text: `${word} `, color: found.color } : { text: `${word} `, color: null };
            });
            setLogs((prev) => [...prev, coloredLog]);
        };

        const onChooseAction = () => setIsChooseAction(true);

        const onOpenExchange = (drawTwo) => {
            const mine = playersRef.current.find((p) => p.name === name);
            setExchangeInfluence([...(mine ? mine.influences : []), ...drawTwo]);
        };

        const onOpenChallenge = (incomingAction) => {
            setAction(incomingAction.source !== name ? incomingAction : null);
        };

        const onOpenBlockChallenge = (res) => {
            setBlockChallengeRes(res.counterAction.source !== name ? res : null);
        };

        const onOpenBlock = (incomingAction) => {
            setBlockingAction(incomingAction.source !== name ? incomingAction : null);
        };

        const onChooseReveal = (res) => setRevealingRes(res);
        const onChooseInfluence = () => setIsChoosingInfluence(true);
        const onCloseChallenge = () => setAction(null);
        const onCloseBlock = () => setBlockingAction(null);
        const onCloseBlockChallenge = () => setBlockChallengeRes(null);

        socket.on('disconnect', onDisconnect);
        socket.on('connect', onConnect);
        socket.on('rejoinedGame', onRejoinedGame);
        socket.io.on('reconnect_failed', onReconnectFailed);
        socket.on('g-gameOver', onGameOver);
        socket.on('g-updatePlayers', onUpdatePlayers);
        socket.on('g-updateCurrentPlayer', onUpdateCurrentPlayer);
        socket.on('g-addLog', onAddLog);
        socket.on('g-chooseAction', onChooseAction);
        socket.on('g-openExchange', onOpenExchange);
        socket.on('g-openChallenge', onOpenChallenge);
        socket.on('g-openBlockChallenge', onOpenBlockChallenge);
        socket.on('g-openBlock', onOpenBlock);
        socket.on('g-chooseReveal', onChooseReveal);
        socket.on('g-chooseInfluence', onChooseInfluence);
        socket.on('g-closeChallenge', onCloseChallenge);
        socket.on('g-closeBlock', onCloseBlock);
        socket.on('g-closeBlockChallenge', onCloseBlockChallenge);

        return () => {
            socket.off('disconnect', onDisconnect);
            socket.off('connect', onConnect);
            socket.off('rejoinedGame', onRejoinedGame);
            socket.io.off('reconnect_failed', onReconnectFailed);
            socket.off('g-gameOver', onGameOver);
            socket.off('g-updatePlayers', onUpdatePlayers);
            socket.off('g-updateCurrentPlayer', onUpdateCurrentPlayer);
            socket.off('g-addLog', onAddLog);
            socket.off('g-chooseAction', onChooseAction);
            socket.off('g-openExchange', onOpenExchange);
            socket.off('g-openChallenge', onOpenChallenge);
            socket.off('g-openBlockChallenge', onOpenBlockChallenge);
            socket.off('g-openBlock', onOpenBlock);
            socket.off('g-chooseReveal', onChooseReveal);
            socket.off('g-chooseInfluence', onChooseInfluence);
            socket.off('g-closeChallenge', onCloseChallenge);
            socket.off('g-closeBlock', onCloseBlock);
            socket.off('g-closeBlockChallenge', onCloseBlockChallenge);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, name, playerToken]);

    const deductCoins = useCallback((amount) => {
        socket.emit('g-deductCoins', { source: name, amount });
    }, [socket, name]);

    const doneAction = () => setIsChooseAction(false);

    const doneChallengeBlockingVote = () => {
        setAction(null);
        setBlockChallengeRes(null);
        setBlockingAction(null);
    };

    const closeOtherVotes = (voteType) => {
        if (voteType === 'challenge') {
            setBlockChallengeRes(null);
            setBlockingAction(null);
        } else if (voteType === 'block') {
            setAction(null);
            setBlockChallengeRes(null);
        } else if (voteType === 'challenge-block') {
            setAction(null);
            setBlockingAction(null);
        }
    };

    const doneReveal = () => setRevealingRes(null);
    const doneChooseInfluence = () => setIsChoosingInfluence(false);
    const doneExchangeInfluence = () => setExchangeInfluence(null);

    const pass = () => {
        if (action != null) {
            socket.emit('g-challengeDecision', { isChallenging: false, action });
        } else if (blockChallengeRes != null) {
            socket.emit('g-blockChallengeDecision', { isChallenging: false });
        } else if (blockingAction !== null) {
            socket.emit('g-blockDecision', { action: blockingAction, isBlocking: false });
        }
        doneChallengeBlockingVote();
    };

    const playAgain = () => {
        socket.emit('g-playAgain');
        setShowGameOver(false);
    };

    if (connectionState === 'failed') {
        return (
            <div className="GameContainer">
                <div className="DisconnectedScreen">
                    <h2>Connection lost</h2>
                    <p>We couldn't reconnect you to the table.</p>
                    <p className="DisconnectedSub">Check your network and refresh the page to try again.</p>
                </div>
            </div>
        );
    }

    const isVoteOpen = action != null || blockChallengeRes != null || blockingAction !== null;
    const isWaiting =
        !isChooseAction &&
        !revealingRes &&
        !isChoosingInfluence &&
        !isVoteOpen &&
        !exchangeInfluence &&
        !isDead;

    const me = playerIndex != null ? players[playerIndex] : null;

    return (
        <div className="GameContainer">
            {connectionState === 'reconnecting' && (
                <div className="ReconnectBanner">
                    <span className="ReconnectBannerDot"></span>
                    Reconnecting…
                </div>
            )}
			<TopBar

			roomCode={roomCode}

			currentPlayer={currentPlayer}

			connectionState={connectionState}

			/>
            <header className="GameTopBar">
                <div className="GameTopBarLeft">
                    <div className="GamePlayerChip">
                        <span className="GamePlayerChipName">{name}</span>
                        {me && <span className="GamePlayerChipCoins">🪙 {me.money}</span>}
                    </div>
                    <RulesModal />
                    <CheatSheetModal />
                </div>
                <div className="GameTopBarRight">
                    {currentPlayer && (
                        <div className="GameTurnIndicator">
                            <span className="GameTurnDot"></span>
                            <span><b>{currentPlayer}</b>'s turn</span>
                        </div>
                    )}
                </div>
            </header>

            <PlayerBoard players={players} currentPlayer={currentPlayer} myName={name} />

            {me && !isDead && (
                <InfluenceHand influences={me.influences} colorMap={influenceColorMap} />
            )}

            <div className="DecisionsSection">
                {isWaiting && (
                    <div className="WaitingPanel">
                        <span className="WaitingDots"><span></span><span></span><span></span></span>
                        <p>Waiting for other players…</p>
                    </div>
                )}
                {isDead && (
                    <div className="WaitingPanel">
                        <p>You're out — spectating the rest of the table.</p>
                    </div>
                )}

                {revealingRes && (
                    <RevealDecision
                        doneReveal={doneReveal}
                        name={name}
                        socket={socket}
                        res={revealingRes}
                        influences={players.find((x) => x.name === name)?.influences || []}
                        colorMap={influenceColorMap}
                    />
                )}
                {isChoosingInfluence && (
                    <ChooseInfluence
                        doneChooseInfluence={doneChooseInfluence}
                        name={name}
                        socket={socket}
                        influences={players.find((x) => x.name === name)?.influences || []}
                        colorMap={influenceColorMap}
                    />
                )}
                {isChooseAction && playerIndex != null && (
                    <ActionDecision
                        doneAction={doneAction}
                        deductCoins={deductCoins}
                        name={name}
                        socket={socket}
                        money={players[playerIndex].money}
                        players={players}
                    />
                )}
                {exchangeInfluence && (
                    <ExchangeInfluences
                        doneExchangeInfluence={doneExchangeInfluence}
                        name={name}
                        influences={exchangeInfluence}
                        socket={socket}
                        colorMap={influenceColorMap}
                    />
                )}
                {action != null && (
                    <ChallengeDecision
                        closeOtherVotes={closeOtherVotes}
                        doneChallengeVote={doneChallengeBlockingVote}
                        name={name}
                        action={action}
                        socket={socket}
                    />
                )}
                {blockChallengeRes != null && (
                    <BlockChallengeDecision
                        closeOtherVotes={closeOtherVotes}
                        doneBlockChallengeVote={doneChallengeBlockingVote}
                        name={name}
                        prevAction={blockChallengeRes.prevAction}
                        counterAction={blockChallengeRes.counterAction}
                        socket={socket}
                    />
                )}
                {blockingAction !== null && (
                    <BlockDecision
                        closeOtherVotes={closeOtherVotes}
                        doneBlockVote={doneChallengeBlockingVote}
                        name={name}
                        action={blockingAction}
                        socket={socket}
                    />
                )}
                {isVoteOpen && (
                    <button className="btn btn-secondary PassBtn" onClick={pass}>Pass</button>
                )}
            </div>

            <EventLog logs={logs} />

            {showGameOver && <GameOverModal winner={winner} onPlayAgain={playAgain} />}
        </div>
    );
}
