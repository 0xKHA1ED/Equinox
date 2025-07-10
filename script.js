// V3 Design - Credit Card Debt Visualizer - script.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("V3 DOM fully loaded and parsed");

    // --- Chart.js Global Styling (V3) ---
    try {
        Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
        Chart.defaults.color = '#343A40'; // var(--color-text-primary)
        Chart.defaults.borderColor = '#DEE2E6'; // var(--color-border)
        Chart.defaults.animation.duration = 600;
        Chart.defaults.animation.easing = 'easeOutCubic';
        Chart.defaults.plugins.tooltip.backgroundColor = '#1C3D5A';
        Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';
        Chart.defaults.plugins.tooltip.bodyColor = '#F8F9FA';
        Chart.defaults.plugins.tooltip.padding = 8;
        Chart.defaults.plugins.tooltip.cornerRadius = 4;
        Chart.defaults.plugins.legend.labels.boxWidth = 12;
        Chart.defaults.plugins.legend.labels.padding = 15;
    } catch (e) {
        console.warn("Could not set Chart.js V3 defaults.", e);
    }

    // --- Element References (V3) ---
    const addCardBtn = document.getElementById('add-card-btn');
    const creditCardFormsContainer = document.getElementById('credit-card-forms-container');

    const addScenarioBtn = document.getElementById('add-scenario-btn');
    const scenarioFormsContainer = document.getElementById('scenario-forms-container');

    const calculateBtn = document.getElementById('calculate-btn');
    const resultsSection = document.getElementById('results-section');

    window.detailedAreaCharts = {}; // To store instances of detailed charts for destruction
    window.scenarioBarChart = null; // For the main comparison bar chart

    addCardFormV3();
    addScenarioFormV3();

    // --- Event Listeners (V3) ---
    if (addCardBtn) addCardBtn.addEventListener('click', addCardFormV3);
    if (addScenarioBtn) addScenarioBtn.addEventListener('click', addScenarioFormV3);

    document.addEventListener('click', function(event) {
        if (event.target && event.target.closest('.btn-remove-item')) {
            const itemToRemove = event.target.closest('.credit-card-item-card, .scenario-input-item');
            if (itemToRemove) {
                itemToRemove.classList.add('is-removing');
                setTimeout(() => {
                    itemToRemove.remove();
                    if (itemToRemove.classList.contains('credit-card-item-card')) updateCardTitlesV3();
                    else if (itemToRemove.classList.contains('scenario-input-item')) updateScenarioTitlesV3();
                }, 300);
            }
        }
    });

    if (calculateBtn) {
        const originalCalculateBtnHTML = calculateBtn.innerHTML; // Store original content

        calculateBtn.addEventListener('click', () => {
            calculateBtn.disabled = true;
            // Use Lucide spinner icon directly if available, or fallback to CSS spinner
            calculateBtn.innerHTML = '<i data-lucide="loader-2" class="spinner-icon lucide-spin"></i> Calculating...';
            if (typeof lucide !== 'undefined') lucide.createIcons();


            const optimalHighlightEl = document.getElementById('optimal-strategy-highlight');
            if (optimalHighlightEl) optimalHighlightEl.innerHTML = '<p>Crunching the numbers...</p>';
            document.getElementById('savings-insight-text').innerHTML = '';

            const barChartCanvas = document.getElementById('scenarioComparisonBarChart');
            if (barChartCanvas && window.scenarioBarChart) {
                 window.scenarioBarChart.destroy();
                 window.scenarioBarChart = null;
            }
            document.getElementById('detailed-scenario-breakdown').querySelector('.tab-list-container').innerHTML = '';
            document.getElementById('detailed-scenario-breakdown').querySelector('.tab-content-container').innerHTML = '';
            if (window.detailedAreaCharts) {
                Object.values(window.detailedAreaCharts).forEach(chart => chart.destroy());
                window.detailedAreaCharts = {};
            }

            setTimeout(() => {
                const collectionSuccess = collectAndProcessDataV3();
                calculateBtn.disabled = false;
                calculateBtn.innerHTML = originalCalculateBtnHTML; // Restore original content
                if (typeof lucide !== 'undefined') lucide.createIcons(); // Re-render icons if any in original HTML

                if (collectionSuccess) {
                    resultsSection.style.display = 'block';
                    setTimeout(() => resultsSection.classList.add('is-visible'), 10);
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    if (optimalHighlightEl) optimalHighlightEl.innerHTML = '<p style="color: var(--color-alert-negative);">Please correct errors in your inputs and try again.</p>';
                    resultsSection.style.display = 'none';
                    resultsSection.classList.remove('is-visible');
                }
            }, 500);
        });
    }

    setupTooltipsV3();
}); // End DOMContentLoaded


