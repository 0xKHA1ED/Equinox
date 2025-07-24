function recommendOptimalStrategy(scenarios, priority = 'lowest_interest') {
    if (scenarios.length === 0) {
        return null;
    }

    if (scenarios.length === 1) {
        return scenarios[0];
    }

    return scenarios.reduce((optimal, current) => {
        if (!optimal) {
            return current;
        }

        if (priority === 'lowest_interest') {
            return current.totalInterestPaid < optimal.totalInterestPaid ? current : optimal;
        } else if (priority === 'fastest_payoff') {
            return current.totalMonths < optimal.totalMonths ? current : optimal;
        }

        return optimal; // Default to current optimal if priority is unknown
    }, null);
}

function calculateSavings(scenarioA, scenarioB) {
    return Math.abs(scenarioA.totalInterestPaid - scenarioB.totalInterestPaid);
}

module.exports = {
    recommendOptimalStrategy,
    calculateSavings,
};
