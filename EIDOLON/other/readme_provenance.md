
# MASL Provenance

This folder contains a SHA256 manifest for the exported MASL bundles.

## SHA256 Verification
sha256sum -c SHA256SUMS.txt

## GPG Signing (Recommended)
gpg --armor --detach-sign --local-user YOUR_KEY_ID SHA256SUMS.txt
