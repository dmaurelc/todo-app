# Hostile Security Review: Fase 1 Quick Wins Plan
**Reviewer**: Security Adversary (Code-Reviewer Agent)
**Date**: 2026-03-10
**Lens**: Attacker mindset - Auth bypass, injection, data exposure, privilege escalation, supply chain, OWASP Top 10

---

## Finding 1: LocalStorage Schema Migration - Race Condition Data Loss
- **Severity:** Critical
- **Location:** Phase 02, section "Implementation Steps > Step 1.2 Add Migration to useTodos.js"
- **Flaw:** Schema migration v1→v2 executes without atomic transactions or concurrency control
- **Failure scenario:**
  1. User opens app in two tabs simultaneously
  2. Tab A reads schema_version = 1
  3. Tab B reads schema_version = 1
  4. Tab A migrates data, sets schema_version = 2
  5. Tab B migrates SAME data (now has priority field)
  6. Tab B overwrites localStorage with duplicate priority field
  7. Result: Data corruption, duplicate todos, or complete data loss
- **Evidence:**
  ```
  // Add SCHEMA_VERSION constant (current: 1, new: 2)
  // Create migrateSchema() function
  // - Check localStorage.getItem('schema_version')
  // - If <2, add priority: 'medium' to all todos
  ```
  No read-modify-write lock. No atomic compare-and-swap.
- **Suggested fix:** Implement localStorage transaction pattern with version check-and-set, or add migration timestamp to detect concurrent migrations.

---

## Finding 2: SearchHighlight Component - XSS via HTML Injection
- **Severity:** Critical
- **Location:** Phase 04, section "Step 3: Create SearchHighlight Component > 3.1"
- **Flaw:** Uses `v-html` with regex replacement without proper sanitization
- **Failure scenario:**
  1. Attacker creates todo with title: `<img src=x onerror=alert(document.cookie)>`
  2. User searches for "img"
  3. SearchHighlight wraps match in `<mark>` tags via string replacement
  4. `v-html` renders: `<mark><img src=x onerror=alert(document.cookie)></mark>`
  5. Browser executes JavaScript, steals localStorage data (all todos), sends to attacker
  6. Since app is client-only, attacker can inject persistent XSS into other users' localStorage via social engineering
