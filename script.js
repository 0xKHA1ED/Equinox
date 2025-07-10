// Main JavaScript file for the Credit Card Debt Visualizer

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // --- Chart.js Global Styling ---
    try {
        Chart.defaults.font.family = "'Inter', 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
        Chart.defaults.color = '#212529'; // --color-text-primary
        Chart.defaults.borderColor = '#DEE2E6'; // --color-border
        Chart.defaults.animation.duration = 800; // Default animation duration
        Chart.defaults.animation.easing = 'easeOutQuart';
    } catch (e) {
        console.warn("Could not set Chart.js defaults.", e);
    }

    // --- Element References ---
    const addCardBtn = document.getElementById('add-card-btn');
    const creditCardFormsContainer = document.getElementById('credit-card-forms-container');
    let cardCount = 1;

    const addScenarioBtn = document.getElementById('add-scenario-btn');
    const scenarioFormsContainer = document.getElementById('scenario-forms-container');
    let scenarioCount = 1;

    const stage1WelcomeInput = document.getElementById('stage-1-welcome-input');
    const stage2Scenarios = document.getElementById('stage-2-scenarios');
    const stage3Results = document.getElementById('stage-3-results');
    const calculateBtn = document.getElementById('calculate-btn');
    const firstCardBalanceInput = document.getElementById('current-balance-1');

    // --- Stage Management ---
    function revealStage(stageElement, focusElementId = null) {
        if (stageElement && stageElement.style.display === 'none') {
            stageElement.style.display = 'block';
            setTimeout(() => {
                stageElement.classList.add('is-visible');
                if (focusElementId) {
                    const elToFocus = document.getElementById(focusElementId);
                    if (elToFocus) elToFocus.focus();
                }
            }, 10); // Small delay to allow display:block to take effect before transition
        }
    }
    if (stage1WelcomeInput) stage1WelcomeInput.classList.add('is-visible'); // Stage 1 is visible by default

    // Reveal Stage 2
    if (firstCardBalanceInput && stage2Scenarios) {
        firstCardBalanceInput.addEventListener('blur', () => {
            if (parseFloat(firstCardBalanceInput.value) > 0 && stage2Scenarios.style.display === 'none') {
                revealStage(stage2Scenarios, 'total-monthly-payment-1'); // Focus first scenario input
            }
        });
    }

    // --- Event Listeners ---
    if (addCardBtn) {
        addCardBtn.addEventListener('click', () => {
            cardCount++;
            const newCardFormHTML = `
                <div class="card-input-form-container container-card">
                    <h2 class="form-title">Card ${cardCount}</h2>
                    <div class="form-group">
                        <label for="card-nickname-${cardCount}">Card Nickname</label>
                        <input type="text" id="card-nickname-${cardCount}" name="card-nickname" placeholder="e.g., Store Card">
                    </div>
                    <div class="form-group">
                        <label for="current-balance-${cardCount}">Current Balance ($)</label>
                        <input type="number" id="current-balance-${cardCount}" name="current-balance" placeholder="e.g., 1000" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label for="interest-rate-${cardCount}">Monthly Interest Rate (%)</label>
                        <input type="number" id="interest-rate-${cardCount}" name="interest-rate" placeholder="e.g., 2.0" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label for="min-payment-percentage-${cardCount}">Minimum Monthly Payment (% of Balance)</label>
                        <input type="number" id="min-payment-percentage-${cardCount}" name="min-payment-percentage" placeholder="e.g., 3" step="0.01" min="0">
                        <span class="tooltip-trigger" tabindex="0" aria-label="Information about minimum payment percentage" data-tooltip-text="Find this percentage on your monthly statement. It's usually 1-3% of your balance.">?</span>
                    </div>
                </div>`;
            creditCardFormsContainer.insertAdjacentHTML('beforeend', newCardFormHTML);
        });
    }

    if (addScenarioBtn) {
        addScenarioBtn.addEventListener('click', () => {
            scenarioCount++;
            const newScenarioFormHTML = `
                <div class="scenario-input-form">
                    <h3 class="form-title">Scenario ${scenarioCount}</h3>
                    <div class="form-group">
                        <label for="total-monthly-payment-${scenarioCount}">Total Monthly Payment ($)</label>
                        <input type="number" id="total-monthly-payment-${scenarioCount}" name="total-monthly-payment" placeholder="e.g., 700" step="0.01" min="0">
                    </div>
                </div>`;
            scenarioFormsContainer.insertAdjacentHTML('beforeend', newScenarioFormHTML);
            document.getElementById(`total-monthly-payment-${scenarioCount}`).focus();
        });
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            calculateBtn.disabled = true;
            calculateBtn.innerHTML = '<span class="spinner"></span> Calculating...';
            const keyInsightCalloutEl = document.getElementById('key-insight-callout');
            if (keyInsightCalloutEl) keyInsightCalloutEl.innerHTML = '<p>Calculating your best options...</p>';

            // Clear previous results
            document.getElementById('scenario-comparison-cards-container').innerHTML = '';
            document.getElementById('detailed-breakdown-accordion-container').innerHTML = '';
            if (window.myComparisonChart) window.myComparisonChart.destroy();
            if (window.detailedChartInstances) {
                Object.values(window.detailedChartInstances).forEach(chart => chart.destroy());
                window.detailedChartInstances = {};
            }

            setTimeout(() => { // Simulate delay
                const collectionSuccess = collectAndProcessData();
                calculateBtn.disabled = false;
                calculateBtn.innerHTML = 'Calculate Repayment Options';
                if (collectionSuccess) {
                    revealStage(stage3Results);
                    stage3Results.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    if (keyInsightCalloutEl) keyInsightCalloutEl.innerHTML = '<p style="color: var(--color-alert-negative);">Please correct the errors in your inputs and try again.</p>';
                }
            }, 500);
        });
    }

    // Tooltip Functionality
    let currentTooltip = null;
    function showTooltip(triggerElement) {
        const tooltipText = triggerElement.dataset.tooltipText;
        if (!tooltipText) return;

        hideTooltip(); // Hide any existing tooltip

        currentTooltip = document.createElement('div');
        currentTooltip.className = 'info-tooltip-popup';
        currentTooltip.textContent = tooltipText;
        document.body.appendChild(currentTooltip);

        const rect = triggerElement.getBoundingClientRect();
        let top = rect.top + window.scrollY - currentTooltip.offsetHeight - 8; // 8px offset
        let left = rect.left + window.scrollX + (rect.width / 2) - (currentTooltip.offsetWidth / 2);

        // Adjust if out of viewport (simple adjustment)
        if (top < window.scrollY + 8) top = rect.bottom + window.scrollY + 8;
        if (left < window.scrollX + 8) left = window.scrollX + 8;
        if (left + currentTooltip.offsetWidth > window.scrollX + document.documentElement.clientWidth - 8) {
            left = window.scrollX + document.documentElement.clientWidth - 8 - currentTooltip.offsetWidth;
        }

        currentTooltip.style.top = `${top}px`;
        currentTooltip.style.left = `${left}px`;
        currentTooltip.style.display = 'block'; // Make visible
        setTimeout(() => currentTooltip.classList.add('is-visible'), 10); // For fade-in
    }
    function hideTooltip() {
        if (currentTooltip) {
            currentTooltip.remove();
            currentTooltip = null;
        }
    }
    document.body.addEventListener('mouseover', e => e.target.classList.contains('tooltip-trigger') && showTooltip(e.target));
    document.body.addEventListener('mouseout', e => e.target.classList.contains('tooltip-trigger') && hideTooltip());
    document.body.addEventListener('focusin', e => e.target.classList.contains('tooltip-trigger') && showTooltip(e.target));
    document.body.addEventListener('focusout', e => e.target.classList.contains('tooltip-trigger') && hideTooltip());
    document.querySelectorAll('.tooltip-trigger').forEach(el => el.setAttribute('tabindex', '0'));

}); // End DOMContentLoaded


