// tests/calculation_engine.test.js
// This file outlines unit tests for functions in calculation_engine.js
// These would typically be run with a test runner like Jest or Mocha.

// Mocking or importing the actual functions would be necessary in a real test environment
// For demonstration, let's assume functions are available:
// const { calculateMonthlyInterest, simulateOneMonthPayment, allocatePaymentsAvalanche } = require('../calculation_engine');

describe('calculateMonthlyInterest', () => {
    test('should return 0 interest for 0 balance', () => {
        // expect(calculateMonthlyInterest(0, 0.015)).toBe(0);
        console.log("Test: calculateMonthlyInterest(0, 0.015) === 0");
    });

    test('should calculate correct interest for positive balance', () => {
        // expect(calculateMonthlyInterest(1000, 0.015)).toBe(15);
        console.log("Test: calculateMonthlyInterest(1000, 0.015) === 15");
    });

    test('should handle floating point results correctly (toFixed(2))', () => {
        // expect(calculateMonthlyInterest(100, 0.012345)).toBe(1.23); // Example, depends on exact toFixed behavior desired
        console.log("Test: calculateMonthlyInterest(100, 0.012345) to be 1.23 (or similar depending on rounding)");
    });
     test('should return 0 interest for negative balance (edge case)', () => {
        // expect(calculateMonthlyInterest(-100, 0.015)).toBe(0);
        console.log("Test: calculateMonthlyInterest(-100, 0.015) === 0");
    });
});

describe('simulateOneMonthPayment', () => {
    const card = { balance: 1000, interestRate: 0.02, minPaymentPercentage: 0.02 }; // 2% monthly interest

    test('payment covers interest and some principal', () => {
        const paymentAmount = 50; // Interest = 1000 * 0.02 = 20. Principal paid = 50 - 20 = 30. New balance = 1000 + 20 - 50 = 970.
        const result = /* simulateOneMonthPayment(card, paymentAmount) */ { newBalance: 970, interestPaid: 20, principalPaid: 30 };
        // expect(result.newBalance).toBe(970);
        // expect(result.interestPaid).toBe(20);
        // expect(result.principalPaid).toBe(30);
        console.log("Test: simulateOneMonthPayment({...}, 50) results in { newBalance: 970, interestPaid: 20, principalPaid: 30 }");
    });

    test('payment equals exact interest', () => {
        const paymentAmount = 20; // Interest = 20. Principal paid = 0. New balance = 1000.
        const result = /* simulateOneMonthPayment(card, paymentAmount) */ { newBalance: 1000, interestPaid: 20, principalPaid: 0 };
        // expect(result.newBalance).toBe(1000);
        // expect(result.interestPaid).toBe(20);
        // expect(result.principalPaid).toBe(0);
        console.log("Test: simulateOneMonthPayment({...}, 20) results in { newBalance: 1000, interestPaid: 20, principalPaid: 0 }");
    });

    test('payment is less than interest', () => {
        const paymentAmount = 10; // Interest = 20. Principal paid = 0. New balance = 1000 + (20-10) = 1010.
        // Note: The implementation might need adjustment if this is how balance should increase.
        // Current implementation: newBalance = (card.balance + interestForMonth - paymentAmount)
        // if paymentAmount < interestForMonth, newBalance = (card.balance + (interestForMonth - paymentAmount))
        // So, 1000 + 20 - 10 = 1010. This seems correct. Principal paid should be 0.
        const result = /* simulateOneMonthPayment(card, paymentAmount) */ { newBalance: 1010, interestPaid: 20, principalPaid: 0 };
        // expect(result.newBalance).toBe(1010);
        // expect(result.interestPaid).toBe(20);
        // expect(result.principalPaid).toBe(0);
        console.log("Test: simulateOneMonthPayment({...}, 10) results in { newBalance: 1010, interestPaid: 20, principalPaid: 0 }");
    });

    test('payment pays off balance exactly', () => {
        const interest = calculateMonthlyInterest(card.balance, card.interestRate); // 20
        const paymentAmount = card.balance + interest; // 1020
        const result = /* simulateOneMonthPayment(card, paymentAmount) */ { newBalance: 0, interestPaid: 20, principalPaid: 1000 };
        // expect(result.newBalance).toBe(0);
        // expect(result.interestPaid).toBe(20);
        // expect(result.principalPaid).toBe(1000);
        console.log("Test: simulateOneMonthPayment({...}, 1020) results in { newBalance: 0, interestPaid: 20, principalPaid: 1000 }");
    });

    test('payment is more than enough to pay off balance', () => {
        const interest = calculateMonthlyInterest(card.balance, card.interestRate); // 20
        const paymentAmount = card.balance + interest + 50; // 1070
        // Should still result in 0 balance, and principal paid should be capped at original balance.
        const result = /* simulateOneMonthPayment(card, paymentAmount) */ { newBalance: 0, interestPaid: 20, principalPaid: 1000 };
        // expect(result.newBalance).toBe(0);
        // expect(result.interestPaid).toBe(20);
        // expect(result.principalPaid).toBe(1000);
        console.log("Test: simulateOneMonthPayment({...}, 1070) results in { newBalance: 0, interestPaid: 20, principalPaid: 1000 }");
    });

    test('card balance is 0', () => {
        const zeroBalanceCard = { balance: 0, interestRate: 0.02, minPaymentPercentage: 0.02 };
        const paymentAmount = 50;
        const result = /* simulateOneMonthPayment(zeroBalanceCard, paymentAmount) */ { newBalance: 0, interestPaid: 0, principalPaid: 0 };
        // expect(result.newBalance).toBe(0);
        // expect(result.interestPaid).toBe(0);
        // expect(result.principalPaid).toBe(0);
        console.log("Test: simulateOneMonthPayment({balance:0,...}, 50) results in { newBalance: 0, interestPaid: 0, principalPaid: 0 }");
    });
});