- **Evidence:**
  ```javascript
  const highlightedText = computed(() => {
    if (!props.query) return props.text
    const escapedQuery = props.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedQuery})`, 'gi')
    return props.text.replace(regex, '<mark>$1</mark>')  // UNSAFE
  })
  ```
  Escape only applies to QUERY, not TEXT. `props.text` is raw user input.
- **Suggested fix:** Never use `v-html`. Use text rendering with CSS highlighting, or DOMPurify library for sanitization.

---

## Finding 3: ReDoS Attack via Search Query
- **Severity:** High
- **Location:** Phase 04, section "Step 3: Create SearchHighlight Component > 3.1"
- **Flaw:** Regex creation from user input without length validation
- **Failure scenario:**
  1. Attacker types search query: `(((((((((((((((((((((((((((((a)`
  2. Regex engine attempts catastrophic backtracking on each todo title
  3. For 1000 todos, search takes 30+ seconds
  4. Browser freezes, UI unresponsive
  5. User force-quits, loses unsaved changes
  6. DoS condition persists until localStorage cleared
- **Evidence:**
  ```javascript
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  ```
  No query length limit. Special chars escaped but nested quantifiers still cause exponential backtracking.
- **Suggested fix:** Hard limit query to 50 chars, use `String.includes()` instead of regex for simple highlighting.

---

## Finding 4: Category/Priority Injection - LocalStorage Pollution
- **Severity:** High
- **Location:** Phase 02 (priorities) and Phase 03 (categories), section "Security Considerations"
- **Flaw:** Validation exists but bypassable via direct localStorage manipulation
- **Failure scenario:**
  1. Attacker opens DevTools Console
  2. Runs: `localStorage.setItem('todos', '[{"id":"hack","title":"pwned","priority":"ATTACKER_CONTROLLED","category":"<script>alert(1)</script>"}]')`
  3. Plan claims whitelist validation prevents this
  4. But validation only happens on NEW todos via `addTodo()`
  5. Existing todos from localStorage bypass validation
  6. Attacker-injected data renders unsanitized, causes persistent XSS
- **Evidence:**
  Phase 02 security: `if (!['low', 'medium', 'high', 'urgent'].includes(priority)) throw`
  Phase 03 security: `if (!['trabajo', 'personal', 'salud', 'ideas', 'otros'].includes(category)) throw`

  Validation in `addTodo()` but NOT in `loadTodos()` from localStorage.
- **Suggested fix:** Validate ALL data on load from localStorage, not just on write. Treat localStorage as untrusted input.

---

## Finding 5: Keyboard Shortcut (⌘K) - Clickjacking Risk
- **Severity:** Medium
- **Location:** Phase 04, section "Step 4: Integrate SearchInput into DashboardView > 4.2"
- **Flaw:** Global keyboard listener without origin/context validation
- **Failure scenario:**
  1. Attacker embeds app in iframe via malicious site
  2. User focuses iframe (thinking it's safe content)
  3. User presses ⌘K
  4. App focuses search input, captures keystrokes
  5. Attacker logs all user input before sending to real app
  6. Credential harvesting if app ever adds password field
- **Evidence:**
  ```javascript
  const handleShortcut = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      searchInputRef.value?.focus()
    }
  }
  window.addEventListener('keydown', handleShortcut)
  ```
  No `window.self === window.top` check. No frame-busting code.
- **Suggested fix:** Add frame embedding prevention, or refuse keyboard shortcuts if framed.

---

## Finding 6: Debounce Memory Leak - Timer Not Cleared
- **Severity:** Medium
- **Location:** Phase 04, section "Step 1: Create Debounce Composable > 1.1"
- **Flaw:** Timeout stored in variable but never cleared on component unmount
- **Failure scenario:**
  1. User navigates to dashboard, starts typing search
  2. Debounce timer set for 300ms
  3. User immediately navigates away (component unmounts)
  4. Timer fires AFTER unmount, tries to update destroyed ref
  5. Vue warning: "Set operation on key that is being destructured"
  6. Memory leak accumulates over navigation cycles
  7. After 100 navigations, browser slows noticeably
- **Evidence:**
  ```javascript
  export function useDebounce(value, delay = 300) {
    const debouncedValue = ref(value.value)
    let timeout

    watch(value, (newValue) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)
    })

    return debouncedValue
  }
  ```
  No `onUnmounted` hook to clear final timeout.
- **Suggested fix:** Add cleanup function that composable consumer must call on unmount.

---

## Finding 7: Emoji in Constants - Unicode Spoofing Attack
- **Severity:** Low
- **Location:** Phase 02 (priorities) and Phase 03 (categories), constants files
- **Flaw:** Hardcoded emoji in constants can be visually confused
- **Failure scenario:**
  1. Attacker discovers "🔥" (urgent) and "🔥‍" (variant) render identically
  2. Social engineers user to believe high-priority todo is urgent
  3. User makes critical decisions based on fake priority indicator
  4. Similar attacks possible with emoji homoglyphs (e.g., 💼 vs 📋)
- **Evidence:**
  ```javascript
  URGENT: {
    value: 'urgent',
    label: 'Urgente',
    icon: '🔥',  // Can be spoofed visually
    // ...
  }
  ```
  No defense against visual spoofing of priority indicators.
- **Suggested fix:** Use SVG icons with unique paths, not emoji. Add color coding that cannot be spoofed.

---

## Finding 8: Confetti Effects - Denial of Service via Animation Flood
- **Severity:** Medium
- **Location:** Phase 05, section "Step 1: Create Animations CSS File"
- **Flaw:** No rate limiting on confetti/animations per completion
- **Failure scenario:**
  1. User creates script to bulk-complete 1000 todos
  2. Each completion triggers confetti animation
  3. 1000 confetti animations spawn simultaneously
  4. Browser chokes rendering 10,000+ DOM nodes
  5. Memory spikes to 2GB+, tab crashes
  6. User loses all unsaved work
- **Evidence:**
  Phase 01 mentions: "watch on todos for completion detection → Confetti logic (normal vs Vecna)"

  No mention of throttling, debouncing, or max concurrent animations.
- **Suggested fix:** Rate limit confetti to once per 5 seconds, or skip if N animations already active.

---

## Summary by Severity

**Critical (2):**
- LocalStorage race condition data loss
- XSS via SearchHighlight v-html injection

**High (2):**
- ReDoS via search query regex
- Category/priority injection bypass

**Medium (3):**
- Keyboard shortcut clickjacking
- Debounce memory leak
- Confetti DoS

**Low (1):**
- Emoji visual spoofing

---

## Unresolved Questions

1. Plan mentions "Vecna mode" throughout but never defines security implications of dark mode toggle. Can it be exploited for UI deception?
2. Phase 01 extracts emoji overlay logic - is there validation that emoji codes are from allowed set, or can users trigger arbitrary emoji?
3. No mention of Content Security Policy (CSP). Should plan include CSP headers to mitigate XSS?
4. Plan assumes localStorage is trusted. Should there be integrity checks (HMAC) to detect data tampering?
5. Audio files mentioned in confetti effects - are these validated for MIME type, or can malicious audio be injected?
