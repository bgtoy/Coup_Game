import React, { useState } from 'react';

export default function InfluenceHand({ influences, colorMap }) {
    const [isHidden, setIsHidden] = useState(false);

    return (
        <div className="InfluenceHand">
            <div className="InfluenceHandHeader">
                <p className="InfluenceHandLabel">Your Influences</p>
                <button
                    className="InfluenceHandToggle"
                    onClick={() => setIsHidden((h) => !h)}
                    type="button"
                    title={isHidden ? 'Show your cards' : 'Hide your cards'}
                >
                    {isHidden ? (
                        <>
                            <EyeOffIcon /> Hidden
                        </>
                    ) : (
                        <>
                            <EyeIcon /> Visible
                        </>
                    )}
                </button>
            </div>
            <div className="InfluenceHandCards">
                {influences.map((influence, index) => (
                    <div
                        key={`${influence}-${index}`}
                        className={`InfluenceCard ${isHidden ? 'is-hidden' : ''}`}
                        style={{ '--card-color': colorMap[influence] }}
                    >
                        <div className="InfluenceCardInner">
                            <div className="InfluenceCardFace InfluenceCardFront">
                                <span className="InfluenceCardGlyph">{glyphFor(influence)}</span>
                                <span className="InfluenceCardName">{influence}</span>
                            </div>
                            <div className="InfluenceCardFace InfluenceCardBack">
                                <span className="InfluenceCardBackGlyph">♣</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function glyphFor(influence) {
    switch (influence) {
        case 'duke': return '♛';
        case 'assassin': return '✦';
        case 'captain': return '⚓';
        case 'ambassador': return '⚖';
        case 'contessa': return '♥';
        default: return '?';
    }
}

function EyeIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10.6 5.1A10.6 10.6 0 0112 5c6.5 0 10 7 10 7a14.6 14.6 0 01-3.1 3.9M6.2 6.2C3.6 8 2 12 2 12s3.5 7 10 7a9.7 9.7 0 004-.85" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9.9 9.9a3 3 0 104.2 4.2" stroke="currentColor" strokeWidth="2"/>
        </svg>
    );
}