describe('allocatePaymentsAvalanche', () => {
    const cards = [
        { id: 1, balance: 1000, interestRate: 0.015, minPaymentPercentage: 0.02 }, // Min: 20
        { id: 2, balance: 2000, interestRate: 0.020, minPaymentPercentage: 0.01 }, // Min: 20 (Higher interest)
        { id: 3, balance: 500, interestRate: 0.010, minPaymentPercentage: 0.03 }   // Min: 15
    ]; // Total Min Payments = 20 + 20 + 15 = 55

    test('total payment less than total minimums', () => {
        const totalMonthlyPayment = 50;
        const allocations = /* allocatePaymentsAvalanche(cards, totalMonthlyPayment) */ [
            { cardId: 1, paymentAmount: 20 }, // Proportional or first-come? Min payment logic needs to be strict here.
            { cardId: 2, paymentAmount: 20 }, // The function should prioritize meeting minimums as much as possible.
            { cardId: 3, paymentAmount: 10 }  // (e.g. 50 distributed to cover partial minimums)
        ];
        // This test depends heavily on how partial minimums are handled. The current implementation tries to meet all.
        // If totalMonthlyPayment < sum of minimums, it allocates up to totalMonthlyPayment towards minimums.
        // Example: Card1 min=20, Card2 min=20, Card3 min=15. Total min=55. Payment=50.
        // It will pay 20 to card1, 20 to card2, 10 to card3.
        console.log("Test: allocatePaymentsAvalanche(cards, 50) allocates {c1:20, c2:20, c3:10} (approx, covers partial minimums)");
    });

    test('total payment equals total minimums', () => {
        const totalMonthlyPayment = 55;
        const allocations = /* allocatePaymentsAvalanche(cards, totalMonthlyPayment) */ [
            { cardId: 1, paymentAmount: 20 },
            { cardId: 2, paymentAmount: 20 },
            { cardId: 3, paymentAmount: 15 }
        ];
        // expect(allocations.find(a=>a.cardId===1).paymentAmount).toBe(20);
        // expect(allocations.find(a=>a.cardId===2).paymentAmount).toBe(20);
        // expect(allocations.find(a=>a.cardId===3).paymentAmount).toBe(15);
        console.log("Test: allocatePaymentsAvalanche(cards, 55) allocates minimums {c1:20, c2:20, c3:15}");
    });

    test('total payment covers minimums with extra for highest interest card', () => {
        const totalMonthlyPayment = 100; // Extra = 100 - 55 = 45. All goes to Card 2.
        const allocations = /* allocatePaymentsAvalanche(cards, totalMonthlyPayment) */ [
            { cardId: 1, paymentAmount: 20 },
            { cardId: 2, paymentAmount: 20 + 45 }, // 65
            { cardId: 3, paymentAmount: 15 }
        ];
        // expect(allocations.find(a=>a.cardId===1).paymentAmount).toBe(20);
        // expect(allocations.find(a=>a.cardId===2).paymentAmount).toBe(65);
        // expect(allocations.find(a=>a.cardId===3).paymentAmount).toBe(15);
        console.log("Test: allocatePaymentsAvalanche(cards, 100) allocates {c1:20, c2:65, c3:15}");
    });

    test('total payment pays off one card and distributes rest', () => {
        // Card 2 (highest interest): Bal 2000, IR 0.02. Interest = 40. To pay off = 2040. Min payment = 20.
        // Let's say totalMonthlyPayment is enough to pay off Card 2 plus other minimums.
        // Other minimums: Card 1 (20), Card 3 (15). Total = 35.
        // Amount needed for Card 2 (balance + interest for month): 2000 + (2000*0.02) = 2040.
        // If totalMonthlyPayment = 35 (other mins) + 2040 (pay off C2) = 2075
        // Card 2 should get 2040. Card 1 gets 20. Card 3 gets 15.
        // The function `allocatePaymentsAvalanche` itself doesn't know the interest for the month yet,
        // it just allocates based on current balance. The simulation loop handles the interest.
        // So, if Card 2 has balance 2000, it will allocate up to 2000 to it from the "extra" pool.
        // Total payment = 20 (min C1) + 15 (min C3) + (2000 to C2 balance + some for C2 interest if logic is that complex, or just its min 20)
        // Let's test with a high payment: $2500
        // Min payments: C1:20, C2:20, C3:15. Sum=55. Remaining = 2500-55 = 2445.
        // C2 (2000 bal, highest interest) gets 2000 of the 2445. Remaining = 445.
        // C1 (1000 bal, next interest) gets 445.
        // So, C1: 20+445 = 465. C2: 20+2000 = 2020. C3: 15. Sum = 465+2020+15 = 2500. This seems right.
        const highPayment = 2500;
        const allocations = /* allocatePaymentsAvalanche(cards, highPayment) */ [
            { cardId: 1, paymentAmount: 465 },
            { cardId: 2, paymentAmount: 2020 },
            { cardId: 3, paymentAmount: 15 }
        ];
        console.log("Test: allocatePaymentsAvalanche(cards, 2500) allocates {c1:465, c2:2020, c3:15}");
    });

    test('single card scenario', () => {
        const singleCard = [{ id: 1, balance: 1000, interestRate: 0.015, minPaymentPercentage: 0.02 }]; // Min: 20
        const totalMonthlyPayment = 100;
        const allocations = /* allocatePaymentsAvalanche(singleCard, totalMonthlyPayment) */ [ {cardId:1, paymentAmount: 100} ];
        // expect(allocations[0].paymentAmount).toBe(100);
        console.log("Test: allocatePaymentsAvalanche with single card gets full payment.");
    });

    test('cards with zero balance', () => {
        const mixedCards = [
            { id: 1, balance: 1000, interestRate: 0.015, minPaymentPercentage: 0.02 }, // Min: 20
            { id: 2, balance: 0, interestRate: 0.020, minPaymentPercentage: 0.01 },    // Min: 0
            { id: 3, balance: 500, interestRate: 0.010, minPaymentPercentage: 0.03 }   // Min: 15
        ]; // Total Min Payments = 20 + 0 + 15 = 35
        const totalMonthlyPayment = 100; // Extra = 100 - 35 = 65. All goes to Card 1.
        const allocations = /* allocatePaymentsAvalanche(mixedCards, totalMonthlyPayment) */ [
            { cardId: 1, paymentAmount: 20 + 65 }, // 85
            { cardId: 2, paymentAmount: 0 },
            { cardId: 3, paymentAmount: 15 }
        ];
        // expect(allocations.find(a=>a.cardId===1).paymentAmount).toBe(85);
        // expect(allocations.find(a=>a.cardId===2).paymentAmount).toBe(0);
        // expect(allocations.find(a=>a.cardId===3).paymentAmount).toBe(15);
        console.log("Test: allocatePaymentsAvalanche with zero balance cards allocates {c1:85, c2:0, c3:15}");
    });
});

