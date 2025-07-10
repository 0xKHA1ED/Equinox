# Functional and End-to-End Test Scenarios

This document outlines test scenarios for the Credit Card Debt Visualization Tool.

## 1. User Journey Tests (Based on "Overwhelmed Olivia")

### Journey 1.1: Olivia Explores Repayment Options

*   **Objective:** Verify Olivia's user journey as described in PRD (Section 7).
*   **Steps:**
    1.  **Landing & Initial State:**
        *   Open `index.html`.
        *   **Expected:** Page loads correctly. "Credit Card Debt Visualizer" title is visible. Input sections for "Credit Card Details" and "Repayment Scenarios" are present. One default card input form and one default scenario input form are visible. Footer privacy message is visible.
    2.  **Input Credit Card Data (3 cards):**
        *   **Card 1:** Nickname "Visa Rewards", Balance $5000, Monthly IR 1.5%, Min Payment 2%.
        *   Click "Add Another Card".
        *   **Card 2:** Nickname "Store Card", Balance $2500, Monthly IR 2.0%, Min Payment 3%.
        *   Click "Add Another Card".
        *   **Card 3:** Nickname "Gas Card", Balance $800, Monthly IR 1.2%, Min Payment 2.5%.
        *   **Expected:** All three card forms are present with the entered data.
    3.  **Specify Monthly Payment Scenarios (3 scenarios):**
        *   **Scenario 1:** Total Monthly Payment $300.
        *   Click "Add Another Scenario".
        *   **Scenario 2:** Total Monthly Payment $500.
        *   Click "Add Another Scenario".
        *   **Scenario 3:** Total Monthly Payment $700.
        *   **Expected:** All three scenario forms are present with the entered data.
    4.  **Calculate and View Scenario Comparison:**
        *   Click "Calculate Repayment Options" button.
        *   **Expected:**
            *   Results section populates. A prominent title like "Your Repayment Options Explored" appears.
            *   A summary bar chart ("comparisonChart") displays, comparing the 3 scenarios.
            *   The chart should have bars for "Total Interest Paid" and "Months to Pay Off" for each scenario.
            *   Axes and tooltips should be correctly labeled and formatted.
    5.  **View Optimal Strategy & Savings:**
        *   **Expected:**
            *   An "Optimal Strategy Recommendation" section appears.
            *   It should identify the $700/month scenario as "Best for Lowest Total Interest" and likely also "Fastest to Debt-Free".
            *   It should state the total interest paid and months to payoff for this optimal scenario.
            *   It should show savings compared to the $300/month scenario (e.g., "By choosing the $700/month plan over the $300/month plan, you could save $X in interest...").
            *   A simple explanation of why the strategy is optimal is present.
    6.  **Dive Deeper into Optimal Scenario ($700/month):**
        *   Scroll to the "Detailed Scenario Breakdowns" section.
        *   Locate the detailed chart for the $700/month scenario.
        *   **Expected:**
            *   A line chart is displayed for this scenario.
            *   The chart title should indicate "$700/month Details".
            *   An "Overall Remaining Debt" line should show debt reducing to zero over time.
            *   Separate lines for "Visa Rewards", "Store Card", and "Gas Card" should show their individual balances reducing to zero.
            *   The X-axis should represent months, and Y-axis the remaining debt in dollars.
            *   Tooltips on the chart should show debt values for each line at specific months.
    7.  **Informed Decision:**
        *   **Expected:** User has a clear visual and textual understanding of their options.

## 2. Specific Functional Requirement Tests

### FR-Test 2.1: Multi-Card and Multi-Scenario Dynamics
*   Add 1 card, 1 scenario. Calculate. Expected: Works.
*   Add 5 cards, 5 scenarios. Calculate. Expected: Works, performance acceptable (UI updates within a few seconds).
*   Add a card, then remove it (Note: remove functionality not yet implemented, this is a future test).
*   Add a scenario, then remove it (Note: remove functionality not yet implemented).

