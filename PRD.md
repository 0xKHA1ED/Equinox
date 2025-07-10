# PRD: Credit Card Debt Visualization Tool

## 1. Overview

The Credit Card Debt Visualization Tool is a web-based application designed to empower individuals struggling with credit card debt by simplifying the process of understanding and strategizing debt repayment. It aims to demystify complex financial calculations, enabling users to visualize various payment scenarios and identify optimal paths to becoming debt-free. The core value proposition lies in its user-friendly interface and the ability to compare multiple repayment strategies without requiring extensive financial knowledge. This project is a non-profit endeavor, focused purely on user empowerment and education.

## 2. Goals and Objectives

- **Primary Goal:** To provide a highly intuitive and accessible tool for individuals to visualize and plan their credit card debt repayment.
- **Objective 1 (User Satisfaction):** Achieve a user satisfaction rating of over 90% with the user interface and overall experience within three months of launch.
- **Objective 2 (Clarity & Empowerment):** Enable users to clearly understand the impact of different payment amounts and interest accrual on their credit card debt, leading to informed decision-making.

## 3. Scope

### In-Scope for Initial Release

- **Credit Card Debt Management:** Focus exclusively on credit card debt.
- **Multi-Card Input:** Ability to input data for multiple credit cards.
- **Detailed Card Data:** Capture current total debt, monthly interest rate (compounding), and minimum payment percentage for each card.
- **Multiple Scenario Inputs:** Allow users to input various total monthly payment amounts they are willing to dedicate across all cards.
- **Interactive Visualizations:** Generate clear charts illustrating different repayment scenarios until debt is paid off.
- **Key Financial Metrics Display:** Show total amount paid, total interest paid, and time to debt-free for each scenario.
- **Optimal Strategy Recommendation:** Identify and recommend the most cost-effective (lowest total interest) and/or fastest repayment strategy.
- **Savings Comparison:** Highlight the savings achieved by following recommended strategies versus alternative scenarios.
- **Local Data Processing:** All user data and calculations are processed locally within the user's browser; no data is logged or sent to external servers.

### Out-of-Scope for Initial Release

- Other debt types (e.g., mortgages, student loans, personal loans).
- Integration with external financial accounts or APIs for automatic data import.
- Automated payment scheduling or direct financial transactions.
- Advanced financial planning features beyond credit card debt (e.g., budgeting, investments).
- User accounts or persistent data storage across sessions (unless implemented via local browser storage).
- Support for LLMs for natural language insights (planned for future releases).

## 4. User Personas or Target Audience

**Persona Name:** Overwhelmed Olivia

- **Demographics:** 25-45 years old, varied income levels.
- **Background:** Has accumulated credit card debt, potentially across multiple cards. May have a basic understanding of finances but gets overwhelmed by complex calculations and the "compounding interest" effect.
- **Pain Points:**
    - Doesn't know where to start with debt repayment.
    - Feels lost trying to calculate how different payment amounts impact her debt.
    - Worries about how much interest she's paying.
    - Feels disempowered and lacks a clear path to becoming debt-free.
- **Goals:**
    - Find a clear, easy-to-understand plan to pay off her credit cards.
    - See the impact of paying a little extra each month.
    - Feel in control of her financial situation.
    - Minimize the total interest paid.
- **Motivation:** To achieve financial freedom and reduce stress related to debt.
- **Tech Comfort:** Comfortable with basic web applications but prefers intuitive, visually-driven tools.

## 5. Functional Requirements

### 5.1. Core Data Input (High Priority)

- **FR-1.1:** Users must be able to add multiple credit cards.
- **FR-1.2:** For each credit card, users must input:
    - Credit Card Nickname (e.g., "Visa Rewards," "Store Card")
    - Current Balance (Total Debt)
    - Monthly Interest Rate (as a percentage, e.g., 1.5%)
    - Minimum Monthly Payment Percentage (as a percentage, e.g., 2%)
- **FR-1.3:** Users must be able to specify multiple "Total Monthly Payment Amounts" they can dedicate across all cards (e.g., $300, $500, $700).

### 5.2. Scenario Generation & Visualization (High Priority)

- **FR-2.1:** The system must generate a repayment scenario for each specified "Total Monthly Payment Amount."
- **FR-2.2:** Each scenario must calculate and display:
    - Month-by-month breakdown of payments, interest, and remaining balance for each card.
    - Total time (in months) until all debts are paid off.
    - Total principal paid.
    - Total interest paid across all cards for that scenario.
- **FR-2.3:** The tool must present a clear, comparative chart (e.g., bar chart, line chart) summarizing key metrics across all scenarios (e.g., Time to Debt-Free, Total Interest Paid).
- **FR-2.4:** For each individual scenario, a detailed chart showing debt reduction over time for each card and overall must be available.

