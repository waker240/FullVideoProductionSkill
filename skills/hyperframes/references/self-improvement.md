# Project retrospective and skill maintenance

<!-- Public portability adaptation, 2026-09-26. -->

At delivery, save up to five short entries in the project's `RETROSPECTIVE.md`: observed problem, proven fix and behavior to change next time. Link audit evidence. Personal configuration and unverified experiments stay in the project.

Do not modify installed skills as a side effect of a build. In a separate maintenance task:

1. Compare proposed guidance with scripts and evidence; remove private data and project-only assumptions.
2. Prefer a corrected helper or reusable template to repeated prose. Test meaningful behavior that can regress.
3. Preserve provider choice and host boundaries. Do not promise unbundled tools, accounts or media.
4. Check links, commands, dependencies and third-party notices in a clean directory.
5. Verify a representative artifact and record release changes/tested versions.

Historical internal learning logs are not included and are unnecessary for this workflow. `scripts/skill-doctor.cjs --budgets-only` is a maintenance aid, not proof of visual/audio quality.
