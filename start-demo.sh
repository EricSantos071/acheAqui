#!/bin/bash

echo ""
echo "🚀 Starting AcheAqui Presentation Environment..."
echo ""

ROOT="$HOME/Projects/acheAqui"
FRONTEND="$ROOT/acheaqui-frontend"

# ─────────────────────────────────────────────

# Backend

# ─────────────────────────────────────────────

echo "🔧 Starting FastAPI backend..."

xfce4-terminal \
  --title="AcheAqui Backend" \
  --hold \
  -e "bash -c 'cd \"$ROOT\" && source .venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload'"

sleep 5

# ─────────────────────────────────────────────

# Frontend

# ─────────────────────────────────────────────

echo "🌐 Starting Next.js frontend..."

xfce4-terminal \
  --title="AcheAqui Frontend" \
  --hold \
  -e "bash -ic 'cd \"$FRONTEND\" && npm run dev'"

sleep 3

echo ""
echo "✅ AcheAqui launched successfully!"
echo ""
echo "Quick checks:"
echo "  Frontend: http://localhost:3000"
echo "  Backend : http://100.125.90.100:8000/health"
echo ""
echo "Now start ngrok in a separate terminal:"
echo ""
echo "  npx ngrok http 3000"
echo ""
echo "Then open the HTTPS URL on your phone."
echo ""
