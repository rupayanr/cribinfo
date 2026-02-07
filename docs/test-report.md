# CribInfo Test Report

**Date:** February 7, 2026
**Version:** Post-Security Hardening Release

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 368 |
| **Passed** | 368 (100%) |
| **Failed** | 0 |
| **Duration** | 2.60s |
| **Test Files** | 28 |

---

## Coverage Report

| Metric | Coverage | Target |
|--------|----------|--------|
| **Statements** | 97.35% | 90% |
| **Branches** | 94.18% | 85% |
| **Functions** | 90.00% | 85% |
| **Lines** | 97.35% | 90% |

All coverage targets exceeded.

---

## Coverage by File

### High Coverage (>95%)

| File | Statements | Branches | Functions |
|------|------------|----------|-----------|
| `App.tsx` | 100% | 100% | 100% |
| `ChatInput.tsx` | 100% | 100% | 100% |
| `ChatMessage.tsx` | 100% | 100% | 100% |
| `FilterBadges.tsx` | 100% | 100% | 100% |
| `MessagePropertyCard.tsx` | 100% | 100% | 100% |
| `PropertyCardSkeleton.tsx` | 100% | 100% | 100% |
| `TypingIndicator.tsx` | 100% | 100% | 100% |
| `WelcomeMessage.tsx` | 100% | 100% | 66.66% |
| `ChatMapWidget.tsx` | 100% | 100% | 100% |
| `CompareView.tsx` | 99.61% | 94.32% | 94.11% |
| `PropertyCard.tsx` | 100% | 100% | 100% |
| `PropertyGrid.tsx` | 100% | 100% | 100% |
| `Filters.tsx` | 100% | 100% | 100% |
| `SearchBar.tsx` | 100% | 100% | 100% |
| `Toast.tsx` | 100% | 75% | 100% |
| `ToastContext.tsx` | 100% | 100% | 100% |
| `useCompare.ts` | 100% | 100% | 100% |
| `useSearch.ts` | 95.43% | 88.57% | 75% |
| `useTheme.ts` | 100% | 93.33% | 100% |
| `ArchitecturePage.tsx` | 100% | 100% | 100% |
| `DocsPage.tsx` | 100% | 50% | 100% |
| `HomePage.tsx` | 100% | 100% | 100% |
| `searchStore.ts` | 100% | 97.14% | 100% |

### Areas for Improvement

| File | Statements | Issue |
|------|------------|-------|
| `main.tsx` | 0% | Entry point, hard to test |
| `MermaidDiagram.tsx` | 89.47% | Mouse event handlers |
| `Header.tsx` | 99.03% | Line 87 |
| `CitySelector.tsx` | 99.41% | Line 126 |

---

## Test Categories

### New Tests Added (68 tests)

| Category | Tests Added | Purpose |
|----------|-------------|---------|
| `useTheme.test.ts` | 7 | Theme toggle, localStorage |
| `useSearch.test.ts` | 17 | Error sanitization, filters |
| `MermaidDiagram.test.tsx` | 10 | Zoom controls, pan |
| `ArchitecturePage.test.tsx` | 7 | All sections coverage |
| `MessagePropertyCard.test.tsx` | 10 | Amenities expand/collapse |
| `CompareView.test.tsx` | 17 | Cards/Table view toggle |

### Existing Tests (300 tests)

