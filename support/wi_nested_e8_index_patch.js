/* wI' Nested / E8-Ready Layout Patch
   Drop this near the existing constellation loader and change insertStarNode(p, index, total)
   to insertWINestedStarNode(p, index, total).
   It uses fields already embedded in the literal name-token JSON-LD files:
   display.shell, display.radius, display.orbitIndex, projectedPosition.unit, literalToken.
*/

function insertWINestedStarNode(persona, index, total) {
    if (!persona || !persona.name) return;

    const display = persona.display || {};
    const shell = Number.isFinite(display.shell) ? display.shell : 1;
    const radius = Number.isFinite(display.radius) ? display.radius : 120 + shell * 55;
    const unit = persona.projectedPosition && Array.isArray(persona.projectedPosition.unit)
        ? persona.projectedPosition.unit
        : null;

    const nodeGeometry = new THREE.IcosahedronGeometry(shell === 0 ? 16 : 8, 1);
    const nodeMaterial = new THREE.MeshStandardMaterial({
        color: persona.color || 0xeeeeff,
        roughness: 0.45,
        metalness: 0.75,
        wireframe: true
    });

    const starNode = new THREE.Mesh(nodeGeometry, nodeMaterial);

    if (unit && unit.length >= 3) {
        starNode.position.set(unit[0] * radius, unit[1] * radius, unit[2] * radius);
    } else {
        const phi = Math.acos(-1 + (2 * index) / total);
        const theta = Math.sqrt(total * Math.PI) * phi;
        starNode.position.setFromSphericalCoords(radius, phi, theta);
    }

    const stableId = (persona.id || persona.name)
        .toString()
        .split("/")
        .pop()
        .replace(/\.jsonld$/i, "")
        .toLowerCase()
        .replace(/\s+/g, "_");

    const labelText = (display.label || persona.literalToken || persona.name);
    starNode.userData = {
        id: stableId,
        name: labelText,
        note: notes[index % notes.length],
        shell,
        cluster: persona.canonicalCluster,
        family: persona.constellationFamily
    };

    constellationGroup.add(starNode);
    stars.push(starNode);

    const labelDiv = document.createElement("div");
    labelDiv.className = "label";
    labelDiv.textContent = labelText;
    const label = new THREE.CSS2DObject(labelDiv);
    label.position.set(0, shell === 0 ? 22 : 13, 0);
    starNode.add(label);

    if (typeof Tone !== "undefined" && proceduralSounds && reverb) {
        proceduralSounds[stableId] = new Tone.FMSynth({
            harmonicity: 1.0 + (shell * 0.13),
            modulationIndex: 8 + (index % 8)
        }).connect(reverb);
    }
}

/* Optional: draw translucent orbit rings per shell after all stars load. */
function addWIShellRings() {
    const shells = [0, 1, 2, 3, 4, 5, 6];
    shells.forEach(shell => {
        if (shell === 0) return;
        const radius = 35 + shell * 55;
        const geometry = new THREE.TorusGeometry(radius, 0.35, 8, 144);
        const material = new THREE.MeshBasicMaterial({ color: 0x8888ff, transparent: true, opacity: 0.15 });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2;
        constellationGroup.add(ring);
    });
}
