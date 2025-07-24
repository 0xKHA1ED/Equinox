function calculateMonthlyInterest(balance, monthlyRate) {
    return balance * monthlyRate;
}

function generateAmortizationSchedule(cards, totalMonthlyPayment) {
    let currentCards = JSON.parse(JSON.stringify(cards)); // Deep copy to avoid mutation
    let schedule = [];
    let month = 1;
    let totalBalance = currentCards.reduce((sum, card) => sum + card.balance, 0);
    const minimumPayment = currentCards.reduce((sum, card) => sum + (card.balance * card.minPaymentPercentage), 0);

    if (totalMonthlyPayment < currentCards.reduce((sum, card) => sum + card.balance * card.minPaymentPercentage, 0)) {
        let interest = currentCards.reduce((sum, card) => sum + calculateMonthlyInterest(card.balance, card.monthlyRate), 0);
        return [{
            month: 1,
            startingBalance: totalBalance,
            payment: totalMonthlyPayment,
            interest: interest,
            endingBalance: totalBalance + interest - totalMonthlyPayment
        }];
    }


    while (totalBalance > 0) {
        let monthlyInterest = 0;
        let paymentForMonth = Math.min(totalMonthlyPayment, totalBalance);
        let startingBalanceForMonth = totalBalance;

        currentCards.forEach(card => {
            monthlyInterest += calculateMonthlyInterest(card.balance, card.monthlyRate);
        });

        let principalPaid = paymentForMonth - monthlyInterest;
        if (totalBalance < totalMonthlyPayment) {
            paymentForMonth = totalBalance + monthlyInterest;
            principalPaid = totalBalance;
        }


        totalBalance -= principalPaid;

        schedule.push({
            month: month,
            startingBalance: startingBalanceForMonth,
            payment: paymentForMonth,
            interest: monthlyInterest,
            principal: principalPaid,
            endingBalance: totalBalance,
        });

        // Simplified card balance update for this example
        currentCards.forEach(card => {
            let interestOnCard = calculateMonthlyInterest(card.balance, card.monthlyRate);
            let paymentToCard = (card.balance / startingBalanceForMonth) * paymentForMonth; // Pro-rata distribution
            card.balance += interestOnCard - paymentToCard;
            if (card.balance < 0) card.balance = 0;
        });

        month++;
    }
    if (schedule.length > 0) {
        const lastMonth = schedule[schedule.length - 1];
        if (lastMonth.endingBalance < 0) {
            lastMonth.payment += lastMonth.endingBalance;
            lastMonth.principal += lastMonth.endingBalance;
            lastMonth.endingBalance = 0;
        }
    }


    return schedule;
}

function calculateTotalInterest(cards, totalMonthlyPayment) {
    const schedule = generateAmortizationSchedule(cards, totalMonthlyPayment);
    return schedule.reduce((sum, month) => sum + month.interest, 0);
}

function calculateMonthsToPayOff(cards, totalMonthlyPayment) {
    return generateAmortizationSchedule(cards, totalMonthlyPayment).length;
}

module.exports = {
    calculateMonthlyInterest,
    generateAmortizationSchedule,
    calculateTotalInterest,
    calculateMonthsToPayOff,
};
