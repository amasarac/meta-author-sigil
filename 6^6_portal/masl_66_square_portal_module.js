// MASL 6/6 Square Portal drop-in module
// Usage:
//   import { MASL66SquarePortal } from './masl_66_square_portal_module.js';
//   MASL66SquarePortal.mount(document.querySelector('#portal'));
export const MASL66SquarePortal = {
  version: "1.0.0",
  id: "masl:portal/2026-06-06-square-portal",
  mount(target, opts = {}) {
    const src = opts.src || "./masl_66_square_portal.html";
    const height = opts.height || "860px";
    target.innerHTML = `
      <iframe title="MASL 6/6 Square Portal"
        src="${src}"
        style="width:100%;height:${height};border:1px solid #24344a;border-radius:12px;background:#08101d"></iframe>`;
  }
};
