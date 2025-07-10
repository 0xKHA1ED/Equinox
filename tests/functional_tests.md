# Functional and End-to-End Test Scenarios (V2 UI)

This document outlines test scenarios for the Credit Card Debt Visualization Tool, based on the V2 UI Design Document.

## 1. Stage 1: Welcome & Initial Input

### 1.1. Initial Display & Content
*   **Test:** Load `index.html`.
*   **Expected:**
    *   Header displays "Credit Card Debt Visualizer".
    *   Stage 1 (`#stage-1-welcome-input`) is visible. Stage 2 and 3 are hidden.
    *   Page title "Take Control of Your Credit Card Debt" is displayed.
    *   Introductory paragraph is present and correct.
    *   One "Card 1" input form is visible within a styled container card.
    *   Card 1 form contains fields: Card Nickname, Current Balance, Monthly Interest Rate, Minimum Monthly Payment %.
    *   Placeholders are correct. Labels are above inputs.
    *   A tooltip trigger `?` is visible next to "Minimum Monthly Payment %".
    *   "+ Add Another Card" button is visible and styled as a primary button.

### 1.2. Add Card Functionality
*   **Test:** Click "+ Add Another Card" button.
*   **Expected:**
    *   A new "Card 2" input form appears below "Card 1", with identical fields and styling.
    *   Focus is ideally set to the first field of "Card 2".
    *   Repeat: Click again. "Card 3" appears.
    *   Animation: New card forms appear smoothly (fade/slide in).

### 1.3. Input Validation (Card Fields - covered by previous detailed list, spot check here)
*   **Test:** Enter invalid data (e.g., negative balance, non-numeric interest rate) in Card 1.
*   **Expected:** `alert()` message specific to the error. Data collection for calculation should fail if errors persist.
*   **Test:** Enter valid data in all fields of Card 1.
*   **Expected:** Data accepted.

### 1.4. Tooltip Functionality (Minimum Payment %)
*   **Test:** Hover mouse over the `?` next to "Minimum Monthly Payment %".
*   **Expected:** A small popover appears with the text: "Find this percentage on your monthly statement. It's usually 1-3% of your balance."
*   **Test:** Move mouse away.
*   **Expected:** Tooltip disappears.
*   **Test:** Tab to the `?` icon using the keyboard.
*   **Expected:** Tooltip appears.
*   **Test:** Tab away from the `?` icon.
*   **Expected:** Tooltip disappears.

### 1.5. Stage 2 Reveal
*   **Test:** Enter a valid positive number (e.g., 1000) into "Current Balance ($)" for Card 1 and blur the input (click or tab out).
*   **Expected:**
    *   Stage 2 (`#stage-2-scenarios`) becomes visible below Stage 1.
    *   Stage 2 appears with a smooth animation.
    *   Focus is set to the first scenario input field in Stage 2.
*   **Test:** Clear the balance from Card 1.
*   **Expected (Current Behavior):** Stage 2 remains visible (as per current simple JS logic). More advanced logic might hide it again, but this is not currently implemented.

## 2. Stage 2: Defining Scenarios

### 2.1. Initial Display & Content (After Reveal)
*   **Test:** Ensure Stage 2 is visible.
*   **Expected:**
    *   Styled container card for Stage 2.
    *   H2 title "2. Define Your Repayment Scenarios" is displayed.
    *   Informational paragraph is present.
    *   "Your combined minimum payment is: $0.00" (or calculated value if cards have data) is displayed, with its tooltip.
    *   One "Scenario 1" input form is visible with a field for "Total Monthly Payment ($)". Placeholder suggests "e.g., Combined minimums".
    *   "+ Add Another Scenario" button is visible, styled as a secondary button.
    *   "Calculate Repayment Options" button is visible at the bottom, styled as a large primary CTA.

### 2.2. Combined Minimum Payment Calculation
*   **Test:** With Card 1 (Balance $1000, Min Pay % 2%), and Card 2 (Balance $500, Min Pay % 3%) entered in Stage 1.
*   **Expected:**
    *   The "Your combined minimum payment is:" display in Stage 2 updates to `$35.00` (assuming $10 floor: Card 1 min = $20, Card 2 min = $15). (Exact value depends on the $10 floor logic in `collectAndProcessData`).
    *   If "Total Monthly Payment ($)" for Scenario 1 is empty, it auto-fills with this combined minimum.

### 2.3. Add Scenario Functionality
*   **Test:** Click "+ Add Another Scenario" button.
*   **Expected:**
    *   A new "Scenario 2" input form appears below "Scenario 1", with identical fields and styling.
    *   Focus is set to the input field of "Scenario 2".
    *   Repeat: Click again. "Scenario 3" appears.

### 2.4. Input Validation (Scenario Fields)
*   **Test:** Enter invalid data (e.g., 0, negative, non-numeric) into a scenario's "Total Monthly Payment ($)".
*   **Expected:** `alert()` message. Calculation should fail if errors persist.
*   **Test:** Enter valid data (e.g., 500).
*   **Expected:** Data accepted.

## 3. Stage 3: The Results

### 3.1. Calculation Trigger & Loading State
*   **Test:** Enter valid data for at least one card and one scenario. Click "Calculate Repayment Options".
*   **Expected:**
    *   Button text changes to "Calculating..." with a spinner icon. Button becomes disabled.
    *   `#key-insight-callout` shows "Calculating your best options...".
    *   Previously displayed scenario cards and accordion items are cleared.
    *   After a short delay (simulated + actual calculation):
        *   Button text reverts to "Calculate Repayment Options" and is re-enabled.
        *   Stage 3 (`#stage-3-results`) becomes visible with a smooth animation.
        *   Page scrolls smoothly to the top of Stage 3.