// To make this file runnable for simple console output:
// For each describe/test block, replace `expect().toBe()` with actual function calls and console.log comparisons.
// This is a conceptual layout. A real test suite would use Jest/Mocha's `expect` and test execution.
console.log("\n--- Mock Unit Test Execution for calculation_engine.js (Conceptual) ---");
// Manually call a few to simulate:
console.log("calculateMonthlyInterest(1000, 0.015) should be 15. Actual:", calculateMonthlyInterest(1000, 0.015));
let testCard = { id:1, balance: 1000, interestRate: 0.02, minPaymentPercentage: 0.02 };
let paymentResult = simulateOneMonthPayment(testCard, 50);
console.log("simulateOneMonthPayment({balance:1000,rate:0.02}, 50) principalPaid should be 30. Actual:", paymentResult.principalPaid);

let testCards = [
    { id: 1, balance: 1000, interestRate: 0.015, minPaymentPercentage: 0.02 },
    { id: 2, balance: 2000, interestRate: 0.020, minPaymentPercentage: 0.01 },
    { id: 3, balance: 500, interestRate: 0.010, minPaymentPercentage: 0.03 }
];
let allocations = allocatePaymentsAvalanche(testCards, 100);
console.log("allocatePaymentsAvalanche(cards, 100) for cardId 2 should be 65. Actual:", allocations.find(a=>a.cardId===2).paymentAmount);
console.log("--- End of Mock Unit Test Execution ---");
