// Main JavaScript file for the Credit Card Debt Visualizer

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    const addCardBtn = document.getElementById('add-card-btn');
    const creditCardFormsContainer = document.getElementById('credit-card-forms-container');
    let cardCount = 1;

    if (addCardBtn) {
        addCardBtn.addEventListener('click', () => {
            cardCount++;
            const newCardForm = `
                <div class="credit-card-entry">
                    <h3>Card ${cardCount}</h3>
                    <label for="card-nickname-${cardCount}">Card Nickname:</label>
                    <input type="text" id="card-nickname-${cardCount}" name="card-nickname" placeholder="e.g., Store Card">

                    <label for="current-balance-${cardCount}">Current Balance ($):</label>
                    <input type="number" id="current-balance-${cardCount}" name="current-balance" placeholder="e.g., 1000" step="0.01" min="0">

                    <label for="interest-rate-${cardCount}">Monthly Interest Rate (%):</label>
                    <input type="number" id="interest-rate-${cardCount}" name="interest-rate" placeholder="e.g., 2.0" step="0.01" min="0">

                    <label for="min-payment-percentage-${cardCount}">Minimum Payment (% of Balance):</label>
                    <input type="number" id="min-payment-percentage-${cardCount}" name="min-payment-percentage" placeholder="e.g., 3" step="0.01" min="0">
                </div>
            `;
            if (creditCardFormsContainer) {
                creditCardFormsContainer.insertAdjacentHTML('beforeend', newCardForm);
            }
        });
    }

    const addScenarioBtn = document.getElementById('add-scenario-btn');
    const scenarioFormsContainer = document.getElementById('scenario-forms-container');
    let scenarioCount = 1;

    if (addScenarioBtn) {
        addScenarioBtn.addEventListener('click', () => {
            scenarioCount++;
            const newScenarioForm = `
                <div class="scenario-entry">
                    <h3>Scenario ${scenarioCount}</h3>
                    <label for="total-monthly-payment-${scenarioCount}">Total Monthly Payment ($):</label>
                    <input type="number" id="total-monthly-payment-${scenarioCount}" name="total-monthly-payment" placeholder="e.g., 500" step="0.01" min="0">
                </div>
            `;
            if (scenarioFormsContainer) {
                scenarioFormsContainer.insertAdjacentHTML('beforeend', newScenarioForm);
            }
        });
    }

    // Placeholder for calculate button event listener
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            // Collect data and call calculation functions
            console.log("Calculate button clicked. Data collection and calculation logic to be implemented.");
            collectAndProcessData();
        });
    }
});