### FR-Test 2.2: Calculation Accuracy (Spot Checks)
*   **Scenario:** 1 card: Balance $1000, Monthly IR 1% (0.01), Min Payment 2% ($20).
    *   **Payment Scenario 1:** Total Monthly Payment $50.
        *   Month 1 Interest: $1000 * 0.01 = $10.
        *   Month 1 Principal Paid: $50 - $10 = $40.
        *   Month 1 Ending Balance: $1000 - $40 = $960.
        *   **Expected:** The detailed breakdown for this scenario should reflect these numbers for the first month. Total interest and payoff time should be verifiable with an external loan calculator for this simple case.
*   **Scenario (Avalanche check):**
    *   Card A: $1000, 2% monthly IR, 2% min pay.
    *   Card B: $1000, 1% monthly IR, 2% min pay.
    *   Total Monthly Payment: $100.
    *   Min payments: Card A=$20, Card B=$20. Total min = $40. Extra payment = $60.
    *   **Expected:** Card A (higher interest) should receive its $20 min + $60 extra = $80. Card B should receive its $20 min. This should be reflected in the first month of the detailed breakdown.

### FR-Test 2.3: Edge Case Payments
*   **Scenario:** Payment amount is less than total minimum payments.
    *   Card A: $1000, 1% IR, 2% min ($20).
    *   Card B: $1000, 1% IR, 2% min ($20).
    *   Total Monthly Payment: $30.
    *   **Expected:** The $30 is distributed to cover partial minimums (e.g., $15 to Card A, $15 to Card B, or $20 to one, $10 to other based on allocation logic). Debt payoff time will be very long or hit the 1000-month safety stop. Warning in console for >1000 months.
*   **Scenario:** Payment amount just covers interest (or less).
    *   Card A: $1000, 1% IR ($10 interest/month).
    *   Total Monthly Payment: $10.
    *   **Expected:** Balance on Card A remains $1000 (or increases if payment is less than interest and fees were applicable). Payoff time > 1000 months.
*   **Scenario:** Very high payment that pays off debt in 1-2 months.
    *   Card A: $100, 1% IR.
    *   Total Monthly Payment: $200.
    *   **Expected:** Correctly shows payoff in 1 month, correct small interest calculated.

## 3. Input Validation Tests

For each input field, attempt the following:

### 3.1. Credit Card Nickname:
*   Empty: **Expected:** Alert "Nickname cannot be empty." Calculation blocked.
*   Spaces only: **Expected:** Alert "Nickname cannot be empty." (after trim). Calculation blocked.
*   Valid text: "My Visa". **Expected:** Accepted.

### 3.2. Current Balance:
*   Empty: **Expected:** Alert "...Balance must be a non-negative number." (NaN). Calculation blocked.
*   Negative value (-100): **Expected:** Alert "...Balance must be a non-negative number." Calculation blocked.
*   Zero (0): **Expected:** Accepted.
*   Non-numeric (abc): **Expected:** Alert "...Balance must be a non-negative number." (NaN). Calculation blocked.
*   Valid (5000.75): **Expected:** Accepted.

### 3.3. Monthly Interest Rate (%):
*   Empty: **Expected:** Alert "...Interest Rate must be a number between 0 and 100." (NaN). Calculation blocked.
*   Negative value (-1.5): **Expected:** Alert "...Interest Rate must be a number between 0 and 100." Calculation blocked.
*   Zero (0): **Expected:** Accepted.
*   Over 100 (e.g., 110): **Expected:** Alert "...Interest Rate must be a number between 0 and 100." Calculation blocked.
*   Non-numeric (abc): **Expected:** Alert "...Interest Rate must be a number between 0 and 100." (NaN). Calculation blocked.
*   Valid (1.75): **Expected:** Accepted.

