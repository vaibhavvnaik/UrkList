#!/usr/bin/env bash
#
# Secret detection script for git pre-commit hook.
# Scans staged files for potential credentials, API keys, and connection strings.
#
# Usage:
#   As pre-commit hook: automatically runs on git commit
#   Manual:             ./scripts/check-secrets.sh [file1 file2 ...]
#

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Patterns that indicate secrets or credentials.
# Each entry: "LABEL:::REGEX"
PATTERNS=(
  "MongoDB Connection String:::mongodb(\+srv)?://[^\s\"']+:[^\s\"']+@"
  "Generic Connection String:::://[a-zA-Z0-9_-]+:[a-zA-Z0-9_!@#\$%^&*]+@[a-zA-Z0-9.-]+"
  "AWS Access Key:::AKIA[0-9A-Z]{16}"
  "AWS Secret Key:::(?i)(aws_secret_access_key|aws_secret)\s*[=:]\s*['\"]?[A-Za-z0-9/+=]{40}"
  "Generic API Key Assignment:::(?i)(api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*['\"][a-zA-Z0-9_\-]{16,}['\"]"
  "Generic Secret Assignment:::(?i)(secret|password|passwd|pwd|token|auth_token|access_token)\s*[=:]\s*['\"][^\s'\"]{8,}['\"]"
  "Private Key Block:::-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"
  "Slack Token:::xox[bporas]-[0-9a-zA-Z-]+"
  "GitHub Token:::gh[pousr]_[A-Za-z0-9_]{36,}"
  "Stripe Key:::sk_(live|test)_[0-9a-zA-Z]{24,}"
  "Google API Key:::AIza[0-9A-Za-z\\-_]{35}"
  "Hardcoded Bearer Token:::(?i)(authorization|bearer)\s*[=:]\s*['\"]Bearer\s+[a-zA-Z0-9_\-.]+['\"]"
  "Hex/Base64 Secret (32+ chars):::(?i)(secret|key|token|password)\s*[=:]\s*['\"][0-9a-fA-F]{32,}['\"]"
)

# Files/paths to always skip
SKIP_PATTERNS=(
  "\.lock$"
  "node_modules/"
  "\.git/"
  "\.env\.example$"
  "\.env\.sample$"
  "check-secrets\.sh$"
  "\.md$"
)

found_secrets=0
checked_files=0

# Determine which files to check
if [ $# -gt 0 ]; then
  files=("$@")
else
  # Get staged files (for pre-commit hook usage)
  mapfile -t files < <(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true)
fi

if [ ${#files[@]} -eq 0 ]; then
  exit 0
fi

for file in "${files[@]}"; do
  # Skip if file doesn't exist (deleted files)
  [ -f "$file" ] || continue

  # Skip binary files
  if file --mime "$file" 2>/dev/null | grep -q "binary"; then
    continue
  fi

  # Skip excluded paths
  skip=false
  for sp in "${SKIP_PATTERNS[@]}"; do
    if echo "$file" | grep -qE "$sp"; then
      skip=true
      break
    fi
  done
  $skip && continue

  checked_files=$((checked_files + 1))

  for entry in "${PATTERNS[@]}"; do
    label="${entry%%:::*}"
    pattern="${entry##*:::}"

    # Use grep with perl-compatible regex
    matches=$(grep -nP "$pattern" "$file" 2>/dev/null || true)
    if [ -n "$matches" ]; then
      if [ $found_secrets -eq 0 ]; then
        echo ""
        echo -e "${RED}========================================${NC}"
        echo -e "${RED}  SECRET DETECTED - COMMIT BLOCKED${NC}"
        echo -e "${RED}========================================${NC}"
        echo ""
      fi
      found_secrets=$((found_secrets + 1))
      echo -e "${YELLOW}[$label]${NC} in ${RED}$file${NC}:"
      echo "$matches" | while IFS= read -r line; do
        line_num="${line%%:*}"
        echo "  Line $line_num (content hidden for safety)"
      done
      echo ""
    fi
  done
done

if [ $found_secrets -gt 0 ]; then
  echo -e "${RED}Found $found_secrets potential secret(s) in staged files.${NC}"
  echo ""
  echo "To fix:"
  echo "  1. Move secrets to environment variables (.env file)"
  echo "  2. Reference them via process.env.YOUR_SECRET_NAME"
  echo "  3. Stage the corrected files and commit again"
  echo ""
  echo "To bypass (NOT recommended):"
  echo "  git commit --no-verify"
  echo ""
  exit 1
fi

exit 0