### 3.2. Key Insight Callout
*   **Test:** Use data that generates clear savings (e.g., one high payment scenario vs. one low payment scenario).
*   **Expected:**
    *   `#key-insight-callout` panel is styled with the Secondary/Accent color.
    *   Text correctly states: "With the recommended plan (paying [Optimal Amount]/month), you could be debt-free [X Years/Months] sooner and save [$Y,YYY] in interest!" (or similar, based on actual calculation).
    *   Amounts and timeframes are correctly bolded.
*   **Test:** Only one scenario entered.
*   **Expected:** Callout text changes to reflect only the outcome of that single scenario (e.g., "you could pay a total of $X in interest...").

### 3.3. Scenario Comparison Cards
*   **Test:** Enter 2-3 scenarios with varying payment amounts.
*   **Expected:**
    *   Correct number of Scenario Summary Cards appear in `#scenario-comparison-cards-container`.
    *   Cards are styled as per design (container-card).
    *   Each card correctly displays:
        *   Scenario Title (e.g., "Scenario 1" or "Scenario: $XXX/month").
        *   Time to Debt-Free (e.g., "X Years, Y Months").
        *   Total Interest Paid (e.g., "$X,XXX.XX").
        *   Total Principal Paid.
    *   The "Recommended" scenario card (lowest total interest) has a "Recommended" badge and distinct highlighting (e.g., primary color border).
    *   The scenario with the highest interest paid (if not the recommended one) has its "Total Interest Paid" value styled with the Alert/Negative color.
    *   Each card has a "See Detailed Breakdown »" link.

### 3.4. Comparative Bar Chart
*   **Test:** With multiple scenarios calculated.
*   **Expected:**
    *   `#comparative-bar-chart-container` (a container-card) is visible.
    *   Chart title "Total Interest Paid by Scenario" is displayed.
    *   A bar chart renders in `<canvas id="comparisonChart">`.
    *   Each bar corresponds to a scenario, labeled correctly.
    *   Bar heights correctly represent total interest paid for each scenario.
    *   Chart styling (colors, fonts) aligns with the new UI theme and Chart.js global defaults.
    *   Bars animate in on render.
    *   Tooltips on hover show correct interest amounts.

### 3.5. Detailed Breakdown Accordion
*   **Test:** Click "See Detailed Breakdown »" link on a scenario card.
*   **Expected:**
    *   An accordion item for that scenario appears below in `#detailed-breakdown-accordion-container`.
    *   The item expands smoothly to show content.
    *   If another accordion item was open, it collapses.
    *   Accordion item contains:
        *   Header with scenario title.
        *   Strategy explanation ("This plan uses the Debt Avalanche method...").
        *   A scrollable, styled month-by-month table with columns: Month, Total Payment, Interest Paid, Principal Paid, Overall Ending Balance. Data in table is accurate for the selected scenario.
        *   A detailed line chart (`<canvas id="detailedLineChart-scenario-X">`) showing overall debt reduction and per-card debt reduction lines for that specific scenario. Chart animates and is styled correctly.
*   **Test:** Click the same "See Detailed Breakdown »" link again (or a header if it becomes clickable).
*   **Expected:** The accordion item collapses smoothly.
*   **Test:** Click link for a different scenario.
*   **Expected:** The first accordion item collapses, the new one expands.

### 3.6. Calculation Accuracy (Spot Checks - similar to V1 tests but verify in new UI)
*   **Scenario 1:** 1 card: Bal $1000, IR 1%/month, Min Pay 2%. Scenario Payment: $50.
    *   **Expected:** Month 1 interest $10, principal $40, end bal $960 in detailed table.
*   **Scenario 2 (Avalanche):** Card A: $1000, 2% IR. Card B: $1000, 1% IR. Payment: $100 (Mins: A=$20, B=$20. Extra=$60).
    *   **Expected:** Month 1 payments in table for Card A approx $80, Card B approx $20.

## 4. General & Cross-Cutting Tests

### 4.1. Responsiveness (Manual Check)
*   **Test:** Resize browser to various widths (desktop, tablet, mobile).
*   **Expected:**
    *   Layout adapts cleanly. Content remains readable.
    *   Container cards stack or resize appropriately.
    *   Charts resize and remain usable.
    *   No horizontal scrollbars on main content.

### 4.2. Keyboard Navigation
*   **Test:** Navigate through all interactive elements (inputs, buttons, links, tooltip triggers) using only Tab/Shift+Tab.
*   **Expected:**
    *   Logical focus order.
    *   Clear visual focus indicators on all elements.
    *   Elements are operable with Enter/Spacebar as appropriate.
    *   Tooltips are triggered on focus.
    *   Accordion items can be opened/closed.

### 4.3. Console Errors
*   **Test:** Perform all major user flows.
*   **Expected:** No JavaScript errors in the browser's developer console.

### 4.4. Edge Cases
*   **Test:** Zero balance cards.
*   **Expected:** Handled gracefully (no interest, no payment allocation).
*   **Test:** Payment less than minimums.
*   **Expected:** Extremely long payoff / hits 1000 month cap, results reflect this.
*   **Test:** No cards entered, click calculate (or if button is disabled, ensure it is).
*   **Expected:** Alert "Please add at least one credit card." Stage 3 not shown.
*   **Test:** Cards entered, but no scenarios, click calculate.
*   **Expected:** Alert "Please add at least one repayment scenario." Stage 3 not shown.
