# Update workflow

Git is the canonical history. Do not create version-suffixed copies of the
framework or documentation inside the project.

For normal local edits:

1. Make the change under `site/`, `tools/`, `docs/`, `deploy/` or another
   appropriate tracked path.
2. Run `tools\Doctor.ps1`.
3. Review the diff with `git diff` and commit it with a meaningful message.

ChatGPT patch ZIPs remain supported for convenience. Drop a patch into
`staging\inbox\` and run `apply <zip>` at the `staple>` prompt. The updater
backs up replaced files first. After applying a patch, run `doctor` and commit
the reviewed result rather than treating the ZIP filename as version history.
