"""Compatibility guard: the static dist/ directory is the source, not generated output."""
from pathlib import Path
root = Path(__file__).parent
assert (root / 'dist/index.html').is_file(), 'Missing static entrypoint'
print('Static project ready. Serve dist/. No files were overwritten. Run npm test before publishing.')
