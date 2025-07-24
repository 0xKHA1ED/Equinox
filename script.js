// calculation_engine.js

/**
 * Calculates the monthly interest for a given balance and monthly interest rate.
 * @param {number} balance - The current balance.
 * @param {number} monthlyInterestRate - The monthly interest rate (e.g., 0.015 for 1.5%).
 * @returns {number} The calculated monthly interest.
 */
function calculateMonthlyInterest(balance, monthlyInterestRate) {
    if (balance <= 0) return 0;
    return parseFloat((balance * monthlyInterestRate).toFixed(2));
}

/**
 * Simulates one month of payment for a single credit card.
 * @param {object} card - The card object { balance, monthlyInterestRate, minPaymentPercentage }
 * @param {number} paymentAmount - The payment made towards this card for the month.
 * @returns {object} Updated card state { newBalance, interestPaid, principalPaid, minPaymentRequired }
 */
function simulateOneMonthPayment(card, paymentAmount) {
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
function allocatePaymentsAvalanche(cards, totalMonthlyPayment) {
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


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // --- Chart.js Global Styling ---
    try {
        // Get the computed style of the root element where variables are defined
        const rootStyles = getComputedStyle(document.documentElement);

        // Read the actual color values from your CSS variables
        const textPrimary = rootStyles.getPropertyValue('--text-primary').trim();
        const textSecondary = rootStyles.getPropertyValue('--text-secondary').trim();
        const glassBorder = rootStyles.getPropertyValue('--glass-border-color').trim();

        // Now, assign the resolved colors to Chart.js
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = textSecondary; // Use the resolved variable
        Chart.defaults.borderColor = glassBorder; // Use the resolved variable
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        Chart.defaults.plugins.tooltip.titleColor = textPrimary; // Use the resolved variable
        Chart.defaults.plugins.tooltip.bodyColor = textSecondary; // Use the resolved variable
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.legend.labels.color = textPrimary; // Use the resolved variable
        Chart.defaults.plugins.legend.labels.boxWidth = 12;
        Chart.defaults.plugins.legend.labels.padding = 15;
    } catch (e) {
        console.warn("Could not set Chart.js defaults.", e);
    }

    // --- Element References ---
    const addCardBtn = document.getElementById('add-card-btn');
    const creditCardFormsContainer = document.getElementById('credit-card-forms-container');

    const addScenarioBtn = document.getElementById('add-scenario-btn');
    const scenarioFormsContainer = document.getElementById('scenario-forms-container');

    const calculateBtn = document.getElementById('calculate-btn');
    const resultsSection = document.getElementById('results-section');

    window.detailedAreaCharts = {}; // To store instances of detailed charts for destruction
    window.scenarioBarChart = null; // For the main comparison bar chart

    // --- Event Listeners ---
    if (addCardBtn) addCardBtn.addEventListener('click', addCardForm);
    if (addScenarioBtn) addScenarioBtn.addEventListener('click', addScenarioForm);

    document.addEventListener('click', function(event) {
        if (event.target && event.target.closest('.btn-remove-item')) {
            const itemToRemove = event.target.closest('.credit-card-item-card, .scenario-input-item');
            if (itemToRemove) {
                itemToRemove.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                itemToRemove.style.opacity = '0';
                itemToRemove.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    itemToRemove.remove();
                    if (itemToRemove.classList.contains('credit-card-item-card')) updateCardTitles();
                    else if (itemToRemove.classList.contains('scenario-input-item')) updateScenarioTitles();
                }, 300);
            }
        }
    });

    if (calculateBtn) {
        const originalCalculateBtnHTML = calculateBtn.innerHTML; // Store original content

        calculateBtn.addEventListener('click', () => {
            calculateBtn.disabled = true;
            // Use Lucide spinner icon directly if available, or fallback to CSS spinner
            calculateBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin mr-2"></i> Calculating...';
            if (typeof lucide !== 'undefined') lucide.createIcons();

            const optimalHighlightEl = document.getElementById('optimal-strategy-highlight');
            if (optimalHighlightEl) optimalHighlightEl.innerHTML = '<p>Crunching the numbers...</p>';
            document.getElementById('savings-insight-text').innerHTML = '';

            if (window.scenarioBarChart) {
                 window.scenarioBarChart.destroy();
                 window.scenarioBarChart = null;
            }
            document.getElementById('detailed-scenario-breakdown').querySelector('[role="tablist"]').innerHTML = '';
            document.getElementById('detailed-scenario-breakdown').querySelector('.tab-content-container').innerHTML = '';
            Object.values(window.detailedAreaCharts).forEach(chart => chart.destroy());
            window.detailedAreaCharts = {};

            setTimeout(() => {
                const collectionSuccess = collectAndProcessData();
                calculateBtn.disabled = false;
                calculateBtn.innerHTML = originalCalculateBtnHTML;
                if (typeof lucide !== 'undefined') lucide.createIcons();

                if (collectionSuccess) {
                    resultsSection.style.display = 'block';
                    resultsSection.style.opacity = '0';
                    setTimeout(() => {
                        resultsSection.style.transition = 'opacity 0.5s ease-in-out';
                        resultsSection.style.opacity = '1';
                        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 10);
                } else {
                    if (optimalHighlightEl) optimalHighlightEl.innerHTML = '<p class="text-red-400">Please correct errors in your inputs and try again.</p>';
                    resultsSection.style.display = 'none';
                }
            }, 500);
        });
    }

    setupTooltips();

    addCardForm();
    addScenarioForm();
}); // End DOMContentLoaded


