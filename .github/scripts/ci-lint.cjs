// Runs pnpm run lint if a 'lint' script is defined in package.json,
// otherwise exits 0 with a notice. Avoids shell-specific `||` behaviour
// differences between bash and PowerShell.
const { execSync } = require('node:child_process');

const pkg = require('../../package.json');
const hasLint = Boolean(pkg.scripts && pkg.scripts.lint);

if (!hasLint) {
  console.log('lint script not defined in package.json — skipping');
  process.exit(0);
}

try {
  execSync('pnpm run lint', { stdio: 'inherit' });
} catch (err) {
  // Surface pnpm's own exit code so the step fails the same way it would
  // if invoked directly. This is intentional — the previous `|| echo` form
  // silently swallowed the failure on Windows runners.
  process.exit(err.status || 1);
}
