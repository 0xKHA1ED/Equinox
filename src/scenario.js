const { generateAmortizationSchedule, calculateTotalInterest, calculateMonthsToPayOff } = require('./calculations');

function addCard(cards, newCard) {
    if (newCard.balance < 0 || newCard.monthlyRate < 0 || newCard.minPaymentPercentage < 0) {
        return cards;
    }
    return [...cards, { ...newCard, id: cards.length + 1 }];
}

function generateScenario(cards, totalMonthlyPayment) {
    if (cards.length === 0) {
        return {
            totalMonths: 0,
            totalInterestPaid: 0,
            schedule: [],
        };
    }

    // Using the Avalanche method: prioritize highest interest rate
    const sortedCards = [...cards].sort((a, b) => b.monthlyRate - a.monthlyRate);

    const schedule = generateAmortizationSchedule(sortedCards, totalMonthlyPayment);
    const totalInterestPaid = schedule.reduce((sum, month) => sum + month.interest, 0);
    const totalMonths = schedule.length;

    return {
        totalMonths,
        totalInterestPaid,
        schedule,
    };
}


module.exports = {
    addCard,
    generateScenario,
};
