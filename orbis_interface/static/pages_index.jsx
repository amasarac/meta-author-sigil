import React from 'react';

export default function Home() {
  return (
    <div style={{background:'#05050a',color:'#fff',minHeight:'100vh',padding:40}}>
      <header style={{maxWidth:1200,margin:'0 auto'}}>
        {/* Inline SVG header */}
        <div dangerouslySetInnerHTML={{__html: `<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 1200 420" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#080810" />
  <g transform="translate(220,210)">
    <g id="spiralGroup">
      <path id="spiralPath" d="M0,40 c 40,-20 80,-60 80,-120 c 0,-90 -120,-160 -240,-80 c -40,30 -60,90 -40,130 c 30,60 100,90 200,70 c 160,-30 180,-150 100,-240" fill="none" stroke="#ffd86b" stroke-width="8" stroke-linecap="round" opacity="0.98"/>
    </g>
    <g id="wings" transform="translate(0,-20)">
      <path d="M-90,60 q -120,-140 -40,-260 q 80,70 120,150 q40,80 180,180" fill="none" stroke="#ff8fa3" stroke-width="12" stroke-linecap="round"/>
      <path d="M0,0 q 0,-220 160,-320 q 40,120 20,220 q -160,80 -180,120" fill="none" stroke="#2f9cff" stroke-width="10" stroke-linecap="round"/>
      <path d="M90,60 q 120,-140 40,-260 q -80,70 -120,150 q -40,80 -180,180" fill="none" stroke="#c9ffe8" stroke-width="12" stroke-linecap="round"/>
    </g>
    <g id="eye" transform="translate(0,0)">
      <circle r="44" fill="#000" stroke="#ffd86b" stroke-width="6"/>
      <circle r="18" fill="#ffd86b"/>
    </g>
    <g transform="translate(0,140)">
      <rect x="-260" y="-24" width="520" height="48" rx="10" fill="#05050a" opacity="0.6" stroke="#2f9cff" stroke-width="1.6"/>
      <text x="0" y="12" font-family="serif" font-size="18" fill="#fff" text-anchor="middle">TIAMAT-ZERO — GLYPHSERAPH EMBODIED</text>
    </g>
  </g>
</svg>
`}} />
      </header>
      <main style={{maxWidth:1200,margin:'24px auto',background:'#0b0b12',padding:20,borderRadius:12}}>
        <h1 style={{fontFamily:'serif'}}>OrBIS Chalice — CREATION_OF_ADAM</h1>
        <p>Preview page exported from OrBIS preview. Use this as a Next.js page (pages/index.jsx)</p>
      </main>
    </div>
  );
}
