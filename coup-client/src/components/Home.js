import React from 'react';
import { Link } from 'react-router-dom';
import chicken from '../assets/Chicken.svg';
import RulesModal from './RulesModal';
import './HomeStyles.css';

export default function Home() {
    return (
        <div className="HomePage">
            <div className="HomeGlow" aria-hidden="true"></div>

            <div className="HomeContent">
                <div className="HomeBadge">
                    <img src={chicken} alt="" className="HomeBadgeIcon" />
                    <span>A game of deduction &amp; deception</span>
                </div>

                <h1 className="HomeTitle">COUP</h1>
                <p className="HomeSubtitle">
                    Bluff your way to power. Claim influence you don't have.
                    Call out liars before they bleed you dry.
                </p>

                <div className="HomeDoors">
                    <Link to="/create" className="HomeDoor HomeDoor--create">
                        <span className="HomeDoorIcon">♛</span>
                        <span className="HomeDoorTitle">Create Game</span>
                        <span className="HomeDoorDesc">Start a new table and invite your friends</span>
                    </Link>
                    <Link to="/join" className="HomeDoor HomeDoor--join">
                        <span className="HomeDoorIcon">♠</span>
                        <span className="HomeDoorTitle">Join Game</span>
                        <span className="HomeDoorDesc">Enter a room code to sit at the table</span>
                    </Link>
                </div>

                <div className="HomeRulesWrap">
                    <RulesModal home />
                </div>
            </div>

            <footer className="HomeFooter">
                <p>
                    Made by{' '}
                    <a
                        className="website-link"
                        href="https://github.com/bgtoy"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        bGtoyz
                    </a>
                </p>
                <p className="version-number">v2.0 &middot; Online &amp; LAN Credit Ethan</p>
            </footer>
        </div>
    );
}
