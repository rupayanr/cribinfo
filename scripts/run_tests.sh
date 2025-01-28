#!/bin/bash

# CribInfo Test Runner
# Runs comprehensive tests for both backend and frontend

set -e

echo "============================================"
echo "        CribInfo Test Suite"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Track results
BACKEND_RESULT=0
FRONTEND_RESULT=0

# Run Backend Tests
echo -e "${BLUE}[1/2] Running Backend Tests...${NC}"
echo "============================================"
cd "$ROOT_DIR/backend"
if source .venv/bin/activate 2>/dev/null; then
    if pytest tests/ -v; then
        echo -e "${GREEN}Backend tests passed!${NC}"
    else
        BACKEND_RESULT=1
        echo -e "${RED}Backend tests failed!${NC}"
    fi
else
    echo -e "${RED}Failed to activate virtual environment${NC}"
    BACKEND_RESULT=1
fi
echo ""

# Run Frontend Tests
echo -e "${BLUE}[2/2] Running Frontend Tests...${NC}"
echo "============================================"
cd "$ROOT_DIR/frontend"
if npm run test:run; then
    echo -e "${GREEN}Frontend tests passed!${NC}"
else
    FRONTEND_RESULT=1
    echo -e "${RED}Frontend tests failed!${NC}"
fi
echo ""

# Summary
echo "============================================"
echo "              Test Summary"
echo "============================================"
if [ $BACKEND_RESULT -eq 0 ]; then
    echo -e "Backend:  ${GREEN}PASSED${NC}"
else
    echo -e "Backend:  ${RED}FAILED${NC}"
fi

if [ $FRONTEND_RESULT -eq 0 ]; then
    echo -e "Frontend: ${GREEN}PASSED${NC}"
else
    echo -e "Frontend: ${RED}FAILED${NC}"
fi
echo "============================================"

# Exit with failure if any test suite failed
if [ $BACKEND_RESULT -ne 0 ] || [ $FRONTEND_RESULT -ne 0 ]; then
    exit 1
fi

echo -e "${GREEN}All tests passed!${NC}"
exit 0
