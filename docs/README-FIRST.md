# Staple IT framework — start here

Run the local staging environment from PowerShell:

```powershell
.\Start-Staging.ps1
```

Before producing or sending a build, run:

```powershell
.\tools\Doctor.ps1
```

Build deployable output with:

```powershell
.\tools\Build-Production.ps1
```

Only `dist\` is deployable. The normal homepage has liquidGL disabled; the
internal audit-only proof of concept can be opened with `liquid` at the
`staple>` prompt.

Git is now the project history. Do not create new `-vN` copies of scripts or
docs inside the working tree; edit current files and commit the change.
