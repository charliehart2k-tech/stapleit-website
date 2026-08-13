# Current build

**Design Drop 04 — Home + IT Support Focus — 13 August 2026**

When `Start-Staging.ps1` starts, confirm the console prints the Design Drop 04 build identifier. If it does not, you are running an older working copy.

# Staple IT framework

Canonical local development and production-build framework for the Staple IT website.

```powershell
.\Start-Staging.ps1
```

The active website is intentionally being rebuilt page by page. At this stage only the Homepage and IT Support are active content routes; `404.html` remains as the technical fallback.

Use `doctor` in the interactive shell (or `tools\Doctor.ps1`) before deployment. Production output is generated into `dist\` and only `dist\` is uploaded to the VPS.

See `docs\README-FIRST.md`, `docs\DESIGN-SYSTEM.md`, `docs\LIQUIDGL.md` and `docs\DEPLOYMENT.md`.
