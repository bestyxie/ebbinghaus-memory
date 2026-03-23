#!/bin/bash
set -e

# Fix ownership of mounted volumes
sudo chown -R node:node /workspace/node_modules /var/lib/pnpm-store

# Install dependencies
pnpm install


npx -y skills add vercel-labs/agent-browser --global --yes