function collectAndProcessData() {
    const cardData = [];
    const cardEntries = document.querySelectorAll('#credit-card-forms-container .card-input-form-container');
    let allCardsValid = true;
    cardEntries.forEach((entry, index) => {
        if (!allCardsValid) return;
        const nicknameInput = entry.querySelector('input[name="card-nickname"]');
        const balanceInput = entry.querySelector('input[name="current-balance"]');
        const interestRateInput = entry.querySelector('input[name="interest-rate"]');
        const minPaymentPercentageInput = entry.querySelector('input[name="min-payment-percentage"]');

        const nickname = nicknameInput.value.trim();
        const balance = parseFloat(balanceInput.value);
        const interestRate = parseFloat(interestRateInput.value);
        const minPaymentPercentage = parseFloat(minPaymentPercentageInput.value);

        if (!nickname) { alert(`Error in Card ${index + 1}: Nickname cannot be empty.`); allCardsValid = false; }
        if (isNaN(balance) || balance < 0) { alert(`Error in Card ${index + 1} ('${nickname || 'N/A'}'): Balance must be non-negative.`); allCardsValid = false; }
        if (isNaN(interestRate) || interestRate < 0 || interestRate > 100) { alert(`Error in Card ${index + 1} ('${nickname || 'N/A'}'): Interest Rate must be 0-100.`); allCardsValid = false; }
        if (isNaN(minPaymentPercentage) || minPaymentPercentage < 0 || minPaymentPercentage > 100) { alert(`Error in Card ${index + 1} ('${nickname || 'N/A'}'): Min. Payment % must be 0-100.`); allCardsValid = false; }

        if (allCardsValid) {
            cardData.push({ id: index + 1, nickname, balance, interestRate: interestRate / 100, minPaymentPercentage: minPaymentPercentage / 100 });
        }
    });
    if (!allCardsValid) return false;

    let combinedMinPayment = 0;
    cardData.forEach(card => {
        if (card.balance > 0) {
            let minPayForCard = card.balance * card.minPaymentPercentage;
            minPayForCard = Math.max(10, minPayForCard);
            minPayForCard = Math.min(minPayForCard, card.balance + calculateMonthlyInterest(card.balance, card.interestRate));
            combinedMinPayment += minPayForCard;
        }
    });
    document.getElementById('combined-min-payment-display').textContent = `$${combinedMinPayment.toFixed(2)}`;
    const firstScenarioInput = document.getElementById('total-monthly-payment-1');
    if (firstScenarioInput.value.trim() === '' && combinedMinPayment > 0) {
        firstScenarioInput.value = combinedMinPayment.toFixed(2);
    }

    const scenarioData = [];
    const scenarioEntries = document.querySelectorAll('#scenario-forms-container .scenario-input-form');
    let allScenariosValid = true;
    scenarioEntries.forEach((entry, index) => {
        if (!allScenariosValid) return;
        const totalPaymentInput = entry.querySelector('input[name="total-monthly-payment"]');
        const totalPayment = parseFloat(totalPaymentInput.value);
        if (isNaN(totalPayment) || totalPayment <= 0) {
            alert(`Error in Scenario ${index + 1}: Total Monthly Payment must be > 0.`); allScenariosValid = false;
        } else {
            scenarioData.push({ id: `scenario-${index + 1}`, totalMonthlyPayment: totalPayment, title: entry.querySelector('.form-title').textContent });
        }
    });
    if (!allScenariosValid) return false;

    if (cardData.length === 0) { alert("Please add at least one credit card."); return false; }
    if (scenarioData.length === 0) { alert("Please add at least one repayment scenario."); return false; }

    const allScenarioResults = calculateAllScenarios(cardData, scenarioData);
    populateKeyInsightCallout(allScenarioResults, cardData);
    populateScenarioComparisonCards(allScenarioResults, cardData);
    renderComparisonBarChart(allScenarioResults);
    return true;
}

