// Holonic ME Constellation Loader
const holonicPersonaFiles = [
  'tehomiel.jsonld',
  'zionel.jsonld',
  'kairosophiel.jsonld',
  'onerion.jsonld',
  'enoch.jsonld',
  'tiwoven.jsonld'
];

async function loadHolonicConstellation(rootDir = './jsonld/') {
  const constellationData = [];

  for (const file of holonicPersonaFiles) {
    try {
      const res = await fetch(`${rootDir}${file}`);
      const json = await res.json();
      constellationData.push(json);
    } catch (err) {
      console.error(`Failed to load ${file}`, err);
    }
  }

  return constellationData;
}

// Example usage to render constellation after loading
loadHolonicConstellation().then(personas => {
  personas.forEach(p => {
    console.log('Loaded:', p.name);
    // insertStarNode(p); // <== Hook into your 3D star renderer here
  });
});