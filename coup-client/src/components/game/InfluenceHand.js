import React from 'react';

export default function InfluenceHand({ influences, colorMap }) {
    return (
        <div className="InfluenceHand">
            <p className="InfluenceHandLabel">Your Influences</p>
            <div className="InfluenceHandCards">
                {influences.map((influence, index) => (
                    <div
                        key={`${influence}-${index}`}
                        className="InfluenceCard"
                        style={{ '--card-color': colorMap[influence] }}
                    >
                        <span className="InfluenceCardGlyph">{glyphFor(influence)}</span>
                        <span className="InfluenceCardName">{influence}</span>
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