function populateKeyInsightCallout(allScenarioResults, initialCardsData) {
    const calloutEl = document.getElementById('key-insight-callout');
    if (!calloutEl || !allScenarioResults || allScenarioResults.length === 0) {
        if (calloutEl) calloutEl.innerHTML = '<p>Enter your card and scenario details to see insights here.</p>';
        return;
    }
    let optimalByInterest = allScenarioResults.reduce((prev, current) => (prev.totalInterestPaid < current.totalInterestPaid) ? prev : current);
    let savingsText = "";
    if (allScenarioResults.length > 1) {
        let worstRelevantScenario = null;
        let highestInterest = -Infinity; // Corrected initialization
        allScenarioResults.forEach(s => {
            if (s.scenarioId !== optimalByInterest.scenarioId) {
                if (s.totalInterestPaid > highestInterest) {
                    highestInterest = s.totalInterestPaid;
                    worstRelevantScenario = s;
                }
            }
        });
        if (worstRelevantScenario && worstRelevantScenario.totalInterestPaid > optimalByInterest.totalInterestPaid) {
            const interestSaved = worstRelevantScenario.totalInterestPaid - optimalByInterest.totalInterestPaid;
            const timeSoonerMonths = worstRelevantScenario.monthsToPayOff - optimalByInterest.monthsToPayOff;
            let timeSoonerText = "";
            if (timeSoonerMonths > 0) {
                const yearsSooner = Math.floor(timeSoonerMonths / 12);
                const monthsPart = timeSoonerMonths % 12;
                if (yearsSooner > 0) timeSoonerText += `<strong>${yearsSooner}</strong> year${yearsSooner > 1 ? 's' : ''}`;
                if (monthsPart > 0) { if (yearsSooner > 0) timeSoonerText += " and "; timeSoonerText += `<strong>${monthsPart}</strong> month${monthsPart > 1 ? 's' : ''}`; }
            }
            if (timeSoonerText !== "") savingsText = `be debt-free ${timeSoonerText} sooner and save <strong>$${interestSaved.toFixed(2)}</strong> in interest!`;
            else if (interestSaved > 0) savingsText = `save <strong>$${interestSaved.toFixed(2)}</strong> in interest!`;
        }
    }
    if (!savingsText) {
        const years = Math.floor(optimalByInterest.monthsToPayOff / 12);
        const months = optimalByInterest.monthsToPayOff % 12;
        let timeToPayOffText = "";
        if (years > 0) timeToPayOffText += `<strong>${years}</strong> year${years > 1 ? 's' : ''} `;
        if (months > 0 || years === 0) { if (years > 0) timeToPayOffText += "and "; timeToPayOffText += `<strong>${months}</strong> month${months > 1 ? 's' : ''}`; }
        if (timeToPayOffText === "") timeToPayOffText = "<strong>less than a month</strong>";
        savingsText = `pay a total of <strong>$${optimalByInterest.totalInterestPaid.toFixed(2)}</strong> in interest and be debt-free in ${timeToPayOffText}.`;
    }
    calloutEl.innerHTML = `<p>With the recommended plan (paying <strong>$${optimalByInterest.totalMonthlyPayment.toFixed(2)}/month</strong>), you could ${savingsText}</p>`;
}

