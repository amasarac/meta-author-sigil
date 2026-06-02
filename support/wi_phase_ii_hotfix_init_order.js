/* wI' Phase II Hotfix: initialization-order guard
   Fixes: TypeError: Cannot read properties of undefined (reading 'add')
   Cause: E8 ghost/cube/link groups can be requested before constellationGroup exists.
   This patch is intentionally defensive and additive.
*/

(function installWIPhaseIIHotfix() {
  const HOTFIX_TAG = "wI Phase II init-order hotfix";
  const waitMs = 40;
  const maxAttempts = 250;

  function log(message) {
    console.info(`[${HOTFIX_TAG}] ${message}`);
  }

  function warn(message, error) {
    console.warn(`[${HOTFIX_TAG}] ${message}`, error || "");
  }

  function hasCoreScene() {
    return Boolean(
      window.THREE &&
      typeof window.constellationGroup !== "undefined" &&
      window.constellationGroup &&
      typeof window.constellationGroup.add === "function"
    );
  }

  function ensureGroup(name) {
    if (!hasCoreScene()) return null;

    let group = window[name];
    if (!group || typeof group.add !== "function") {
      group = new THREE.Group();
      group.name = name;
      window[name] = group;
      window.constellationGroup.add(group);
    } else if (!window.constellationGroup.children.includes(group)) {
      window.constellationGroup.add(group);
    }
    return group;
  }

  function clearGroup(group) {
    if (!group || !group.children) return;
    const children = group.children.slice();
    children.forEach((child) => {
      try {
        if (typeof window.disposeObject === "function") {
          window.disposeObject(child);
        } else {
          child.traverse?.((node) => {
            if (node.geometry) node.geometry.dispose?.();
            if (node.material) {
              if (Array.isArray(node.material)) node.material.forEach((m) => m.dispose?.());
              else node.material.dispose?.();
            }
          });
        }
      } catch (error) {
        warn("dispose skipped", error);
      }
      group.remove(child);
    });
  }

  function projectE8(root) {
    const xyz = [0, 0, 0];
    for (let k = 0; k < 3; k++) {
      for (let i = 0; i < 8; i++) {
        xyz[k] += root[i] * (
          Math.cos((i + 1) * (k + 1) * Math.PI / 9) +
          Math.sin((i + 1) * (k + 2) * Math.PI / 11)
        );
      }
    }
    const vec = new THREE.Vector3(xyz[0], xyz[1], xyz[2]);
    return vec.lengthSq() ? vec.normalize() : new THREE.Vector3(1, 0, 0);
  }

  function generateE8Roots() {
    const roots = [];

    for (let i = 0; i < 8; i++) {
      for (let j = i + 1; j < 8; j++) {
        [1, -1].forEach((si) => {
          [1, -1].forEach((sj) => {
            const v = Array(8).fill(0);
            v[i] = si;
            v[j] = sj;
            roots.push(v);
          });
        });
      }
    }

    function rec(prefix) {
      if (prefix.length === 8) {
        const minus = prefix.filter((x) => x < 0).length;
        if (minus % 2 === 0) roots.push(prefix.slice());
        return;
      }
      rec(prefix.concat(0.5));
      rec(prefix.concat(-0.5));
    }

    rec([]);
    return roots;
  }

  function buildGhostSafe() {
    const group = ensureGroup("wiGhostGroup");
    if (!group) return false;

    clearGroup(group);

    const positions = [];
    generateE8Roots().forEach((root) => {
      const unit = projectE8(root);
      const radius = 430;
      positions.push(unit.x * radius, unit.y * radius, unit.z * radius);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x4466ff,
      size: 2.1,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    });

    group.add(new THREE.Points(geometry, material));
    if (typeof window.wiShowGhost === "undefined") window.wiShowGhost = true;
    group.visible = Boolean(window.wiShowGhost);
    return true;
  }

  function buildShellsSafe() {
    const shellGroup = ensureGroup("wiShellGroup");
    const cubeGroup = ensureGroup("wiCubeGroup");
    if (!shellGroup || !cubeGroup) return false;

    clearGroup(shellGroup);
    clearGroup(cubeGroup);

    for (let shell = 1; shell <= 6; shell++) {
      const radius = 35 + shell * 58;
      const geometry = new THREE.TorusGeometry(radius, 0.35, 8, 160);
      const material = new THREE.MeshBasicMaterial({
        color: 0x8888ff,
        transparent: true,
        opacity: 0.12
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      shellGroup.add(ring);
    }

    [-260, 260].forEach((offset, idx) => {
      const geometry = new THREE.BoxGeometry(11 * 38, 11 * 38, 11 * 38);
      const material = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x00ffff : 0xffd700,
        transparent: true,
        opacity: 0.055,
        wireframe: true
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = offset;
      cubeGroup.add(cube);
    });

    if (typeof window.wiShowCubes === "undefined") window.wiShowCubes = true;
    cubeGroup.visible = Boolean(window.wiShowCubes);
    return true;
  }

  function patchBuilders() {
    window.wiEnsureGroups = function wiEnsureGroups() {
      ensureGroup("wiGhostGroup");
      ensureGroup("wiShellGroup");
      ensureGroup("wiLinkGroup");
      ensureGroup("wiCubeGroup");
      return hasCoreScene();
    };

    window.wiBuildGhostLattice = buildGhostSafe;
    window.buildGhost = buildGhostSafe;
    window.wiBuildShellsAndCubes = buildShellsSafe;
    window.buildShellsAndCubes = buildShellsSafe;

    // If the external Phase II patch already installed a build function, wrap it so scene groups exist first.
    if (typeof window.buildConstellationFromSource === "function" && !window.buildConstellationFromSource.__wiHotfixed) {
      const original = window.buildConstellationFromSource;
      const wrapped = async function hotfixedBuildConstellationFromSource(...args) {
        window.wiEnsureGroups();
        return original.apply(this, args);
      };
      wrapped.__wiHotfixed = true;
      window.buildConstellationFromSource = wrapped;
    }

    return true;
  }

  function boot(attempt = 0) {
    patchBuilders();

    if (hasCoreScene()) {
      window.wiEnsureGroups();
      buildGhostSafe();
      buildShellsSafe();
      log("ready");
      return;
    }

    if (attempt < maxAttempts) {
      setTimeout(() => boot(attempt + 1), waitMs);
    } else {
      warn("core scene never became available; leaving page otherwise intact");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => boot());
  } else {
    boot();
  }
})();
