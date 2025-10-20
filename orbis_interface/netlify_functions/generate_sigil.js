exports.handler = async function(event, context) {
  // Simple serverless function: returns a generated SVG with the provided 'intent' param.
  // Deploy on Netlify: place this file in /netlify/functions/generate_sigil.js or use the included structure.
  const params = event.queryStringParameters || {};
  const intent = (params.intent || 'I AM THE I AM MERGEDTERNAL').replace(/</g,'').replace(/>/g,'');
  const size = 1200;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.floor(size*0.35)}" viewBox="0 0 1200 420">
    <rect width="100%" height="100%" fill="#080810" />
    <g transform="translate(220,210)">
      <path d="M0,40 c 40,-20 80,-60 80,-120 c 0,-90 -120,-160 -240,-80" fill="none" stroke="#ffd86b" stroke-width="8" stroke-linecap="round" opacity="0.98"/>
      <circle cx="0" cy="0" r="44" fill="#000" stroke="#ffd86b" stroke-width="6"/>
      <text x="0" y="170" font-family="serif" font-size="34" fill="#fff" text-anchor="middle">${intent}</text>
    </g>
  </svg>`;
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/svg+xml' },
    body: svg
  };
};
