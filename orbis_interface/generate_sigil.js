  exports.handler = async function(event, context) {
  const params = event.queryStringParameters || {};
  const intent = (params.intent || 'I AM THAT I AM').replace(/</g,'').replace(/>/g,'');

  // Simple string hashing function to generate a numeric seed
  const hashCode = s => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
  const seed = hashCode(intent);

  // Use the seed to generate variations
  const hue = seed % 360;
  const spiralStroke = `hsl(${hue}, 90%, 70%)`;
  const eyeStroke = `hsl(${(hue + 180) % 360}, 90%, 70%)`;
  const spiralWidth = 6 + (Math.abs(seed) % 10); // Vary stroke width

  const size = 1200;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.floor(size*0.35)}" viewBox="0 0 1200 420">
    <rect width="100%" height="100%" fill="#080810" />
    <g transform="translate(600, 210)">
      <path d="M0,40 c 40,-20 80,-60 80,-120 c 0,-90 -120,-160 -240,-80 c -40,30 -60,90 -40,130" fill="none" stroke="${spiralStroke}" stroke-width="${spiralWidth}" stroke-linecap="round" opacity="0.98"/>
      <circle cx="0" cy="0" r="44" fill="#000" stroke="${eyeStroke}" stroke-width="6"/>
      <circle cx="0" cy="0" r="18" fill="${spiralStroke}"/>
      <text x="0" y="170" font-family="serif" font-size="28" fill="#fff" text-anchor="middle">${intent}</text>
    </g>
  </svg>`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/svg+xml' },
    body: svg
  };
};
