# Git workflow (no clashes)
1. Commit ONLY inside your owned folders (see README). server/app/schemas and core change via PR reviewed by User2.
2. Branch: feature/<user>-<task>. Never push to main.
3. Before every push: git pull --rebase origin main
4. Small PRs, squash merge, delete branch.
5. main.py is already wired to one router per module, so nobody edits it. Add endpoints only in your own api/<module>.py.
6. Commit format: <module>: <what>