### 3.4. Minimum Payment Percentage (%):
*   Empty: **Expected:** Alert "...Minimum Payment Percentage must be a number between 0 and 100." (NaN). Calculation blocked.
*   Negative value (-1): **Expected:** Alert "...Minimum Payment Percentage must be a number between 0 and 100." Calculation blocked.
*   Zero (0): **Expected:** Accepted.
*   Over 100 (e.g., 101): **Expected:** Alert "...Minimum Payment Percentage must be a number between 0 and 100." Calculation blocked.
*   Non-numeric (abc): **Expected:** Alert "...Minimum Payment Percentage must be a number between 0 and 100." (NaN). Calculation blocked.
*   Valid (2.5): **Expected:** Accepted.

### 3.5. Total Monthly Payment (Scenario Input):
*   Empty: **Expected:** Alert "...Total Monthly Payment must be a positive number." (NaN). Calculation blocked.
*   Negative value (-100): **Expected:** Alert "...Total Monthly Payment must be a positive number." Calculation blocked.
*   Zero (0): **Expected:** Alert "...Total Monthly Payment must be a positive number." Calculation blocked.
*   Non-numeric (abc): **Expected:** Alert "...Total Monthly Payment must be a positive number." (NaN). Calculation blocked.
*   Valid (500): **Expected:** Accepted.

## 4. Visualisation Tests
*   **No Data:** Click "Calculate" with no cards or no scenarios.
    *   **Expected:** Alerts "Please add at least one credit card." or "Please add at least one repayment scenario." Results section remains empty or shows a message like "Please enter your data above."
*   **Chart Rendering:** With valid data, ensure all charts (summary and detailed) render without JavaScript errors in the console.
*   **Chart Clarity:** Are chart labels, titles, legends, and tooltips clear and readable?
*   **Responsiveness:** (Manual Check) Resize browser window.
    *   **Expected:** Charts resize appropriately. Layout does not break significantly on smaller screens (basic mobile/tablet usability). (Full mobile optimization might be iterative as per PRD).

This provides a good set of test cases to verify the application's functionality.
tool_code
create_file_with_block
tests/functional_tests.md
# Functional and End-to-End Test Scenarios

This document outlines test scenarios for the Credit Card Debt Visualization Tool.

## 1. User Journey Tests (Based on "Overwhelmed Olivia")

### Journey 1.1: Olivia Explores Repayment Options

*   **Objective:** Verify Olivia's user journey as described in PRD (Section 7).
*   **Steps:**
    1.  **Landing & Initial State:**
        *   Open `index.html`.
        *   **Expected:** Page loads correctly. "Credit Card Debt Visualizer" title is visible. Input sections for "Credit Card Details" and "Repayment Scenarios" are present. One default card input form and one default scenario input form are visible. Footer privacy message is visible.
    2.  **Input Credit Card Data (3 cards):**
        *   **Card 1:** Nickname "Visa Rewards", Balance $5000, Monthly IR 1.5%, Min Payment 2%.
        *   Click "Add Another Card".
        *   **Card 2:** Nickname "Store Card", Balance $2500, Monthly IR 2.0%, Min Payment 3%.
        *   Click "Add Another Card".
        *   **Card 3:** Nickname "Gas Card", Balance $800, Monthly IR 1.2%, Min Payment 2.5%.
        *   **Expected:** All three card forms are present with the entered data.
    3.  **Specify Monthly Payment Scenarios (3 scenarios):**
        *   **Scenario 1:** Total Monthly Payment $300.
        *   Click "Add Another Scenario".
        *   **Scenario 2:** Total Monthly Payment $500.
        *   Click "Add Another Scenario".
        *   **Scenario 3:** Total Monthly Payment $700.
        *   **Expected:** All three scenario forms are present with the entered data.
    4.  **Calculate and View Scenario Comparison:**
        *   Click "Calculate Repayment Options" button.
        *   **Expected:**
            *   Results section populates. A prominent title like "Your Repayment Options Explored" appears.
            *   A summary bar chart ("comparisonChart") displays, comparing the 3 scenarios.
            *   The chart should have bars for "Total Interest Paid" and "Months to Pay Off" for each scenario.
            *   Axes and tooltips should be correctly labeled and formatted.
    5.  **View Optimal Strategy & Savings:**
        *   **Expected:**
            *   An "Optimal Strategy Recommendation" section appears.
            *   It should identify the $700/month scenario as "Best for Lowest Total Interest" and likely also "Fastest to Debt-Free".
            *   It should state the total interest paid and months to payoff for this optimal scenario.
            *   It should show savings compared to the $300/month scenario (e.g., "By choosing the $700/month plan over the $300/month plan, you could save $X in interest...").
            *   A simple explanation of why the strategy is optimal is present.
    6.  **Dive Deeper into Optimal Scenario ($700/month):**
        *   Scroll to the "Detailed Scenario Breakdowns" section.
        *   Locate the detailed chart for the $700/month scenario.
        *   **Expected:**
            *   A line chart is displayed for this scenario.
            *   The chart title should indicate "$700/month Details".
            *   An "Overall Remaining Debt" line should show debt reducing to zero over time.
            *   Separate lines for "Visa Rewards", "Store Card", and "Gas Card" should show their individual balances reducing to zero.
            *   The X-axis should represent months, and Y-axis the remaining debt in dollars.
            *   Tooltips on the chart should show debt values for each line at specific months.
    7.  **Informed Decision:**
        *   **Expected:** User has a clear visual and textual understanding of their options.