### 5.3. Optimal Strategy & Insights (High Priority)

- **FR-3.1:** The tool must identify and clearly highlight the "Optimal Strategy" (e.g., the scenario with the lowest total interest paid or fastest repayment, potentially giving the user an option to prioritize).
- **FR-3.2:** The tool must clearly articulate the monetary savings (difference in total interest paid) between the optimal strategy and other less efficient scenarios.
- **FR-3.3:** Provide a simple, clear explanation of why a particular strategy is optimal.

## 6. Non-Functional Requirements

- **Performance (NFR-1):** All calculations and scenario generations should complete and display within 2-3 seconds, even with multiple cards and scenarios.
- **Security (NFR-2):** No user data is to be stored on servers or transmitted externally. All processing must occur client-side (in the user's browser).
- **Privacy (NFR-3):** Explicitly communicate that the tool does not collect, log, or share any user-entered financial data.
- **Usability (NFR-4):** The user interface must be intuitive, visually clear, and require minimal financial literacy to operate. Navigation should be straightforward.
- **Accessibility (NFR-5):** Adhere to basic web accessibility guidelines (e.g., sufficient color contrast, keyboard navigation).
- **Scalability (NFR-6):** The initial release is not designed for massive concurrent user loads, given the client-side processing model. Focus on individual user experience.
- **Maintainability (NFR-7):** Codebase should be well-documented and modular for future enhancements (e.g., LLM integration).

## 7. User Journeys

### User Journey: "Exploring Repayment Options"

1. **User Arrives:** Olivia, feeling overwhelmed by her credit card debt, lands on the tool's homepage.
2. **Input Credit Card Data:** She is prompted to input details for her three credit cards: balance, monthly interest, and minimum payment percentage for each.
3. **Specify Monthly Payment Amounts:** Olivia then considers different total monthly amounts she *could* pay, inputting $300, $500, and $700 as potential scenarios.
4. **View Scenario Comparison:** The tool instantly displays a clear chart comparing the three scenarios, showing which one pays off debt fastest and which incurs the least interest.
5. **Dive Deeper into Optimal Scenario:** Olivia clicks on the recommended "Optimal Strategy" ($700/month scenario).
6. **Review Detailed Breakdown:** She sees a detailed breakdown for this scenario, including month-by-month payments, interest, and remaining balance for each card, along with a visual timeline.
7. **Understand Savings:** The tool clearly states how much interest she would save by following the $700/month plan compared to the $300/month plan.
8. **Informed Decision:** Olivia now feels empowered with a clear understanding of her options and a concrete plan to tackle her debt.

## 8. Success Metrics

- **User Satisfaction Score:** A direct user feedback mechanism (e.g., a simple in-app survey or NPS) should indicate over 90% satisfaction with the UI/UX.
- **Engagement Rate:** High number of users successfully completing the input and scenario generation process. (Metrics to be defined based on implementation, e.g., unique sessions where scenarios are generated).
- **Return Rate:** While not storing data, a high return rate (if measurable via analytics that respect privacy principles, e.g., general site traffic) could indicate ongoing value.

## 9. Timeline

- **Week 1:**
    - Detailed UI/UX Design & Prototyping
    - Core Calculation Engine Development (Interest, Amortization)
- **Week 2:**
    - Multi-Card Input Implementation
    - Basic Scenario Generation & Output Display
- **Week 3:**
    - Advanced Charting & Visualization Integration
    - Optimal Strategy Recommendation Logic
- **Week 4:**
    - UI/UX Refinements & Polish
    - User Acceptance Testing (UAT) with target audience representatives
    - Deployment Preparation & Launch

## 10. Open Questions/Assumptions

- **Data Input Validation:** How strictly should input data be validated? (e.g., minimum payment percentage cannot be negative, interest rate format).
- **Payment Allocation Logic:** If a user inputs a total monthly payment, how should the tool *allocate* that payment across multiple credit cards by default (e.g., snowball method, avalanche method, pro-rata)? This needs to be defined for the "optimal strategy." (Current assumption: Avalanche Method - prioritizing highest interest rate card first to minimize total interest).
- **Mobile Responsiveness:** Will the initial version be fully optimized for mobile devices, or primarily desktop-focused? (Assumption: Basic responsiveness will be included, but full mobile-first optimization might be iterative).
- **User Feedback Mechanism:** How will the 90% user satisfaction metric be collected and measured in a non-profit, non-data-logging environment? (Assumption: A simple, anonymous in-app feedback prompt linked to a survey tool that respects user privacy).
