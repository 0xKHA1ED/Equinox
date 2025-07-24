const {
    recommendOptimalStrategy,
    calculateSavings,
} = require('./strategy');
const { generateScenario } = require('./scenario');

describe('Optimal Strategy Recommendation', () => {
    const cards = [
        { id: 1, balance: 1000, monthlyRate: 0.01, minPaymentPercentage: 0.02 },
        { id: 2, balance: 500, monthlyRate: 0.015, minPaymentPercentage: 0.03 },
    ];

    // Positive Tests
    test('test_identify_optimal_strategy_lowest_interest', () => {
        const scenarios = [
            generateScenario(cards, 300),
            generateScenario(cards, 500),
        ];
        const optimal = recommendOptimalStrategy(scenarios, 'lowest_interest');
        expect(optimal).toBe(scenarios[1]);
    });

    test('test_identify_optimal_strategy_fastest_payoff', () => {
        const scenarios = [
            generateScenario(cards, 300),
            generateScenario(cards, 500),
        ];
        const optimal = recommendOptimalStrategy(scenarios, 'fastest_payoff');
        expect(optimal).toBe(scenarios[1]);
    });

    test('test_savings_calculation_is_accurate', () => {
        const scenario1 = generateScenario(cards, 300);
        const scenario2 = generateScenario(cards, 500);
        const savings = calculateSavings(scenario1, scenario2);
        expect(savings).toBeCloseTo(scenario1.totalInterestPaid - scenario2.totalInterestPaid, 2);
    });

    // Negative Tests
    test('test_recommendation_with_single_scenario', () => {
        const scenarios = [generateScenario(cards, 300)];
        const optimal = recommendOptimalStrategy(scenarios, 'lowest_interest');
        expect(optimal).toBe(scenarios[0]);
    });

    test('test_recommendation_with_no_scenarios', () => {
        const optimal = recommendOptimalStrategy([], 'lowest_interest');
        expect(optimal).toBeNull();
    });

    // Edge Case Tests
    test('test_scenarios_with_very_similar_outcomes', () => {
        const scenarios = [
            { totalInterestPaid: 100.01, totalMonths: 12 },
            { totalInterestPaid: 100.00, totalMonths: 12 },
        ];
        const optimal = recommendOptimalStrategy(scenarios, 'lowest_interest');
        expect(optimal).toBe(scenarios[1]);
    });

    test('test_strategy_where_minimum_payment_is_optimal', () => {
        // This case assumes the "optimal" is the only one provided.
        const scenarios = [generateScenario(cards, 50)]; // Assuming 50 is the minimum
        const optimal = recommendOptimalStrategy(scenarios, 'lowest_interest');
        expect(optimal).toBe(scenarios[0]);
    });
});
