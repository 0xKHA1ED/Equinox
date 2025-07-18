import { calculateMonthlyInterest, simulateOneMonthPayment, allocatePaymentsAvalanche } from '../calculation_engine.js';

describe('calculateMonthlyInterest', () => {
    test('should return 0 interest for 0 balance', () => {
        expect(calculateMonthlyInterest(0, 0.015)).toBe(0);
    });

    test('should calculate correct interest for positive balance', () => {
        expect(calculateMonthlyInterest(1000, 0.015)).toBe(15);
    });

    test('should handle floating point results correctly (toFixed(2))', () => {
        expect(calculateMonthlyInterest(100, 0.012345)).toBe(1.23);
    });
     test('should return 0 interest for negative balance (edge case)', () => {
        expect(calculateMonthlyInterest(-100, 0.015)).toBe(0);
    });
});

describe('simulateOneMonthPayment', () => {
    const card = { balance: 1000, interestRate: 0.02, minPaymentPercentage: 0.02 };

    test('payment covers interest and some principal', () => {
        const paymentAmount = 50;
        const result = simulateOneMonthPayment(card, paymentAmount);
        expect(result.newBalance).toBe(970);
        expect(result.interestPaid).toBe(20);
        expect(result.principalPaid).toBe(30);
    });

    test('payment equals exact interest', () => {
        const paymentAmount = 20;
        const result = simulateOneMonthPayment(card, paymentAmount);
        expect(result.newBalance).toBe(1000);
        expect(result.interestPaid).toBe(20);
        expect(result.principalPaid).toBe(0);
    });

    test('payment is less than interest', () => {
        const paymentAmount = 10;
        const result = simulateOneMonthPayment(card, paymentAmount);
        expect(result.newBalance).toBe(1010);
        expect(result.interestPaid).toBe(20);
        expect(result.principalPaid).toBe(0);
    });

    test('payment pays off balance exactly', () => {
        const interest = calculateMonthlyInterest(card.balance, card.interestRate);
        const paymentAmount = card.balance + interest;
        const result = simulateOneMonthPayment(card, paymentAmount);
        expect(result.newBalance).toBe(0);
        expect(result.interestPaid).toBe(20);
        expect(result.principalPaid).toBe(1000);
    });

    test('payment is more than enough to pay off balance', () => {
        const interest = calculateMonthlyInterest(card.balance, card.interestRate);
        const paymentAmount = card.balance + interest + 50;
        const result = simulateOneMonthPayment(card, paymentAmount);
        expect(result.newBalance).toBe(0);
        expect(result.interestPaid).toBe(20);
        expect(result.principalPaid).toBe(1000);
    });

    test('card balance is 0', () => {
        const zeroBalanceCard = { balance: 0, interestRate: 0.02, minPaymentPercentage: 0.02 };
        const paymentAmount = 50;
        const result = simulateOneMonthPayment(zeroBalanceCard, paymentAmount);
        expect(result.newBalance).toBe(0);
        expect(result.interestPaid).toBe(0);
        expect(result.principalPaid).toBe(0);
    });
});

describe('allocatePaymentsAvalanche', () => {
    const cards = [
        { id: 1, balance: 1000, interestRate: 0.015, minPaymentPercentage: 0.02 },
        { id: 2, balance: 2000, interestRate: 0.020, minPaymentPercentage: 0.01 },
        { id: 3, balance: 500, interestRate: 0.010, minPaymentPercentage: 0.03 }
    ];

    test('total payment less than total minimums', () => {
        const totalMonthlyPayment = 50;
        const allocations = allocatePaymentsAvalanche(cards, totalMonthlyPayment);
        expect(allocations.find(a=>a.cardId===1).paymentAmount).toBe(20);
        expect(allocations.find(a=>a.cardId===2).paymentAmount).toBe(20);
        expect(allocations.find(a=>a.cardId===3).paymentAmount).toBe(10);
    });

    test('total payment equals total minimums', () => {
        const totalMonthlyPayment = 55;
        const allocations = allocatePaymentsAvalanche(cards, totalMonthlyPayment);
        expect(allocations.find(a=>a.cardId===1).paymentAmount).toBe(20);
        expect(allocations.find(a=>a.cardId===2).paymentAmount).toBe(20);
        expect(allocations.find(a=>a.cardId===3).paymentAmount).toBe(15);
    });

    test('total payment covers minimums with extra for highest interest card', () => {
        const totalMonthlyPayment = 100;
        const allocations = allocatePaymentsAvalanche(cards, totalMonthlyPayment);
        expect(allocations.find(a=>a.cardId===1).paymentAmount).toBe(20);
        expect(allocations.find(a=>a.cardId===2).paymentAmount).toBe(65);
        expect(allocations.find(a=>a.cardId===3).paymentAmount).toBe(15);
    });

    test('total payment pays off one card and distributes rest', () => {
        const highPayment = 2500;
        const allocations = allocatePaymentsAvalanche(cards, highPayment);
        expect(allocations.find(a=>a.cardId===1).paymentAmount).toBe(465);
        expect(allocations.find(a=>a.cardId===2).paymentAmount).toBe(2020);
        expect(allocations.find(a=>a.cardId===3).paymentAmount).toBe(15);
    });

    test('single card scenario', () => {
        const singleCard = [{ id: 1, balance: 1000, interestRate: 0.015, minPaymentPercentage: 0.02 }];
        const totalMonthlyPayment = 100;
        const allocations = allocatePaymentsAvalanche(singleCard, totalMonthlyPayment);
        expect(allocations[0].paymentAmount).toBe(100);
    });

    test('cards with zero balance', () => {
        const mixedCards = [
            { id: 1, balance: 1000, interestRate: 0.015, minPaymentPercentage: 0.02 },
            { id: 2, balance: 0, interestRate: 0.020, minPaymentPercentage: 0.01 },
            { id: 3, balance: 500, interestRate: 0.010, minPaymentPercentage: 0.03 }
        ];
        const totalMonthlyPayment = 100;
        const allocations = allocatePaymentsAvalanche(mixedCards, totalMonthlyPayment);
        expect(allocations.find(a=>a.cardId===1).paymentAmount).toBe(85);
        expect(allocations.find(a=>a.cardId===2).paymentAmount).toBe(0);
        expect(allocations.find(a=>a.cardId===3).paymentAmount).toBe(15);
    });
});