function collectAndProcessData() {
    const cardData = [];
    const cardEntries = document.querySelectorAll('#credit-card-forms-container .credit-card-entry');
    cardEntries.forEach((entry, index) => {
        const nickname = entry.querySelector(`input[name="card-nickname"]`).value;
        const balance = parseFloat(entry.querySelector(`input[name="current-balance"]`).value);
        const nicknameInput = entry.querySelector(`input[name="card-nickname"]`);
        const balanceInput = entry.querySelector(`input[name="current-balance"]`);
        const interestRateInput = entry.querySelector(`input[name="interest-rate"]`);
        const minPaymentPercentageInput = entry.querySelector(`input[name="min-payment-percentage"]`);

        const nickname = nicknameInput.value.trim();
        const balance = parseFloat(balanceInput.value);
        const interestRate = parseFloat(interestRateInput.value);
        const minPaymentPercentage = parseFloat(minPaymentPercentageInput.value);

        let isValidCard = true;

        if (!nickname) {
            alert(`Error in Card ${index + 1}: Nickname cannot be empty.`);
            isValidCard = false;
        }
        if (isNaN(balance) || balance < 0) {
            alert(`Error in Card ${index + 1} ('${nickname}'): Current Balance must be a non-negative number.`);
            isValidCard = false;
        }
        if (isNaN(interestRate) || interestRate < 0 || interestRate > 100) { // Assuming monthly rate, >100% is highly unlikely and likely an error
            alert(`Error in Card ${index + 1} ('${nickname}'): Monthly Interest Rate must be a number between 0 and 100.`);
            isValidCard = false;
        }
        if (isNaN(minPaymentPercentage) || minPaymentPercentage < 0 || minPaymentPercentage > 100) {
            alert(`Error in Card ${index + 1} ('${nickname}'): Minimum Payment Percentage must be a number between 0 and 100.`);
            isValidCard = false;
        }

        if (isValidCard) {
            cardData.push({
                id: index + 1,
                nickname,
                balance,
                interestRate: interestRate / 100, // Convert percentage to decimal
                minPaymentPercentage: minPaymentPercentage / 100 // Convert percentage to decimal
            });
        } else {
            // Stop further processing if any card is invalid
            cardData.length = 0; // Clear partially collected data
            return; // Exit forEach loop early (not possible directly, but set a flag or clear array)
        }
    });

    // If cardData was cleared due to an error in the loop, stop.
    if (cardEntries.length > 0 && cardData.length === 0) {
        return; // An error occurred in card validation
    }


    const scenarioData = [];
    const scenarioEntries = document.querySelectorAll('#scenario-forms-container .scenario-entry');
    scenarioEntries.forEach((entry, index) => {
        const totalPaymentInput = entry.querySelector(`input[name="total-monthly-payment"]`);
        const totalPayment = parseFloat(totalPaymentInput.value);
        let isValidScenario = true;

        if (isNaN(totalPayment) || totalPayment <= 0) {
            alert(`Error in Scenario ${index + 1}: Total Monthly Payment must be a positive number.`);
            isValidScenario = false;
        }

        if (isValidScenario) {
            scenarioData.push({
                id: index + 1,
                totalMonthlyPayment: totalPayment
            });
        } else {
            scenarioData.length = 0; // Clear partially collected data
            return;
        }
    });

    if (scenarioEntries.length > 0 && scenarioData.length === 0 && cardData.length > 0) {
         // Ensure we don't proceed if scenario validation failed after successful card validation
        return;
    }


    console.log("Collected Card Data:", cardData);
    console.log("Collected Scenario Data:", scenarioData);

    if (cardData.length === 0) {
        alert("Please add at least one credit card.");
        return;
    }
    if (scenarioData.length === 0) {
        alert("Please add at least one repayment scenario.");
        return;
    }

    // Further processing will involve passing this data to the calculation engine
    // and then to the display functions.
    if (cardData.length > 0 && scenarioData.length > 0) {
        // Clear previous results before new calculation
        const resultsSection = document.getElementById('results-section');
        const detailedChartsContainer = document.getElementById('detailed-charts-container');
        const comparisonChartCtx = document.getElementById('comparisonChart');
        const optimalStrategySummary = document.getElementById('optimal-strategy-summary');

        if (detailedChartsContainer) detailedChartsContainer.innerHTML = ''; // Clear old detailed charts
        if (optimalStrategySummary) optimalStrategySummary.innerHTML = ''; // Clear old summary

        // Destroy existing chart instance if it exists
        if (window.myComparisonChart instanceof Chart) {
            window.myComparisonChart.destroy();
        }

        const allScenarioResults = calculateAllScenarios(cardData, scenarioData);
        console.log("All Scenario Results:", allScenarioResults);
        displayResults(allScenarioResults, initialCardsData); // Pass initialCardsData for context if needed
    }
}
/**
 * Calculates repayment scenarios based on card data and specified total monthly payments.
 * @param {Array<object>} initialCardsData - Array of initial card states.
 * @param {Array<object>} scenariosInput - Array of scenarios, each with a totalMonthlyPayment.
 * @returns {Array<object>} Array of scenario results.
 */