function populateScenarioComparisonCards(allScenarioResults, initialCardsData) {
    const container = document.getElementById('scenario-comparison-cards-container');
    if (!container || !allScenarioResults || allScenarioResults.length === 0) return;
    container.innerHTML = '';
    let optimalByInterest = allScenarioResults.reduce((prev, current) => (prev.totalInterestPaid < current.totalInterestPaid) ? prev : current);
    let highestInterestScenario = allScenarioResults.reduce((prev, current) => (prev.totalInterestPaid > current.totalInterestPaid) ? prev : current);

    allScenarioResults.forEach(scenario => {
        const years = Math.floor(scenario.monthsToPayOff / 12);
        const months = scenario.monthsToPayOff % 12;
        let timeToPayOffText = "";
        if (years > 0) timeToPayOffText += `${years} year${years > 1 ? 's' : ''}`;
        if (months > 0 || years === 0) { if (years > 0) timeToPayOffText += ", "; timeToPayOffText += `${months} month${months > 1 ? 's' : ''}`; }
        if (timeToPayOffText === "" && scenario.monthsToPayOff === 0 && scenario.totalPrincipalPaid > 0) timeToPayOffText = "Paid off instantly";
        else if (timeToPayOffText === "") timeToPayOffText = "N/A";

        const cardClasses = ['scenario-summary-card', 'container-card'];
        if (scenario.scenarioId === optimalByInterest.scenarioId) cardClasses.push('is-recommended');

        let interestClass = "metric-value";
        if (scenario.scenarioId === highestInterestScenario.scenarioId && scenario.scenarioId !== optimalByInterest.scenarioId) {
             interestClass = "metric-value metric-interest-alert";
        }

        const cardHTML = `
            <div class="${cardClasses.join(' ')}">
                ${scenario.scenarioId === optimalByInterest.scenarioId ? '<div class="scenario-badge recommended-badge">Recommended</div>' : ''}
                <h3 class="scenario-title">${scenario.title || `Scenario: $${scenario.totalMonthlyPayment.toFixed(2)}/month`}</h3>
                <p class="metric"><strong>Time to Debt-Free:</strong> <span class="metric-value">${timeToPayOffText}</span></p>
                <p class="metric"><strong>Total Interest Paid:</strong> <span class="${interestClass}">$${scenario.totalInterestPaid.toFixed(2)}</span></p>
                <p class="metric"><strong>Total Principal Paid:</strong> <span class="metric-value">$${scenario.totalPrincipalPaid.toFixed(2)}</span></p>
                <a href="#" class="details-link" data-scenario-id="${scenario.scenarioId}">See Detailed Breakdown &raquo;</a>
            </div>`;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });

    document.querySelectorAll('.details-link').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const scenarioId = event.target.dataset.scenarioId;
            const scenarioResult = allScenarioResults.find(r => r.scenarioId === scenarioId);
            const accordionContainer = document.getElementById('detailed-breakdown-accordion-container');
            const targetAccordionItemId = `accordion-item-${scenarioId}`;
            let targetAccordionItem = document.getElementById(targetAccordionItemId);
            const currentlyActiveItem = accordionContainer.querySelector('.accordion-item.is-active');

            if (currentlyActiveItem && currentlyActiveItem.id !== targetAccordionItemId) {
                currentlyActiveItem.classList.remove('is-active');
            }
            if (!targetAccordionItem && scenarioResult) {
                renderDetailedBreakdown(scenarioResult, initialCardsData, accordionContainer, targetAccordionItemId);
                targetAccordionItem = document.getElementById(targetAccordionItemId);
            }
            if (targetAccordionItem) {
                targetAccordionItem.classList.toggle('is-active');
                 if (targetAccordionItem.classList.contains('is-active')) {
                    setTimeout(() => targetAccordionItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 10);
                }
            }
        });
    });
}