function addCardFormV3() {
    const container = document.getElementById('credit-card-forms-container');
    const cardIndex = container.querySelectorAll('.credit-card-item-card').length + 1;
    const newCardId = `card-item-dynamic-${Date.now()}`; // Unique ID for element

    const cardHTML = `
        <div class="credit-card-item-card dynamic-item-card is-adding" id="${newCardId}" data-card-id="${cardIndex}">
            <div class="card-header-v3">
                <h3 class="form-title-v3">Credit Card ${cardIndex}</h3>
                ${cardIndex > 1 ? `<button type="button" class="btn btn-destructive btn-remove-item btn-sm-v3" aria-label="Remove Card ${cardIndex}"><i data-lucide="trash-2" class="btn-icon"></i></button>` : ''}
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
                <span class="tooltip-trigger-v3" tabindex="0" data-tooltip-text="Your APR divided by 12. E.g., 18% APR is 1.5% monthly."><i data-lucide="info" class="icon-info"></i></span>
            </div>
            <div class="form-group">
                <label for="min-payment-percentage-${cardIndex}">Minimum Payment (%)</label>
                <input type="number" id="min-payment-percentage-${cardIndex}" name="min-payment-percentage" placeholder="e.g., 2" step="0.01" min="0">
                <span class="tooltip-trigger-v3" tabindex="0" data-tooltip-text="Found on your statement, usually 1-3% of balance or a flat fee."><i data-lucide="info" class="icon-info"></i></span>
            </div>
        </div>`;
    container.insertAdjacentHTML('beforeend', cardHTML);
    const newElement = document.getElementById(newCardId);
    if (typeof lucide !== 'undefined') lucide.createIcons({ context: newElement }); // Render icons within the new element
    setTimeout(() => {
        newElement.classList.remove('is-adding');
        document.getElementById(`card-nickname-${cardIndex}`).focus();
    }, 10);
}

function updateCardTitlesV3() {
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
            if(header) header.insertAdjacentHTML('beforeend', `<button type="button" class="btn btn-destructive btn-remove-item btn-sm-v3" aria-label="Remove Card ${cardNumericId}"><span class="icon-trash-2">&times;</span></button>`);
        } else if (cardNumericId === 1 && removeBtn) {
            removeBtn.remove();
        }
        card.querySelectorAll('label').forEach(label => { const oldFor = label.htmlFor; if (oldFor) label.htmlFor = oldFor.replace(/-(\d+)$/, `-${cardNumericId}`); });
        card.querySelectorAll('input').forEach(input => { const oldId = input.id; if (oldId) input.id = oldId.replace(/-(\d+)$/, `-${cardNumericId}`); });
    });
}

function addScenarioFormV3() {
    const container = document.getElementById('scenario-forms-container');
    const scenarioIndex = container.querySelectorAll('.scenario-input-item').length + 1;
    const newScenarioId = `scenario-item-dynamic-${Date.now()}`;
    const scenarioHTML = `
        <div class="scenario-input-item dynamic-scenario-item is-adding" id="${newScenarioId}" data-scenario-id="${scenarioIndex}">
            <div class="card-header-v3">
                 <h3 class="form-title-v3">Scenario ${scenarioIndex}</h3>
                ${scenarioIndex > 1 ? `<button type="button" class="btn btn-destructive btn-remove-item btn-sm-v3" aria-label="Remove Scenario ${scenarioIndex}"><i data-lucide="trash-2" class="btn-icon"></i></button>` : ''}
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
        newElement.classList.remove('is-adding');
        document.getElementById(`total-monthly-payment-${scenarioIndex}`).focus();
    }, 10);
}

function updateScenarioTitlesV3() {
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
            if(header) header.insertAdjacentHTML('beforeend', `<button type="button" class="btn btn-destructive btn-remove-item btn-sm-v3" aria-label="Remove Scenario ${scenarioNumericId}"><span class="icon-trash-2">&times;</span></button>`);
        } else if (scenarioNumericId === 1 && removeBtn) {
            removeBtn.remove();
        }
        scenario.querySelectorAll('label').forEach(label => { const oldFor = label.htmlFor; if (oldFor) label.htmlFor = oldFor.replace(/-(\d+)$/, `-${scenarioNumericId}`); });
        scenario.querySelectorAll('input').forEach(input => { const oldId = input.id; if (oldId) input.id = oldId.replace(/-(\d+)$/, `-${scenarioNumericId}`); });
    });
}

function collectAndProcessDataV3() {
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
            scenarioData.push({ id: `v3-scenario-${scenarioNumericId}`, title: entry.querySelector('.form-title-v3').textContent, totalMonthlyPayment: totalPayment });
        }
    });
    if (!allScenariosValid) return false;
    if (cardData.length === 0) { alert("Please add at least one credit card."); return false; }
    if (scenarioData.length === 0) { alert("Please add at least one payment scenario."); return false; }

    const allScenarioResults = calculateAllScenarios(cardData, scenarioData);
    populateResultsSummaryCard_V3(allScenarioResults, cardData);
    populateDetailedTabs_V3(allScenarioResults, cardData);
    return true;
}

function populateResultsSummaryCard_V3(allScenarioResults, initialCardsData) {
    const optimalHighlightEl = document.getElementById('optimal-strategy-highlight');
    const savingsInsightEl = document.getElementById('savings-insight-text');
    if (!optimalHighlightEl || !savingsInsightEl || !allScenarioResults || allScenarioResults.length === 0) return;

    const optimalScenario = allScenarioResults.reduce((prev, current) => (prev.totalInterestPaid < current.totalInterestPaid) ? prev : current);
    optimalHighlightEl.innerHTML = `<p><span class="icon-check-circle"></span> Best Choice: Paying <strong>$${optimalScenario.totalMonthlyPayment.toFixed(2)}/month</strong> is your most cost-effective plan.</p>`;

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
                if (years > 0) timeText += `<strong>${years}</strong> year${years > 1 ? 's' : ''}`;
                if (months > 0) { if (years > 0) timeText += " and "; timeText += `<strong>${months}</strong> month${months > 1 ? 's' : ''}`; }
            }
            savingsText = `By choosing this plan, you'll save <strong>$${interestSaved.toFixed(2)}</strong> in interest`;
            if (timeText) savingsText += ` and be debt-free ${timeText} sooner`;
            savingsText += ` compared to the plan paying $${highestInterestScenario.totalMonthlyPayment.toFixed(2)}/month.`;
        } else { savingsText = "This is the most efficient plan you've entered."; }
    } else {
        savingsText = `This plan gets you debt-free in ${optimalScenario.monthsToPayOff} months, with $${optimalScenario.totalInterestPaid.toFixed(2)} in total interest.`;
    }
    savingsInsightEl.innerHTML = `<p>${savingsText}</p>`;
    renderScenarioBarChart_V3(allScenarioResults, optimalScenario.scenarioId);
}

