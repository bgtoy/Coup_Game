import React from "react";

const ACTION_INFO = {
    steal: {
        icon: "🗡",
        title: "Captain",
        text: (source, target) => (
            <>
                <b>{source}</b> wants to steal from <b>{target}</b>
            </>
        ),
    },

    tax: {
        icon: "👑",
        title: "Duke",
        text: (source) => (
            <>
                <b>{source}</b> claims <b>Duke</b> and collects 3 coins.
            </>
        ),
    },

    assassinate: {
        icon: "☠",
        title: "Assassin",
        text: (source, target) => (
            <>
                <b>{source}</b> wants to assassinate <b>{target}</b>.
            </>
        ),
    },

    exchange: {
        icon: "🔄",
        title: "Ambassador",
        text: (source) => (
            <>
                <b>{source}</b> wants to exchange influences.
            </>
        ),
    },
};

export default function ChallengeDecision({
    closeOtherVotes,
    doneChallengeVote,
    name,
    action,
    socket,
}) {
    const info = ACTION_INFO[action.action];

    const vote = (isChallenging) => {

        closeOtherVotes("challenge");

        socket.emit("g-challengeDecision", {

            action,

            isChallenging,

            challengee: action.source,

            challenger: name,

        });

        doneChallengeVote();

    };

    return (

        <div className="ChallengeOverlay">

            <div className="ChallengeModal">

                <div className="ChallengeHeader">

                    ⚔ CHALLENGE ⚔

                </div>

                <div className="ChallengeIcon">

                    {info?.icon}

                </div>

                <div className="ChallengeClaim">

                    {info?.title}

                </div>

                <div className="ChallengeDescription">

                    {info?.text(action.source, action.target)}

                </div>

                <div className="ChallengeButtons">

                    <button
                        className="ChallengeBtn danger"
                        onClick={() => vote(true)}
                    >

                        ⚔ Challenge

                    </button>

                    <button
                        className="ChallengeBtn allow"
                        onClick={() => vote(false)}
                    >

                        ✔ Allow

                    </button>

                </div>

            </div>

        </div>

    );
}