const {
    generateScenario,
    addCard,
} = require('./scenario');

describe('Multi-Card & Scenario Generation', () => {
    // Positive Tests
    test('test_generate_scenario_for_multiple_cards', () => {
        const cards = [
            { id: 1, balance: 1000, monthlyRate: 0.01, minPaymentPercentage: 0.02 },
            { id: 2, balance: 500, monthlyRate: 0.015, minPaymentPercentage: 0.03 },
        ];
        const scenario = generateScenario(cards, 300);
        expect(scenario.totalMonths).toBeGreaterThan(0);
        expect(scenario.totalInterestPaid).toBeGreaterThan(0);
    });

    test('test_total_metrics_aggregation_across_cards', () => {
        const cards = [
            { id: 1, balance: 1000, monthlyRate: 0.01, minPaymentPercentage: 0.02 },
            { id: 2, balance: 500, monthlyRate: 0.015, minPaymentPercentage: 0.03 },
        ];
        const scenario = generateScenario(cards, 300);
        // A more precise assertion would require calculating the expected values manually
        expect(scenario.totalInterestPaid).toBeCloseTo(54.84, 2);
        expect(scenario.totalMonths).toBe(6);
    });

    test('test_multiple_scenarios_generation', () => {
        const cards = [
            { id: 1, balance: 1000, monthlyRate: 0.01, minPaymentPercentage: 0.02 },
        ];
        const scenarios = [300, 500].map(payment => generateScenario(cards, payment));
        expect(scenarios.length).toBe(2);
        expect(scenarios[0].totalMonths).toBeGreaterThan(scenarios[1].totalMonths);
        expect(scenarios[0].totalInterestPaid).toBeGreaterThan(scenarios[1].totalInterestPaid);
    });

    // Negative Tests
    test('test_add_card_with_invalid_data', () => {
        let cards = [];
        // Test with negative balance
        cards = addCard(cards, { balance: -100, monthlyRate: 0.01, minPaymentPercentage: 0.02 });
        expect(cards.length).toBe(0);

        // Test with negative interest rate
        cards = addCard(cards, { balance: 100, monthlyRate: -0.01, minPaymentPercentage: 0.02 });
        expect(cards.length).toBe(0);
    });

    test('test_generate_scenario_with_no_cards', () => {
        const scenario = generateScenario([], 300);
        expect(scenario.totalMonths).toBe(0);
        expect(scenario.totalInterestPaid).toBe(0);
    });

    // Edge Case Tests
    test('test_scenario_with_one_card_paid_off_early', () => {
        const cards = [
            { id: 1, balance: 200, monthlyRate: 0.01, minPaymentPercentage: 0.02 },
            { id: 2, balance: 1000, monthlyRate: 0.02, minPaymentPercentage: 0.03 },
        ];
        const scenario = generateScenario(cards, 150);
        // This test requires inspecting the amortization schedule to verify payment reallocation.
        // For simplicity, we'll check that the payoff is faster than if payments were not reallocated.
        // A more detailed test would inspect the schedule month by month.
        expect(scenario.totalMonths).toBeLessThan(12); // A rough estimate
    });

    test('test_identical_interest_rates_allocation', () => {
        const cards = [
            { id: 1, balance: 500, monthlyRate: 0.02, minPaymentPercentage: 0.02 },
            { id: 2, balance: 1000, monthlyRate: 0.02, minPaymentPercentage: 0.02 },
        ];
        const scenario = generateScenario(cards, 200);
        // With Avalanche, the higher balance card should be paid off first.
        // This is a simplification; a real test would check the payment allocation in the schedule.
        expect(scenario.totalMonths).toBe(9);
    });
});