function addCardForm(event) {
    const container = document.getElementById('credit-card-forms-container');
    if (!container) return;

    const isButtonClick = event && event.type === 'click';
    const cardExists = container.querySelector('.credit-card-item-card');

    if (!isButtonClick && cardExists) {
        return;
    }
    const cardIndex = container.querySelectorAll('.credit-card-item-card').length + 1;
    const newCardId = `card-item-dynamic-${Date.now()}`;

    const cardHTML = `
        <div class="credit-card-item-card" id="${newCardId}" data-card-id="${cardIndex}" style="opacity:0; transform: scale(0.95);">
            <div class="card-header-v3">
                <h3 class="form-title-v3">Credit Card ${cardIndex}</h3>
                ${cardIndex > 1 ? `<button type="button" class="btn-remove-item" aria-label="Remove Card ${cardIndex}"><i data-lucide="trash-2" class="w-5 h-5"></i></button>` : ''}
            </div>
            <div class="form-group">
                <label for="card-nickname-${cardIndex}">Card Nickname</label>
                <input type="text" id="card-nickname-${cardIndex}" name="card-nickname" placeholder="e.g., Visa Rewards">
            </div>
            <div class="form-group">
                <label for="current-balance-${cardIndex}">Current Balance ($)</label>
                <input type="number" id="current-balance-${cardIndex}" name="current-balance" placeholder="e.g., 5000" step="0.01" min="0">
            </div>
            <div class="form-group">
                <label for="interest-rate-${cardIndex}">Monthly Interest Rate (%)</label>
                <input type="number" id="interest-rate-${cardIndex}" name="interest-rate" placeholder="e.g., 1.5" step="0.01" min="0">
                <span class="tooltip-trigger" tabindex="0" data-tooltip-text="Your APR divided by 12. E.g., 18% APR is 1.5% monthly."><i data-lucide="info" class="w-4 h-4"></i></span>
            </div>
            <div class="form-group">
                <label for="min-payment-percentage-${cardIndex}">Minimum Payment (%)</label>
                <input type="number" id="min-payment-percentage-${cardIndex}" name="min-payment-percentage" placeholder="e.g., 2" step="0.01" min="0">
                <span class="tooltip-trigger" tabindex="0" data-tooltip-text="Found on your statement, usually 1-3% of balance or a flat fee."><i data-lucide="info" class="w-4 h-4"></i></span>
            </div>
        </div>`;
    container.insertAdjacentHTML('beforeend', cardHTML);
    const newElement = document.getElementById(newCardId);
    if (typeof lucide !== 'undefined') lucide.createIcons({ context: newElement });
    setTimeout(() => {
        newElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        newElement.style.opacity = '1';
        newElement.style.transform = 'scale(1)';
        document.getElementById(`card-nickname-${cardIndex}`).focus();
    }, 10);
}