function calculateAllScenarios(initialCardsData, scenariosInput) {
    const results = [];

    scenariosInput.forEach(scenarioInput => {
        let currentCardsData = JSON.parse(JSON.stringify(initialCardsData)); // Deep copy for each scenario
        let months = 0;
        let totalInterestPaidForScenario = 0;
        let totalPrincipalPaidForScenario = 0;
        const monthlyDetails = []; // To store month-by-month breakdown

        while (currentCardsData.some(card => card.balance > 0)) {
            months++;
            if (months > 1000) { // Safety break for very long calculations (e.g., payments too low)
                console.warn(`Scenario ${scenarioInput.id} exceeded 1000 months. Check payment amounts.`);
                monthlyDetails.push({ month: months, warning: "Calculation stopped after 1000 months." });
                break;
            }

            let monthDetail = {
                month: months,
                cards: [],
                totalPaymentThisMonth: 0,
                totalInterestThisMonth: 0,
                totalPrincipalPaidThisMonth: 0
            };

            // 1. Allocate payments for the month using Avalanche
            const paymentAllocations = allocatePaymentsAvalanche(currentCardsData, scenarioInput.totalMonthlyPayment);

            let scenarioTotalPaymentThisMonth = 0;

            currentCardsData.forEach(card => {
                if (card.balance <= 0) {
                    monthDetail.cards.push({
                        id: card.id,
                        nickname: card.nickname,
                        startingBalance: 0,
                        payment: 0,
                        interestPaid: 0,
                        principalPaid: 0,
                        endingBalance: 0
                    });
                    return; // Skip paid off cards
                }

                const allocation = paymentAllocations.find(a => a.cardId === card.id);
                let paymentForThisCard = allocation ? allocation.paymentAmount : 0;

                // Ensure payment does not exceed what's needed to pay off the card this month
                const interestForMonthOnCard = calculateMonthlyInterest(card.balance, card.interestRate);
                const amountToPayOffCompletely = card.balance + interestForMonthOnCard;
                if (paymentForThisCard > amountToPayOffCompletely) {
                    paymentForThisCard = amountToPayOffCompletely;
                }


                const cardInitialBalanceForMonth = card.balance;
                const paymentResult = simulateOneMonthPayment(card, paymentForThisCard);

                card.balance = paymentResult.newBalance; // Update card balance for next iteration/month

                totalInterestPaidForScenario += paymentResult.interestPaid;
                totalPrincipalPaidForScenario += paymentResult.principalPaid;

                scenarioTotalPaymentThisMonth += paymentForThisCard;
                monthDetail.totalInterestThisMonth += paymentResult.interestPaid;
                monthDetail.totalPrincipalPaidThisMonth += paymentResult.principalPaid;

                monthDetail.cards.push({
                    id: card.id,
                    nickname: card.nickname,
                    startingBalance: cardInitialBalanceForMonth,
                    payment: paymentForThisCard,
                    interestPaid: paymentResult.interestPaid,
                    principalPaid: paymentResult.principalPaid,
                    endingBalance: card.balance
                });
            });

            monthDetail.totalPaymentThisMonth = scenarioTotalPaymentThisMonth;
            monthlyDetails.push(monthDetail);

            // Check if total payment capacity is less than sum of minimums for remaining cards (could lead to infinite loop if not handled)
            const sumOfMinimums = currentCardsData
                .filter(c => c.balance > 0)
                .reduce((sum, c) => sum + Math.max(10, c.balance * c.minPaymentPercentage), 0);
            if (scenarioInput.totalMonthlyPayment < sumOfMinimums && currentCardsData.some(c => c.balance > 0 && c.interestRate > 0)) {
                 // This condition might indicate that the debt could grow if payments are too low.
                 // The current loop structure relies on `allocatePaymentsAvalanche` ensuring minimums are met if possible.
                 // If `totalMonthlyPayment` is truly insufficient to cover interest on all cards, balances may rise.
                 // The `months > 1000` is a safeguard. More sophisticated handling could be added.
            }
        }

        results.push({
            scenarioId: scenarioInput.id,
            totalMonthlyPayment: scenarioInput.totalMonthlyPayment,
            monthsToPayOff: months,
            totalInterestPaid: parseFloat(totalInterestPaidForScenario.toFixed(2)),
            totalPrincipalPaid: parseFloat(totalPrincipalPaidForScenario.toFixed(2)), // Should match initial total debt
            monthlyBreakdown: monthlyDetails
        });
    });

    return results;
}