| File | Tests | Status |
|------|-------|--------|
| `types/index.test.ts` | 10 | Pass |
| `stores/searchStore.test.ts` | 26 | Pass |
| `hooks/useSearch.test.ts` | 26 | Pass |
| `hooks/useCompare.test.ts` | 7 | Pass |
| `hooks/useTheme.test.ts` | 7 | Pass |
| `Map/PropertyMap.test.tsx` | 19 | Pass |
| `Map/ChatMapContent.test.tsx` | 11 | Pass |
| `Map/ChatMapWidget.test.tsx` | 10 | Pass |
| `Chat/ChatMessage.test.tsx` | 15 | Pass |
| `Chat/ChatContainer.test.tsx` | 8 | Pass |
| `Chat/ChatInput.test.tsx` | 13 | Pass |
| `Chat/WelcomeMessage.test.tsx` | 12 | Pass |
| `Chat/MessagePropertyCard.test.tsx` | 23 | Pass |
| `Chat/TypingIndicator.test.tsx` | 2 | Pass |
| `Chat/FilterBadges.test.tsx` | 11 | Pass |
| `Property/PropertyCard.test.tsx` | 15 | Pass |
| `Property/PropertyGrid.test.tsx` | 6 | Pass |
| `Property/CompareView.test.tsx` | 27 | Pass |
| `Search/SearchBar.test.tsx` | 16 | Pass |
| `Search/Filters.test.tsx` | 10 | Pass |
| `Search/CitySelector.test.tsx` | 9 | Pass |
| `Layout/Header.test.tsx` | 11 | Pass |
| `Docs/MermaidDiagram.test.tsx` | 21 | Pass |
| `Toast/Toast.test.tsx` | 8 | Pass |
| `Toast/ToastContext.test.tsx` | 8 | Pass |
| `pages/ArchitecturePage.test.tsx` | 21 | Pass |
| `pages/DocsPage.test.tsx` | 8 | Pass |
| `App.test.tsx` | 8 | Pass |

---

## Test Quality Metrics

### Security Tests

| Feature | Test Coverage |
|---------|---------------|
| Error message sanitization | `useSearch.test.ts` - 5 tests |
| Safe error whitelist | `useSearch.test.ts` - 3 tests |
| Rate limit error handling | `useSearch.test.ts` - 2 tests |

### UI Component Tests

| Feature | Test Coverage |
|---------|---------------|
| CompareView Cards mode | 8 tests |
| CompareView Table mode | 7 tests |
| Zoom controls | 7 tests |
| Star ratings | 2 tests |
| Amenities expand/collapse | 4 tests |

### Edge Cases Tested

- Empty compare list
- Single property comparison (no highlights)
- Full compare list (5 properties)
- Null/undefined property values
- Price formatting (Lakhs vs Crores)
- Area name fallback for missing titles
- Disabled states for zoom controls
- Theme toggle persistence

---

## Known Warnings (Non-Blocking)

1. **React act() warnings** in:
   - `MermaidDiagram.test.tsx`
   - `SearchBar.test.tsx`
   - `PropertyGrid.test.tsx`

   These are cosmetic warnings due to async state updates in useEffect hooks and do not affect functionality.

---

## Uncovered Lines Analysis

| File | Lines | Reason |
|------|-------|--------|
| `main.tsx` | 1-16 | Entry point, React DOM render |
| `MermaidDiagram.tsx` | 96-103, 107, 111 | Mouse move/leave handlers |
| `Header.tsx` | 87 | Edge case in navigation |
| `CitySelector.tsx` | 126 | Click outside handler |
| `useSearch.ts` | 85-87, 100-107 | Some error branches |
| `CompareView.tsx` | 479-480 | Table view location fallback |

---

## Performance

| Metric | Value |
|--------|-------|
| Transform time | 689ms |
| Setup time | 1.05s |
| Collection time | 5.22s |
| Test execution | 4.85s |
| **Total duration** | 2.60s |

---

## Recommendations

### Completed
- [x] Add useTheme tests
- [x] Expand useSearch error handling tests
- [x] Add MermaidDiagram zoom/pan tests
- [x] Add ArchitecturePage section tests
- [x] Add MessagePropertyCard amenity tests
- [x] Add CompareView Cards/Table toggle tests

### Future Improvements
1. Add E2E tests with Playwright/Cypress
2. Add visual regression tests for CompareView cards
3. Add accessibility tests (a11y)
4. Test mouse drag interactions in MermaidDiagram
5. Add integration tests for API calls

---

## Test Environment

| Component | Version |
|-----------|---------|
| Vitest | 1.6.1 |
| React Testing Library | 14.x |
| React | 18.x |
| Node.js | 20.x |
| TypeScript | 5.x |

---

## How to Run Tests

```bash
# Run all tests
npm run test:run

# Run with coverage
npm run test:run -- --coverage

# Run specific test file
npm run test:run src/hooks/useSearch.test.ts

# Run in watch mode
npm run test
```

---

*Report generated: February 7, 2026*
*Total tests written: 368 | Coverage: 97.35% statements*
