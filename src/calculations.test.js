const {
    calculateMonthlyInterest,
    generateAmortizationSchedule,
    calculateTotalInterest,
    calculateMonthsToPayOff,
} = require('./calculations');

describe('Core Calculation Engine', () => {
    // Positive Tests
    test('test_calculate_monthly_interest_correctly', () => {
        const balance = 1000;
        const monthlyRate = 0.015; // 1.5%
        const expectedInterest = 15;
        expect(calculateMonthlyInterest(balance, monthlyRate)).toBe(expectedInterest);
    });

    test('test_amortization_schedule_single_card', () => {
        const card = { balance: 500, monthlyRate: 0.02, minPaymentPercentage: 0.03 };
        const payment = 100;
        const schedule = generateAmortizationSchedule([card], payment);
        const lastPayment = schedule[schedule.length - 1];
        expect(lastPayment.endingBalance).toBe(0);
    });

    test('test_total_interest_paid_single_card', () => {
        const card = { balance: 1000, monthlyRate: 0.01, minPaymentPercentage: 0.02 };
        const payment = 100;
        const totalInterest = calculateTotalInterest([card], payment);
        // Approximate expected value, can be refined with a more precise calculation
        expect(totalInterest).toBeCloseTo(58.98, 2);
    });

    test('test_time_to_debt_free_single_card', () => {
        const card = { balance: 1000, monthlyRate: 0.01, minPaymentPercentage: 0.02 };
        const payment = 100;
        const months = calculateMonthsToPayOff([card], payment);
        expect(months).toBe(11); // 10 full payments + 1 final smaller payment
    });

    // Negative Tests
    test('test_calculate_interest_with_zero_balance', () => {
        expect(calculateMonthlyInterest(0, 0.015)).toBe(0);
    });

    test('test_calculate_interest_with_zero_rate', () => {
        expect(calculateMonthlyInterest(1000, 0)).toBe(0);
    });

    test('test_scenario_with_insufficient_payment', () => {
        const card = { balance: 1000, monthlyRate: 0.02, minPaymentPercentage: 0.03 }; // Min payment = $30
        const payment = 25; // Payment is less than interest + min payment
        const schedule = generateAmortizationSchedule([card], payment);
        const expectedEndingBalance = card.balance + calculateMonthlyInterest(card.balance, card.monthlyRate) - payment;
        expect(schedule[0].endingBalance).toBe(expectedEndingBalance);
    });

    // Edge Case Tests
    test('test_final_payment_is_less_than_monthly_payment', () => {
        const card = { balance: 500, monthlyRate: 0.01, minPaymentPercentage: 0.02 };
        const payment = 100;
        const schedule = generateAmortizationSchedule([card], payment);
        const lastPayment = schedule[schedule.length - 1];
        expect(lastPayment.payment).toBeLessThan(payment);
        expect(lastPayment.payment).toBeGreaterThan(0);
    });

    test('test_high_interest_rate_calculation', () => {
        const balance = 1000;
        const monthlyRate = 0.5; // 50%
        const expectedInterest = 500;
        expect(calculateMonthlyInterest(balance, monthlyRate)).toBe(expectedInterest);
    });

    test('test_very_large_balance_calculation', () => {
        const balance = 1e12; // 1 trillion
        const monthlyRate = 0.015;
        const expectedInterest = 1.5e10;
        expect(calculateMonthlyInterest(balance, monthlyRate)).toBe(expectedInterest);
    });
});