function renderScenarioBarChart_V3(allScenarioResults, optimalScenarioId) {
    const ctx = document.getElementById('scenarioComparisonBarChart')?.getContext('2d');
    if (!ctx) return;
    if (window.scenarioBarChart) window.scenarioBarChart.destroy();

    const labels = allScenarioResults.map(s => s.title);
    const interestData = allScenarioResults.map(s => s.totalInterestPaid);
    const timeData = allScenarioResults.map(s => s.monthsToPayOff);
    const optimalIndex = allScenarioResults.findIndex(s => s.scenarioId === optimalScenarioId);

    const interestColors = allScenarioResults.map((s, i) => i === optimalIndex ? 'rgba(40, 167, 69, 0.7)' : 'rgba(253, 126, 20, 0.7)'); // Green for optimal interest, Orange otherwise
    const timeColors = allScenarioResults.map((s, i) => i === optimalIndex ? 'rgba(0, 90, 179, 0.9)' : 'rgba(0, 123, 255, 0.7)');     // Darker Blue for optimal time, Primary Blue otherwise


    window.scenarioBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Interest Paid', data: interestData,
                backgroundColor: interestColors,
                borderColor: interestColors.map(c => c.replace('0.7', '1').replace('0.9','1')),
                borderWidth: 1, yAxisID: 'yInterest', order: 1
            }, {
                label: 'Time to Debt-Free (Months)', data: timeData,
                backgroundColor: timeColors,
                borderColor: timeColors.map(c => c.replace('0.7', '1').replace('0.9','1')),
                borderWidth: 1, yAxisID: 'yTime', order: 2
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'x',
            plugins: { tooltip: { mode: 'index', intersect: false }, legend: { position: 'bottom' } },
            scales: {
                yInterest: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Total Interest Paid ($)', color: 'var(--color-accent-warning)' }, ticks:{color: 'var(--color-accent-warning)'} },
                yTime: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Months to Debt-Free', color: 'var(--color-primary)' }, grid: { drawOnChartArea: false }, ticks:{color: 'var(--color-primary)'} }
            }
        }
    });
}

