import React from "react";

export default function TopBar({
    roomCode,
    currentPlayer,
    connectionState
}) {

    const statusColor = {
        connected: "#22c55e",
        reconnecting: "#f59e0b",
        failed: "#ef4444"
    };

    return (

        <div className="cg-topbar">

            <div className="cg-room">

                ROOM

                <span>{roomCode}</span>

            </div>

            <div className="cg-title">

                COUP ONLINE

            </div>

            <div className="cg-right">

                <div
                    className="cg-status"
                    style={{
                        background: statusColor[connectionState]
                    }}
                />

                <span>

                    Turn :

                    <b>{currentPlayer}</b>

                </span>

            </div>

        </div>

    );

}