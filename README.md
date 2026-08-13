# Current build

**Design Drop 02 — 13 August 2026**

When `Start-Staging.ps1` starts, confirm the console prints:

`[BUILD] Design Drop 02 · 2026-08-13`

If it does not, you are running an older extracted framework.

# Staple IT framework

Canonical development and production-build framework for the Staple IT website.

```powershell
.\Start-Staging.ps1
```

Use `doctor` in the interactive shell (or `tools\Doctor.ps1`) before a deployment leaves the project. Production output is generated into `dist\` locally and only `dist\` is uploaded to the VPS.

See `docs\README-FIRST.md` and `docs\DEPLOYMENT.md`.
