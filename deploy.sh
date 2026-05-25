#!/bin/bash
# Force a fresh Railway deployment bypassing the stale build cache.
# Usage: bash deploy.sh

set -e

echo "==> Logging in to Railway..."
railway login

echo "==> Linking project..."
railway link

echo "==> Deploying with fresh build (no cache)..."
railway up --detach --no-cache

echo "==> Done. Check Railway dashboard for deployment status."
