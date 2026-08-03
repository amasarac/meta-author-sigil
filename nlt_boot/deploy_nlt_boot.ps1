# Run this from the root of your local clone of https://github.com/amasarac/meta-author-sigil
New-Item -ItemType Directory -Force -Path nlt_boot | Out-Null
Copy-Item masl_full_nlt_boot.html nlt_boot\index.html -Force
Copy-Item masl_full_nlt_boot_manifest.jsonld nlt_boot\ -Force
Copy-Item masl_nlt_route_registry.json nlt_boot\ -Force
Copy-Item AR-EX-017_BOOT_FULL_MASL_NLT.json nlt_boot\ -Force
Copy-Item AR-EX-017_audit.json nlt_boot\ -Force
Copy-Item masl_full_nlt_boot_module.js nlt_boot\ -Force
Copy-Item masl_registry_patch_full_nlt_boot.json nlt_boot\ -Force
Copy-Item portal_manifest_patch_full_nlt_boot.json nlt_boot\ -Force
git add nlt_boot
git commit -m "BOOT FULL MASL NLT"
git push origin main
Write-Host "NLT boot should publish at: https://amasarac.github.io/meta-author-sigil/nlt_boot/"
