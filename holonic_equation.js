
// === Holonic Equation Animation Logic ===
function renderHolonEquation(containerId, glyphEquation) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const equationDiv = document.createElement('div');
    equationDiv.className = 'holon-equation';
    equationDiv.innerText = glyphEquation;
    container.appendChild(equationDiv);

    setTimeout(() => equationDiv.classList.add('active'), 100);
}
