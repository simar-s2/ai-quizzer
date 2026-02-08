#!/bin/bash

# llm-pack
# Combines project structure and file contents into a single text file for LLMs.
# Optimized for Next.js / Web Development.

set -euo pipefail

# --- CONFIGURATION ---
OUTPUT_DIR="$HOME/Desktop"
PROJECT_NAME="$(basename "$PWD")"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTPUT_FILE="${OUTPUT_DIR}/${PROJECT_NAME}_Context_${TIMESTAMP}.txt"
MAX_FILE_SIZE_KB=100

# Web & Dev Trash to explicitly ignore
IGNORE_PATTERNS=(
    ".git" ".DS_Store" "node_modules" 
    ".next" "out" "build" "dist" ".vercel"
    ".env" ".env.local" ".env.development.local" ".env.test.local" ".env.production.local"
    "npm-debug.log*" "yarn-debug.log*" "yarn-error.log*" ".pnpm-debug.log*"
    "*.lock" "*.png" "*.jpg" "*.jpeg" "*.gif" "*.svg" "*.pdf" "*.ico"
    "package-lock.json" "yarn.lock" "pnpm-lock.yaml"
)

# --- FUNCTIONS ---

is_binary() {
    # Check mime type to prevent printing garbage characters
    local mime
    mime=$(file -b --mime-type "$1")
    [[ "$mime" == text/* || "$mime" == application/json || "$mime" == application/xml ]] && return 0
    return 1
}

generate_tree() {
    echo "=========================================" >> "$OUTPUT_FILE"
    echo "           PROJECT STRUCTURE             " >> "$OUTPUT_FILE"
    echo "=========================================" >> "$OUTPUT_FILE"
    
    # Use 'tree' if installed, otherwise fallback to finding files
    if command -v tree &> /dev/null; then
        # -I ignores patterns. We construct a pipe-separated string of ignores.
        local ignore_str
        ignore_str=$(IFS='|'; echo "${IGNORE_PATTERNS[*]}")
        tree -I "$ignore_str" >> "$OUTPUT_FILE"
    else
        find . -maxdepth 3 -not -path '*/.*' >> "$OUTPUT_FILE"
    fi
    echo -e "\n" >> "$OUTPUT_FILE"
}

process_file() {
    local file="$1"
    
    # 1. Skip if file doesn't exist (deleted during run)
    [[ ! -f "$file" ]] && return

    # 2. Skip if file is too big
    local size_kb
    size_kb=$(($(wc -c < "$file") / 1024))
    if [[ $size_kb -gt $MAX_FILE_SIZE_KB ]]; then
        echo "Skipping large file: $file (${size_kb}KB)"
        return
    fi

    # 3. Skip if binary
    if ! is_binary "$file"; then
        echo "Skipping binary file: $file"
        return
    fi

    # 4. Append content
    echo "-----------------------------------------" >> "$OUTPUT_FILE"
    echo "FILE: $file" >> "$OUTPUT_FILE"
    echo "-----------------------------------------" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo -e "\n\n" >> "$OUTPUT_FILE"
}

# --- EXECUTION ---

echo "📦 Packing context for: $PROJECT_NAME"

# Create file header
{
    echo "# LLM Context Pack"
    echo "# Project: $PROJECT_NAME"
    echo "# Date: $(date)"
    echo "# Note: Binary files and large files (>$MAX_FILE_SIZE_KB KB) are excluded."
    echo ""
} > "$OUTPUT_FILE"

# 1. Append Structure
generate_tree

echo "=========================================" >> "$OUTPUT_FILE"
echo "             FILE CONTENTS               " >> "$OUTPUT_FILE"
echo "=========================================" >> "$OUTPUT_FILE"

# 2. Append Contents
# STRATEGY: Use git ls-files if available (respects .gitignore), else use find.
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "✅ Using Git to track relevant files..."
    git ls-files | while read -r file; do
        # Even if git tracks it, double check it against our ignore patterns
        should_process=true
        for pattern in "${IGNORE_PATTERNS[@]}"; do
            # Simple wildcard matching
            if [[ "$file" == $pattern ]]; then
                should_process=false
                break
            fi
        done
        
        if $should_process; then
             process_file "$file"
        fi
    done
else
    echo "⚠️ Not a git repo. Using standard find..."
    # Build find exclusion args
    FIND_ARGS=()
    for pattern in "${IGNORE_PATTERNS[@]}"; do
        FIND_ARGS+=(-name "$pattern" -prune -o)
    done
    
    find . "${FIND_ARGS[@]}" -type f -print | while read -r file; do
        # Strip leading ./ for cleaner output
        clean_file="${file#./}"
        process_file "$clean_file"
    done
fi

echo "✅ Done! Context saved to: $OUTPUT_FILE"