function displayResults(allScenarioResults, initialCardsData) {
    const comparisonChartCtx = document.getElementById('comparisonChart')?.getContext('2d');
    const detailedChartsContainer = document.getElementById('detailed-charts-container');

    if (!comparisonChartCtx || !detailedChartsContainer) {
        console.error("Chart canvas or detailed container not found!");
        return;
    }

    // Clear previous detailed charts
    detailedChartsContainer.innerHTML = '';

    // Prepare data for comparison chart
    const labels = allScenarioResults.map(res => `Scenario: $${res.totalMonthlyPayment}/month`);
    const totalInterestData = allScenarioResults.map(res => res.totalInterestPaid);
    const monthsToPayOffData = allScenarioResults.map(res => res.monthsToPayOff);

    // Destroy existing chart instance if it exists to prevent conflicts
    if (window.myComparisonChart instanceof Chart) {
        window.myComparisonChart.destroy();
    }

    window.myComparisonChart = new Chart(comparisonChartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Interest Paid ($)',
                    data: totalInterestData,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    yAxisID: 'yInterest',
                },
                {
                    label: 'Months to Pay Off',
                    data: monthsToPayOffData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'yMonths',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                yInterest: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Total Interest Paid ($)'
                    }
                },
                yMonths: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Months to Pay Off'
                    },
                    grid: {
                        drawOnChartArea: false, // only draw grid for yInterest axis
                    },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                if (context.dataset.yAxisID === 'yInterest') {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                } else {
                                    label += context.parsed.y + ' months';
                                }
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // Generate detailed charts for each scenario
    allScenarioResults.forEach((scenario, index) => {
        const scenarioContainer = document.createElement('div');
        scenarioContainer.classList.add('scenario-detail-container');
        scenarioContainer.innerHTML = `<h3>Scenario ${index + 1}: Paying $${scenario.totalMonthlyPayment}/month</h3>`;

        const canvas = document.createElement('canvas');
        canvas.id = `scenarioChart-${scenario.scenarioId}`;
        // Ensure canvas has a unique ID if multiple charts of this type are possible or if re-rendering
        // Chart.js might require canvas elements to have dimensions before initialization if not responsive.
        // canvas.width = 400; canvas.height = 200; // Or use CSS
        scenarioContainer.appendChild(canvas);
        detailedChartsContainer.appendChild(scenarioContainer);

        renderDetailedScenarioChart(canvas.getContext('2d'), scenario, initialCardsData);
    });

    // Optimal Strategy Recommendation (FR-3.1, FR-3.2, FR-3.3)
    const optimalStrategySummaryEl = document.getElementById('optimal-strategy-summary');
    if (optimalStrategySummaryEl && allScenarioResults.length > 0) {
        // First, find the strategy with the lowest total interest.
        let optimalByInterest = allScenarioResults.reduce((prev, current) => (prev.totalInterestPaid < current.totalInterestPaid) ? prev : current);

        // Then, find the strategy with the fastest payoff.
        let optimalByTime = allScenarioResults.reduce((prev, current) => (prev.monthsToPayOff < current.monthsToPayOff) ? prev : current);

        let summaryHTML = '<h4>Optimal Strategy Recommendation:</h4>';

        // For this implementation, we'll primarily highlight the one with lowest total interest,
        // but also mention if it's the fastest or if another is faster.

        summaryHTML += `<p><strong>Best for Lowest Total Interest:</strong> Scenario paying <strong>$${optimalByInterest.totalMonthlyPayment}/month</strong>.
                        You'll pay a total of <strong>$${optimalByInterest.totalInterestPaid.toFixed(2)}</strong> in interest and be debt-free in
                        <strong>${optimalByInterest.monthsToPayOff} months</strong>.</p>`;

        if (optimalByInterest.scenarioId !== optimalByTime.scenarioId) {
            summaryHTML += `<p><strong>Fastest to Debt-Free:</strong> Scenario paying <strong>$${optimalByTime.totalMonthlyPayment}/month</strong>.
                            You'll be debt-free in <strong>${optimalByTime.monthsToPayOff} months</strong>, paying a total of
                            $${optimalByTime.totalInterestPaid.toFixed(2)} in interest.</p>`;
        } else {
            summaryHTML += `<p>This strategy is also the fastest to get you debt-free.</p>`;
        }

        // Savings Comparison (FR-3.2)
        // Compare the optimal (by interest) with the scenario that has the highest interest paid (worst case among those calculated)
        if (allScenarioResults.length > 1) {
            let worstScenarioByInterest = allScenarioResults.reduce((prev, current) => (prev.totalInterestPaid > current.totalInterestPaid) ? prev : current);
            if (worstScenarioByInterest.scenarioId !== optimalByInterest.scenarioId) {
                const savings = worstScenarioByInterest.totalInterestPaid - optimalByInterest.totalInterestPaid;
                summaryHTML += `<p>By choosing the $${optimalByInterest.totalMonthlyPayment}/month plan over the $${worstScenarioByInterest.totalMonthlyPayment}/month plan,
                                you could save <strong>$${savings.toFixed(2)}</strong> in interest payments.</p>`;
            }
        }

        // Simple explanation (FR-3.3)
        summaryHTML += `<p class="explanation"><em>Why this is often optimal: Paying more each month, especially using a strategy like Avalanche (which this calculator uses by default to allocate payments), reduces your principal balance faster. This means less interest accrues over time, saving you money and getting you out of debt sooner.</em></p>`;

        optimalStrategySummaryEl.innerHTML = summaryHTML;
    }
}

