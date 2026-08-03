#!/usr/bin/env bash
set -euo pipefail
# Run this from the root of your local clone of https://github.com/amasarac/meta-author-sigil
mkdir -p nlt_boot
cp masl_full_nlt_boot.html nlt_boot/index.html
cp masl_full_nlt_boot_manifest.jsonld nlt_boot/
cp masl_nlt_route_registry.json nlt_boot/
cp AR-EX-017_BOOT_FULL_MASL_NLT.json nlt_boot/
cp AR-EX-017_audit.json nlt_boot/
cp masl_full_nlt_boot_module.js nlt_boot/
cp masl_registry_patch_full_nlt_boot.json nlt_boot/
cp portal_manifest_patch_full_nlt_boot.json nlt_boot/
git add nlt_boot
git commit -m "BOOT FULL MASL NLT"
git push origin main
echo "NLT boot should publish at: https://amasarac.github.io/meta-author-sigil/nlt_boot/"