## 2. Specific Functional Requirement Tests

### FR-Test 2.1: Multi-Card and Multi-Scenario Dynamics
*   Add 1 card, 1 scenario. Calculate. Expected: Works.
*   Add 5 cards, 5 scenarios. Calculate. Expected: Works, performance acceptable (UI updates within a few seconds).
*   Add a card, then remove it (Note: remove functionality not yet implemented, this is a future test).
*   Add a scenario, then remove it (Note: remove functionality not yet implemented).

### FR-Test 2.2: Calculation Accuracy (Spot Checks)
*   **Scenario:** 1 card: Balance $1000, Monthly IR 1% (0.01), Min Payment 2% ($20).
    *   **Payment Scenario 1:** Total Monthly Payment $50.
        *   Month 1 Interest: $1000 * 0.01 = $10.
        *   Month 1 Principal Paid: $50 - $10 = $40.
        *   Month 1 Ending Balance: $1000 - $40 = $960.
        *   **Expected:** The detailed breakdown for this scenario should reflect these numbers for the first month. Total interest and payoff time should be verifiable with an external loan calculator for this simple case.
*   **Scenario (Avalanche check):**
    *   Card A: $1000, 2% monthly IR, 2% min pay.
    *   Card B: $1000, 1% monthly IR, 2% min pay.
    *   Total Monthly Payment: $100.
    *   Min payments: Card A=$20, Card B=$20. Total min = $40. Extra payment = $60.
    *   **Expected:** Card A (higher interest) should receive its $20 min + $60 extra = $80. Card B should receive its $20 min. This should be reflected in the first month of the detailed breakdown.

### FR-Test 2.3: Edge Case Payments
*   **Scenario:** Payment amount is less than total minimum payments.
    *   Card A: $1000, 1% IR, 2% min ($20).
    *   Card B: $1000, 1% IR, 2% min ($20).
    *   Total Monthly Payment: $30.
    *   **Expected:** The $30 is distributed to cover partial minimums (e.g., $15 to Card A, $15 to Card B, or $20 to one, $10 to other based on allocation logic). Debt payoff time will be very long or hit the 1000-month safety stop. Warning in console for >1000 months.
*   **Scenario:** Payment amount just covers interest (or less).
    *   Card A: $1000, 1% IR ($10 interest/month).
    *   Total Monthly Payment: $10.
    *   **Expected:** Balance on Card A remains $1000 (or increases if payment is less than interest and fees were applicable). Payoff time > 1000 months.