function renderDetailedScenarioChart(ctx, scenarioResult, initialCardsData) {
    const numMonths = scenarioResult.monthsToPayOff;
    const labels = Array.from({ length: numMonths }, (_, i) => `Month ${i + 1}`);

    const datasets = [];
    const colors = ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)'];

    // Overall debt reduction line
    const overallDebtData = [];
    let runningTotalDebt = initialCardsData.reduce((sum, card) => sum + card.balance, 0);
    overallDebtData.push(runningTotalDebt); // Month 0 (Initial state)

    scenarioResult.monthlyBreakdown.forEach(monthData => {
        runningTotalDebt -= monthData.totalPrincipalPaidThisMonth;
        overallDebtData.push(Math.max(0, runningTotalDebt)); // Ensure balance doesn't go below zero
    });
     // Adjust labels to include "Initial" state for Month 0
    const detailedLabels = ['Initial', ...Array.from({ length: numMonths }, (_, i) => `Month ${i + 1}`)];


    datasets.push({
        label: 'Overall Remaining Debt',
        data: overallDebtData,
        borderColor: 'rgba(75, 192, 75, 1)',
        backgroundColor: 'rgba(75, 192, 75, 0.2)',
        fill: true,
        type: 'line',
        tension: 0.1
    });

    // Per-card debt reduction lines
    initialCardsData.forEach((initialCard, cardIndex) => {
        const cardDebtData = [];
        let currentCardBalance = initialCard.balance;
        cardDebtData.push(currentCardBalance); // Month 0

        scenarioResult.monthlyBreakdown.forEach(monthData => {
            const cardMonthDetail = monthData.cards.find(c => c.id === initialCard.id);
            if (cardMonthDetail) {
                // Ending balance of this month is starting balance for next, but we plot ending balances
                currentCardBalance = cardMonthDetail.endingBalance;
            }
             // If card is paid off, its balance remains 0
            cardDebtData.push(Math.max(0, currentCardBalance));
        });

        datasets.push({
            label: `${initialCard.nickname} Remaining Debt`,
            data: cardDebtData,
            borderColor: colors[cardIndex % colors.length],
            backgroundColor: 'transparent', // No fill for individual card lines
            type: 'line',
            tension: 0.1,
            borderDash: [5, 5] // Dashed line for individual cards
        });
    });


    new Chart(ctx, {
        type: 'line', // Base type, but datasets can override
        data: {
            labels: detailedLabels, // Use adjusted labels
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Debt Reduction Over Time ($${scenarioResult.totalMonthlyPayment}/month)`
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Remaining Debt ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Months'
                    }
                }
            }
        }
    });
}
