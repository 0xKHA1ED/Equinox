// calculation_engine.js

/**
 * Calculates the monthly interest for a given balance and monthly interest rate.
 * @param {number} balance - The current balance.
 * @param {number} monthlyInterestRate - The monthly interest rate (e.g., 0.015 for 1.5%).
 * @returns {number} The calculated monthly interest.
 */
export function calculateMonthlyInterest(balance, monthlyInterestRate) {
    if (balance <= 0) return 0;
    return parseFloat((balance * monthlyInterestRate).toFixed(2));
}

/**
 * Simulates one month of payment for a single credit card.
 * @param {object} card - The card object { balance, monthlyInterestRate, minPaymentPercentage }
 * @param {number} paymentAmount - The payment made towards this card for the month.
 * @returns {object} Updated card state { newBalance, interestPaid, principalPaid, minPaymentRequired }
 */
export function simulateOneMonthPayment(card, paymentAmount) {
    const interestForMonth = calculateMonthlyInterest(card.balance, card.interestRate);
    let principalPaid = parseFloat((paymentAmount - interestForMonth).toFixed(2));

    if (principalPaid < 0) { // Payment doesn't even cover interest
        principalPaid = 0;
    }
    if (principalPaid > card.balance) { // Cannot pay more principal than exists
        principalPaid = card.balance;
    }

    let newBalance = parseFloat((card.balance + interestForMonth - paymentAmount).toFixed(2));
    if (newBalance < 0) {
        newBalance = 0;
    }

    // If payment made was less than interest, balance increases
    if (paymentAmount < interestForMonth) {
        newBalance = parseFloat((card.balance + (interestForMonth - paymentAmount)).toFixed(2));
    }


    return {
        newBalance: newBalance,
        interestPaid: interestForMonth, // Interest accrued this month
        principalPaid: principalPaid, // Actual principal reduced
        minPaymentRequired: parseFloat((card.balance * card.minPaymentPercentage).toFixed(2)) // For next month, if needed
    };
}


/**
 * Allocates a total monthly payment across multiple cards using the Avalanche method.
 * Prioritizes cards with the highest interest rates.
 * Ensures minimum payments are made on all cards.
 * @param {Array<object>} cards - Array of card objects. Each card needs { id, balance, interestRate, minPaymentPercentage }
 * @param {number} totalMonthlyPayment - The total amount available for payments.
 * @returns {Array<object>} Array of payment allocations { cardId, paymentAmount }
 */
export function allocatePaymentsAvalanche(cards, totalMonthlyPayment) {
    let remainingPayment = totalMonthlyPayment;
    const allocations = cards.map(card => ({ cardId: card.id, paymentAmount: 0, originalBalance: card.balance, interestRate: card.interestRate, minPaymentPercentage: card.minPaymentPercentage }));

    // Calculate and allocate minimum payments first
    cards.forEach(card => {
        if (card.balance > 0) {
            let minPayment = Math.max(10, card.balance * card.minPaymentPercentage); // Assuming a minimum payment of $10 if percentage is too low
            minPayment = Math.min(minPayment, card.balance + calculateMonthlyInterest(card.balance, card.interestRate)); // Cannot be more than balance + interest
            minPayment = Math.min(minPayment, remainingPayment); // Cannot be more than available payment

            const allocation = allocations.find(a => a.cardId === card.id);
            allocation.paymentAmount += minPayment;
            remainingPayment -= minPayment;
        }
    });

    if (remainingPayment <= 0) { // If total payment only covers (or is less than) minimums
        return allocations.map(a => ({cardId: a.cardId, paymentAmount: parseFloat(a.paymentAmount.toFixed(2))}));
    }

    // Sort cards by interest rate (descending) for Avalanche method
    const sortedCardsForAvalanche = cards
        .filter(card => card.balance > 0)
        .sort((a, b) => b.interestRate - a.interestRate);

    // Allocate remaining payment to highest interest cards
    for (const card of sortedCardsForAvalanche) {
        if (remainingPayment <= 0) break;

        const allocation = allocations.find(a => a.cardId === card.id);
        const currentCardBalance = card.balance;

        const extraPayment = Math.min(remainingPayment, currentCardBalance);

        if (extraPayment > 0) {
            allocation.paymentAmount += extraPayment;
            remainingPayment -= extraPayment;
        }
    }

    // Ensure no card gets paid more than its balance + interest
     allocations.forEach(alloc => {
        const card = cards.find(c => c.id === alloc.cardId);
        if (card && card.balance > 0) {
            const interest = calculateMonthlyInterest(card.balance, card.interestRate);
            const maxPayable = card.balance + interest;
            if (alloc.paymentAmount > maxPayable) {
                const overpayment = alloc.paymentAmount - maxPayable;
                alloc.paymentAmount = maxPayable;
                // This overpayment should ideally be re-distributed, but for simplicity now,
                // it's assumed totalMonthlyPayment is managed not to grossly overpay if only one card left.
                // The scenario simulation loop should handle this by capping payments.
            }
        } else if (card && card.balance <= 0) {
            alloc.paymentAmount = 0; // No payment if balance is zero
        }
    });


    return allocations.map(a => ({cardId: a.cardId, paymentAmount: parseFloat(a.paymentAmount.toFixed(2))}));
}