*   **Scenario:** Very high payment that pays off debt in 1-2 months.
    *   Card A: $100, 1% IR.
    *   Total Monthly Payment: $200.
    *   **Expected:** Correctly shows payoff in 1 month, correct small interest calculated.

## 3. Input Validation Tests

For each input field, attempt the following:

### 3.1. Credit Card Nickname:
*   Empty: **Expected:** Alert "Nickname cannot be empty." Calculation blocked.
*   Spaces only: **Expected:** Alert "Nickname cannot be empty." (after trim). Calculation blocked.
*   Valid text: "My Visa". **Expected:** Accepted.

### 3.2. Current Balance:
*   Empty: **Expected:** Alert "...Balance must be a non-negative number." (NaN). Calculation blocked.
*   Negative value (-100): **Expected:** Alert "...Balance must be a non-negative number." Calculation blocked.
*   Zero (0): **Expected:** Accepted.
*   Non-numeric (abc): **Expected:** Alert "...Balance must be a non-negative number." (NaN). Calculation blocked.
*   Valid (5000.75): **Expected:** Accepted.

### 3.3. Monthly Interest Rate (%):
*   Empty: **Expected:** Alert "...Interest Rate must be a number between 0 and 100." (NaN). Calculation blocked.
*   Negative value (-1.5): **Expected:** Alert "...Interest Rate must be a number between 0 and 100." Calculation blocked.
*   Zero (0): **Expected:** Accepted.
*   Over 100 (e.g., 110): **Expected:** Alert "...Interest Rate must be a number between 0 and 100." Calculation blocked.
*   Non-numeric (abc): **Expected:** Alert "...Interest Rate must be a number between 0 and 100." (NaN). Calculation blocked.
*   Valid (1.75): **Expected:** Accepted.

### 3.4. Minimum Payment Percentage (%):
*   Empty: **Expected:** Alert "...Minimum Payment Percentage must be a number between 0 and 100." (NaN). Calculation blocked.
*   Negative value (-1): **Expected:** Alert "...Minimum Payment Percentage must be a number between 0 and 100." Calculation blocked.
*   Zero (0): **Expected:** Accepted.
*   Over 100 (e.g., 101): **Expected:** Alert "...Minimum Payment Percentage must be a number between 0 and 100." Calculation blocked.
*   Non-numeric (abc): **Expected:** Alert "...Minimum Payment Percentage must be a number between 0 and 100." (NaN). Calculation blocked.
*   Valid (2.5): **Expected:** Accepted.

### 3.5. Total Monthly Payment (Scenario Input):
*   Empty: **Expected:** Alert "...Total Monthly Payment must be a positive number." (NaN). Calculation blocked.
*   Negative value (-100): **Expected:** Alert "...Total Monthly Payment must be a positive number." Calculation blocked.
*   Zero (0): **Expected:** Alert "...Total Monthly Payment must be a positive number." Calculation blocked.
*   Non-numeric (abc): **Expected:** Alert "...Total Monthly Payment must be a positive number." (NaN). Calculation blocked.
*   Valid (500): **Expected:** Accepted.

## 4. Visualisation Tests
*   **No Data:** Click "Calculate" with no cards or no scenarios.
    *   **Expected:** Alerts "Please add at least one credit card." or "Please add at least one repayment scenario." Results section remains empty or shows a message like "Please enter your data above."
*   **Chart Rendering:** With valid data, ensure all charts (summary and detailed) render without JavaScript errors in the console.
*   **Chart Clarity:** Are chart labels, titles, legends, and tooltips clear and readable?
*   **Responsiveness:** (Manual Check) Resize browser window.
    *   **Expected:** Charts resize appropriately. Layout does not break significantly on smaller screens (basic mobile/tablet usability). (Full mobile optimization might be iterative as per PRD).

This provides a good set of test cases to verify the application's functionality.
