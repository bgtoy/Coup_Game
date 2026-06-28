import React, { useEffect, useRef, useState } from 'react';

export default function EventLog({ logs }) {
    const bodyRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    return (
        <div className={`EventLogContainer ${isOpen ? 'is-open' : ''}`}>
            <button className="EventLogToggle" onClick={() => setIsOpen((o) => !o)} type="button">
                <span>Event Log</span>
                <span className="EventLogToggleIcon">{isOpen ? '▾' : '▴'}</span>
            </button>
            {isOpen && (
                <div className="EventLogBody" ref={bodyRef}>
                    {logs.length === 0 && <p className="EventLogEmpty">Nothing has happened yet.</p>}
                    {logs.map((line, index) => (
                        <p key={index} className={index === logs.length - 1 ? 'EventLogLine new' : 'EventLogLine'}>
                            {line.map((segment, i) => (
                                <span key={i} style={segment.color ? { color: segment.color, fontWeight: 700 } : undefined}>
                                    {segment.text}
                                </span>
                            ))}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}