function updateCardTitles() {
    const cards = document.querySelectorAll('#credit-card-forms-container .credit-card-item-card');
    cards.forEach((card, index) => {
        const cardNumericId = index + 1;
        card.dataset.cardId = cardNumericId;
        const titleEl = card.querySelector('.form-title-v3');
        const removeBtn = card.querySelector('.btn-remove-item');
        if (titleEl) titleEl.textContent = `Credit Card ${cardNumericId}`;
        if (removeBtn) removeBtn.setAttribute('aria-label', `Remove Card ${cardNumericId}`);
        else if (cardNumericId > 1 && !removeBtn) {
            const header = card.querySelector('.card-header-v3');
            if(header) header.insertAdjacentHTML('beforeend', `<button type="button" class="btn-remove-item" aria-label="Remove Card ${cardNumericId}"><i data-lucide="trash-2" class="w-5 h-5"></i></button>`);
        } else if (cardNumericId === 1 && removeBtn) {
            removeBtn.remove();
        }
        card.querySelectorAll('label').forEach(label => { const oldFor = label.htmlFor; if (oldFor) label.htmlFor = oldFor.replace(/-(\d+)$/, `-${cardNumericId}`); });
        card.querySelectorAll('input').forEach(input => { const oldId = input.id; if (oldId) input.id = oldId.replace(/-(\d+)$/, `-${cardNumericId}`); });
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addScenarioForm(event) {
    const container = document.getElementById('scenario-forms-container');
    if (!container) return;

    const isButtonClick = event && event.type === 'click';
    const scenarioExists = container.querySelector('.scenario-input-item');

    if (!isButtonClick && scenarioExists) {
        return;
    }
    const scenarioIndex = container.querySelectorAll('.scenario-input-item').length + 1;
    const newScenarioId = `scenario-item-dynamic-${Date.now()}`;
    const scenarioHTML = `
        <div class="scenario-input-item" id="${newScenarioId}" data-scenario-id="${scenarioIndex}" style="opacity:0; transform: scale(0.95);">
            <div class="card-header-v3">
                 <h3 class="form-title-v3">Scenario ${scenarioIndex}</h3>
                ${scenarioIndex > 1 ? `<button type="button" class="btn-remove-item" aria-label="Remove Scenario ${scenarioIndex}"><i data-lucide="trash-2" class="w-5 h-5"></i></button>` : ''}
            </div>
            <div class="form-group">
                <label for="total-monthly-payment-${scenarioIndex}">Total Monthly Payment ($)</label>
                <input type="number" id="total-monthly-payment-${scenarioIndex}" name="total-monthly-payment" placeholder="e.g., 500" step="0.01" min="0">
            </div>
        </div>`;
    container.insertAdjacentHTML('beforeend', scenarioHTML);
    const newElement = document.getElementById(newScenarioId);
    if (typeof lucide !== 'undefined') lucide.createIcons({ context: newElement });
    setTimeout(() => {
        newElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        newElement.style.opacity = '1';
        newElement.style.transform = 'scale(1)';
        document.getElementById(`total-monthly-payment-${scenarioIndex}`).focus();
    }, 10);
}

function updateScenarioTitles() {
    const scenarios = document.querySelectorAll('#scenario-forms-container .scenario-input-item');
    scenarios.forEach((scenario, index) => {
        const scenarioNumericId = index + 1;
        scenario.dataset.scenarioId = scenarioNumericId;
        const titleEl = scenario.querySelector('.form-title-v3');
        const removeBtn = scenario.querySelector('.btn-remove-item');
        if (titleEl) titleEl.textContent = `Scenario ${scenarioNumericId}`;
        if (removeBtn) removeBtn.setAttribute('aria-label', `Remove Scenario ${scenarioNumericId}`);
        else if (scenarioNumericId > 1 && !removeBtn) {
            const header = scenario.querySelector('.card-header-v3');
            if(header) header.insertAdjacentHTML('beforeend', `<button type="button" class="btn-remove-item" aria-label="Remove Scenario ${scenarioNumericId}"><i data-lucide="trash-2" class="w-5 h-5"></i></button>`);
        } else if (scenarioNumericId === 1 && removeBtn) {
            removeBtn.remove();
        }
        scenario.querySelectorAll('label').forEach(label => { const oldFor = label.htmlFor; if (oldFor) label.htmlFor = oldFor.replace(/-(\d+)$/, `-${scenarioNumericId}`); });
        scenario.querySelectorAll('input').forEach(input => { const oldId = input.id; if (oldId) input.id = oldId.replace(/-(\d+)$/, `-${scenarioNumericId}`); });
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function collectAndProcessData() {
    const cardData = [];
    const cardEntries = document.querySelectorAll('#credit-card-forms-container .credit-card-item-card');
    let allCardsValid = true;
    cardEntries.forEach((entry) => {
        const cardNumericId = parseInt(entry.dataset.cardId);
        const nicknameInput = entry.querySelector(`input[id^="card-nickname-"]`);
        const balanceInput = entry.querySelector(`input[id^="current-balance-"]`);
        const interestRateInput = entry.querySelector(`input[id^="interest-rate-"]`);
        const minPaymentPercentageInput = entry.querySelector(`input[id^="min-payment-percentage-"]`);
        [nicknameInput, balanceInput, interestRateInput, minPaymentPercentageInput].forEach(inp => inp && inp.classList.remove('is-invalid'));
        const nickname = nicknameInput.value.trim();
        const balance = parseFloat(balanceInput.value);
        const interestRate = parseFloat(interestRateInput.value);
        const minPaymentPercentage = parseFloat(minPaymentPercentageInput.value);
        if (!nickname) { alert(`Error in Card ${cardNumericId}: Nickname is required.`); nicknameInput && nicknameInput.classList.add('is-invalid'); allCardsValid = false; }
        if (isNaN(balance) || balance < 0) { alert(`Error in Card ${cardNumericId} ('${nickname || 'N/A'}'): Balance must be a non-negative number.`); balanceInput && balanceInput.classList.add('is-invalid'); allCardsValid = false; }
        if (isNaN(interestRate) || interestRate < 0 || interestRate > 100) { alert(`Error in Card ${cardNumericId} ('${nickname || 'N/A'}'): Monthly Interest Rate must be between 0 and 100.`); interestRateInput && interestRateInput.classList.add('is-invalid'); allCardsValid = false; }
        if (isNaN(minPaymentPercentage) || minPaymentPercentage < 0 || minPaymentPercentage > 100) { alert(`Error in Card ${cardNumericId} ('${nickname || 'N/A'}'): Minimum Payment % must be between 0 and 100.`); minPaymentPercentageInput && minPaymentPercentageInput.classList.add('is-invalid'); allCardsValid = false; }
        if (allCardsValid) cardData.push({ id: cardNumericId, nickname, balance, interestRate: interestRate / 100, minPaymentPercentage: minPaymentPercentage / 100 });
    });
    if (!allCardsValid) return false;

    const scenarioData = [];
    const scenarioEntries = document.querySelectorAll('#scenario-forms-container .scenario-input-item');
    let allScenariosValid = true;
    scenarioEntries.forEach((entry) => {
        const scenarioNumericId = parseInt(entry.dataset.scenarioId);
        const totalPaymentInput = entry.querySelector(`input[id^="total-monthly-payment-"]`);
        totalPaymentInput.classList.remove('is-invalid');
        const totalPayment = parseFloat(totalPaymentInput.value);
        if (isNaN(totalPayment) || totalPayment <= 0) {
            alert(`Error in Scenario ${scenarioNumericId}: Total Monthly Payment must be a positive number.`);
            totalPaymentInput.classList.add('is-invalid'); allScenariosValid = false;
        } else {
            scenarioData.push({ id: `scenario-${scenarioNumericId}`, title: entry.querySelector('.form-title-v3').textContent, totalMonthlyPayment: totalPayment });
        }
    });
    if (!allScenariosValid) return false;
    if (cardData.length === 0) { alert("Please add at least one credit card."); return false; }
    if (scenarioData.length === 0) { alert("Please add at least one payment scenario."); return false; }

    const allScenarioResults = calculateAllScenarios(cardData, scenarioData);
    populateResultsSummaryCard(allScenarioResults, cardData);
    populateDetailedTabs(allScenarioResults, cardData);
    return true;
}

function populateResultsSummaryCard(allScenarioResults, initialCardsData) {
    const optimalHighlightEl = document.getElementById('optimal-strategy-highlight');
    const savingsInsightEl = document.getElementById('savings-insight-text');
    if (!optimalHighlightEl || !savingsInsightEl || !allScenarioResults || allScenarioResults.length === 0) return;

    const optimalScenario = allScenarioResults.reduce((prev, current) => (prev.totalInterestPaid < current.totalInterestPaid) ? prev : current);
    optimalHighlightEl.innerHTML = `<p class="flex items-center"><i data-lucide="check-circle" class="w-6 h-6 mr-2 text-green-400"></i> Best Choice: Paying <strong class="mx-1 text-white">$${optimalScenario.totalMonthlyPayment.toFixed(2)}/month</strong> is your most cost-effective plan.</p>`;

    let savingsText = "";
    if (allScenarioResults.length > 1) {
        const highestInterestScenario = allScenarioResults.filter(s => s.scenarioId !== optimalScenario.scenarioId)
                                       .reduce((prev, current) => (prev.totalInterestPaid > current.totalInterestPaid) ? prev : current, {totalInterestPaid: -1, monthsToPayOff: Infinity});
        if (highestInterestScenario.totalInterestPaid > optimalScenario.totalInterestPaid) {
            const interestSaved = highestInterestScenario.totalInterestPaid - optimalScenario.totalInterestPaid;
            const timeSoonerMonths = highestInterestScenario.monthsToPayOff - optimalScenario.monthsToPayOff;
            let timeText = "";
            if (timeSoonerMonths > 0) {
                const years = Math.floor(timeSoonerMonths / 12); const months = timeSoonerMonths % 12;
                if (years > 0) timeText += `<strong class="text-white">${years}</strong> year${years > 1 ? 's' : ''}`;
                if (months > 0) { if (years > 0) timeText += " and "; timeText += `<strong class="text-white">${months}</strong> month${months > 1 ? 's' : ''}`; }
            }
            savingsText = `By choosing this plan, you'll save <strong class="text-white">$${interestSaved.toFixed(2)}</strong> in interest`;
            if (timeText) savingsText += ` and be debt-free ${timeText} sooner`;
            savingsText += ` compared to the plan paying $${highestInterestScenario.totalMonthlyPayment.toFixed(2)}/month.`;
        } else { savingsText = "This is the most efficient plan you've entered."; }
    } else {
        savingsText = `This plan gets you debt-free in ${optimalScenario.monthsToPayOff} months, with $${optimalScenario.totalInterestPaid.toFixed(2)} in total interest.`;
    }
    savingsInsightEl.innerHTML = `<p>${savingsText}</p>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    renderScenarioBarChart(allScenarioResults, optimalScenario.scenarioId);
}

function renderScenarioBarChart(allScenarioResults, optimalScenarioId) {
    const ctx = document.getElementById('scenarioComparisonBarChart')?.getContext('2d');
    if (!ctx) return;
    if (window.scenarioBarChart) window.scenarioBarChart.destroy();

    const labels = allScenarioResults.map(s => s.title);
    const interestData = allScenarioResults.map(s => s.totalInterestPaid);
    const timeData = allScenarioResults.map(s => s.monthsToPayOff);
    const optimalIndex = allScenarioResults.findIndex(s => s.scenarioId === optimalScenarioId);

    const interestColors = allScenarioResults.map((s, i) => i === optimalIndex ? 'rgba(74, 222, 128, 0.7)' : 'rgba(251, 146, 60, 0.7)');
    const timeColors = allScenarioResults.map((s, i) => i === optimalIndex ? 'rgba(96, 165, 250, 0.8)' : 'rgba(59, 130, 246, 0.7)');

    window.scenarioBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Interest Paid', data: interestData,
                backgroundColor: interestColors,
                borderColor: interestColors.map(c => c.replace('0.7', '1')),
                borderWidth: 1, yAxisID: 'yInterest', order: 1
            }, {
                label: 'Time to Debt-Free (Months)', data: timeData,
                backgroundColor: timeColors,
                borderColor: timeColors.map(c => c.replace('0.7', '1').replace('0.8', '1')),
                borderWidth: 1, yAxisID: 'yTime', order: 2
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { tooltip: { mode: 'index', intersect: false }, legend: { position: 'bottom' } },
            scales: {
                x: { grid: { color: 'var(--glass-border-color)' } },
                yInterest: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Total Interest Paid ($)', color: 'rgba(251, 146, 60, 1)' }, grid: { color: 'var(--glass-border-color)' }, ticks:{color: 'rgba(251, 146, 60, 1)'} },
                yTime: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Months to Debt-Free', color: 'rgba(96, 165, 250, 1)' }, grid: { drawOnChartArea: false }, ticks:{color: 'rgba(96, 165, 250, 1)'} }
            }
        }
    });
}

function populateDetailedTabs(allScenarioResults, initialCardsData) {
    const tabListContainer = document.getElementById('detailed-scenario-breakdown').querySelector('[role="tablist"]');
    const tabContentContainer = document.getElementById('detailed-scenario-breakdown').querySelector('.tab-content-container');
    tabListContainer.innerHTML = ''; tabContentContainer.innerHTML = '';
    if (!allScenarioResults || allScenarioResults.length === 0) return;
    window.detailedAreaCharts = window.detailedAreaCharts || {};

    allScenarioResults.forEach((scenario, index) => {
        const tabId = `tab-${scenario.scenarioId.replace(/\s+/g, '-')}`;
        const panelId = `panel-${scenario.scenarioId.replace(/\s+/g, '-')}`;
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-button'; tabButton.role = 'tab';
        tabButton.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        tabButton.setAttribute('aria-controls', panelId); tabButton.id = tabId;
        tabButton.textContent = scenario.title;
        if (index === 0) tabButton.classList.add('is-active');
        tabButton.addEventListener('click', () => {
            tabListContainer.querySelectorAll('.tab-button').forEach(btn => { btn.classList.remove('is-active'); btn.setAttribute('aria-selected', 'false'); });
            tabContentContainer.querySelectorAll('.tab-content-panel').forEach(panel => { panel.style.display = 'none'; panel.classList.remove('is-active'); });
            tabButton.classList.add('is-active'); tabButton.setAttribute('aria-selected', 'true');
            const targetPanel = document.getElementById(panelId);
            if (targetPanel) { targetPanel.style.display = 'block'; targetPanel.classList.add('is-active'); }
        });
        tabListContainer.appendChild(tabButton);

        const tabPanel = document.createElement('div');
        tabPanel.className = 'tab-content-panel'; tabPanel.id = panelId;
        tabPanel.setAttribute('role', 'tabpanel'); tabPanel.setAttribute('aria-labelledby', tabId);
        if (index !== 0) tabPanel.style.display = 'none';
        if (index === 0) tabPanel.classList.add('is-active');

        const years = Math.floor(scenario.monthsToPayOff / 12); const months = scenario.monthsToPayOff % 12;
        let timeText = (years > 0 ? `${years} yr${years > 1 ? 's' : ''} ` : '') + (months > 0 || years === 0 ? `${months} mo${months > 1 ? 's' : ''}` : '');
        if (timeText.trim() === "" && scenario.monthsToPayOff === 0 && scenario.totalPrincipalPaid > 0) timeText = "Instant"; else if (timeText.trim() === "") timeText = "N/A";

        const tableRows = scenario.monthlyBreakdown.map(m => {
            let overallStartingBalanceForMonth = 0;
            if (m.month === 1) overallStartingBalanceForMonth = initialCardsData.reduce((sum, card) => sum + card.balance, 0);
            else {
                const prevMonthBreakdown = scenario.monthlyBreakdown.find(prev_m => prev_m.month === m.month -1);
                if(prevMonthBreakdown) overallStartingBalanceForMonth = prevMonthBreakdown.cards.reduce((sum, card) => sum + card.endingBalance, 0);
            }
            const overallEndingBalanceForMonth = m.cards.reduce((sum, card) => sum + card.endingBalance, 0);
            return `<tr><td>${m.month}</td><td>$${overallStartingBalanceForMonth.toFixed(2)}</td><td>$${m.totalPaymentThisMonth.toFixed(2)}</td><td>$${m.totalInterestThisMonth.toFixed(2)}</td><td>$${Math.max(0, overallEndingBalanceForMonth).toFixed(2)}</td></tr>`;
        }).join('');

        const stackedAreaChartCanvasId = `stackedAreaChart-${scenario.scenarioId.replace(/\s+/g, '-')}`;
        tabPanel.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center my-4">
                <div class="glass-card p-4 rounded-lg"><div class="text-sm text-gray-400">Time to Debt-Free</div><div class="text-xl font-bold text-white">${timeText}</div></div>
                <div class="glass-card p-4 rounded-lg"><div class="text-sm text-gray-400">Total Interest Paid</div><div class="text-xl font-bold text-red-400">$${scenario.totalInterestPaid.toFixed(2)}</div></div>
                <div class="glass-card p-4 rounded-lg"><div class="text-sm text-gray-400">Total Principal Paid</div><div class="text-xl font-bold text-green-400">$${scenario.totalPrincipalPaid.toFixed(2)}</div></div>
            </div>
            <div class="h-80 relative mt-6"><canvas id="${stackedAreaChartCanvasId}"></canvas></div>
            <div class="overflow-x-auto mt-6">
                <table class="month-by-month-table w-full">
                    <thead><tr><th>Month</th><th>Starting Balance</th><th>Payment</th><th>Interest</th><th>Ending Balance</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>`;
        tabContentContainer.appendChild(tabPanel);
        const stackedAreaCtx = document.getElementById(stackedAreaChartCanvasId)?.getContext('2d');
        if(stackedAreaCtx) renderStackedAreaChart(stackedAreaCtx, scenario, initialCardsData); else console.error("Canvas not found for " + stackedAreaChartCanvasId);
    });
}

function renderStackedAreaChart(ctx, scenarioResult, initialCardsData) {
    if (!ctx) { console.error("renderStackedAreaChart: context is null for scenario", scenarioResult.scenarioId); return; }
    const numMonths = scenarioResult.monthsToPayOff;
    const labels = ['Initial', ...Array.from({ length: numMonths }, (_, i) => `M${i + 1}`)];
    const datasets = [];
    const cardColors = ['rgba(59, 130, 246, 0.5)', 'rgba(16, 185, 129, 0.5)', 'rgba(239, 68, 68, 0.5)', 'rgba(107, 114, 128, 0.5)', 'rgba(20, 184, 166, 0.5)'];

    initialCardsData.forEach((initialCard, cardIndex) => {
        const cardBalanceHistory = [initialCard.balance];
        scenarioResult.monthlyBreakdown.forEach(monthData => {
            const cardMonthDetail = monthData.cards.find(c => c.id === initialCard.id);
            cardBalanceHistory.push(cardMonthDetail ? Math.max(0, cardMonthDetail.endingBalance) : cardBalanceHistory[cardBalanceHistory.length - 1]);
        });
        datasets.push({
            label: initialCard.nickname, data: cardBalanceHistory, tension: 0.2, fill: true,
            backgroundColor: cardColors[cardIndex % cardColors.length],
            borderColor: cardColors[cardIndex % cardColors.length].replace('0.5', '1'),
            pointRadius: 0, pointHitRadius: 10
        });
    });

    const chartId = `stackedArea-${scenarioResult.scenarioId.replace(/\s+/g, '-')}`;
    if (window.detailedAreaCharts[chartId]) window.detailedAreaCharts[chartId].destroy();
    window.detailedAreaCharts[chartId] = new Chart(ctx, {
        type: 'line', data: { labels: labels, datasets: datasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: {
                y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Debt Balance ($)' }, grid: { color: 'var(--glass-border-color)' } },
                x: { title: { display: true, text: 'Months' }, grid: { color: 'var(--glass-border-color)' } }
            },
            interaction: { mode: 'index', intersect: false },
        }
    });
}

function setupTooltips() {
    let currentTooltip = null;
    function showTooltip(triggerElement) {
        const tooltipText = triggerElement.dataset.tooltipText;
        if (!tooltipText) return;
        hideTooltip();
        currentTooltip = document.createElement('div');
        currentTooltip.className = 'p-2 bg-gray-800 text-white text-xs rounded-md absolute z-10';
        currentTooltip.textContent = tooltipText;
        document.body.appendChild(currentTooltip);
        const rect = triggerElement.getBoundingClientRect();
        let top = rect.top + window.scrollY - currentTooltip.offsetHeight - 8;
        let left = rect.left + window.scrollX + (rect.width / 2) - (currentTooltip.offsetWidth / 2);
        if (top < window.scrollY + 8) top = rect.bottom + window.scrollY + 8;
        if (left < window.scrollX + 8) left = window.scrollX + 8;
        if (left + currentTooltip.offsetWidth > window.scrollX + document.documentElement.clientWidth - 8) {
            left = window.scrollX + document.documentElement.clientWidth - 8 - currentTooltip.offsetWidth;
        }
        currentTooltip.style.top = `${top}px`; currentTooltip.style.left = `${left}px`;
        currentTooltip.style.opacity = '1';
    }
    function hideTooltip() { if (currentTooltip) { currentTooltip.remove(); currentTooltip = null; } }
    document.body.addEventListener('mouseover', e => { if (e.target.closest('.tooltip-trigger')) showTooltip(e.target.closest('.tooltip-trigger')); });
    document.body.addEventListener('mouseout', e => { if (e.target.closest('.tooltip-trigger')) hideTooltip(); });
    document.body.addEventListener('focusin', e => { if (e.target.closest('.tooltip-trigger')) showTooltip(e.target.closest('.tooltip-trigger')); });
    document.body.addEventListener('focusout', e => { if (e.target.closest('.tooltip-trigger')) hideTooltip(); });
}

function calculateAllScenarios(initialCardsData, scenariosInput) {
    const results = [];
    scenariosInput.forEach(scenarioInput => {
        let currentCardsData = JSON.parse(JSON.stringify(initialCardsData));
        let months = 0;
        let totalInterestPaidForScenario = 0;
        let totalPrincipalPaidForScenario = 0;
        const monthlyBreakdown = [];
        while (currentCardsData.some(card => card.balance > 0)) {
            months++;
            if (months > 1200) {
                monthlyBreakdown.push({ month: months, warning: "Calculation stopped (100yr limit)." }); break;
            }
            let monthDetail = { month: months, cards: [], totalPaymentThisMonth: 0, totalInterestThisMonth: 0, totalPrincipalPaidThisMonth: 0 };
            const paymentAllocations = allocatePaymentsAvalanche(currentCardsData, scenarioInput.totalMonthlyPayment);
            let scenarioTotalActualPaymentThisMonth = 0;
            currentCardsData.forEach(card => {
                if (card.balance <= 0) {
                    monthDetail.cards.push({ id: card.id, nickname: card.nickname, startingBalance: 0, payment: 0, interestPaid: 0, principalPaid: 0, endingBalance: 0 }); return;
                }
                const allocation = paymentAllocations.find(a => a.cardId === card.id);
                let paymentForThisCard = allocation ? allocation.paymentAmount : 0;
                const cardInitialBalanceForMonth = card.balance;
                const interestForMonthOnCard = calculateMonthlyInterest(card.balance, card.interestRate);
                const amountToPayOffCompletely = card.balance + interestForMonthOnCard;
                if (paymentForThisCard > amountToPayOffCompletely) paymentForThisCard = amountToPayOffCompletely;

                const paymentResult = simulateOneMonthPayment(card, paymentForThisCard);
                card.balance = paymentResult.newBalance;
                totalInterestPaidForScenario += paymentResult.interestPaid;
                totalPrincipalPaidForScenario += paymentResult.principalPaid;
                scenarioTotalActualPaymentThisMonth += paymentForThisCard;
                monthDetail.totalInterestThisMonth += paymentResult.interestPaid;
                monthDetail.totalPrincipalPaidThisMonth += paymentResult.principalPaid;
                monthDetail.cards.push({
                    id: card.id, nickname: card.nickname,
                    startingBalance: cardInitialBalanceForMonth, payment: paymentForThisCard,
                    interestPaid: paymentResult.interestPaid, principalPaid: paymentResult.principalPaid,
                    endingBalance: card.balance
                });
            });
            monthDetail.totalPaymentThisMonth = scenarioTotalActualPaymentThisMonth;
            monthlyBreakdown.push(monthDetail);
        }
        results.push({
            scenarioId: scenarioInput.id,
            title: scenarioInput.title,
            totalMonthlyPayment: scenarioInput.totalMonthlyPayment,
            monthsToPayOff: months,
            totalInterestPaid: parseFloat(totalInterestPaidForScenario.toFixed(2)),
            totalPrincipalPaid: parseFloat(totalPrincipalPaidForScenario.toFixed(2)),
            monthlyBreakdown: monthlyBreakdown
        });
    });
    return results;
}
// Ensure calculation_engine.js is loaded before this script.