function renderComparisonBarChart(allScenarioResults) {
    const comparisonChartCtx = document.getElementById('comparisonChart')?.getContext('2d');
    if (!comparisonChartCtx || !allScenarioResults || allScenarioResults.length === 0) return;
    const labels = allScenarioResults.map(res => res.title || `$${res.totalMonthlyPayment.toFixed(2)}/month`);
    const totalInterestData = allScenarioResults.map(res => res.totalInterestPaid);
    if (window.myComparisonChart) window.myComparisonChart.destroy();
    window.myComparisonChart = new Chart(comparisonChartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Interest Paid ($)',
                data: totalInterestData,
                backgroundColor: 'rgba(0, 123, 255, 0.6)', // Using primary action color with opacity
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label || ''}: $${ctx.parsed.y.toFixed(2)}` }}},
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Total Interest Paid ($)' }}, x: { title: { display: false }}}
        }
    });
}

function renderDetailedBreakdown(scenarioResult, initialCardsData, accordionContainer, accordionItemId) {
    if (!accordionContainer) return;
    const monthByMonthRows = scenarioResult.monthlyBreakdown.map(month => `
        <tr><td>${month.month}</td><td>$${month.totalPaymentThisMonth.toFixed(2)}</td><td>$${month.totalInterestThisMonth.toFixed(2)}</td><td>$${month.totalPrincipalPaidThisMonth.toFixed(2)}</td><td>$${Math.max(0, month.cards.reduce((s, c) => s + c.endingBalance, 0)).toFixed(2)}</td></tr>`).join('');
    const detailedChartCanvasId = `detailedLineChart-${scenarioResult.scenarioId.replace('scenario-','')}`; // Ensure unique ID
    const breakdownHTML = `
        <div class="accordion-item" id="${accordionItemId}">
            <div class="accordion-header"><h4>Detailed Breakdown for ${scenarioResult.title || `Scenario paying $${scenarioResult.totalMonthlyPayment.toFixed(2)}/month`}</h4></div>
            <div class="accordion-content">
                <p class="strategy-explanation">This plan uses the Debt Avalanche method. Extra payments are applied to your highest-interest card first to save you the most money.</p>
                <div class="table-responsive"><table class="month-by-month-table">
                    <thead><tr><th>Month</th><th>Total Payment</th><th>Interest Paid</th><th>Principal Paid</th><th>Overall Ending Balance</th></tr></thead>
                    <tbody>${monthByMonthRows}</tbody>
                </table></div>
                <canvas id="${detailedChartCanvasId}" style="margin-top: 20px; max-height:300px;"></canvas>
            </div></div>`;
    accordionContainer.insertAdjacentHTML('beforeend', breakdownHTML);
    const detailedCtx = document.getElementById(detailedChartCanvasId)?.getContext('2d');
    if (detailedCtx) renderDetailedLineChartForScenario(detailedCtx, scenarioResult, initialCardsData);
}

function renderDetailedLineChartForScenario(ctx, scenarioResult, initialCardsData) {
    const numMonths = scenarioResult.monthsToPayOff;
    const detailedLabels = ['Initial', ...Array.from({ length: numMonths }, (_, i) => `M${i + 1}`)]; // Shorter month labels
    const datasets = [];
    const chartColors = ['#007BFF', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#20c997'];

    const overallDebtData = [initialCardsData.reduce((s, c) => s + c.balance, 0)];
    let runningTotalDebt = overallDebtData[0];
    scenarioResult.monthlyBreakdown.forEach(monthData => {
        runningTotalDebt -= monthData.totalPrincipalPaidThisMonth;
        overallDebtData.push(Math.max(0, runningTotalDebt));
    });
    datasets.push({ label: 'Overall Debt', data: overallDebtData, borderColor: chartColors[0], backgroundColor: 'rgba(0,123,255,0.1)', fill: true, tension: 0.1 });

    initialCardsData.forEach((initialCard, cardIndex) => {
        const cardDebtData = [initialCard.balance];
        let currentCardBalance = initialCard.balance;
        scenarioResult.monthlyBreakdown.forEach(monthData => {
            const cardMonthDetail = monthData.cards.find(c => c.id === initialCard.id);
            currentCardBalance = cardMonthDetail ? cardMonthDetail.endingBalance : currentCardBalance;
            cardDebtData.push(Math.max(0, currentCardBalance));
        });
        datasets.push({ label: `${initialCard.nickname}`, data: cardDebtData, borderColor: chartColors[(cardIndex + 1) % chartColors.length], fill: false, tension: 0.1, borderDash: [5, 5] });
    });

    if (window.detailedChartInstances[scenarioResult.scenarioId]) window.detailedChartInstances[scenarioResult.scenarioId].destroy();
    window.detailedChartInstances[scenarioResult.scenarioId] = new Chart(ctx, {
        type: 'line', data: { labels: detailedLabels, datasets: datasets },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: false }, legend: { position: 'bottom', labels:{boxWidth:12,padding:10} }}, scales: { y: { beginAtZero: true, title: { display: true, text: 'Remaining Debt ($)' }}, x: { title: { display: true, text: 'Months' }}}}
    });
}

// --- Calculation Engine (Copied from calculation_engine.js for simplicity in this single file, or keep separate) ---
// calculation_engine.js content would go here if merging. For now, assuming it's included separately in HTML.
// Ensure calculateMonthlyInterest, simulateOneMonthPayment, allocatePaymentsAvalanche are available.

// (The actual calculation_engine.js content is not included here for brevity, but it's used by calculateAllScenarios)
// Make sure calculation_engine.js is loaded before this script in index.html