function populateDetailedTabs_V3(allScenarioResults, initialCardsData) {
    const tabListContainer = document.getElementById('detailed-scenario-breakdown').querySelector('.tab-list-container');
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
            tabContentContainer.querySelectorAll('.tab-content-panel').forEach(panel => panel.classList.remove('is-active'));
            tabButton.classList.add('is-active'); tabButton.setAttribute('aria-selected', 'true');
            const targetPanel = document.getElementById(panelId);
            if (targetPanel) targetPanel.classList.add('is-active');
        });
        tabListContainer.appendChild(tabButton);

        const tabPanel = document.createElement('div');
        tabPanel.className = 'tab-content-panel'; tabPanel.id = panelId;
        tabPanel.setAttribute('role', 'tabpanel'); tabPanel.setAttribute('aria-labelledby', tabId);
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
            <div class="scenario-metrics-header">
                <div class="metric-item">Time to Debt-Free <strong>${timeText}</strong></div>
                <div class="metric-item">Total Interest Paid <strong class="interest-value">$${scenario.totalInterestPaid.toFixed(2)}</strong></div>
                <div class="metric-item">Total Principal Paid <strong>$${scenario.totalPrincipalPaid.toFixed(2)}</strong></div>
            </div>
            <div class="chart-container"><canvas id="${stackedAreaChartCanvasId}"></canvas></div>
            <div class="table-responsive">
                <table class="month-by-month-table">
                    <thead><tr><th>Month</th><th>Starting Balance</th><th>Payment</th><th>Interest</th><th>Ending Balance</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>`;
        tabContentContainer.appendChild(tabPanel);
        const stackedAreaCtx = document.getElementById(stackedAreaChartCanvasId)?.getContext('2d'); // Use optional chaining
        if(stackedAreaCtx) renderStackedAreaChart_V3(stackedAreaCtx, scenario, initialCardsData); else console.error("Canvas not found for " + stackedAreaChartCanvasId);

    });
}

function renderStackedAreaChart_V3(ctx, scenarioResult, initialCardsData) {
    if (!ctx) { console.error("renderStackedAreaChart_V3: context is null for scenario", scenarioResult.scenarioId); return; }
    const numMonths = scenarioResult.monthsToPayOff;
    const labels = ['Initial', ...Array.from({ length: numMonths }, (_, i) => `M${i + 1}`)];
    const datasets = [];
    const cardColors = ['rgba(0, 123, 255, 0.5)', 'rgba(40, 167, 69, 0.5)', 'rgba(253, 126, 20, 0.5)', 'rgba(108, 117, 125, 0.5)', 'rgba(23, 162, 184, 0.5)'];

    initialCardsData.forEach((initialCard, cardIndex) => {
        const cardBalanceHistory = [initialCard.balance];
        let currentCardBalance = initialCard.balance;
        scenarioResult.monthlyBreakdown.forEach(monthData => {
            const cardMonthDetail = monthData.cards.find(c => c.id === initialCard.id);
            currentCardBalance = cardMonthDetail ? cardMonthDetail.endingBalance : currentCardBalance;
            cardBalanceHistory.push(Math.max(0, currentCardBalance));
        });
        datasets.push({
            label: initialCard.nickname, data: cardBalanceHistory, tension: 0.1, fill: true,
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
            plugins: { title: { display: false }, legend: { position: 'bottom' } },
            scales: {
                y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Debt Balance ($)' } },
                x: { title: { display: true, text: 'Months' } }
            },
            interaction: { mode: 'index', intersect: false },
        }
    });
}

function setupTooltipsV3() {
    let currentTooltipV3 = null;
    function showTooltip(triggerElement) {
        const tooltipText = triggerElement.dataset.tooltipText;
        if (!tooltipText) return;
        hideTooltip();
        currentTooltipV3 = document.createElement('div');
        currentTooltipV3.className = 'info-tooltip-popup-v3';
        currentTooltipV3.textContent = tooltipText;
        document.body.appendChild(currentTooltipV3);
        const rect = triggerElement.getBoundingClientRect();
        let top = rect.top + window.scrollY - currentTooltipV3.offsetHeight - 8;
        let left = rect.left + window.scrollX + (rect.width / 2) - (currentTooltipV3.offsetWidth / 2);
        if (top < window.scrollY + 8) top = rect.bottom + window.scrollY + 8;
        if (left < window.scrollX + 8) left = window.scrollX + 8;
        if (left + currentTooltipV3.offsetWidth > window.scrollX + document.documentElement.clientWidth - 8) {
            left = window.scrollX + document.documentElement.clientWidth - 8 - currentTooltipV3.offsetWidth;
        }
        currentTooltipV3.style.top = `${top}px`; currentTooltipV3.style.left = `${left}px`;
        currentTooltipV3.style.opacity = '1';
    }
    function hideTooltip() { if (currentTooltipV3) { currentTooltipV3.remove(); currentTooltipV3 = null; } }
    document.body.addEventListener('mouseover', e => { if (e.target.closest('.tooltip-trigger-v3')) showTooltip(e.target.closest('.tooltip-trigger-v3')); });
    document.body.addEventListener('mouseout', e => { if (e.target.closest('.tooltip-trigger-v3')) hideTooltip(); });
    document.body.addEventListener('focusin', e => { if (e.target.closest('.tooltip-trigger-v3')) showTooltip(e.target.closest('.tooltip-trigger-v3')); });
    document.body.addEventListener('focusout', e => { if (e.target.closest('.tooltip-trigger-v3')) hideTooltip(); });
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
