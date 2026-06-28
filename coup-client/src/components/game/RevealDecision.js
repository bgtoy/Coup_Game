import React from 'react';

const CARD_INFO = {

    duke:{
        icon:"👑",
        color:"#fbbf24"
    },

    assassin:{
        icon:"☠",
        color:"#9f1239"
    },

    captain:{
        icon:"⚓",
        color:"#2563eb"
    },

    ambassador:{
        icon:"🤝",
        color:"#22c55e"
    },

    contessa:{
        icon:"🛡",
        color:"#ec4899"
    }

};
const ACTION_MAP = {
    tax: ['duke'],
    assassinate: ['assassin'],
    exchange: ['ambassador'],
    steal: ['captain'],
    block_foreign_aid: ['duke'],
    block_steal: ['ambassador', 'captain'],
    block_assassinate: ['contessa'],
};

export default function RevealDecision({ doneReveal, name, socket, res, influences, colorMap }) {
    const act = res.isBlock ? res.counterAction.counterAction : res.action.action;
    const validInfluences = ACTION_MAP[act] || [];

    const selectInfluence = (influence) => {
        socket.emit('g-revealDecision', {
            revealedCard: influence,
            prevAction: res.action,
            counterAction: res.counterAction,
            challengee: res.challengee,
            challenger: res.challenger,
            isBlock: res.isBlock,
        });
        doneReveal();
    };

   return (

<div className="RevealOverlay">

<div className="RevealModal">

<div className="RevealHeader">

💀 REVEAL YOUR INFLUENCE

</div>

<div className="RevealDescription">

You have been challenged.

Reveal

<b>
{" "}
{validInfluences.map(capitalize).join(" or ")}
</b>
to prove your claim.
</div>

<div className="RevealCards">

{

influences.map((influence,index)=>{

const info= CARD_INFO[influence];

return(

<button

key={`${influence}-${index}`}

className="RevealCard"

style={{

"--card-color":info.color

}}

onClick={()=>selectInfluence(influence)}

>

<div className="RevealCardIcon">

{info.icon}

</div>

<div className="RevealCardTitle">

{capitalize(influence)}

</div>

<div className="RevealCardHint">

Click to Reveal

</div>

</button>

);

})

}

</div>

</div>

</div>

);
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
