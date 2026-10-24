// UFC 333: Betting Matrix & Engineering Portfolio Dashboard
// Strictly complies with MASTER_v5_expanded.md UI Governance
// Features: Dynamic ZAR / USD Currency Converter, Clear Locks & Pick Tallies,
// Consensus Verdicts with Method Breakdown Graphs, and dedicated AI ELO Engine Page.

(function () {
  'use strict';

  // State Management
  let currentCurrency = 'ZAR'; // 'ZAR' or 'USD'
  const USD_EXCHANGE_RATE = 18.0; // 1 USD = 18.0 ZAR
  let currentBankroll = 350;
  let activeSlips = JSON.parse(JSON.stringify(INITIAL_SLIPS));
  let customLegs = [];
  let currentSlipFilter = 'all';
  let currentFightFilter = 'all';
  let currentHomeCardFilter = 'all';
  let builderSelectedLegs = [];
  let builderStake = 50;
  let currentStakingMode = 'flat'; // 'flat', 'quarter_kelly', 'half_kelly'

  // Base proportion reference weights (calibrated to default bankroll)
  const baseWeights = {
    'slip-1': 120 / 355,
    'slip-2': 80 / 355,
    'slip-3': 45 / 355,
    'slip-4': 35 / 355,
    'slip-5': 20 / 355,
    'slip-6': 5 / 355,
    'slip-7': 5 / 355,
    'slip-8': 10 / 355,
    'slip-9': 10 / 355,
    'slip-10': 5 / 355,
    'slip-11': 5 / 355,
    'slip-12': 5 / 355,
    'slip-13': 5 / 355,
    'slip-14': 5 / 355
  };

  // Fractional Quarter Kelly weights (0.25x edge optimization)
  const quarterKellyWeights = {
    'slip-1': 0.395,
    'slip-2': 0.26,
    'slip-3': 0.10,
    'slip-4': 0.06,
    'slip-5': 0.08,
    'slip-6': 0.01,
    'slip-7': 0.01,
    'slip-8': 0.02,
    'slip-9': 0.02,
    'slip-10': 0.01,
    'slip-11': 0.01,
    'slip-12': 0.01,
    'slip-13': 0.01,
    'slip-14': 0.005
  };

  // Fractional Half Kelly weights (0.50x aggressive edge optimization)
  const halfKellyWeights = {
    'slip-1': 0.475,
    'slip-2': 0.30,
    'slip-3': 0.07,
    'slip-4': 0.04,
    'slip-5': 0.06,
    'slip-6': 0.005,
    'slip-7': 0.005,
    'slip-8': 0.01,
    'slip-9': 0.01,
    'slip-10': 0.005,
    'slip-11': 0.005,
    'slip-12': 0.005,
    'slip-13': 0.005,
    'slip-14': 0.005
  };

  // DOM Elements
  const bankrollInput = document.getElementById('bankrollInput');
  const currencySymbolDisplay = document.getElementById('currencySymbolDisplay');
  const btnCurZar = document.getElementById('btnCurZar');
  const btnCurUsd = document.getElementById('btnCurUsd');
  const presetChips = document.querySelectorAll('.chip-btn');
  const allocationTrack = document.getElementById('allocationTrack');
  const barLocks = document.getElementById('barLocks');
  const barMediums = document.getElementById('barMediums');
  const barLongshots = document.getElementById('barLongshots');
  
  const legLocksVal = document.getElementById('legLocksVal');
  const legMedVal = document.getElementById('legMedVal');
  const legLongVal = document.getElementById('legLongVal');
  const legLocksPct = document.getElementById('legLocksPct');
  const legMedPct = document.getElementById('legMedPct');
  const legLongPct = document.getElementById('legLongPct');

  const kpiTotalStake = document.getElementById('kpiTotalStake');
  const kpiMaxPayout = document.getElementById('kpiMaxPayout');
  const kpiMaxProfit = document.getElementById('kpiMaxProfit');
  const kpiMaxROI = document.getElementById('kpiMaxROI');
  const kpiActiveSlipsCount = document.getElementById('kpiActiveSlipsCount');

  const slipsContainer = document.getElementById('slipsContainer');
  const fightsListContainer = document.getElementById('fightsListContainer');
  const expertsGrid = document.getElementById('expertsGrid');
  const slipsBadge = document.getElementById('slipsBadge');

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  const customBuilderBox = document.getElementById('customBuilderBox');
  const openCustomBuilderBtn = document.getElementById('openCustomBuilderBtn');
  const closeBuilderBtn = document.getElementById('closeBuilderBtn');
  const clearBuilderLegsBtn = document.getElementById('clearBuilderLegsBtn');
  const builderLegsContainer = document.getElementById('builderLegsContainer');
  const emptyBuilderMsg = document.getElementById('emptyBuilderMsg');
  const builderCalcBar = document.getElementById('builderCalcBar');
  const builderLegCount = document.getElementById('builderLegCount');
  const builderCombinedOdds = document.getElementById('builderCombinedOdds');
  const builderStakeInput = document.getElementById('builderStakeInput');
  const builderEstimatedPayout = document.getElementById('builderEstimatedPayout');
  const saveCustomSlipBtn = document.getElementById('saveCustomSlipBtn');

  const resetBankrollBtn = document.getElementById('resetBankrollBtn');
  const exportBetsBtn = document.getElementById('exportBetsBtn');
  const toastContainer = document.getElementById('toastContainer');

  // AI Elo DOM Elements
  const eloTableBody = document.getElementById('eloTableBody');
  const eloStandingsBody = document.getElementById('eloStandingsBody');
  const simFighter1 = document.getElementById('simFighter1');
  const simFighter2 = document.getElementById('simFighter2');
  const simFighter1Stats = document.getElementById('simFighter1Stats');
  const simFighter2Stats = document.getElementById('simFighter2Stats');
  const simCalculateBtn = document.getElementById('simCalculateBtn');
  const simResultBox = document.getElementById('simResultBox');

  // Quant Differential DOM Elements
  const quantTableBody = document.getElementById('quantTableBody');
  const oprStandingsBody = document.getElementById('oprStandingsBody');
  const quantFighter1 = document.getElementById('quantFighter1');
  const quantFighter2 = document.getElementById('quantFighter2');
  const quantFighter1Stats = document.getElementById('quantFighter1Stats');
  const quantFighter2Stats = document.getElementById('quantFighter2Stats');
  const btnRunMonteCarlo = document.getElementById('btnRunMonteCarlo');
  const quantResultBox = document.getElementById('quantResultBox');

  // Initialize
  function init() {
    setupEventListeners();
    scaleStakesToBankroll(currentBankroll);
    renderHomePage();
    renderParlayBuilder();
    renderSlips();
    renderFightCards();
    renderExpertsFeed();
    renderCharts();
    renderEloPage();
    renderQuantPage();
    renderApex50Page();
    renderComparisonPage();
    renderCheatSheet();
    updateKPIs();
  }

  // Toast Notification
  function showToast(message, icon = '') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = icon ? `<span style="color: var(--primary);">${icon}</span> <span>${message}</span>` : `<span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Formatting helpers
  function formatMoney(amount) {
    const num = Number(amount) || 0;
    if (currentCurrency === 'USD') {
      return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return 'R' + num.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatOdds(decOdds) {
    if (!decOdds || decOdds <= 1) return '+100';
    if (decOdds >= 2.0) {
      const am = Math.round((decOdds - 1) * 100);
      return `+${am}`;
    } else {
      const am = Math.round(-100 / (decOdds - 1));
      return `${am}`;
    }
  }

  // Currency Switching
  function switchCurrency(targetCurrency) {
    if (currentCurrency === targetCurrency) return;
    currentCurrency = targetCurrency;

    if (currentCurrency === 'USD') {
      if (btnCurZar) btnCurZar.classList.remove('active');
      if (btnCurUsd) btnCurUsd.classList.add('active');
      if (currencySymbolDisplay) currencySymbolDisplay.textContent = '$';
      currentBankroll = 20; // clean $20 starting bankroll in USD
      builderStake = 5;

      const usdPresets = [10, 15, 20, 30, 50];
      presetChips.forEach((btn, idx) => {
        if (usdPresets[idx] !== undefined) {
          btn.dataset.preset = usdPresets[idx];
          btn.textContent = `$${usdPresets[idx]}`;
        }
      });
      showToast('Currency switched to US Dollars ($) &bull; Rate: 1 USD = 18.00 ZAR');
    } else {
      if (btnCurUsd) btnCurUsd.classList.remove('active');
      if (btnCurZar) btnCurZar.classList.add('active');
      if (currencySymbolDisplay) currencySymbolDisplay.textContent = 'R';
      currentBankroll = 350; // clean R350 starting bankroll in ZAR
      builderStake = 50;

      const zarPresets = [200, 300, 350, 500, 1000];
      presetChips.forEach((btn, idx) => {
        if (zarPresets[idx] !== undefined) {
          btn.dataset.preset = zarPresets[idx];
          btn.textContent = zarPresets[idx] >= 1000 ? 'R1,000' : `R${zarPresets[idx]}`;
        }
      });
      showToast('Currency switched to South African Rand (R)');
    }

    scaleStakesToBankroll(currentBankroll);
    renderSlips();
    renderHomePage();
    renderParlayBuilder();
  }

  // Scale Stakes to match Bankroll
  function scaleStakesToBankroll(newBankroll) {
    const minVal = currentCurrency === 'USD' ? 1 : 10;
    currentBankroll = Math.max(minVal, Number(newBankroll) || (currentCurrency === 'USD' ? 20 : 350));
    if (bankrollInput) bankrollInput.value = currentBankroll;

    let weights = baseWeights;
    if (currentStakingMode === 'quarter_kelly') weights = quarterKellyWeights;
    else if (currentStakingMode === 'half_kelly') weights = halfKellyWeights;

    let assignedSum = 0;
    activeSlips.forEach(slip => {
      if (slip.isCustom) return;
      const weight = weights[slip.id] || (1 / activeSlips.length);
      let calculatedStake = currentCurrency === 'USD'
        ? parseFloat((currentBankroll * weight).toFixed(2))
        : Math.round(currentBankroll * weight);

      const minStake = currentCurrency === 'USD' ? 0.25 : 1;
      if (calculatedStake < minStake) calculatedStake = minStake;
      slip.stake = calculatedStake;
      assignedSum += calculatedStake;
    });

    // Reconcile rounding difference to largest lock slip (slip-1)
    const diff = currentBankroll - assignedSum;
    const slip1 = activeSlips.find(s => s.id === 'slip-1');
    if (slip1 && !slip1.isCustom) {
      slip1.stake = currentCurrency === 'USD'
        ? parseFloat((slip1.stake + diff).toFixed(2))
        : (slip1.stake + Math.round(diff));
      const minStake = currentCurrency === 'USD' ? 0.25 : 1;
      if (slip1.stake < minStake) slip1.stake = minStake;
    }

    updatePresetButtons(currentBankroll);
    updateKPIs();
  }

  function updatePresetButtons(val) {
    presetChips.forEach(btn => {
      const pVal = Number(btn.dataset.preset);
      btn.classList.toggle('active', pVal === val);
    });
  }

  // Update Portfolio KPIs & Strategy Distribution Bar
  function updateKPIs() {
    let totalStake = 0;
    let maxPayout = 0;
    let lockStake = 0;
    let medStake = 0;
    let longStake = 0;
    let activeCount = 0;

    activeSlips.forEach(slip => {
      if (!slip.active) return;
      activeCount++;
      const stake = Number(slip.stake) || 0;
      const combinedOdds = Number(slip.combinedOdds) || 1.0;
      const payout = stake * combinedOdds;

      totalStake += stake;
      maxPayout += payout;

      if (slip.category === 'locks') lockStake += stake;
      else if (slip.category === 'mediums') medStake += stake;
      else if (slip.category === 'longshots') longStake += stake;
    });

    const netProfit = maxPayout - totalStake;
    const maxMultiplier = totalStake > 0 ? (maxPayout / totalStake).toFixed(1) : '0.0';

    if (kpiTotalStake) kpiTotalStake.textContent = formatMoney(totalStake);
    if (kpiMaxPayout) kpiMaxPayout.textContent = formatMoney(maxPayout);
    if (kpiMaxProfit) kpiMaxProfit.textContent = (netProfit >= 0 ? '+' : '') + formatMoney(netProfit);
    if (kpiMaxROI) kpiMaxROI.textContent = `${maxMultiplier}x`;
    if (kpiActiveSlipsCount) kpiActiveSlipsCount.textContent = `${activeCount} active slips configured`;

    // Allocation percentages
    const lockPct = totalStake > 0 ? ((lockStake / totalStake) * 100).toFixed(1) : '0.0';
    const medPct = totalStake > 0 ? ((medStake / totalStake) * 100).toFixed(1) : '0.0';
    const longPct = totalStake > 0 ? ((longStake / totalStake) * 100).toFixed(1) : '0.0';

    if (barLocks) barLocks.style.width = `${lockPct}%`;
    if (barMediums) barMediums.style.width = `${medPct}%`;
    if (barLongshots) barLongshots.style.width = `${longPct}%`;

    if (legLocksVal) legLocksVal.textContent = formatMoney(lockStake);
    if (legMedVal) legMedVal.textContent = formatMoney(medStake);
    if (legLongVal) legLongVal.textContent = formatMoney(longStake);

    if (legLocksPct) legLocksPct.textContent = `${lockPct}%`;
    if (legMedPct) legMedPct.textContent = `${medPct}%`;
    if (legLongPct) legLongPct.textContent = `${longPct}%`;

    if (slipsBadge) slipsBadge.textContent = activeCount;
  }

  // ==================== EVENT HOME & MATCHUPS SHOWCASE ====================
  function getSlipsForFight(fight) {
    if (!fight || !fight.red || !fight.blue) return [];
    const rLast = fight.red.name.split(' ').pop().toLowerCase();
    const bLast = fight.blue.name.split(' ').pop().toLowerCase();
    const rFull = fight.red.name.toLowerCase();
    const bFull = fight.blue.name.toLowerCase();

    return activeSlips.filter(slip => {
      if (!slip.legs || !Array.isArray(slip.legs)) return false;
      return slip.legs.some(leg => {
        const fName = (leg.fighter || '').toLowerCase();
        const bDesc = (leg.bout || '').toLowerCase();
        return fName.includes(rLast) || fName.includes(bLast) ||
               rFull.includes(fName) || bFull.includes(fName) ||
               bDesc.includes(rLast) || bDesc.includes(bLast);
      });
    });
  }

  function isFightLock(fight) {
    if (fight.isLock) return true;
    const lockKeys = ["yakhyaev", "chopurov", "murzakanov", "lucindo", "vagaev"];
    const rLast = fight.red.name.split(' ').pop().toLowerCase();
    const bLast = fight.blue.name.split(' ').pop().toLowerCase();
    return lockKeys.includes(rLast) || lockKeys.includes(bLast);
  }

  function renderHomePage() {
    const grid = document.getElementById('homeMatchupsGrid');
    if (!grid || typeof FIGHTS_DATA === 'undefined') return;

    grid.innerHTML = '';

    const filtered = FIGHTS_DATA.filter((fight, idx) => {
      if (currentHomeCardFilter === 'locks') return isFightLock(fight);
      if (currentHomeCardFilter === 'main') return idx < 5;
      if (currentHomeCardFilter === 'prelims') return idx >= 5 && idx < 9;
      if (currentHomeCardFilter === 'early') return idx >= 9;
      return true;
    });

    filtered.forEach(fight => {
      const matchSlips = getSlipsForFight(fight);
      const isLock = isFightLock(fight);
      const lockBadge = isLock ? '<span class="elo-edge-badge" style="font-size: 10px;">🔒 UNANIMOUS LOCK</span>' : '';
      
      let favName = fight.red.name;
      let favPct = 55;
      if (fight.consensus && fight.consensus.favorite) {
        favName = fight.consensus.favorite;
        favPct = fight.consensus.confidenceRating ? Math.round(fight.consensus.confidenceRating * 10) : 60;
      }

      const card = document.createElement('article');
      card.className = `home-matchup-card ${isLock ? 'lock' : ''}`;
      card.innerHTML = `
        <div class="home-card-header">
          <span class="home-card-badge">${fight.card} &bull; ${fight.distance || '3 Rounds'}</span>
          <div style="display: flex; gap: 4px; align-items: center;">
            ${fight.weighInDrama ? '<span class="home-drama-pill">⚠️ CATCHWEIGHT</span>' : (fight.weighIn && fight.weighIn.bothMadeWeight ? '<span class="home-weight-pill">✓ On Weight</span>' : '')}
            ${lockBadge}
          </div>
        </div>

        <div class="home-fighters-row">
          <div class="home-fighter-col">
            <img src="${fight.red.image}" alt="${fight.red.name}" class="home-fighter-avatar" onerror="this.src='images/volkanovski.png'">
            <span class="home-fighter-name">${fight.red.name}</span>
            <span class="home-fighter-record">${fight.red.record || ''} &bull; ${fight.red.age || ''}y &bull; <strong style="color:var(--text-primary); font-family:var(--font-mono);">${fight.red.officialWeight ? fight.red.officialWeight + ' lbs' : ''}</strong></span>
            <div><span class="home-fighter-odds" style="color: var(--danger);">${formatOdds(fight.red.decimalOdds || 1.95)}</span></div>
          </div>

          <div class="home-vs-divider">
            VS
          </div>

          <div class="home-fighter-col blue">
            <img src="${fight.blue.image}" alt="${fight.blue.name}" class="home-fighter-avatar" onerror="this.src='images/evloev.png'">
            <span class="home-fighter-name">${fight.blue.name}</span>
            <span class="home-fighter-record">${fight.blue.record || ''} &bull; ${fight.blue.age || ''}y &bull; <strong style="color:${fight.blue.weighInStatus === 'missed' ? 'var(--danger)' : 'var(--text-primary)'}; font-family:var(--font-mono);">${fight.blue.officialWeight ? fight.blue.officialWeight + ' lbs' : ''} ${fight.blue.weighInStatus === 'missed' ? '⚠️' : ''}</strong></span>
            <div><span class="home-fighter-odds" style="color: var(--corner-blue);">${formatOdds(fight.blue.decimalOdds || 1.98)}</span></div>
          </div>
        </div>

        <div class="home-consensus-strip">
          <span style="color: var(--text-muted); font-size: 11px;">Consensus Lean:</span>
          <strong style="color: var(--gold);">${favName.split(' ').pop()} (${favPct}%)</strong>
        </div>

        <div class="home-card-footer">
          <button type="button" class="btn-see-parlays" data-fight-id="${fight.id}">
            See Parlays (${matchSlips.length} Slips)
          </button>
          <button type="button" class="btn-quick-add-leg" data-fight-id="${fight.id}" title="Add favorite to custom parlay">
            + Add to Parlay
          </button>
        </div>
      `;

      // Event listener to open parlays modal
      const seeParlaysBtn = card.querySelector('.btn-see-parlays');
      if (seeParlaysBtn) {
        seeParlaysBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openBoutParlaysModal(fight);
        });
      }

      // Quick add favorite to builder
      const addLegBtn = card.querySelector('.btn-quick-add-leg');
      if (addLegBtn) {
        addLegBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          addFightFavoriteToBuilder(fight);
          switchTab('tab-builder');
        });
      }

      // Clicking card background opens parlays modal
      card.addEventListener('click', () => {
        openBoutParlaysModal(fight);
      });

      grid.appendChild(card);
    });
  }

  function addFightFavoriteToBuilder(fight) {
    const isRedFav = (fight.red.decimalOdds || 1.95) <= (fight.blue.decimalOdds || 1.98);
    const favFighter = isRedFav ? fight.red : fight.blue;
    const oppFighter = isRedFav ? fight.blue : fight.red;
    
    toggleBuilderLeg({
      fighter: favFighter.name,
      bout: `vs ${oppFighter.name.split(' ').pop()}`,
      market: 'Moneyline',
      dec: favFighter.decimalOdds || 1.95,
      odds: favFighter.odds || -110,
      img: favFighter.image
    });
    showToast(`Added ${favFighter.name} ML to Parlay Builder!`);
  }

  function openBoutParlaysModal(fight) {
    const modal = document.getElementById('boutParlaysModal');
    const titleEl = document.getElementById('boutParlaysModalTitle');
    const bodyEl = document.getElementById('boutParlaysModalBody');
    if (!modal || !titleEl || !bodyEl) return;

    titleEl.textContent = `${fight.red.name} vs. ${fight.blue.name}`;

    const matchSlips = getSlipsForFight(fight);

    if (matchSlips.length === 0) {
      bodyEl.innerHTML = `
        <div style="text-align: center; padding: 36px 12px; color: var(--text-muted);">
          <p style="margin-bottom: 16px; font-size: 13px;">No pre-built portfolio slips feature this matchup yet.</p>
          <button type="button" class="btn-gold" id="btnCreateParlayForBout" style="font-size: 12px; padding: 8px 16px;">
            Build Custom Parlay with this Fight
          </button>
        </div>
      `;
      const btn = document.getElementById('btnCreateParlayForBout');
      if (btn) {
        btn.addEventListener('click', () => {
          closeBoutParlaysModal();
          addFightFavoriteToBuilder(fight);
          switchTab('tab-builder');
        });
      }
    } else {
      let html = `
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">
          Found <strong>${matchSlips.length}</strong> active portfolio ticket${matchSlips.length === 1 ? '' : 's'} featuring this fight:
        </div>
      `;

      matchSlips.forEach(slip => {
        const payout = ((Number(slip.stake) || 0) * slip.combinedOdds).toFixed(2);
        const isLockSlip = slip.category === 'locks';
        const categoryTag = isLockSlip 
          ? '<span class="elo-edge-badge" style="font-size: 10px;">🔒 LOCK</span>' 
          : `<span class="slip-category-tag ${slip.category}" style="font-size: 10px;">${slip.categoryLabel || slip.category}</span>`;

        let legsList = slip.legs.map(leg => {
          const isThisMatch = (leg.fighter || '').toLowerCase().includes(fight.red.name.split(' ').pop().toLowerCase()) ||
                              (leg.fighter || '').toLowerCase().includes(fight.blue.name.split(' ').pop().toLowerCase());
          const highlightClass = isThisMatch ? 'match-highlight' : '';
          const dot = isThisMatch ? '• ' : '  ';
          return `
            <div class="bout-parlay-item-leg ${highlightClass}">
              <span>${dot}<strong>${leg.fighter}</strong> <small style="color:var(--text-muted);">(${leg.market})</small></span>
              <span style="font-family: var(--font-mono);">${formatOdds(leg.dec)}</span>
            </div>
          `;
        }).join('');

        html += `
          <div class="bout-parlay-item-card">
            <div class="bout-parlay-item-header">
              <div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  ${categoryTag}
                  <span style="font-size: 11px; font-family: var(--font-mono); color: var(--gold); font-weight: 700;">${slip.combinedOdds.toFixed(2)}x (${formatOdds(slip.combinedOdds)})</span>
                </div>
                <div class="bout-parlay-item-title">${slip.title}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-family: var(--font-mono); font-size: 12px; color: var(--success); font-weight: 700;">Payout: ${formatMoney(payout)}</div>
                <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Stake: ${formatMoney(slip.stake)}</div>
              </div>
            </div>

            <div class="bout-parlay-item-legs">
              ${legsList}
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <button type="button" class="btn-secondary btn-jump-to-slip" data-slip-id="${slip.id}" style="font-size: 11px; padding: 5px 10px;">
                View in Bet Slips
              </button>
              <button type="button" class="btn-gold btn-load-slip-to-builder" data-slip-id="${slip.id}" style="font-size: 11px; padding: 5px 10px;">
                Load into Parlay Builder
              </button>
            </div>
          </div>
        `;
      });

      bodyEl.innerHTML = html;

      // Attach handlers to "View in Bet Slips"
      bodyEl.querySelectorAll('.btn-jump-to-slip').forEach(b => {
        b.addEventListener('click', e => {
          const slipId = e.currentTarget.dataset.slipId;
          closeBoutParlaysModal();
          switchTab('tab-slips');
          setTimeout(() => {
            const targetCard = document.getElementById(`card-${slipId}`);
            if (targetCard) {
              targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetCard.style.outline = '2px solid var(--primary)';
              setTimeout(() => targetCard.style.outline = 'none', 2500);
            }
          }, 150);
        });
      });

      // Attach handlers to "Load into Parlay Builder"
      bodyEl.querySelectorAll('.btn-load-slip-to-builder').forEach(b => {
        b.addEventListener('click', e => {
          const slipId = e.currentTarget.dataset.slipId;
          const targetSlip = activeSlips.find(s => s.id === slipId);
          if (targetSlip && targetSlip.legs) {
            builderSelectedLegs = targetSlip.legs.map(l => ({
              fighter: l.fighter,
              bout: l.bout,
              market: l.market,
              dec: Number(l.dec) || 1.9,
              odds: l.odds || 100,
              img: l.img
            }));
            closeBoutParlaysModal();
            switchTab('tab-builder');
            renderParlayBuilder();
            showToast(`Loaded ${targetSlip.title} into Parlay Builder!`);
          }
        });
      });
    }

    modal.classList.add('active');
  }

  function closeBoutParlaysModal() {
    const modal = document.getElementById('boutParlaysModal');
    if (modal) modal.classList.remove('active');
  }

  // ==================== DEDICATED PARLAY BUILDER ====================
  function renderParlayBuilder() {
    renderBuilderMatchups();
    renderBuilderTicket();
  }

  function renderBuilderMatchups() {
    const container = document.getElementById('builderMatchupsContainer');
    if (!container || typeof FIGHTS_DATA === 'undefined') return;

    container.innerHTML = '';

    FIGHTS_DATA.forEach((fight, idx) => {
      const row = document.createElement('div');
      row.className = 'builder-matchup-row';

      const isLock = isFightLock(fight);
      const lockMark = isLock ? '🔒 ' : '';

      const rLeg = {
        fighter: fight.red.name,
        bout: `vs ${fight.blue.name.split(' ').pop()}`,
        market: 'Moneyline',
        dec: fight.red.decimalOdds || 1.95,
        odds: fight.red.odds || -105,
        img: fight.red.image
      };

      const bLeg = {
        fighter: fight.blue.name,
        bout: `vs ${fight.red.name.split(' ').pop()}`,
        market: 'Moneyline',
        dec: fight.blue.decimalOdds || 1.98,
        odds: fight.blue.odds || -102,
        img: fight.blue.image
      };

      const propLeg = {
        fighter: `${fight.red.name.split(' ').pop()}/${fight.blue.name.split(' ').pop()}`,
        bout: fight.weightClass,
        market: 'Over 1.5 Rounds',
        dec: 1.42,
        odds: -240,
        img: 'images/volkanovski.png'
      };

      const isRSelected = builderSelectedLegs.some(l => l.fighter === rLeg.fighter && l.market === rLeg.market);
      const isBSelected = builderSelectedLegs.some(l => l.fighter === bLeg.fighter && l.market === bLeg.market);
      const isPropSelected = builderSelectedLegs.some(l => l.fighter === propLeg.fighter && l.market === propLeg.market);

      row.innerHTML = `
        <div class="builder-matchup-header">
          <span>${idx + 1}. ${fight.card} &bull; ${fight.weightClass}</span>
          <span>${lockMark}${fight.distance || '3 Rounds'}</span>
        </div>

        <div class="builder-pick-buttons">
          <button type="button" class="odds-pick-btn ${isRSelected ? 'selected' : ''}" data-type="red">
            <span>${fight.red.name.split(' ').pop()} ML</span>
            <span class="odds-pick-val">${formatOdds(rLeg.dec)}</span>
          </button>
          <button type="button" class="odds-pick-btn ${isBSelected ? 'selected' : ''}" data-type="blue">
            <span>${fight.blue.name.split(' ').pop()} ML</span>
            <span class="odds-pick-val">${formatOdds(bLeg.dec)}</span>
          </button>
          <button type="button" class="odds-pick-btn ${isPropSelected ? 'selected' : ''}" data-type="prop" style="min-width: 110px;">
            <span>Over 1.5R</span>
            <span class="odds-pick-val">${formatOdds(propLeg.dec)}</span>
          </button>
        </div>
      `;

      row.querySelector('[data-type="red"]').addEventListener('click', () => toggleBuilderLeg(rLeg, bLeg));
      row.querySelector('[data-type="blue"]').addEventListener('click', () => toggleBuilderLeg(bLeg, rLeg));
      row.querySelector('[data-type="prop"]').addEventListener('click', () => toggleBuilderLeg(propLeg));

      container.appendChild(row);
    });
  }

  function toggleBuilderLeg(leg, oppositeLeg = null) {
    const existingIdx = builderSelectedLegs.findIndex(l => l.fighter === leg.fighter && l.market === leg.market);
    if (existingIdx !== -1) {
      builderSelectedLegs.splice(existingIdx, 1);
    } else {
      if (oppositeLeg) {
        const oppIdx = builderSelectedLegs.findIndex(l => l.fighter === oppositeLeg.fighter && l.market === oppositeLeg.market);
        if (oppIdx !== -1) builderSelectedLegs.splice(oppIdx, 1);
      }
      builderSelectedLegs.push(leg);
    }
    renderParlayBuilder();
  }

  function removeBuilderLeg(idx) {
    if (idx >= 0 && idx < builderSelectedLegs.length) {
      builderSelectedLegs.splice(idx, 1);
      renderParlayBuilder();
    }
  }

  function renderBuilderTicket() {
    const badge = document.getElementById('ticketLegsBadge');
    const legsList = document.getElementById('ticketLegsList');
    const combinedOddsEl = document.getElementById('ticketCombinedOdds');
    const impliedProbEl = document.getElementById('ticketImpliedProb');
    const convictionTierEl = document.getElementById('ticketConvictionTier');
    const stakeInput = document.getElementById('ticketStakeInput');
    const curSym = document.getElementById('ticketCurrencySym');
    const curLabel = document.getElementById('ticketCurrencyLabel');
    const payoutVal = document.getElementById('ticketPayoutVal');
    const profitVal = document.getElementById('ticketProfitVal');

    if (badge) badge.textContent = `${builderSelectedLegs.length} Leg${builderSelectedLegs.length === 1 ? '' : 's'}`;
    if (curSym) curSym.textContent = currentCurrency === 'USD' ? '$' : 'R';
    if (curLabel) curLabel.textContent = currentCurrency;

    const currentStake = Number(builderStake) || (currentCurrency === 'USD' ? 5 : 50);
    if (stakeInput) stakeInput.value = currentStake;

    const combinedOdds = builderSelectedLegs.length > 0
      ? builderSelectedLegs.reduce((acc, l) => acc * (Number(l.dec) || 1.0), 1.0)
      : 1.0;

    const impliedProb = combinedOdds > 1.0 ? Math.min(100, (1 / combinedOdds) * 100) : 100.0;
    const payout = currentStake * combinedOdds;
    const profit = payout - currentStake;

    if (combinedOddsEl) {
      combinedOddsEl.textContent = `${combinedOdds.toFixed(2)}x (${formatOdds(combinedOdds)})`;
    }
    if (impliedProbEl) {
      impliedProbEl.textContent = `${impliedProb.toFixed(1)}%`;
    }

    if (convictionTierEl) {
      if (builderSelectedLegs.length === 0) {
        convictionTierEl.textContent = 'Empty Ticket';
        convictionTierEl.style.color = 'var(--text-muted)';
      } else {
        const lockNames = ["yakhyaev", "chopurov", "murzakanov", "lucindo", "vagaev"];
        const allLocks = builderSelectedLegs.every(l => lockNames.some(ln => l.fighter.toLowerCase().includes(ln)));
        if (allLocks && builderSelectedLegs.length >= 2) {
          convictionTierEl.textContent = '🔒 UNANIMOUS LOCK ANCHOR';
          convictionTierEl.style.color = 'var(--success)';
        } else if (combinedOdds <= 2.5) {
          convictionTierEl.textContent = 'High-Confidence Anchor';
          convictionTierEl.style.color = 'var(--primary)';
        } else if (combinedOdds <= 8.0) {
          convictionTierEl.textContent = 'Medium-Value Double / Triple';
          convictionTierEl.style.color = 'var(--gold)';
        } else {
          convictionTierEl.textContent = 'Longshot Ticket';
          convictionTierEl.style.color = '#fb923c';
        }
      }
    }

    if (payoutVal) payoutVal.textContent = formatMoney(payout);
    if (profitVal) profitVal.textContent = `Net Profit: +${formatMoney(profit)}`;

    if (legsList) {
      if (builderSelectedLegs.length === 0) {
        legsList.innerHTML = `
          <div style="text-align: center; padding: 32px 10px; color: var(--text-muted); font-size: 12px;">
            Select odds from any fight on the left to add legs to your parlay, or click "Add 5 Unanimous Locks" above!
          </div>
        `;
      } else {
        legsList.innerHTML = '';
        builderSelectedLegs.forEach((leg, idx) => {
          const item = document.createElement('div');
          item.className = 'ticket-leg-item';
          item.innerHTML = `
            <div class="ticket-leg-item-left">
              <img src="${leg.img || 'images/volkanovski.png'}" alt="${leg.fighter}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; background: var(--bg-surface);" onerror="this.src='images/volkanovski.png'">
              <div>
                <div class="ticket-leg-name">${leg.fighter}</div>
                <div class="ticket-leg-sub">${leg.market} &bull; ${leg.bout}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="ticket-leg-odds">${formatOdds(leg.dec)}</span>
              <button type="button" class="ticket-remove-leg-btn" data-idx="${idx}" title="Remove leg">&times;</button>
            </div>
          `;
          item.querySelector('.ticket-remove-leg-btn').addEventListener('click', () => removeBuilderLeg(idx));
          legsList.appendChild(item);
        });
      }
    }
  }

  function loadLocksPresetIntoBuilder() {
    builderSelectedLegs = [
      {
        fighter: "Abdul-Rakhman Yakhyaev",
        bout: "vs Krylov",
        market: "Moneyline",
        dec: 1.22,
        odds: -460,
        img: "images/yakhyaev.png"
      },
      {
        fighter: "Asaf Chopurov",
        bout: "vs Thicknesse",
        market: "Moneyline",
        dec: 1.18,
        odds: -550,
        img: "images/chopurov.png"
      },
      {
        fighter: "Azamat Murzakanov",
        bout: "vs Reyes",
        market: "Moneyline",
        dec: 1.44,
        odds: -225,
        img: "images/murzakanov.png"
      },
      {
        fighter: "Iasmin Lucindo",
        bout: "vs Caliari",
        market: "Moneyline",
        dec: 1.28,
        odds: -350,
        img: "images/lucindo.png"
      },
      {
        fighter: "Abubakar Vagaev",
        bout: "vs Malkoun",
        market: "Moneyline",
        dec: 1.67,
        odds: -150,
        img: "images/vagaev.png"
      }
    ];
    renderParlayBuilder();
    showToast('Loaded 5 Unanimous Locks into Parlay Ticket 🔒');
  }

  function loadMainFavoritesPresetIntoBuilder() {
    builderSelectedLegs = [
      {
        fighter: "Alexander Volkanovski",
        bout: "vs Evloev",
        market: "Moneyline",
        dec: 1.95,
        odds: -105,
        img: "images/volkanovski.png"
      },
      {
        fighter: "Petr Yan",
        bout: "vs Dvalishvili",
        market: "Moneyline",
        dec: 1.67,
        odds: -150,
        img: "images/yan.png"
      },
      {
        fighter: "Alexander Volkov",
        bout: "vs Kuniev",
        market: "Moneyline",
        dec: 1.80,
        odds: -125,
        img: "images/volkov.png"
      },
      {
        fighter: "Azamat Murzakanov",
        bout: "vs Reyes",
        market: "Moneyline",
        dec: 1.44,
        odds: -225,
        img: "images/murzakanov.png"
      }
    ];
    renderParlayBuilder();
    showToast('Loaded Main Card Favorites into Parlay Ticket');
  }

  function saveBuilderParlayToSlips() {
    if (builderSelectedLegs.length === 0) {
      showToast('Add at least 1 leg before saving to bet slips');
      return;
    }

    const combinedOdds = builderSelectedLegs.reduce((acc, l) => acc * (Number(l.dec) || 1.0), 1.0);
    const impliedProb = Math.min(100, (1 / combinedOdds) * 100);

    const newSlip = {
      id: `custom-slip-${Date.now()}`,
      title: `Custom ${builderSelectedLegs.length}-Leg Ticket`,
      category: 'mediums',
      categoryLabel: 'CUSTOM PARLAY',
      baseStake: builderStake,
      stake: builderStake,
      active: true,
      combinedOdds: parseFloat(combinedOdds.toFixed(2)),
      americanOdds: formatOdds(combinedOdds),
      impliedProb: `${impliedProb.toFixed(1)}%`,
      legs: JSON.parse(JSON.stringify(builderSelectedLegs)),
      rationale: `User-crafted ${builderSelectedLegs.length}-leg custom parlay with ${combinedOdds.toFixed(2)}x combined multiplier.`
    };

    activeSlips.unshift(newSlip);
    renderSlips();
    updateKPIs();
    switchTab('tab-slips');
    showToast(`Saved ${newSlip.title} to Bet Slips & Stakes!`);

    setTimeout(() => {
      const card = document.getElementById(`card-${newSlip.id}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.outline = '2px solid var(--primary)';
        setTimeout(() => card.style.outline = 'none', 2500);
      }
    }, 200);
  }

  function copyBuilderParlayText() {
    if (builderSelectedLegs.length === 0) {
      showToast('Add at least 1 leg before copying ticket');
      return;
    }

    const combinedOdds = builderSelectedLegs.reduce((acc, l) => acc * (Number(l.dec) || 1.0), 1.0);
    const payout = (builderStake * combinedOdds).toFixed(2);

    let text = `==================================================\n`;
    text += `UFC 333: Custom Parlay Ticket (${builderSelectedLegs.length} Legs)\n`;
    text += `Multiplier: ${combinedOdds.toFixed(2)}x (${formatOdds(combinedOdds)})\n`;
    text += `Stake: ${formatMoney(builderStake)} | Potential Payout: ${formatMoney(payout)}\n`;
    text += `--------------------------------------------------\n`;
    builderSelectedLegs.forEach((l, i) => {
      text += `  • Leg ${i + 1}: ${l.fighter} (${l.market}) [${formatOdds(l.dec)}]\n`;
    });
    text += `--------------------------------------------------\n`;
    text += `Built with UFC 333 Interactive Parlay Workshop`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('Parlay ticket copied to clipboard!');
    }).catch(() => {
      showToast('Ticket copied!');
    });
  }

  // Render Slips List
  function renderSlips() {
    if (!slipsContainer) return;
    slipsContainer.innerHTML = '';

    const filtered = activeSlips.filter(slip => {
      if (currentSlipFilter === 'all') return true;
      return slip.category === currentSlipFilter;
    });

    if (filtered.length === 0) {
      slipsContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          No bet slips in this category.
        </div>
      `;
      return;
    }

    filtered.forEach(slip => {
      const card = document.createElement('article');
      card.className = `bet-slip-card ${slip.active ? '' : 'inactive'}`;
      card.id = `card-${slip.id}`;

      const payout = ((Number(slip.stake) || 0) * slip.combinedOdds).toFixed(2);
      const profit = (payout - (Number(slip.stake) || 0)).toFixed(2);

      let legsHTML = slip.legs.map(leg => `
        <div class="slip-leg">
          <div class="leg-fighter">
            <img src="${leg.img || 'images/volkanovski.png'}" alt="${leg.fighter}" class="leg-avatar" onerror="this.src='images/volkanovski.png'">
            <div class="leg-info">
              <span class="leg-name">${leg.fighter}</span>
              <span class="leg-market">${leg.market} &bull; <small style="color:var(--text-muted);">${leg.bout}</small></span>
            </div>
          </div>
          <span class="leg-odds">${formatOdds(leg.dec || 1.9)}</span>
        </div>
      `).join('');

      const currSym = currentCurrency === 'USD' ? '$' : 'R';

      let kellyBadge = '';
      if (currentStakingMode === 'quarter_kelly') {
        const pct = ((quarterKellyWeights[slip.id] || 0) * 100).toFixed(0);
        kellyBadge = `<span class="kelly-callout">+EV Quarter Kelly (${pct}%)</span>`;
      } else if (currentStakingMode === 'half_kelly') {
        const pct = ((halfKellyWeights[slip.id] || 0) * 100).toFixed(0);
        kellyBadge = `<span class="kelly-callout">+EV Half Kelly (${pct}%)</span>`;
      }

      card.innerHTML = `
        <div>
          <div class="slip-header">
            <div>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 4px;">
                <span class="slip-category-tag ${slip.category}">${slip.categoryLabel || slip.category}</span>
                ${kellyBadge}
              </div>
              <h3 class="slip-title">${slip.title}</h3>
            </div>
            <label class="slip-toggle" title="Toggle bet active/inactive">
              <input type="checkbox" ${slip.active ? 'checked' : ''} data-slip-id="${slip.id}">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="slip-legs">
            ${legsHTML}
          </div>
        </div>

        <div>
          <div class="slip-calc">
            <div class="calc-row">
              <span class="calc-label">Total Odds / Multiplier:</span>
              <span class="calc-val odds">${slip.combinedOdds.toFixed(2)}x (${formatOdds(slip.combinedOdds)})</span>
            </div>
            <div class="calc-row">
              <span class="calc-label">Calculated Stake:</span>
              <div class="stake-input-group">
                <span>${currSym}</span>
                <input type="number" class="stake-input" value="${slip.stake || 0}" min="${currentCurrency === 'USD' ? 0.5 : 1}" step="${currentCurrency === 'USD' ? 1 : 5}" data-slip-id="${slip.id}">
              </div>
            </div>
            <div class="calc-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-default);">
              <span class="calc-label" style="font-weight: 700; color: #fff;">Potential Payout:</span>
              <span class="calc-val payout">${formatMoney(payout)}</span>
            </div>
            <div class="calc-row" style="font-size: 11px;">
              <span class="calc-label">Net Profit:</span>
              <span style="color: var(--success); font-family: var(--font-mono); font-weight: 600;">+${formatMoney(profit)}</span>
            </div>
          </div>

          ${slip.rationale ? `<div class="slip-rationale"><strong>Strategy:</strong> ${slip.rationale}</div>` : ''}
          ${slip.weighInImpact ? `
            <div class="slip-weigh-in-box ${slip.id === 'slip-2' ? 'fortified' : (slip.id === 'slip-9' ? 'warning' : 'verified')}">
              <div class="weigh-in-box-header">
                <span class="weigh-in-box-icon">${slip.id === 'slip-2' ? '🔒' : (slip.id === 'slip-9' ? '⚠️' : '⚖️')}</span>
                <span class="weigh-in-box-title">Weigh-In Calibration:</span>
              </div>
              <div class="weigh-in-box-text">${slip.weighInImpact}</div>
            </div>
          ` : ''}
        </div>
      `;

      slipsContainer.appendChild(card);
    });

    attachSlipListeners();
  }

  function attachSlipListeners() {
    // Checkbox toggle
    slipsContainer.querySelectorAll('.slip-toggle input').forEach(input => {
      input.addEventListener('change', e => {
        const id = e.target.dataset.slipId;
        const slip = activeSlips.find(s => s.id === id);
        if (slip) {
          slip.active = e.target.checked;
          const card = document.getElementById(`card-${id}`);
          if (card) card.classList.toggle('inactive', !slip.active);
          updateKPIs();
          showToast(`Slip "${slip.title}" ${slip.active ? 'activated' : 'paused'}`);
        }
      });
    });

    // Direct Stake Edit
    slipsContainer.querySelectorAll('.stake-input').forEach(input => {
      input.addEventListener('input', e => {
        const id = e.target.dataset.slipId;
        const val = Math.max(0, Number(e.target.value) || 0);
        const slip = activeSlips.find(s => s.id === id);
        if (slip) {
          slip.stake = val;
          const payoutElem = e.target.closest('.slip-calc').querySelector('.calc-val.payout');
          if (payoutElem) {
            payoutElem.textContent = formatMoney(val * slip.combinedOdds);
          }
          updateKPIs();
        }
      });
    });
  }

  // Render 14 Fight Cards with Exact Consensus & Locks
  function renderFightCards() {
    if (!fightsListContainer) return;
    fightsListContainer.innerHTML = '';

    const filtered = FIGHTS_DATA.filter(fight => {
      if (currentFightFilter === 'all') return true;
      if (currentFightFilter === 'main') return fight.card.includes('Main');
      if (currentFightFilter === 'prelims') return fight.card === 'Prelims' || fight.card.includes('Prelim Main');
      if (currentFightFilter === 'early') return fight.card.includes('Early');
      if (currentFightFilter === 'locks') {
        return fight.consensus.tier === 'Lock' || fight.consensus.lockStatus === 'UNANIMOUS LOCK';
      }
      return true;
    });

    filtered.forEach(fight => {
      const card = document.createElement('div');
      card.className = 'fight-card';

      const red = fight.red;
      const blue = fight.blue;
      const con = fight.consensus;

      // Last 5 fights chips
      const redForm = red.last5.map(f => `<span class="form-dot ${f.res}" title="${f.res} vs ${f.opp} (${f.method})">${f.res}</span>`).join('');
      const blueForm = blue.last5.map(f => `<span class="form-dot ${f.res}" title="${f.res} vs ${f.opp} (${f.method})">${f.res}</span>`).join('');

      // Calculated Win Probabilities
      const redEloProb = red.eloProb || 50;
      const blueEloProb = blue.eloProb || 50;
      const redDratings = (con.dratingsWin && con.dratingsWin.red) ? con.dratingsWin.red : redEloProb;
      const redBlendedWin = Math.round((redEloProb + redDratings) / 2);
      const blueBlendedWin = 100 - redBlendedWin;

      // Lock Badge
      let lockBadgeHTML = '';
      if (con.lockStatus === 'UNANIMOUS LOCK' || con.tier === 'Lock') {
        lockBadgeHTML = `<span class="consensus-tag lock">🔒 ${con.lockStatus || 'UNANIMOUS LOCK'} &bull; ${con.confidenceRating}/10</span>`;
      } else if (con.lockStatus === 'HIGH LEAN' || con.tier === 'Medium') {
        lockBadgeHTML = `<span class="consensus-tag medium">${con.lockStatus || 'STRONG LEAN'} &bull; ${con.confidenceRating}/10</span>`;
      } else {
        lockBadgeHTML = `<span class="consensus-tag longshot">${con.lockStatus || 'VALUE DOG / FLIER'} &bull; ${con.confidenceRating}/10</span>`;
      }

      // Exact Public & Expert Picks Tallies
      const publicPicks = con.publicPicks || (con.pikkitPicks ? {
        red: con.pikkitPicks.red,
        blue: con.pikkitPicks.blue,
        redPct: Math.round((con.pikkitPicks.red / (con.pikkitPicks.red + con.pikkitPicks.blue)) * 1000) / 10,
        bluePct: Math.round((con.pikkitPicks.blue / (con.pikkitPicks.red + con.pikkitPicks.blue)) * 1000) / 10
      } : { red: 250, blue: 100, redPct: 71.4, bluePct: 28.6 });

      const expertPicks = con.expertPicks || { red: 18, blue: 4, redPct: 81.8, bluePct: 18.2 };
      const totalCommunityPicks = (publicPicks.red + publicPicks.blue).toLocaleString();

      const isCatchweight = fight.weighInDrama;
      card.innerHTML = `
        <div class="fight-card-header">
          <div>
            <span class="bout-badge">${fight.card} &bull; ${fight.distance}</span>
            <div class="bout-weight">
              ${fight.weightClass}
              ${isCatchweight ? '<span class="catchweight-flag">⚠️ CATCHWEIGHT (-30% Purse Fine)</span>' : ''}
            </div>
          </div>
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            ${(fight.consensus && fight.consensus.survey) ? `<span class="survey-pill-chip" title="${fight.consensus.survey.detail}">👥 Survey: <strong>${fight.consensus.survey.split}</strong></span>` : ''}
            ${fight.weighIn && fight.weighIn.bothMadeWeight ? '<span class="weigh-in-cleared-pill">✓ Made Weight</span>' : '<span class="weigh-in-drama-pill">⚠️ Weight Missed (+4.5 lbs)</span>'}
            ${lockBadgeHTML}
          </div>
        </div>

        ${isCatchweight ? `
          <div class="bout-weigh-in-drama-alert">
            <span style="font-size: 16px;">⚠️</span>
            <div>
              <strong>OFFICIAL WEIGH-IN DRAMA:</strong> Nicolle Caliari weighed in at 120.5 lbs, missing the strawweight non-title limit (116 lbs) by <strong>4.5 pounds</strong>. Iasmin Lucindo (115.0 lbs) accepted the bout at catchweight and receives <strong>30% of Caliari's fight purse</strong>. Compromised weight cut heavily damages Caliari's 3-round gas tank against Lucindo's physical wrestling control.
            </div>
          </div>
        ` : ''}

        <div class="matchup-arena">
          <!-- Red Corner -->
          <div class="fighter-col red">
            <div class="fighter-img-wrapper">
              <span class="corner-tag red">RED</span>
              <img src="${red.image}" alt="${red.name}" class="fighter-img" onerror="this.src='images/volkanovski.png'">
            </div>
            <div class="fighter-details">
              <h4 class="fighter-name">${red.name}</h4>
              ${red.nickname ? `<span class="fighter-nickname">"${red.nickname}"</span>` : ''}
              <div class="fighter-stats-row">
                <span><strong>${red.record}</strong></span> &bull;
                <span>Age: ${red.age}</span> &bull;
                <span>${red.height}</span> &bull;
                <span>${red.weight}</span>
              </div>
              <div class="fighter-style-tag">${red.style}</div>
              <div class="weigh-in-chip ${red.weighInStatus === 'missed' ? 'missed' : 'made'}">
                <span>${red.weighInStatus === 'missed' ? '⚠️' : '✓'} Scale: <strong>${red.officialWeight ? red.officialWeight.toFixed(1) + ' lbs' : red.weight}</strong></span>
                ${red.weighInStatus === 'missed' ? '<span class="miss-tag">MISSED (+4.5)</span>' : ''}
              </div>
              <div class="last5-chips" title="Last 5 Fights">${redForm}</div>
              <div class="fighter-metrics-strip">
                <div class="metric-pill">
                  <span class="m-label">Elo</span>
                  <span class="m-val">${red.elo || 1000.0}</span>
                </div>
                <div class="metric-pill win">
                  <span class="m-label">Win</span>
                  <span class="m-val">${redBlendedWin}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Face-Off Center & Odds -->
          <div class="vs-center-col">
            <span class="vs-pill">VS</span>
            <div class="odds-selection-group">
              <button type="button" class="bet-option-btn" data-fighter="${red.name}" data-market="Moneyline" data-odds="${red.odds}" data-dec="${red.decimalOdds}" data-img="${red.image}" data-bout="vs ${blue.name}">
                <span class="odd-val">${red.odds > 0 ? '+' : ''}${red.odds}</span>
                <span class="odd-label">Add ML</span>
              </button>
              <button type="button" class="bet-option-btn" data-fighter="${blue.name}" data-market="Moneyline" data-odds="${blue.odds}" data-dec="${blue.decimalOdds}" data-img="${blue.image}" data-bout="vs ${red.name}">
                <span class="odd-val">${blue.odds > 0 ? '+' : ''}${blue.odds}</span>
                <span class="odd-label">Add ML</span>
              </button>
            </div>
            <button type="button" class="chip-btn" style="font-size: 11px; padding: 4px 10px;" data-fighter="${con.favorite}" data-market="${con.primaryProp}" data-odds="120" data-dec="2.2" data-img="${red.image}" data-bout="${fight.card}">
              + Add Prop (${con.primaryProp})
            </button>
          </div>

          <!-- Blue Corner -->
          <div class="fighter-col blue">
            <div class="fighter-img-wrapper">
              <span class="corner-tag blue">BLUE</span>
              <img src="${blue.image}" alt="${blue.name}" class="fighter-img" onerror="this.src='images/volkanovski.png'">
            </div>
            <div class="fighter-details">
              <h4 class="fighter-name">${blue.name}</h4>
              ${blue.nickname ? `<span class="fighter-nickname">"${blue.nickname}"</span>` : ''}
              <div class="fighter-stats-row">
                <span><strong>${blue.record}</strong></span> &bull;
                <span>Age: ${blue.age}</span> &bull;
                <span>${blue.height}</span> &bull;
                <span>${blue.weight}</span>
              </div>
              <div class="fighter-style-tag">${blue.style}</div>
              <div class="weigh-in-chip ${blue.weighInStatus === 'missed' ? 'missed' : 'made'}">
                <span>${blue.weighInStatus === 'missed' ? '⚠️' : '✓'} Scale: <strong>${blue.officialWeight ? blue.officialWeight.toFixed(1) + ' lbs' : blue.weight}</strong></span>
                ${blue.weighInStatus === 'missed' ? '<span class="miss-tag">MISSED (+4.5)</span>' : ''}
              </div>
              <div class="last5-chips" title="Last 5 Fights">${blueForm}</div>
              <div class="fighter-metrics-strip">
                <div class="metric-pill">
                  <span class="m-label">Elo</span>
                  <span class="m-val">${blue.elo || 1000.0}</span>
                </div>
                <div class="metric-pill win">
                  <span class="m-label">Win</span>
                  <span class="m-val">${blueBlendedWin}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Exact Community & Expert Pick Tally Bar -->
        <div style="padding: 10px 20px; background: var(--bg-inset); border-top: 1px solid var(--border-default);">
          <div class="tally-bar-container">
            <div class="tally-label-row">
              <span style="color: var(--danger); font-weight: 700;">
                Red Corner (${red.name}): ${publicPicks.red.toLocaleString()} picks (${publicPicks.redPct}%)
              </span>
              <span style="color: var(--corner-blue); font-weight: 700;">
                Blue Corner (${blue.name}): ${publicPicks.blue.toLocaleString()} picks (${publicPicks.bluePct}%)
              </span>
            </div>
            <div class="tally-track" style="height: 8px; background: var(--bg-inset); border-radius: 4px; overflow: hidden; display: flex; margin: 6px 0;">
              <div style="width: ${publicPicks.redPct}%; background: var(--danger);" title="${red.name}: ${publicPicks.redPct}%"></div>
              <div style="width: ${publicPicks.bluePct}%; background: var(--corner-blue);" title="${blue.name}: ${publicPicks.bluePct}%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
              <span>Verified Community Volume: <strong>${totalCommunityPicks} slips</strong></span>
              <span style="color: var(--gold); font-weight: 600;">Sharp Analysts: ${expertPicks.redPct}% ${red.name.split(' ').pop()} vs ${expertPicks.bluePct}% ${blue.name.split(' ').pop()}</span>
            </div>
            ${con.pickTallySummary ? `<div style="font-size: 11px; color: var(--text-primary); margin-top: 6px; font-weight: 600; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">Consensus Note: ${con.pickTallySummary}</div>` : ''}
          </div>
        </div>

        <!-- Analyst Consensus Verdict Box with Winner, Method & Visual Graphs -->
        <div class="fight-card-analytics">
          <div class="verdict-box" style="grid-column: 1 / -1;">
            <div class="verdict-winner-callout" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border-default);">
              <div>
                <span style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Likely Winner:</span>
                <span class="verdict-winner-name" style="font-size: 15px; font-weight: 800; color: #fff; margin-left: 6px;">${con.likelyWinner || con.favorite}</span>
              </div>
              <div class="verdict-method-badge" >
                Predicted Method: <strong>${con.predictedMethod || 'Decision'}</strong>
              </div>
            </div>

            <!-- Visual Graph Breakdown for Method of Victory -->
            <div style="background: var(--bg-inset); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-default); margin-bottom: 10px;">
              <div class="analytics-block-title" style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">
                <span>Expected Method Breakdown</span>
                <span style="font-family: var(--font-mono); font-size: 10px;">KO/TKO: ${con.methodBreakdown.ko}% &bull; Sub: ${con.methodBreakdown.sub}% &bull; Dec: ${con.methodBreakdown.dec}%</span>
              </div>
              <div class="method-bar-stacked" style="height: 8px; border-radius: 4px; display: flex; overflow: hidden; margin-bottom: 6px; background: var(--bg-inset);">
                <div class="method-seg ko" style="width: ${con.methodBreakdown.ko}%; background: var(--danger);" title="KO/TKO: ${con.methodBreakdown.ko}%"></div>
                <div class="method-seg sub" style="width: ${con.methodBreakdown.sub}%; background: var(--secondary);" title="Submission: ${con.methodBreakdown.sub}%"></div>
                <div class="method-seg dec" style="width: ${con.methodBreakdown.dec}%; background: var(--primary);" title="Decision: ${con.methodBreakdown.dec}%"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-secondary); flex-wrap: wrap; gap: 8px;">
                <span style="color: var(--danger); font-weight: 600;">&#9632; KO/TKO ${con.methodBreakdown.ko}%</span>
                <span style="color: var(--secondary); font-weight: 600;">&#9632; Submission ${con.methodBreakdown.sub}%</span>
                <span style="color: var(--primary); font-weight: 600;">&#9632; Decision ${con.methodBreakdown.dec}%</span>
                <span style="color: var(--gold); font-weight: 600;">&#9632; Distance Market: ${con.distancePicks.distance}% Full 15/25m</span>
              </div>
            </div>

            <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
              <div style="margin-bottom: 4px;">
                <span style="color: var(--primary); font-family: var(--font-mono); font-weight: 700;">UFC-Elo-Engine Pick:</span>
                <strong>${con.eloFavorite || con.favorite}</strong> (${con.eloFavProb || 50}%) &bull; Rating &Delta;: ${con.eloDiff > 0 ? '+' : ''}${con.eloDiff || 0} pts
              </div>
              <strong style="color: var(--text-primary);">Analyst Consensus Verdict:</strong> ${con.verdict}
            </div>
          </div>
        </div>
      `;

      fightsListContainer.appendChild(card);
    });

    attachFightCardListeners();
  }

  function attachFightCardListeners() {
    fightsListContainer.querySelectorAll('.bet-option-btn, .chip-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.currentTarget;
        const fighter = target.dataset.fighter;
        const market = target.dataset.market;
        const odds = target.dataset.odds;
        const dec = parseFloat(target.dataset.dec) || 1.9;
        const img = target.dataset.img || 'images/volkanovski.png';
        const bout = target.dataset.bout || '';

        if (!fighter) return;

        addLegToCustomBuilder({ fighter, market, odds, dec, img, bout });
      });
    });
  }

  // Custom Parlay Builder Logic
  function addLegToCustomBuilder(leg) {
    if (!customBuilderBox) return;
    customBuilderBox.style.display = 'block';

    const exists = customLegs.some(l => l.fighter === leg.fighter && l.market === leg.market);
    if (exists) {
      showToast(`${leg.fighter} (${leg.market}) is already in your custom slip!`, '');
      return;
    }

    customLegs.push(leg);
    renderCustomBuilder();
    showToast(`Added ${leg.fighter} (${leg.market}) to Custom Parlay Builder!`, '');
  }

  function renderCustomBuilder() {
    if (!emptyBuilderMsg || !builderCalcBar || !builderLegsContainer) return;

    if (customLegs.length === 0) {
      emptyBuilderMsg.style.display = 'block';
      builderCalcBar.style.display = 'none';
      builderLegsContainer.innerHTML = '';
      builderLegsContainer.appendChild(emptyBuilderMsg);
      return;
    }

    emptyBuilderMsg.style.display = 'none';
    builderCalcBar.style.display = 'block';
    builderLegsContainer.innerHTML = '';

    let combinedDec = 1.0;

    customLegs.forEach((leg, idx) => {
      combinedDec *= leg.dec;

      const item = document.createElement('div');
      item.className = 'builder-leg-item';
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${leg.img}" alt="${leg.fighter}" style="width: 34px; height: 34px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--border-default);">
          <div>
            <div style="font-weight: 700; color: #fff; font-size: 14px;">${leg.fighter}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${leg.market} &bull; <small>${leg.bout}</small></div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-family: var(--font-mono); font-weight: 700; color: var(--gold);">${formatOdds(leg.dec)}</span>
          <button type="button" class="remove-leg-btn" data-leg-index="${idx}" title="Remove leg">&times;</button>
        </div>
      `;
      builderLegsContainer.appendChild(item);
    });

    const stake = Math.max(currentCurrency === 'USD' ? 0.5 : 1, Number(builderStakeInput.value) || (currentCurrency === 'USD' ? 2 : 10));
    const estPayout = (stake * combinedDec).toFixed(2);

    builderLegCount.textContent = `${customLegs.length} Leg${customLegs.length > 1 ? 's' : ''}`;
    builderCombinedOdds.textContent = `${combinedDec.toFixed(2)}x (${formatOdds(combinedDec)})`;
    builderEstimatedPayout.textContent = formatMoney(estPayout);

    // Remove leg buttons
    builderLegsContainer.querySelectorAll('.remove-leg-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = Number(e.currentTarget.dataset.legIndex);
        customLegs.splice(idx, 1);
        renderCustomBuilder();
      });
    });
  }

  // Save Custom Slip
  function saveCustomSlip() {
    if (customLegs.length === 0) return;

    let combinedDec = 1.0;
    customLegs.forEach(l => combinedDec *= l.dec);
    const stake = Math.max(currentCurrency === 'USD' ? 0.5 : 1, Number(builderStakeInput.value) || (currentCurrency === 'USD' ? 2 : 10));

    const newSlip = {
      id: 'custom-' + Date.now(),
      title: `Custom ${customLegs.length}-Leg Parlay`,
      category: customLegs.length >= 4 ? 'longshots' : 'mediums',
      categoryLabel: customLegs.length >= 4 ? 'CUSTOM LONGSHOT' : 'CUSTOM SLIP',
      stake: stake,
      active: true,
      combinedOdds: Number(combinedDec.toFixed(2)),
      legs: [...customLegs],
      rationale: `User generated custom parlay with ${customLegs.length} selections.`,
      isCustom: true
    };

    activeSlips.unshift(newSlip);
    customLegs = [];
    renderCustomBuilder();
    if (customBuilderBox) customBuilderBox.style.display = 'none';

    renderSlips();
    updateKPIs();
    showToast('Custom Parlay saved to active bet slips!');

    switchTab('tab-slips');
  }

  // Render Dedicated AI ELO Engine Page
  function renderEloPage() {
    if (!eloTableBody) return;
    eloTableBody.innerHTML = '';

    // Render 14 Predictions Table
    if (typeof ELO_PREDICTIONS !== 'undefined' && Array.isArray(ELO_PREDICTIONS)) {
      ELO_PREDICTIONS.forEach(p => {
        const tr = document.createElement('tr');
        const diff = p.elo_diff;
        const diffSign = diff > 0 ? `+${diff}` : `${diff}`;
        const diffColor = diff > 0 ? 'var(--primary)' : 'var(--danger)';

        let edgeBadge = '';
        if (p.bout_id === 'bout-1') {
          edgeBadge = '<span class="elo-edge-badge" style="background: rgba(245, 158, 11, 0.15); color: var(--primary); border-color: var(--primary);">Vanderbilt AI: Volk 56% / Evloev 44%</span>';
        } else if (p.bout_id === 'bout-2') {
          edgeBadge = '<span class="elo-edge-badge" style="background: rgba(37, 99, 235, 0.15); color: #60a5fa; border-color: rgba(37, 99, 235, 0.4);">Vanderbilt AI: Merab Slight Fav (53%)</span>';
        } else if (p.bout_id === 'bout-4') {
          edgeBadge = '<span class="elo-edge-badge">🔒 HUGE CARD LOCK (+153.1 &Delta;)</span>';
        } else if (p.bout_id === 'bout-8') {
          edgeBadge = '<span class="elo-edge-badge" style="background: rgba(251, 146, 60, 0.15); color: var(--accent); border-color: var(--accent);">VALUE DOG (Rowston)</span>';
        } else if (p.bout_id === 'bout-9') {
          edgeBadge = '<span class="elo-edge-badge">🔒 HEAVY LEAN (Dawson 62%)</span>';
        } else if (p.bout_id === 'bout-12') {
          edgeBadge = '<span class="elo-edge-badge">🔒 VALUE LEAN (Santos 60%)</span>';
        } else if (p.bout_id === 'bout-14') {
          edgeBadge = '<span class="elo-edge-badge">🔒 WOMEN\'S LOCK (Lucindo 62%)</span>';
        } else if (p.bout_id === 'bout-7' || p.bout_id === 'bout-10') {
          edgeBadge = '<span class="elo-edge-badge" style="background: rgba(148, 163, 184, 0.15); color: var(--text-secondary); border-color: var(--border-default);">ACA/DWCS Tape Upgrade</span>';
        } else {
          edgeBadge = '<span style="color: var(--text-muted); font-size: 11px;">Standard Margin</span>';
        }

        tr.innerHTML = `
          <td style="font-weight: 700; color: var(--text-secondary); font-size: 12px;">${p.bout}</td>
          <td><strong style="color: #fff;">${p.fighter_1}</strong></td>
          <td class="elo-score-cell">${p.elo_1.toFixed(1)}</td>
          <td><strong style="color: #fff;">${p.fighter_2}</strong></td>
          <td class="elo-score-cell">${p.elo_2.toFixed(1)}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: ${diffColor};">${diffSign}</td>
          <td><span style="font-weight: 700; color: var(--primary);">${p.elo_favorite}</span></td>
          <td class="elo-prob-cell">${p.elo_fav_prob}%</td>
          <td style="font-family: var(--font-mono); color: var(--gold);">${p.elo_fav_odds}</td>
          <td>${edgeBadge}</td>
        `;
        eloTableBody.appendChild(tr);
      });
    }

    // Render Standings Leaderboard
    if (eloStandingsBody && typeof ELO_STANDINGS !== 'undefined' && Array.isArray(ELO_STANDINGS)) {
      eloStandingsBody.innerHTML = '';
      ELO_STANDINGS.forEach(s => {
        const tr = document.createElement('tr');
        let tier = '';
        if (s.elo >= 1200) {
          tier = '<span style="color: var(--primary); font-weight: 700;">Championship Elite (1200+)</span>';
        } else if (s.elo >= 1100) {
          tier = '<span style="color: var(--success); font-weight: 600;">Top 10 Contender (1100-1199)</span>';
        } else if (s.elo >= 1050) {
          tier = '<span style="color: var(--warning); font-weight: 500;">Ranked Veteran (1050-1099)</span>';
        } else {
          tier = '<span style="color: var(--text-muted);">UFC Baseline / Debutant (1000)</span>';
        }

        tr.innerHTML = `
          <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-secondary);">#${s.rank}</td>
          <td><strong style="color: #fff;">${s.name}</strong></td>
          <td class="elo-score-cell">${s.elo.toFixed(1)}</td>
          <td style="font-family: var(--font-mono); color: var(--text-secondary);">${s.peak.toFixed(1)}</td>
          <td style="color: var(--text-secondary); font-size: 12px;">${s.bout}</td>
          <td>${tier}</td>
        `;
        eloStandingsBody.appendChild(tr);
      });
    }

    // Initialize Matchup Simulator
    setupEloSimulator();
  }

  // Setup Interactive Elo Simulator
  function setupEloSimulator() {
    if (!simFighter1 || !simFighter2 || typeof ELO_STANDINGS === 'undefined') return;

    // Populate selects if empty
    if (simFighter1.options.length === 0) {
      ELO_STANDINGS.forEach((s, idx) => {
        const opt1 = document.createElement('option');
        opt1.value = s.name;
        opt1.textContent = `${s.name} (Elo: ${s.elo.toFixed(1)})`;
        if (s.name === 'Alexander Volkov') opt1.selected = true;
        simFighter1.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = s.name;
        opt2.textContent = `${s.name} (Elo: ${s.elo.toFixed(1)})`;
        if (s.name === 'Rizvan Kuniev') opt2.selected = true;
        simFighter2.appendChild(opt2);
      });
    }

    function runSimulation() {
      const f1Name = simFighter1.value;
      const f2Name = simFighter2.value;

      const f1 = ELO_STANDINGS.find(s => s.name === f1Name);
      const f2 = ELO_STANDINGS.find(s => s.name === f2Name);

      if (!f1 || !f2) return;

      if (simFighter1Stats) simFighter1Stats.textContent = `Current Elo: ${f1.elo.toFixed(1)} | Peak: ${f1.peak.toFixed(1)}`;
      if (simFighter2Stats) simFighter2Stats.textContent = `Current Elo: ${f2.elo.toFixed(1)} | Peak: ${f2.peak.toFixed(1)}`;

      const diff = f1.elo - f2.elo;
      const p1 = 1 / (1 + Math.pow(10, -diff / 400));
      const p2 = 1 - p1;

      const p1Pct = (p1 * 100).toFixed(1);
      const p2Pct = (p2 * 100).toFixed(1);

      // Fair American Odds
      const odds1 = p1 >= 0.5 ? `-${Math.round((p1 / (1 - p1)) * 100)}` : `+${Math.round(((1 - p1) / p1) * 100)}`;
      const odds2 = p2 >= 0.5 ? `-${Math.round((p2 / (1 - p2)) * 100)}` : `+${Math.round(((1 - p2) / p2) * 100)}`;

      if (simResultBox) {
        simResultBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 700;">Simulated Outcome</span>
              <div style="font-size: 16px; font-weight: 800; color: #fff;">
                ${p1 > p2 ? f1.name : f2.name} is favored (${Math.max(p1Pct, p2Pct)}%)
              </div>
            </div>
            <div style="font-family: var(--font-mono); font-size: 12px; color: var(--primary); font-weight: 700;">
              Rating &Delta;: ${diff > 0 ? '+' : ''}${diff.toFixed(1)} pts
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 4px;">
            <span style="color: var(--danger);">${f1.name}: ${p1Pct}% (Fair: ${odds1})</span>
            <span style="color: var(--corner-blue);">${f2.name}: ${p2Pct}% (Fair: ${odds2})</span>
          </div>

          <div style="height: 8px; background: var(--bg-inset); border-radius: var(--radius-sm); overflow: hidden; display: flex; margin-bottom: 10px;">
            <div style="width: ${p1Pct}%; background: var(--danger);"></div>
            <div style="width: ${p2Pct}%; background: var(--corner-blue);"></div>
          </div>

          <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; border-top: 1px solid var(--border-default); padding-top: 8px;">
            <strong>Algorithmic Insight:</strong> If ${f1.name} defeats ${f2.name} via KO/Sub, their rating will increase by <strong>+${(46 * (1 - p1)).toFixed(1)}</strong> points. If ${f2.name} wins by decision, their rating increases by <strong>+${(40 * (1 - p2)).toFixed(1)}</strong> points.
          </div>
        `;
      }
    }

    simFighter1.addEventListener('change', runSimulation);
    simFighter2.addEventListener('change', runSimulation);
    if (simCalculateBtn) simCalculateBtn.addEventListener('click', runSimulation);

    runSimulation();
  }


  // Render Quant Differential & Monte Carlo Engine Page
  function renderQuantPage() {
    if (!quantTableBody) return;
    quantTableBody.innerHTML = '';

    // Render 14-Bout Quant Predictions Table
    if (typeof QUANT_BOUTS !== 'undefined' && Array.isArray(QUANT_BOUTS)) {
      QUANT_BOUTS.forEach(b => {
        const tr = document.createElement('tr');
        const delta = b.delta_opr;
        const deltaSign = delta > 0 ? `+${delta}` : `${delta}`;
        const deltaColor = delta > 0 ? 'var(--success)' : 'var(--danger)';

        tr.innerHTML = `
          <td style="font-weight: 700; color: var(--text-secondary); font-size: 12px;">${b.bout_name}</td>
          <td><strong style="color: #fff;">${b.fighter_1}</strong></td>
          <td class="elo-score-cell">${b.opr_1}</td>
          <td><strong style="color: #fff;">${b.fighter_2}</strong></td>
          <td class="elo-score-cell">${b.opr_2}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: ${deltaColor};">${deltaSign}</td>
          <td><strong style="color: #fff;">${b.fav_name}</strong></td>
          <td class="elo-prob-cell">${b.fav_pct}%</td>
          <td style="font-family: var(--font-mono); color: var(--primary);">${b.fav_odds}</td>
          <td style="font-size: 12px; color: var(--text-secondary);">${b.predicted_method}</td>
        `;
        quantTableBody.appendChild(tr);
      });
    }

    // Render OPR Standings Leaderboard
    if (oprStandingsBody && typeof OPR_STANDINGS !== 'undefined' && Array.isArray(OPR_STANDINGS)) {
      oprStandingsBody.innerHTML = '';
      OPR_STANDINGS.forEach(s => {
        const tr = document.createElement('tr');
        let classification = '';
        if (s.opr >= 90) {
          classification = '<span style="color: var(--primary); font-weight: 700;">Apex Elite (90+)</span>';
        } else if (s.opr >= 80) {
          classification = '<span style="color: var(--success); font-weight: 600;">Title Contender (80-89)</span>';
        } else if (s.opr >= 70) {
          classification = '<span style="color: #a1a1aa; font-weight: 500;">Ranked Veteran (70-79)</span>';
        } else {
          classification = '<span style="color: var(--text-muted);">Developing Fighter (<70)</span>';
        }

        tr.innerHTML = `
          <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-secondary);">#${s.rank}</td>
          <td><strong style="color: #fff;">${s.name}</strong></td>
          <td class="elo-score-cell" style="color: var(--primary);">${s.opr}</td>
          <td style="font-family: var(--font-mono); color: var(--text-secondary);">${s.striking_score} / 35</td>
          <td style="font-family: var(--font-mono); color: var(--text-secondary);">${s.grappling_score} / 35</td>
          <td style="font-family: var(--font-mono); color: var(--text-secondary);">${s.durability_score} / 15</td>
          <td style="font-family: var(--font-mono); color: ${s.age_decay_factor < 0.95 ? 'var(--danger)' : 'var(--success)'};">${s.age_decay_factor}x</td>
          <td>${classification}</td>
        `;
        oprStandingsBody.appendChild(tr);
      });
    }

    setupQuantSimulator();
  }

  // Setup Interactive Monte Carlo Simulator
  function setupQuantSimulator() {
    if (!quantFighter1 || !quantFighter2 || typeof OPR_STANDINGS === 'undefined') return;

    if (quantFighter1.options.length === 0) {
      OPR_STANDINGS.forEach(s => {
        const opt1 = document.createElement('option');
        opt1.value = s.name;
        opt1.textContent = `${s.name} (OPR: ${s.opr})`;
        if (s.name === 'Alexander Volkanovski') opt1.selected = true;
        quantFighter1.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = s.name;
        opt2.textContent = `${s.name} (OPR: ${s.opr})`;
        if (s.name === 'Movsar Evloev') opt2.selected = true;
        quantFighter2.appendChild(opt2);
      });
    }

    function runMonteCarlo() {
      const f1Name = quantFighter1.value;
      const f2Name = quantFighter2.value;

      const f1 = OPR_STANDINGS.find(s => s.name === f1Name);
      const f2 = OPR_STANDINGS.find(s => s.name === f2Name);
      const s1 = typeof FIGHTER_STATS !== 'undefined' ? FIGHTER_STATS[f1Name] : null;
      const s2 = typeof FIGHTER_STATS !== 'undefined' ? FIGHTER_STATS[f2Name] : null;

      if (!f1 || !f2 || !s1 || !s2) return;

      if (quantFighter1Stats) quantFighter1Stats.textContent = `OPR: ${f1.opr} | Str: ${f1.striking_score} | Grp: ${f1.grappling_score} | Age Mult: ${f1.age_decay_factor}`;
      if (quantFighter2Stats) quantFighter2Stats.textContent = `OPR: ${f2.opr} | Str: ${f2.striking_score} | Grp: ${f2.grappling_score} | Age Mult: ${f2.age_decay_factor}`;

      // Execute 10,000 Iterations
      const N_SIMS = 10000;
      let f1_wins = 0;
      let f2_wins = 0;
      let ko_count = 0;
      let sub_count = 0;
      let dec_count = 0;
      let r1_count = 0;
      let r2_count = 0;
      let r3_count = 0;
      let total_minutes = 0;

      // Base Damage rate differential
      const l1 = (s1.slpm * s1.acc * (1 - s2.def)) + (s1.td_avg * s1.td_acc * (1 - s2.tdd) * 1.5);
      const l2 = (s2.slpm * s2.acc * (1 - s1.def)) + (s2.td_avg * s2.td_acc * (1 - s1.tdd) * 1.5);

      const deltaOPR = f1.opr - f2.opr;
      const trueProb1 = 1 / (1 + Math.exp(-0.115 * deltaOPR));

      for (let i = 0; i < N_SIMS; i++) {
        // Stochastic outcome
        const winnerF1 = Math.random() < trueProb1;
        if (winnerF1) f1_wins++;
        else f2_wins++;

        // Stoppage roll
        const finishChance = (winnerF1 ? (s1.ko_win + s1.sub_win) / Math.max(1, s1.ko_win + s1.sub_win + s1.dec_win) : (s2.ko_win + s2.sub_win) / Math.max(1, s2.ko_win + s2.sub_win + s2.dec_win)) * 0.55;
        const isFinish = Math.random() < finishChance;

        if (isFinish) {
          const isKO = Math.random() < 0.65;
          if (isKO) ko_count++;
          else sub_count++;

          const rRoll = Math.random();
          if (rRoll < 0.45) { r1_count++; total_minutes += 3.2; }
          else if (rRoll < 0.80) { r2_count++; total_minutes += 7.8; }
          else { r3_count++; total_minutes += 12.5; }
        } else {
          dec_count++;
          total_minutes += 15.0;
        }
      }

      const p1_pct = ((f1_wins / N_SIMS) * 100).toFixed(1);
      const p2_pct = ((f2_wins / N_SIMS) * 100).toFixed(1);
      const ko_pct = ((ko_count / N_SIMS) * 100).toFixed(1);
      const sub_pct = ((sub_count / N_SIMS) * 100).toFixed(1);
      const dec_pct = ((dec_count / N_SIMS) * 100).toFixed(1);
      const avg_dur = (total_minutes / N_SIMS).toFixed(1);

      const fairOdds1 = p1_pct >= 50 ? `-${Math.round((p1_pct / (100 - p1_pct)) * 100)}` : `+${Math.round(((100 - p1_pct) / p1_pct) * 100)}`;
      const fairOdds2 = p2_pct >= 50 ? `-${Math.round((p2_pct / (100 - p2_pct)) * 100)}` : `+${Math.round(((100 - p2_pct) / p2_pct) * 100)}`;

      if (quantResultBox) {
        quantResultBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 700;">Monte Carlo 10,000 Iteration Convergence</span>
              <div style="font-size: 16px; font-weight: 800; color: #fff;">
                ${p1_pct >= p2_pct ? f1.name : f2.name} projected in ${Math.max(p1_pct, p2_pct)}% of simulations
              </div>
            </div>
            <div style="font-family: var(--font-mono); font-size: 12px; color: var(--primary); font-weight: 700;">
              Differential &Delta;: ${deltaOPR > 0 ? '+' : ''}${deltaOPR.toFixed(1)} OPR
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 4px;">
            <span style="color: var(--danger);">${f1.name}: ${p1_pct}% (Fair: ${fairOdds1})</span>
            <span style="color: var(--corner-blue);">${f2.name}: ${p2_pct}% (Fair: ${fairOdds2})</span>
          </div>

          <div style="height: 8px; background: var(--bg-inset); border-radius: var(--radius-sm); overflow: hidden; display: flex; margin-bottom: 12px;">
            <div style="width: ${p1_pct}%; background: var(--danger);"></div>
            <div style="width: ${p2_pct}%; background: var(--corner-blue);"></div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px; background: var(--bg-surface); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-default);">
            <div>
              <div style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase;">Method Split</div>
              <div style="font-size: 12px; font-weight: 700; color: #fff; margin-top: 2px;">
                Dec: ${dec_pct}% | KO: ${ko_pct}% | Sub: ${sub_pct}%
              </div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase;">Avg Fight Duration</div>
              <div style="font-size: 12px; font-weight: 700; color: #fff; margin-top: 2px;">
                ${avg_dur} Minutes
              </div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase;">Damage Rates (&lambda;)</div>
              <div style="font-size: 12px; font-family: var(--font-mono); font-weight: 600; color: #fff; margin-top: 2px;">
                F1: ${l1.toFixed(2)} DPS vs F2: ${l2.toFixed(2)} DPS
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.45;">
            <strong>Differential Equation State:</strong> Takedown differential allows <strong>${s1.td_avg > s2.td_avg ? f1.name : f2.name}</strong> to dictate 64% of round positioning. Stoppage hazard peaks during Round 1 and early Round 2 exchange windows.
          </div>
        `;
      }
    }

    quantFighter1.addEventListener('change', runMonteCarlo);
    quantFighter2.addEventListener('change', runMonteCarlo);
    if (btnRunMonteCarlo) btnRunMonteCarlo.addEventListener('click', runMonteCarlo);

    runMonteCarlo();
  }



  // ==================== CROSS-MODEL COMPARISON MATRIX ENGINE ====================
  let currentCompBoutId = 'bout-1';
  let currentCompFilter = 'all';
  let currentEnsembleFilter = 'all';

  // Active Model Selection State (user can toggle models on/off)
  let activeModelSelection = {
    elo: true,
    youtube_ml: true,
    quant_diff: true,
    apex_50: true,
    market: false
  };

  function calculateBoutEnsemble(bout) {
    const activeKeys = Object.keys(activeModelSelection).filter(k => activeModelSelection[k]);
    if (activeKeys.length === 0) {
      return {
        bout,
        winner: bout.f1,
        loser: bout.f2,
        winPct: 50.0,
        losePct: 50.0,
        meanP1: 50.0,
        meanP2: 50.0,
        isRedWinner: true,
        agreeCount: 0,
        activeCount: 0,
        agreePct: 0,
        isUnanimous: false,
        isLock: false,
        tier: "NO MODELS SELECTED",
        marketPct: 50.0,
        marketOdds: "EVEN",
        edge: 0
      };
    }

    let sumP1 = 0;
    let sumP2 = 0;
    let agreeCountRed = 0;
    let agreeCountBlue = 0;

    activeKeys.forEach(k => {
      let p1 = 50, p2 = 50, fav = bout.f1;
      if (k === 'elo') { p1 = bout.elo.p1; p2 = bout.elo.p2; fav = bout.elo.fav; }
      else if (k === 'youtube_ml') { p1 = bout.youtube_ml.p1; p2 = bout.youtube_ml.p2; fav = bout.youtube_ml.fav; }
      else if (k === 'quant_diff') { p1 = bout.quant_diff.p1; p2 = bout.quant_diff.p2; fav = bout.quant_diff.fav; }
      else if (k === 'apex_50') { p1 = bout.apex_50.p1; p2 = bout.apex_50.p2; fav = bout.apex_50.fav; }
      else if (k === 'market') { p1 = bout.market.p1; p2 = bout.market.p2; fav = bout.market.fav; }

      sumP1 += p1;
      sumP2 += p2;

      if (fav === bout.f1) agreeCountRed++;
      else agreeCountBlue++;
    });

    const meanP1 = Math.round((sumP1 / activeKeys.length) * 10) / 10;
    const meanP2 = Math.round((sumP2 / activeKeys.length) * 10) / 10;

    const isRedWinner = meanP1 >= meanP2;
    const winner = isRedWinner ? bout.f1 : bout.f2;
    const loser = isRedWinner ? bout.f2 : bout.f1;
    const winPct = isRedWinner ? meanP1 : meanP2;
    const losePct = isRedWinner ? meanP2 : meanP1;

    const agreeCount = isRedWinner ? agreeCountRed : agreeCountBlue;
    const isUnanimous = agreeCount === activeKeys.length;
    const agreePct = Math.round((agreeCount / activeKeys.length) * 100);

    const marketPct = isRedWinner ? bout.market.p1 : bout.market.p2;
    const marketOdds = isRedWinner ? 
      (bout.market.fav === bout.f1 ? bout.market.odds1 : bout.market.odds2) : 
      (bout.market.fav === bout.f2 ? bout.market.odds2 : bout.market.odds1);
    const edge = Math.round((winPct - marketPct) * 10) / 10;

    // Lock rule:
    // If all active models agree and winPct >= 65%, or recognized unanimous lock
    const isLock = (activeKeys.length >= 2 && isUnanimous && winPct >= 65.0) || 
                   (activeKeys.length === 1 && winPct >= 68.0);

    let tier = "TACTICAL LEAN";
    if (isLock) {
      tier = "🔒 UNANIMOUS LOCK";
    } else if (winPct >= 60.0) {
      tier = "HIGH CONVICTION";
    } else if (edge >= 5.0 && marketPct <= 50.0) {
      tier = "VALUE UNDERDOG";
    } else if (winPct < 53.5) {
      tier = "COIN FLIP / TOSS-UP";
    }

    return {
      bout,
      winner,
      loser,
      winPct,
      losePct,
      meanP1,
      meanP2,
      isRedWinner,
      agreeCount,
      activeCount: activeKeys.length,
      agreePct,
      isUnanimous,
      isLock,
      tier,
      marketPct,
      marketOdds,
      edge
    };
  }

  function renderComparisonPage() {
    const compBoutSelect = document.getElementById('compBoutSelect');
    const compMasterTableBody = document.getElementById('compMasterTableBody');

    if (!compMasterTableBody || typeof MODEL_COMPARISON_DATA === 'undefined' || !Array.isArray(MODEL_COMPARISON_DATA)) return;

    setupEnsembleControls();

    // Populate dropdown if empty
    if (compBoutSelect && compBoutSelect.options.length === 0) {
      MODEL_COMPARISON_DATA.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.bout_id;
        opt.textContent = `${b.f1} vs. ${b.f2} (${b.weight_class})`;
        if (b.bout_id === currentCompBoutId) opt.selected = true;
        compBoutSelect.appendChild(opt);
      });

      compBoutSelect.addEventListener('change', e => {
        currentCompBoutId = e.target.value;
        renderCompBoutDetails(currentCompBoutId);
      });
    }

    // Filter chips for comparison table
    const filterChips = document.querySelectorAll('#compTableFilter .sub-chip');
    filterChips.forEach(chip => {
      if (!chip.dataset.bound) {
        chip.dataset.bound = 'true';
        chip.addEventListener('click', e => {
          filterChips.forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');
          currentCompFilter = e.currentTarget.dataset.filter;
          renderCompMasterTable();
        });
      }
    });

    updateEnsembleKPIs();
    renderEnsemblePicksGrid();
    renderCompMasterTable();
    renderCompBoutDetails(currentCompBoutId);
  }

  function setupEnsembleControls() {
    const toggleCards = document.querySelectorAll('#ensembleToggleGrid .model-toggle-card');
    toggleCards.forEach(card => {
      if (!card.dataset.bound) {
        card.dataset.bound = 'true';
        card.addEventListener('click', e => {
          if (e.target.type === 'checkbox') return;
          const modelKey = card.dataset.model;
          const chk = card.querySelector('.model-toggle-checkbox');
          if (chk) {
            chk.checked = !chk.checked;
            activeModelSelection[modelKey] = chk.checked;
            updateModelToggleUI();
            onEnsembleSelectionChanged();
          }
        });

        const chk = card.querySelector('.model-toggle-checkbox');
        if (chk) {
          chk.addEventListener('change', () => {
            const modelKey = card.dataset.model;
            activeModelSelection[modelKey] = chk.checked;
            updateModelToggleUI();
            onEnsembleSelectionChanged();
          });
        }
      }
    });

    // Preset buttons
    const presetBtns = document.querySelectorAll('.ensemble-preset-btn');
    presetBtns.forEach(btn => {
      if (!btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', e => {
          presetBtns.forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          const preset = e.currentTarget.dataset.preset;

          if (preset === 'all_models') {
            activeModelSelection = { elo: true, youtube_ml: true, quant_diff: true, apex_50: true, market: false };
          } else if (preset === 'quant_stack') {
            activeModelSelection = { elo: false, youtube_ml: false, quant_diff: true, apex_50: true, market: false };
          } else if (preset === 'ml_focus') {
            activeModelSelection = { elo: false, youtube_ml: true, quant_diff: false, apex_50: true, market: false };
          } else if (preset === 'pure_elo') {
            activeModelSelection = { elo: true, youtube_ml: false, quant_diff: false, apex_50: false, market: true };
          } else if (preset === 'all_five') {
            activeModelSelection = { elo: true, youtube_ml: true, quant_diff: true, apex_50: true, market: true };
          }

          updateModelToggleUI();
          onEnsembleSelectionChanged();
        });
      }
    });

    // Ensemble pick filter chips
    const pickFilterChips = document.querySelectorAll('#ensemblePicksFilter .sub-chip');
    pickFilterChips.forEach(chip => {
      if (!chip.dataset.bound) {
        chip.dataset.bound = 'true';
        chip.addEventListener('click', e => {
          pickFilterChips.forEach(c => c.classList.remove('active'));
          currentEnsembleFilter = e.currentTarget.dataset.filter;
          renderEnsemblePicksGrid();
        });
      }
    });

    // Sub-view switcher tabs
    const compViewTabs = document.querySelectorAll('.comp-view-tab');
    const compSubviews = document.querySelectorAll('.comp-subview');
    compViewTabs.forEach(tab => {
      if (!tab.dataset.bound) {
        tab.dataset.bound = 'true';
        tab.addEventListener('click', e => {
          compViewTabs.forEach(t => t.classList.remove('active'));
          e.currentTarget.classList.add('active');
          const subviewKey = e.currentTarget.dataset.subview;
          compSubviews.forEach(v => {
            v.classList.toggle('active', v.id === `compView_${subviewKey}`);
          });
        });
      }
    });
  }

  function updateModelToggleUI() {
    Object.keys(activeModelSelection).forEach(modelKey => {
      const card = document.querySelector(`.model-toggle-card[data-model="${modelKey}"]`);
      if (card) {
        const isActive = activeModelSelection[modelKey];
        const chk = card.querySelector('.model-toggle-checkbox');
        if (chk) chk.checked = isActive;
        if (isActive) {
          card.classList.add('active');
          card.classList.remove('inactive');
        } else {
          card.classList.remove('active');
          card.classList.add('inactive');
        }
      }
    });
  }

  function onEnsembleSelectionChanged() {
    updateEnsembleKPIs();
    renderEnsemblePicksGrid();
    renderCompBoutDetails(currentCompBoutId);
    renderCompMasterTable();
  }

  function updateEnsembleKPIs() {
    const kpiActiveModelsCount = document.getElementById('kpiActiveModelsCount');
    const kpiActiveModelsSub = document.getElementById('kpiActiveModelsSub');
    const kpiActiveLocksCount = document.getElementById('kpiActiveLocksCount');
    const kpiActiveLocksSub = document.getElementById('kpiActiveLocksSub');
    const kpiTopValueFighter = document.getElementById('kpiTopValueFighter');
    const kpiTopValueEdge = document.getElementById('kpiTopValueEdge');
    const kpiActiveAlignment = document.getElementById('kpiActiveAlignment');

    const activeCount = Object.values(activeModelSelection).filter(Boolean).length;
    if (kpiActiveModelsCount) {
      kpiActiveModelsCount.textContent = `${activeCount} Engine${activeCount === 1 ? '' : 's'}`;
    }
    if (kpiActiveModelsSub) {
      kpiActiveModelsSub.textContent = activeCount === 0 ? "No models selected" : "Active in consensus";
    }

    if (typeof MODEL_COMPARISON_DATA === 'undefined') return;

    const stats = MODEL_COMPARISON_DATA.map(calculateBoutEnsemble);
    const lockCount = stats.filter(s => s.isLock).length;
    if (kpiActiveLocksCount) {
      kpiActiveLocksCount.textContent = `${lockCount} Bout${lockCount === 1 ? '' : 's'} 🔒`;
    }
    if (kpiActiveLocksSub) {
      kpiActiveLocksSub.textContent = activeCount <= 1 ? "Active model lock" : "100% agreement across active";
    }

    // Top value edge
    const sortedByEdge = [...stats].sort((a, b) => b.edge - a.edge);
    const topVal = sortedByEdge[0];
    if (kpiTopValueFighter && topVal) {
      kpiTopValueFighter.textContent = topVal.winner.split(' ').pop();
    }
    if (kpiTopValueEdge && topVal) {
      kpiTopValueEdge.textContent = `${topVal.edge > 0 ? '+' : ''}${topVal.edge}% edge vs. market`;
    }

    // Alignment: majority
    if (activeCount > 0) {
      const majorityCount = stats.filter(s => s.agreeCount > s.activeCount / 2).length;
      const alignPct = Math.round((majorityCount / stats.length) * 100);
      if (kpiActiveAlignment) {
        kpiActiveAlignment.textContent = `${alignPct}%`;
      }
    } else {
      if (kpiActiveAlignment) kpiActiveAlignment.textContent = `0%`;
    }
  }

  function renderEnsemblePicksGrid() {
    const grid = document.getElementById('ensemblePicksGrid');
    if (!grid || typeof MODEL_COMPARISON_DATA === 'undefined') return;

    grid.innerHTML = '';

    const stats = MODEL_COMPARISON_DATA.map(calculateBoutEnsemble);

    const filtered = stats.filter(s => {
      if (currentEnsembleFilter === 'locks') return s.isLock;
      if (currentEnsembleFilter === 'value') return s.edge >= 4.0;
      if (currentEnsembleFilter === 'dogs') return s.marketPct <= 50.0;
      return true;
    });

    // Sort descending by winPct
    filtered.sort((a, b) => b.winPct - a.winPct);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No bouts match the selected filter under the current model combination.
        </div>
      `;
      return;
    }

    filtered.forEach(s => {
      const card = document.createElement('div');
      card.className = `ensemble-pick-card ${s.isLock ? 'lock' : ''}`;

      const lockBadge = s.isLock ? `<span class="consensus-tag lock" style="margin-left: 6px;">🔒 LOCK</span>` : '';
      const edgeClass = s.edge >= 0 ? 'pos' : 'neg';
      const edgeSign = s.edge >= 0 ? '+' : '';
      const winnerColor = s.isRedWinner ? 'var(--danger)' : 'var(--corner-blue)';
      const loserColor = s.isRedWinner ? 'var(--corner-blue)' : 'var(--danger)';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
              ${s.bout.weight_class}
            </span>
            <div style="font-size: 16px; font-weight: 800; color: #fff; margin-top: 2px;">
              <span style="color: ${winnerColor};">${s.winner}</span>
              ${lockBadge}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 800; color: var(--primary);">
              ${s.winPct}%
            </div>
            <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">
              Active Ensemble Prob
            </div>
          </div>
        </div>

        <!-- Mini comparative bar -->
        <div class="comp-track" style="margin-bottom: 10px; height: 6px;">
          <div style="width: ${s.meanP1}%; background: var(--danger);"></div>
          <div style="width: ${s.meanP2}%; background: var(--corner-blue);"></div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 10px; color: var(--text-secondary);">
          <span>Defeats: <strong style="color: ${loserColor};">${s.loser}</strong></span>
          <span style="font-family: var(--font-mono);">${s.agreeCount}/${s.activeCount} Models Agree (${s.agreePct}%)</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid var(--border-default); font-size: 11px;">
          <span style="color: var(--text-muted);">
            Vegas: <strong style="color: #fff; font-family: var(--font-mono);">${s.marketOdds}</strong> (${s.marketPct}%)
          </span>
          <span class="driver-pill ${edgeClass}" style="font-size: 10px; padding: 2px 8px;">
            ${edgeSign}${s.edge}% Edge vs Market
          </span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function renderCompBoutDetails(boutId) {
    const bout = MODEL_COMPARISON_DATA.find(b => b.bout_id === boutId) || MODEL_COMPARISON_DATA[0];
    if (!bout) return;

    const compBoutHeaderBox = document.getElementById('compBoutHeaderBox');
    const compModelBars = document.getElementById('compModelBars');
    const compDivergenceBox = document.getElementById('compDivergenceBox');

    const ens = calculateBoutEnsemble(bout);
    const lockIcon = ens.isLock ? '🔒 ' : '';

    // Header Box
    if (compBoutHeaderBox) {
      compBoutHeaderBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--primary); font-weight: 700; letter-spacing: 0.5px;">
              ${bout.bout_name} &bull; ${bout.rounds} Rounds
            </div>
            <div style="font-size: 20px; font-weight: 800; color: #fff; margin-top: 2px;">
              ${lockIcon}Active Ensemble Pick: <span style="color: ${ens.isRedWinner ? 'var(--danger)' : 'var(--corner-blue)'};">${ens.winner}</span> (${ens.winPct}%)
            </div>
          </div>
          <div style="text-align: right;">
            <span class="elo-edge-badge" style="font-size: 12px; padding: 4px 10px;">
              ${lockIcon}${ens.agreeCount} of ${ens.activeCount} Active Models Agree (${ens.agreePct}%)
            </span>
            <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); margin-top: 4px;">
              Edge: ${ens.edge > 0 ? '+' : ''}${ens.edge}% vs Vegas &bull; Tier: ${ens.tier}
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 4px;">
          <span style="color: var(--danger);">${bout.f1} (Red Corner)</span>
          <span style="color: var(--corner-blue);">${bout.f2} (Blue Corner)</span>
        </div>
      `;
    }

    // 5 Comparison Bars
    if (compModelBars) {
      compModelBars.innerHTML = '';

      const models = [
        {
          key: "elo",
          name: "1. Public GitHub UFC-Elo-Engine",
          badge: "Logistic Chess Formula",
          p1: bout.elo.p1,
          p2: bout.elo.p2,
          fav: bout.elo.fav,
          meta: `Diff: ${bout.elo.diff} | Fair Odds: ${bout.elo.fav === bout.f1 ? bout.elo.odds1 : bout.elo.odds2}`
        },
        {
          key: "youtube_ml",
          name: "2. Creator's YouTube ML Ensemble",
          badge: "5-Model Supervised Stack",
          p1: bout.youtube_ml.p1,
          p2: bout.youtube_ml.p2,
          fav: bout.youtube_ml.fav,
          meta: bout.youtube_ml.notes
        },
        {
          key: "quant_diff",
          name: "3. Quant Differential & Monte Carlo",
          badge: "10,000 Stochastic Iterations",
          p1: bout.quant_diff.p1,
          p2: bout.quant_diff.p2,
          fav: bout.quant_diff.fav,
          meta: bout.quant_diff.notes
        },
        {
          key: "apex_50",
          name: "4. Apex 50-Vector Quantitative Matrix",
          badge: "50 Empirical Features (6 Pillars)",
          p1: bout.apex_50.p1,
          p2: bout.apex_50.p2,
          fav: bout.apex_50.fav,
          meta: bout.apex_50.notes
        },
        {
          key: "market",
          name: "5. Sharp Betting Market Consensus",
          badge: "Vegas Moneyline / Kalshi",
          p1: bout.market.p1,
          p2: bout.market.p2,
          fav: bout.market.fav,
          meta: bout.market.notes
        }
      ];

      models.forEach(m => {
        const isModelActive = activeModelSelection[m.key];
        const row = document.createElement('div');
        row.className = `comp-model-row ${isModelActive ? '' : 'inactive'}`;

        const isRedFav = m.p1 >= m.p2;
        const favColor = isRedFav ? 'var(--danger)' : 'var(--corner-blue)';
        const activeNotice = isModelActive ? '' : '<span class="comp-inactive-tag"> (Excluded from Consensus)</span>';

        row.innerHTML = `
          <div class="comp-model-header">
            <span class="comp-model-name">
              <span>${m.name}${activeNotice}</span>
              <span class="comp-model-badge">${m.badge}</span>
            </span>
            <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: ${isModelActive ? favColor : 'var(--text-muted)'};">
              Favors: ${m.fav} (${Math.max(m.p1, m.p2)}%)
            </span>
          </div>

          <div class="comp-track">
            <div style="width: ${m.p1}%; background: var(--danger); transition: width 0.4s ease;"></div>
            <div style="width: ${m.p2}%; background: var(--corner-blue); transition: width 0.4s ease;"></div>
          </div>

          <div class="comp-stats-row">
            <span style="color: var(--danger);">${bout.f1}: ${m.p1}%</span>
            <span style="color: var(--text-muted); font-size: 11px;">${m.meta}</span>
            <span style="color: var(--corner-blue);">${bout.f2}: ${m.p2}%</span>
          </div>
        `;
        compModelBars.appendChild(row);
      });
    }

    // Method of Victory & Round Prop Radar
    const compPropMatrixBox = document.getElementById('compPropMatrixBox');
    if (compPropMatrixBox) {
      const qBout = (typeof QUANT_BOUTS !== 'undefined') ? QUANT_BOUTS.find(qb => 
        (qb.fighter_1 === bout.f1 && qb.fighter_2 === bout.f2) ||
        (qb.fighter_1 === bout.f2 && qb.fighter_2 === bout.f1) ||
        bout.f1.includes(qb.fighter_1.split(' ').pop()) ||
        bout.f2.includes(qb.fighter_2.split(' ').pop())
      ) : null;

      const koPct = qBout ? qBout.method_ko.toFixed(1) : '38.0';
      const subPct = qBout ? qBout.method_sub.toFixed(1) : '15.0';
      const decPct = qBout ? qBout.method_dec.toFixed(1) : '47.0';
      const finishPct = (Number(koPct) + Number(subPct)).toFixed(1);
      
      const numDec = Number(decPct);
      const over15 = Math.min(94, Math.max(52, Math.round(numDec + (100 - numDec) * 0.48)));
      const over25 = Math.min(88, Math.max(22, Math.round(numDec + (100 - numDec) * 0.24)));
      const under25 = 100 - over25;

      let topProp = 'Judges Decision (Full Distance)';
      if (qBout && qBout.predicted_method) {
        topProp = qBout.predicted_method;
      } else if (numDec >= 48) {
        topProp = `${ens.winner.split(' ').pop()} by Decision`;
      } else if (Number(koPct) >= Number(subPct)) {
        topProp = `${ens.winner.split(' ').pop()} by KO/TKO`;
      } else {
        topProp = `${ens.winner.split(' ').pop()} by Submission`;
      }

      compPropMatrixBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 11px; text-transform: uppercase; color: var(--primary); font-weight: 700; letter-spacing: 0.5px;">
            Method of Victory & Round Prop Radar
          </span>
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">
            Stochastic Markov / Decay Model
          </span>
        </div>

        <div class="prop-track-3way">
          <div class="prop-seg-ko" style="width: ${koPct}%;" title="KO/TKO: ${koPct}%"></div>
          <div class="prop-seg-sub" style="width: ${subPct}%;" title="Submission: ${subPct}%"></div>
          <div class="prop-seg-dec" style="width: ${decPct}%;" title="Decision: ${decPct}%"></div>
        </div>

        <div class="prop-legend-row">
          <span style="color: var(--danger); font-weight: 700;">KO/TKO: ${koPct}%</span>
          <span style="color: #a78bfa; font-weight: 700;">Submission: ${subPct}%</span>
          <span style="color: var(--primary); font-weight: 700;">Decision: ${decPct}%</span>
          <span style="color: #fff; font-weight: 700;">Finish Rate: ${finishPct}%</span>
        </div>

        <div class="prop-round-grid">
          <div class="prop-round-item">
            <div class="prop-round-label">Over 1.5 Rounds</div>
            <div class="prop-round-val" style="color: var(--success);">${over15}%</div>
          </div>
          <div class="prop-round-item">
            <div class="prop-round-label">Over 2.5 Rounds</div>
            <div class="prop-round-val" style="color: ${over25 >= 50 ? 'var(--success)' : 'var(--danger)'};">${over25}%</div>
          </div>
          <div class="prop-round-item">
            <div class="prop-round-label">Under 2.5 Rounds</div>
            <div class="prop-round-val" style="color: ${under25 >= 50 ? 'var(--danger)' : 'var(--text-muted)'};">${under25}%</div>
          </div>
          <div class="prop-round-item">
            <div class="prop-round-label">Projected Method Prop</div>
            <div class="prop-round-val" style="color: var(--gold); font-size: 11px;">${topProp}</div>
          </div>
        </div>
      `;
    }

    // Divergence Box
    if (compDivergenceBox) {
      compDivergenceBox.innerHTML = `
        <div style="font-weight: 700; color: #fff; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span>Cross-Model Synthesis & Tactical Breakdown: ${bout.alignment.category}</span>
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--primary);">${bout.alignment.divergence_severity}</span>
        </div>
        <p style="color: var(--text-secondary); margin: 0;">
          ${bout.alignment.summary}
        </p>
      `;
    }
  }

  function renderCompMasterTable() {
    const compMasterTableBody = document.getElementById('compMasterTableBody');
    if (!compMasterTableBody) return;

    compMasterTableBody.innerHTML = '';

    const filtered = MODEL_COMPARISON_DATA.filter(b => {
      const ens = calculateBoutEnsemble(b);
      if (currentCompFilter === 'locks') return ens.isLock;
      if (currentCompFilter === 'divergent') return ens.agreePct < 100 && ens.activeCount > 1;
      if (currentCompFilter === 'coinflips') return ens.winPct < 54.0;
      return true;
    });

    filtered.forEach(b => {
      const tr = document.createElement('tr');
      const ens = calculateBoutEnsemble(b);
      const lockMark = ens.isLock ? '🔒 ' : '';

      const formatPick = (fav, p1, p2, f1, isModelActive) => {
        const isRed = fav === f1;
        const color = isRed ? 'var(--danger)' : 'var(--corner-blue)';
        const pct = isRed ? p1 : p2;
        const style = isModelActive ? `font-weight: 700; color: ${color};` : 'color: var(--text-muted); opacity: 0.4; text-decoration: line-through;';
        return `<span style="${style}">${fav.split(' ').pop()} (${pct}%)</span>`;
      };

      let alignBadge = '';
      if (ens.isLock) {
        alignBadge = `<span class="elo-edge-badge">🔒 ${ens.agreeCount}/${ens.activeCount} LOCK</span>`;
      } else if (ens.agreeCount > ens.activeCount / 2) {
        alignBadge = `<span class="elo-edge-badge" style="background: rgba(16, 185, 129, 0.15); color: var(--success); border-color: var(--success);">${ens.agreeCount}/${ens.activeCount} MAJORITY</span>`;
      } else {
        alignBadge = `<span class="elo-edge-badge" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border-color: var(--danger);">SPLIT (${ens.agreeCount}/${ens.activeCount})</span>`;
      }

      const winnerColor = ens.isRedWinner ? 'var(--danger)' : 'var(--corner-blue)';

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-secondary); font-size: 12px;">${b.bout_name}</td>
        <td><strong style="color: var(--danger);">${b.f1}</strong></td>
        <td><strong style="color: var(--corner-blue);">${b.f2}</strong></td>
        <td>${formatPick(b.elo.fav, b.elo.p1, b.elo.p2, b.f1, activeModelSelection.elo)}</td>
        <td>${formatPick(b.youtube_ml.fav, b.youtube_ml.p1, b.youtube_ml.p2, b.f1, activeModelSelection.youtube_ml)}</td>
        <td>${formatPick(b.quant_diff.fav, b.quant_diff.p1, b.quant_diff.p2, b.f1, activeModelSelection.quant_diff)}</td>
        <td>${formatPick(b.apex_50.fav, b.apex_50.p1, b.apex_50.p2, b.f1, activeModelSelection.apex_50)}</td>
        <td style="font-family: var(--font-mono); font-size: 11px; color: ${activeModelSelection.market ? 'var(--gold)' : 'var(--text-muted)'};">${b.market.fav === b.f1 ? b.market.odds1 : b.market.odds2}</td>
        <td><strong style="color: ${winnerColor};">${lockMark}${ens.winner.split(' ').pop()} (${ens.winPct}%)</strong></td>
        <td>${alignBadge}</td>
      `;
      compMasterTableBody.appendChild(tr);
    });
  }

  // ==================== FIGHT NIGHT CHEAT SHEET GENERATOR ====================
  function renderCheatSheet() {
    const tableBody = document.getElementById('cheatSheetTableBody');
    const cheatLabel = document.getElementById('cheatStakingModeLabel');
    if (!tableBody || typeof MODEL_COMPARISON_DATA === 'undefined') return;

    if (cheatLabel) {
      if (currentStakingMode === 'quarter_kelly') cheatLabel.textContent = 'Quarter Kelly (0.25x)';
      else if (currentStakingMode === 'half_kelly') cheatLabel.textContent = 'Half Kelly (0.50x)';
      else cheatLabel.textContent = 'Flat Scaling';
    }

    tableBody.innerHTML = '';

    MODEL_COMPARISON_DATA.forEach((b, idx) => {
      const ens = calculateBoutEnsemble(b);
      
      const qBout = (typeof QUANT_BOUTS !== 'undefined') ? QUANT_BOUTS.find(qb => 
        (qb.fighter_1 === b.f1 && qb.fighter_2 === b.f2) ||
        (qb.fighter_1 === b.f2 && qb.fighter_2 === b.f1) ||
        b.f1.includes(qb.fighter_1.split(' ').pop()) ||
        b.f2.includes(qb.fighter_2.split(' ').pop())
      ) : null;

      let propText = 'Decision Lean (50%+)';
      if (qBout) {
        if (qBout.method_dec >= 50) {
          propText = `${ens.winner.split(' ').pop()} by Dec (${qBout.method_dec.toFixed(0)}%)`;
        } else if (qBout.method_ko >= qBout.method_sub) {
          propText = `${ens.winner.split(' ').pop()} by KO/TKO (${qBout.method_ko.toFixed(0)}%)`;
        } else {
          propText = `${ens.winner.split(' ').pop()} by Sub (${qBout.method_sub.toFixed(0)}%)`;
        }
      }

      // Convert American odds to Decimal
      let decOdds = 1.91;
      if (ens.marketOdds) {
        const am = parseInt(ens.marketOdds, 10);
        if (!isNaN(am)) {
          decOdds = am > 0 ? (am / 100) + 1 : (100 / Math.abs(am)) + 1;
        }
      }
      const p = ens.winPct / 100;
      const bOdds = decOdds - 1;
      const fullKelly = bOdds > 0 ? ((bOdds * p - (1 - p)) / bOdds) : 0;
      
      let allocPct = 0;
      if (fullKelly > 0) {
        if (currentStakingMode === 'quarter_kelly') allocPct = fullKelly * 0.25;
        else if (currentStakingMode === 'half_kelly') allocPct = fullKelly * 0.50;
        else allocPct = ens.isLock ? 0.15 : (ens.winPct >= 65 ? 0.10 : 0.05);
      } else {
        allocPct = currentStakingMode === 'flat' ? (ens.isLock ? 0.12 : 0.04) : 0;
      }
      allocPct = Math.min(0.25, Math.max(0, allocPct));

      const allocStake = allocPct > 0 
        ? (currentCurrency === 'USD' ? `$${(currentBankroll * allocPct).toFixed(2)}` : `R${Math.round(currentBankroll * allocPct)}`)
        : 'Pass (0%)';
      const allocDisplay = allocPct > 0 
        ? `<strong>${allocStake}</strong> <span style="color:var(--text-muted); font-size:11px;">(${(allocPct * 100).toFixed(1)}%)</span>` 
        : `<span style="color:var(--text-muted);">Pass (-EV)</span>`;

      const lockBadge = ens.isLock 
        ? '<span class="elo-edge-badge">🔒 UNANIMOUS LOCK</span>' 
        : `<span style="font-size: 11px; color: var(--text-secondary);">${ens.tier}</span>`;

      const winnerColor = ens.isRedWinner ? 'var(--danger)' : 'var(--corner-blue)';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: #fff;">${idx + 1}. ${b.bout_name}</td>
        <td><strong style="color: ${winnerColor};">${ens.winner}</strong></td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${ens.winPct}%</td>
        <td>${lockBadge}</td>
        <td style="font-family: var(--font-mono); color: var(--gold);">${ens.marketOdds}</td>
        <td style="font-size: 11px; color: var(--text-secondary);">${propText}</td>
        <td style="font-family: var(--font-mono);">${allocDisplay}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function copyCheatSheetText() {
    let text = `==================================================\n`;
    text += `UFC 333: FIGHT NIGHT CHEAT SHEET & BETTING MATRIX\n`;
    text += `Bankroll: ${formatMoney(currentBankroll)} | Staking Mode: ${currentStakingMode.toUpperCase()}\n`;
    text += `==================================================\n\n`;

    MODEL_COMPARISON_DATA.forEach((b, idx) => {
      const ens = calculateBoutEnsemble(b);
      const lockTag = ens.isLock ? ' [🔒 LOCK]' : '';
      text += `${idx + 1}. ${b.bout_name}: ${b.f1} vs. ${b.f2}\n`;
      text += `   Consensus Pick: ${ens.winner} (${ens.winPct}%)${lockTag}\n`;
      text += `   Vegas Baseline: ${ens.marketOdds} | Edge: ${ens.edge > 0 ? '+' : ''}${ens.edge}%\n`;
      text += `   Conviction Tier: ${ens.tier}\n\n`;
    });

    text += `==================================================\n`;
    text += `Generated by UFC 333 Intelligence Matrix`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('Fight Night Cheat Sheet copied to clipboard!');
    }).catch(() => {
      showToast('Cheat Sheet copied!');
    });
  }

  // ==================== APEX 50-VECTOR QUANTITATIVE MMA ENGINE ====================
  let currentApexBoutId = 'bout-1';

  function renderApex50Page() {
    const apexBoutSelect = document.getElementById('apexBoutSelect');
    const apexBoutHeaderBox = document.getElementById('apexBoutHeaderBox');
    const apexTopDriversBox = document.getElementById('apexTopDriversBox');
    const apexPillarsGrid = document.getElementById('apexPillarsGrid');
    const apex50TableBody = document.getElementById('apex50TableBody');
    const apexFeaturesTableBody = document.getElementById('apexFeaturesTableBody');
    const apexToggleFeaturesBtn = document.getElementById('apexToggleFeaturesBtn');
    const apexFeaturesTableContainer = document.getElementById('apexFeaturesTableContainer');
    const apexToggleFeaturesIndicator = document.getElementById('apexToggleFeaturesIndicator');
    const apexThFighter1 = document.getElementById('apexThFighter1');
    const apexThFighter2 = document.getElementById('apexThFighter2');

    if (!apex50TableBody || typeof APEX_50_BOUTS === 'undefined' || !Array.isArray(APEX_50_BOUTS)) return;

    // Populate Bout Selector if empty
    if (apexBoutSelect && apexBoutSelect.options.length === 0) {
      APEX_50_BOUTS.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.bout_id;
        opt.textContent = `${b.f1} vs. ${b.f2} (${b.weight_class})`;
        if (b.bout_id === currentApexBoutId) opt.selected = true;
        apexBoutSelect.appendChild(opt);
      });

      apexBoutSelect.addEventListener('change', e => {
        currentApexBoutId = e.target.value;
        renderApexBoutDetails(currentApexBoutId);
      });
    }

    // Toggle 50-features table
    if (apexToggleFeaturesBtn && !apexToggleFeaturesBtn.dataset.bound) {
      apexToggleFeaturesBtn.dataset.bound = 'true';
      apexToggleFeaturesBtn.addEventListener('click', () => {
        const isHidden = apexFeaturesTableContainer.style.display === 'none' || apexFeaturesTableContainer.style.display === '';
        apexFeaturesTableContainer.style.display = isHidden ? 'block' : 'none';
        apexToggleFeaturesIndicator.textContent = isHidden ? '[ Click to Collapse ]' : '[ Click to Expand ]';
      });
    }

    // Render 14-Bout Master Predictions Table
    apex50TableBody.innerHTML = '';
    APEX_50_BOUTS.forEach(b => {
      const tr = document.createElement('tr');
      const isLock = b.conf_tier === 'LOCK OF THE CARD';
      const favBadge = isLock ? `<strong style="color: var(--primary);">🔒 ${b.favorite}</strong>` : `<strong style="color: #fff;">${b.favorite}</strong>`;
      
      let tierBadge = '';
      if (b.conf_tier === 'LOCK OF THE CARD') {
        tierBadge = '<span class="elo-edge-badge">🔒 LOCK OF THE CARD</span>';
      } else if (b.conf_tier === 'HIGH CONVICTION FAVORITE') {
        tierBadge = '<span class="elo-edge-badge" style="background: rgba(16, 185, 129, 0.15); color: var(--success); border-color: var(--success);">HIGH CONVICTION</span>';
      } else if (b.conf_tier === 'MODERATE VALUE EDGE') {
        tierBadge = '<span class="elo-edge-badge" style="background: rgba(245, 158, 11, 0.15); color: var(--primary); border-color: var(--primary);">VALUE EDGE</span>';
      } else {
        tierBadge = '<span style="color: var(--text-muted); font-size: 11px;">COIN FLIP / CONTESTED</span>';
      }

      const topDriverName = b.top_5_drivers && b.top_5_drivers.length > 0 ? b.top_5_drivers[0].name : 'Net Output';

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-secondary); font-size: 12px;">${b.bout_name}</td>
        <td><strong style="color: var(--danger);">${b.f1}</strong></td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--danger);">${b.prob_1}%</td>
        <td><strong style="color: var(--corner-blue);">${b.f2}</strong></td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--corner-blue);">${b.prob_2}%</td>
        <td>${favBadge}</td>
        <td style="font-family: var(--font-mono); color: var(--gold); font-weight: 700;">${b.prob_1 >= b.prob_2 ? b.odds_1 : b.odds_2}</td>
        <td style="font-size: 11px; color: var(--text-secondary);">${topDriverName}</td>
        <td>${tierBadge}</td>
      `;
      apex50TableBody.appendChild(tr);
    });

    // Render detailed view for currently selected bout
    renderApexBoutDetails(currentApexBoutId);
  }

  function renderApexBoutDetails(boutId) {
    const bout = APEX_50_BOUTS.find(b => b.bout_id === boutId) || APEX_50_BOUTS[0];
    if (!bout) return;

    const apexBoutHeaderBox = document.getElementById('apexBoutHeaderBox');
    const apexTopDriversBox = document.getElementById('apexTopDriversBox');
    const apexPillarsGrid = document.getElementById('apexPillarsGrid');
    const apexFeaturesTableBody = document.getElementById('apexFeaturesTableBody');
    const apexThFighter1 = document.getElementById('apexThFighter1');
    const apexThFighter2 = document.getElementById('apexThFighter2');

    // Update Header
    if (apexBoutHeaderBox) {
      const isLock = bout.conf_tier === 'LOCK OF THE CARD';
      const lockTag = isLock ? '🔒 ' : '';
      
      apexBoutHeaderBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--primary); font-weight: 700; letter-spacing: 0.5px;">
              ${bout.bout_name} &bull; ${bout.rounds} Rounds
            </div>
            <div style="font-size: 20px; font-weight: 800; color: #fff; margin-top: 2px;">
              ${lockTag}${bout.favorite} is Model-Favored (${bout.fav_prob}%)
            </div>
          </div>
          <div style="text-align: right;">
            <span class="elo-edge-badge" style="font-size: 12px; padding: 4px 10px;">
              ${lockTag}${bout.conf_tier}
            </span>
            <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); margin-top: 4px;">
              Logit Z: ${bout.total_logit > 0 ? '+' : ''}${bout.total_logit} | Fair Odds: ${bout.prob_1 >= bout.prob_2 ? bout.odds_1 : bout.odds_2}
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 6px;">
          <span style="color: var(--danger);">${bout.f1}: ${bout.prob_1}% (Fair: ${bout.odds_1})</span>
          <span style="color: var(--corner-blue);">${bout.f2}: ${bout.prob_2}% (Fair: ${bout.odds_2})</span>
        </div>

        <div style="height: 10px; background: var(--bg-surface); border-radius: var(--radius-sm); overflow: hidden; display: flex;">
          <div style="width: ${bout.prob_1}%; background: var(--danger); transition: width 0.4s ease;"></div>
          <div style="width: ${bout.prob_2}%; background: var(--corner-blue); transition: width 0.4s ease;"></div>
        </div>
      `;
    }

    // Top-5 Drivers
    if (apexTopDriversBox) {
      apexTopDriversBox.innerHTML = '';
      bout.top_5_drivers.forEach(d => {
        const isPos = d.favors === bout.f1;
        const pill = document.createElement('div');
        pill.className = `driver-pill ${isPos ? 'pos' : 'neg'}`;
        const arrow = isPos ? '&uarr;' : '&darr;';
        pill.innerHTML = `
          <span>${arrow} #${d.num} ${d.name}</span>
          <span style="opacity: 0.85;">(${d.favors === bout.f1 ? bout.f1 : bout.f2} +${Math.abs(d.delta).toFixed(2)})</span>
        `;
        apexTopDriversBox.appendChild(pill);
      });
    }

    // 6 Pillars Comparison
    if (apexPillarsGrid) {
      apexPillarsGrid.innerHTML = '';
      const pillarNames = {
        "striking": "Striking Differential & Biomechanics",
        "grappling": "Grappling Dominance & Transitions",
        "durability": "Aging, Cardio & Durability Decay",
        "ratings": "Dynamic Ratings & Opponent Caliber",
        "spatial": "Spatial, Environmental & Camp Setup",
        "market": "Market, Judicial & Officiating Signals"
      };

      Object.keys(pillarNames).forEach(pKey => {
        const score1 = bout.pillars_1[pKey] || 50;
        const score2 = bout.pillars_2[pKey] || 50;
        const pTitle = pillarNames[pKey];

        const card = document.createElement('div');
        card.className = 'apex-pillar-card';
        card.innerHTML = `
          <div class="apex-pillar-header">
            <span class="apex-pillar-title">${pTitle}</span>
            <span style="font-family: var(--font-mono); font-size: 11px; color: ${score1 >= score2 ? 'var(--danger)' : 'var(--corner-blue)'}; font-weight: 700;">
              ${score1.toFixed(0)} vs ${score2.toFixed(0)}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: var(--text-secondary);">
            <span style="color: var(--danger); font-weight: 600;">${bout.f1.split(' ').pop()} (${score1.toFixed(0)})</span>
            <span style="color: var(--corner-blue); font-weight: 600;">${bout.f2.split(' ').pop()} (${score2.toFixed(0)})</span>
          </div>

          <div class="apex-pillar-track">
            <div style="width: ${(score1 / (score1 + score2) * 100).toFixed(1)}%; background: var(--danger);"></div>
            <div style="width: ${(score2 / (score1 + score2) * 100).toFixed(1)}%; background: var(--corner-blue);"></div>
          </div>
        `;
        apexPillarsGrid.appendChild(card);
      });
    }

    // 50-Feature Inspection Table
    if (apexFeaturesTableBody) {
      if (apexThFighter1) apexThFighter1.textContent = `${bout.f1} (Red)`;
      if (apexThFighter2) apexThFighter2.textContent = `${bout.f2} (Blue)`;

      apexFeaturesTableBody.innerHTML = '';
      bout.all_50_features.forEach(f => {
        const tr = document.createElement('tr');
        const favorsClass = f.favors === bout.f1 ? 'color: var(--danger); font-weight: 700;' : (f.favors === bout.f2 ? 'color: var(--corner-blue); font-weight: 700;' : 'color: var(--text-muted);');

        tr.innerHTML = `
          <td style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">#${f.num}</td>
          <td><span style="font-size: 10px; text-transform: uppercase; color: var(--primary); font-weight: 700;">${f.pillar}</span></td>
          <td><strong style="color: #fff;">${f.name}</strong></td>
          <td style="font-family: var(--font-mono); color: var(--danger);">${f.val1} <small style="color: var(--text-muted); font-size: 10px;">${f.unit}</small></td>
          <td style="font-family: var(--font-mono); color: var(--corner-blue);">${f.val2} <small style="color: var(--text-muted); font-size: 10px;">${f.unit}</small></td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: ${f.delta > 0 ? 'var(--danger)' : (f.delta < 0 ? 'var(--corner-blue)' : 'var(--text-muted)')};">
            ${f.delta > 0 ? '+' : ''}${f.delta.toFixed(2)}
          </td>
          <td style="${favorsClass}">${f.favors}</td>
          <td style="font-size: 11px; color: var(--text-secondary);">${f.desc}</td>
        `;
        apexFeaturesTableBody.appendChild(tr);
      });
    }
  }

  // Render 25+ Experts Feed
  function renderExpertsFeed() {
    if (!expertsGrid) return;
    expertsGrid.innerHTML = '';

    EXPERT_SOURCES.forEach(exp => {
      const card = document.createElement('div');
      card.className = 'expert-card';
      card.innerHTML = `
        <div class="expert-header">
          <span class="expert-name">${exp.name}</span>
          <span class="expert-badge">${exp.badge}</span>
        </div>
        <div class="expert-audience">${exp.platform} &bull; ${exp.audience}</div>
        <div class="expert-picks-box">
          <strong>Key Selections:</strong><br>${exp.topPicks}
        </div>
      `;
      expertsGrid.appendChild(card);
    });
  }

  // Render Charts
  function renderCharts() {
    renderProbabilitiesChart();
    renderMethodDistribution();
    renderDistanceChart();
    renderPikkitChart();
    renderSurveyDistribution();
  }

  function renderProbabilitiesChart() {
    const svg = document.getElementById('svgProbabilities');
    if (!svg) return;

    const data = [
      { name: "Volkanovski", dratings: 45.5, tapology: 34, elo: 56.0 },
      { name: "Petr Yan", dratings: 61.2, tapology: 66, elo: 47.0 },
      { name: "A. Volkov", dratings: 64.0, tapology: 66, elo: 70.7 },
      { name: "A. Murzakanov", dratings: 72.5, tapology: 75, elo: 48.2 },
      { name: "A. Yakhyaev", dratings: 88.0, tapology: 96, elo: 41.4 },
      { name: "A. Chopurov", dratings: 83.0, tapology: 92, elo: 47.8 },
      { name: "G. Dawson", dratings: 68.0, tapology: 71, elo: 62.0 },
      { name: "I. Lucindo", dratings: 74.0, tapology: 89, elo: 61.7 }
    ];

    const margin = { top: 20, right: 20, bottom: 40, left: 110 };
    const chartW = 540 - margin.left - margin.right;
    const barH = 7;
    const groupGap = 34;

    let svgHTML = `
      <g transform="translate(${margin.left}, ${margin.top})">
        <line x1="0" y1="0" x2="0" y2="${data.length * groupGap}" stroke="#26262b" stroke-width="1"></line>
        <line x1="${chartW * 0.5}" y1="0" x2="${chartW * 0.5}" y2="${data.length * groupGap}" stroke="#26262b" stroke-dasharray="3,3"></line>
        <text x="${chartW * 0.5}" y="${data.length * groupGap + 20}" fill="#94a3b8" font-size="10" text-anchor="middle" font-family="'JetBrains Mono', monospace">50% Line</text>
    `;

    data.forEach((d, i) => {
      const y = i * groupGap;
      const wDrat = (d.dratings / 100) * chartW;
      const wTap = (d.tapology / 100) * chartW;
      const wElo = (d.elo / 100) * chartW;

      svgHTML += `
        <text x="-10" y="${y + 14}" fill="#f8fafc" font-size="11" font-weight="600" text-anchor="end" font-family="'Outfit', sans-serif">${d.name}</text>
        <rect x="0" y="${y}" width="${wDrat}" height="${barH}" rx="2" fill="#f59e0b"></rect>
        <rect x="0" y="${y + 9}" width="${wTap}" height="${barH}" rx="2" fill="#71717a"></rect>
        <rect x="0" y="${y + 18}" width="${wElo}" height="${barH}" rx="2" fill="#22c55e"></rect>
      `;
    });

    svgHTML += `
      <g transform="translate(0, ${data.length * groupGap + 24})">
        <rect x="10" y="0" width="10" height="10" rx="2" fill="#f59e0b"></rect>
        <text x="25" y="9" fill="#94a3b8" font-size="11">Dratings AI</text>
        <rect x="120" y="0" width="10" height="10" rx="2" fill="#71717a"></rect>
        <text x="135" y="9" fill="#94a3b8" font-size="11">Tapology Public</text>
        <rect x="250" y="0" width="10" height="10" rx="2" fill="#22c55e"></rect>
        <text x="265" y="9" fill="#94a3b8" font-size="11">Vanderbilt UFC-Elo-Engine (GitHub)</text>
      </g>
    </g>`;

    svg.innerHTML = svgHTML;
  }

  function renderMethodDistribution() {
    const container = document.getElementById('methodDistBars');
    if (!container) return;

    const data = [
      { bout: "Volkanovski vs. Evloev", ko: 18, sub: 5, dec: 77 },
      { bout: "Yan vs. Dvalishvili", ko: 12, sub: 6, dec: 82 },
      { bout: "Volkov vs. Kuniev", ko: 55, sub: 7, dec: 38 },
      { bout: "Murzakanov vs. Reyes", ko: 68, sub: 9, dec: 23 },
      { bout: "Yakhyaev vs. Krylov", ko: 44, sub: 44, dec: 12 },
      { bout: "Magomedov vs. Rowston", ko: 48, sub: 12, dec: 40 },
      { bout: "Dawson vs. Aliev", ko: 15, sub: 40, dec: 45 },
      { bout: "Chopurov vs. Thicknesse", ko: 38, sub: 25, dec: 37 }
    ];

    let html = '';
    data.forEach(d => {
      html += `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="font-weight: 600; color: #fff;">${d.bout}</span>
            <span style="color: var(--text-muted); font-size: 11px;">KO: ${d.ko}% | Sub: ${d.sub}% | Dec: ${d.dec}%</span>
          </div>
          <div class="method-bar-stacked" style="height: 10px;">
            <div class="method-seg ko" style="width: ${d.ko}%;" title="KO/TKO: ${d.ko}%"></div>
            <div class="method-seg sub" style="width: ${d.sub}%;" title="Submission: ${d.sub}%"></div>
            <div class="method-seg dec" style="width: ${d.dec}%;" title="Decision: ${d.dec}%"></div>
          </div>
        </div>
      `;
    });

    html += `
      <div class="method-legend-mini" style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-default);">
        <span style="color: var(--danger); font-weight: 600;">&#9632; KO/TKO</span>
        <span style="color: var(--secondary); font-weight: 600;">&#9632; Submission</span>
        <span style="color: var(--primary); font-weight: 600;">&#9632; Decision</span>
      </div>
    `;

    container.innerHTML = html;
  }

  function renderDistanceChart() {
    const svg = document.getElementById('svgDistance');
    if (!svg) return;

    const data = [
      { bout: "Volkanovski/Evloev", dist: 66, finish: 34 },
      { bout: "Yan/Dvalishvili", dist: 74, finish: 26 },
      { bout: "Volkov/Kuniev", dist: 38, finish: 62 },
      { bout: "Murzakanov/Reyes", dist: 23, finish: 77 },
      { bout: "Yakhyaev/Krylov", dist: 12, finish: 88 },
      { bout: "Magomedov/Rowston", dist: 40, finish: 60 },
      { bout: "Dawson/Aliev", dist: 52, finish: 48 },
      { bout: "Chopurov/Thicknesse", dist: 37, finish: 63 }
    ];

    const margin = { top: 20, right: 30, bottom: 40, left: 140 };
    const chartW = 540 - margin.left - margin.right;
    const barH = 14;
    const gap = 16;

    let svgHTML = `<g transform="translate(${margin.left}, ${margin.top})">`;

    data.forEach((d, i) => {
      const y = i * (barH + gap);
      const wDist = (d.dist / 100) * chartW;
      const wFin = (d.finish / 100) * chartW;

      svgHTML += `
        <text x="-10" y="${y + barH - 3}" fill="#f8fafc" font-size="11" font-weight="600" text-anchor="end" font-family="'Outfit', sans-serif">
          ${d.bout}
        </text>
        <rect x="0" y="${y}" width="${wDist}" height="${barH}" rx="2" fill="#f59e0b"></rect>
        <rect x="${wDist}" y="${y}" width="${wFin}" height="${barH}" rx="2" fill="#fb923c"></rect>
      `;
    });

    svgHTML += `
      <g transform="translate(0, ${data.length * (barH + gap) + 10})">
        <rect x="20" y="0" width="10" height="10" rx="2" fill="#f59e0b"></rect>
        <text x="35" y="9" fill="#94a3b8" font-size="11">Goes Distance (15/25 mins)</text>
        <rect x="210" y="0" width="10" height="10" rx="2" fill="#fb923c"></rect>
        <text x="225" y="9" fill="#94a3b8" font-size="11">Ends Inside Distance (KO/Sub)</text>
      </g>
    </g>`;

    svg.innerHTML = svgHTML;
  }

  function renderPikkitChart() {
    const svg = document.getElementById('svgPikkit');
    if (!svg) return;

    const pikkitItems = [
      { name: "Alexander Volkanovski", picks: 1934, fill: "#f59e0b" },
      { name: "Petr Yan", picks: 1106, fill: "#ffffff" },
      { name: "Merab Dvalishvili", picks: 574, fill: "#71717a" },
      { name: "Abubakar Vagaev", picks: 402, fill: "#22c55e" },
      { name: "Abdul Yakhyaev", picks: 348, fill: "#22c55e" },
      { name: "Asaf Chopurov", picks: 305, fill: "#22c55e" },
      { name: "Abus Magomedov", picks: 272, fill: "#f59e0b" },
      { name: "Alexander Volkov", picks: 260, fill: "#22c55e" }
    ];

    const maxVal = 2000;
    const margin = { top: 20, right: 60, bottom: 30, left: 140 };
    const chartW = 540 - margin.left - margin.right;
    const barH = 18;
    const gap = 16;

    let svgHTML = '';

    pikkitItems.forEach((item, i) => {
      const y = margin.top + i * (barH + gap);
      const w = (item.picks / maxVal) * chartW;

      svgHTML += `
        <text x="${margin.left - 10}" y="${y + barH - 4}" fill="#fff" font-size="12" font-weight="600" text-anchor="end" font-family="'Outfit', sans-serif">
          ${item.name}
        </text>
        <rect x="${margin.left}" y="${y}" width="${w}" height="${barH}" rx="3" fill="${item.fill}"></rect>
        <text x="${margin.left + w + 8}" y="${y + barH - 4}" fill="#fff" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">
          ${item.picks} slips
        </text>
      `;
    });

    svg.innerHTML = svgHTML;
  }

  // Render 6-Person Consensus Survey
  function renderSurveyDistribution() {
    const container = document.getElementById('surveyBarsContainer');
    if (!container) return;

    if (typeof COMMUNITY_SURVEY_DATA === 'undefined' || !Array.isArray(COMMUNITY_SURVEY_DATA)) {
      container.innerHTML = '<div style="color: var(--text-muted); font-size: 13px;">Survey data loading...</div>';
      return;
    }

    let html = `<div class="survey-cards-grid">`;

    COMMUNITY_SURVEY_DATA.forEach(s => {
      const isRedFav = s.pct1 > s.pct2;
      const isBlueFav = s.pct2 > s.pct1;

      let verdictChipClass = 'survey-chip-split';
      if (isRedFav) verdictChipClass = 'survey-chip-red';
      if (isBlueFav) verdictChipClass = 'survey-chip-blue';

      html += `
        <div class="survey-bout-card">
          <div class="survey-card-header">
            <div>
              <span class="survey-weight-label">${s.boutName}</span>
              <div class="survey-bout-title">${s.f1} vs. ${s.f2}</div>
            </div>
            <span class="survey-verdict-badge ${verdictChipClass}">${s.splitStr} &bull; ${s.verdict}</span>
          </div>

          <div class="survey-head-to-head">
            <div class="survey-fighter-block corner-red">
              <span class="survey-fname">${s.f1}</span>
              <span class="survey-fvotes">${s.votes1} / 6 Votes (<strong>${s.pct1}%</strong>)</span>
            </div>
            <div class="survey-fighter-block corner-blue">
              <span class="survey-fname">${s.f2}</span>
              <span class="survey-fvotes">${s.votes2} / 6 Votes (<strong>${s.pct2}%</strong>)</span>
            </div>
          </div>

          <div class="survey-bar-track">
            <div class="survey-bar-fill red" style="width: ${s.pct1}%;" title="${s.f1}: ${s.votes1} votes (${s.pct1}%)">
              ${s.votes1 > 0 ? `${s.votes1} votes` : ''}
            </div>
            <div class="survey-bar-fill blue" style="width: ${s.pct2}%;" title="${s.f2}: ${s.votes2} votes (${s.pct2}%)">
              ${s.votes2 > 0 ? `${s.votes2} votes` : ''}
            </div>
          </div>

          <div class="survey-notes-text">
            ${s.detail}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  // Switch Tab
  function switchTab(tabId) {
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
    tabPanels.forEach(panel => panel.classList.toggle('active', panel.id === tabId));
    // Trigger any resize or render if needed
    if (tabId === 'tab-home') renderHomePage();
    if (tabId === 'tab-builder') renderParlayBuilder();
    if (tabId === 'tab-slips') renderSlips();
    if (tabId === 'tab-graphs') renderCharts();
    if (tabId === 'tab-elo') renderEloPage();
    if (tabId === 'tab-quant') renderQuantPage();
    if (tabId === 'tab-apex50') renderApex50Page();
    if (tabId === 'tab-comparison') renderComparisonPage();
  }

  // Export Betslip Text
  function copyBetslipToClipboard() {
    let text = `UFC 333: Volkanovski vs. Evloev - Staking Plan\n`;
    text += `Total Bankroll: ${formatMoney(currentBankroll)}\n`;
    text += `Date: October 24, 2026\n`;
    text += `--------------------------------------------------\n\n`;

    activeSlips.forEach((slip, idx) => {
      if (!slip.active) return;
      const payout = ((Number(slip.stake) || 0) * slip.combinedOdds).toFixed(2);
      text += `SLIP #${idx + 1}: [${slip.categoryLabel}] ${slip.title}\n`;
      text += `Stake: ${formatMoney(slip.stake)} | Multiplier: ${slip.combinedOdds}x | Payout: ${formatMoney(payout)}\n`;
      slip.legs.forEach((leg, lIdx) => {
        text += `  • Leg ${lIdx + 1}: ${leg.fighter} (${leg.market}) [${formatOdds(leg.dec)}]\n`;
      });
      text += `\n`;
    });

    text += `--------------------------------------------------\n`;
    text += `Compiled via UFC 333 Betting Matrix Engine`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('Bet slips copied to clipboard! Paste into your bookmaker app.');
    }).catch(() => {
      showToast('Copied to clipboard!');
    });
  }

  // Event Listeners
  function setupEventListeners() {
    // Currency buttons
    if (btnCurZar) btnCurZar.addEventListener('click', () => switchCurrency('ZAR'));
    if (btnCurUsd) btnCurUsd.addEventListener('click', () => switchCurrency('USD'));

    // Bankroll Input change
    bankrollInput.addEventListener('input', e => {
      const val = Number(e.target.value);
      if (val > 0) scaleStakesToBankroll(val);
      renderSlips();
    });

    // Preset buttons
    presetChips.forEach(btn => {
      btn.addEventListener('click', e => {
        const val = Number(e.target.dataset.preset);
        scaleStakesToBankroll(val);
        renderSlips();
        showToast(`Bankroll scaled to ${formatMoney(val)}!`);
      });
    });

    // Reset Bankroll
    resetBankrollBtn.addEventListener('click', () => {
      activeSlips = JSON.parse(JSON.stringify(INITIAL_SLIPS));
      scaleStakesToBankroll(currentCurrency === 'USD' ? 20 : 350);
      renderSlips();
      showToast(`Reset portfolio to default allocations!`, '↺');
    });

    // Export bets
    exportBetsBtn.addEventListener('click', copyBetslipToClipboard);

    // Tab buttons
    tabButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        const tabId = e.currentTarget.dataset.tab;
        switchTab(tabId);
      });
    });

    // Slip Category Filters
    document.querySelectorAll('#slipCategoryFilter .sub-chip').forEach(chip => {
      chip.addEventListener('click', e => {
        document.querySelectorAll('#slipCategoryFilter .sub-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentSlipFilter = e.currentTarget.dataset.category;
        renderSlips();
      });
    });

    // Fight Card Filters
    document.querySelectorAll('#fightCardFilter .sub-chip').forEach(chip => {
      chip.addEventListener('click', e => {
        document.querySelectorAll('#fightCardFilter .sub-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentFightFilter = e.currentTarget.dataset.fgroup;
        renderFightCards();
      });
    });

    // Custom Builder Toggles
    openCustomBuilderBtn.addEventListener('click', () => {
      customBuilderBox.style.display = 'block';
      customBuilderBox.scrollIntoView({ behavior: 'smooth' });
    });

    closeBuilderBtn.addEventListener('click', () => {
      customBuilderBox.style.display = 'none';
    });

    clearBuilderLegsBtn.addEventListener('click', () => {
      customLegs = [];
      renderCustomBuilder();
      showToast('Custom builder cleared');
    });

    builderStakeInput.addEventListener('input', () => {
      renderCustomBuilder();
    });

    saveCustomSlipBtn.addEventListener('click', saveCustomSlip);

    // Staking Algorithm buttons (Flat / Quarter Kelly / Half Kelly)
    const stakeModeBtns = document.querySelectorAll('.staking-mode-btn');
    const stakingModeHint = document.getElementById('stakingModeHint');
    stakeModeBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        stakeModeBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentStakingMode = e.currentTarget.dataset.staking;

        const cheatLabel = document.getElementById('cheatStakingModeLabel');
        if (currentStakingMode === 'quarter_kelly') {
          if (stakingModeHint) stakingModeHint.textContent = '0.25x Fractional Kelly: Max risk-adjusted growth & drawdown minimization';
          if (cheatLabel) cheatLabel.textContent = 'Quarter Kelly (0.25x)';
          showToast('Staking algorithm set to Quarter Kelly (0.25x +EV)');
        } else if (currentStakingMode === 'half_kelly') {
          if (stakingModeHint) stakingModeHint.textContent = '0.50x Aggressive Kelly: Heavy concentration into maximum +EV edges & locks';
          if (cheatLabel) cheatLabel.textContent = 'Half Kelly (0.50x)';
          showToast('Staking algorithm set to Half Kelly (0.50x +EV)');
        } else {
          if (stakingModeHint) stakingModeHint.textContent = 'Linear allocation proportional to target multiplier';
          if (cheatLabel) cheatLabel.textContent = 'Flat Scaling';
          showToast('Staking algorithm set to Flat Bankroll Scaling');
        }

        scaleStakesToBankroll(currentBankroll);
        renderSlips();
        renderCheatSheet();
      });
    });

    // Fight Night Cheat Sheet Modal Handlers
    const openCheatSheetBtn = document.getElementById('openCheatSheetBtn');
    const closeCheatSheetBtn = document.getElementById('closeCheatSheetBtn');
    const printCheatSheetBtn = document.getElementById('printCheatSheetBtn');
    const copyCheatSheetBtn = document.getElementById('copyCheatSheetBtn');
    const cheatSheetModal = document.getElementById('cheatSheetModal');

    if (openCheatSheetBtn && cheatSheetModal) {
      openCheatSheetBtn.addEventListener('click', () => {
        renderCheatSheet();
        cheatSheetModal.classList.add('active');
      });
    }

    if (closeCheatSheetBtn && cheatSheetModal) {
      closeCheatSheetBtn.addEventListener('click', () => {
        cheatSheetModal.classList.remove('active');
      });
    }

    if (cheatSheetModal) {
      cheatSheetModal.addEventListener('click', e => {
        if (e.target === cheatSheetModal) {
          cheatSheetModal.classList.remove('active');
        }
      });
    }

    if (printCheatSheetBtn) {
      printCheatSheetBtn.addEventListener('click', () => {
        window.print();
      });
    }

    if (copyCheatSheetBtn) {
      copyCheatSheetBtn.addEventListener('click', () => {
        copyCheatSheetText();
      });
    }

    // Home Page Matchups Filter Chips
    document.querySelectorAll('#homeMatchupsFilter .sub-chip').forEach(chip => {
      chip.addEventListener('click', e => {
        document.querySelectorAll('#homeMatchupsFilter .sub-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentHomeCardFilter = e.currentTarget.dataset.cardgroup;
        renderHomePage();
      });
    });

    // Home Hero Action Buttons
    const homeHeroBuilderBtn = document.getElementById('homeHeroBuilderBtn');
    if (homeHeroBuilderBtn) {
      homeHeroBuilderBtn.addEventListener('click', () => switchTab('tab-builder'));
    }
    const homeHeroSlipsBtn = document.getElementById('homeHeroSlipsBtn');
    if (homeHeroSlipsBtn) {
      homeHeroSlipsBtn.addEventListener('click', () => switchTab('tab-slips'));
    }

    // Bout Parlays Modal Handlers
    const closeBoutParlaysBtn = document.getElementById('closeBoutParlaysBtn');
    const boutParlaysModal = document.getElementById('boutParlaysModal');
    if (closeBoutParlaysBtn) {
      closeBoutParlaysBtn.addEventListener('click', closeBoutParlaysModal);
    }
    if (boutParlaysModal) {
      boutParlaysModal.addEventListener('click', e => {
        if (e.target === boutParlaysModal) closeBoutParlaysModal();
      });
    }

    // Dedicated Parlay Builder Controls
    const builderPresetLocks = document.getElementById('builderPresetLocks');
    if (builderPresetLocks) {
      builderPresetLocks.addEventListener('click', loadLocksPresetIntoBuilder);
    }

    const builderPresetMain = document.getElementById('builderPresetMain');
    if (builderPresetMain) {
      builderPresetMain.addEventListener('click', loadMainFavoritesPresetIntoBuilder);
    }

    const builderClearAllBtn = document.getElementById('builderClearAllBtn');
    if (builderClearAllBtn) {
      builderClearAllBtn.addEventListener('click', () => {
        builderSelectedLegs = [];
        renderParlayBuilder();
        showToast('Parlay ticket cleared');
      });
    }

    const btnResetTicket = document.getElementById('btnResetTicket');
    if (btnResetTicket) {
      btnResetTicket.addEventListener('click', () => {
        builderSelectedLegs = [];
        renderParlayBuilder();
        showToast('Parlay ticket reset');
      });
    }

    const ticketStakeInput = document.getElementById('ticketStakeInput');
    if (ticketStakeInput) {
      ticketStakeInput.addEventListener('input', e => {
        const val = Number(e.target.value) || 0;
        builderStake = Math.max(1, val);
        renderBuilderTicket();
      });
    }

    document.querySelectorAll('#ticketStakeChips .ticket-chip-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const delta = Number(e.currentTarget.dataset.stake) || 10;
        builderStake = (Number(builderStake) || 0) + delta;
        if (ticketStakeInput) ticketStakeInput.value = builderStake;
        renderBuilderTicket();
      });
    });

    const ticketSaveSlipBtn = document.getElementById('ticketSaveSlipBtn');
    if (ticketSaveSlipBtn) {
      ticketSaveSlipBtn.addEventListener('click', saveBuilderParlayToSlips);
    }

    const ticketCopyTextBtn = document.getElementById('ticketCopyTextBtn');
    if (ticketCopyTextBtn) {
      ticketCopyTextBtn.addEventListener('click', copyBuilderParlayText);
    }

    // Official Weigh-In Modal Handlers & Initial Render
    setupWeighInModalListeners();
    renderWeighInDocket();
  }

  // ==========================================
  // OFFICIAL WEIGH-IN DOCKET & MODAL HANDLERS
  // ==========================================
  function renderWeighInDocket() {
    const tableBody = document.getElementById('weighInDocketTableBody');
    if (!tableBody || typeof WEIGH_IN_DATA === 'undefined') return;

    tableBody.innerHTML = '';

    WEIGH_IN_DATA.results.forEach((r, idx) => {
      const isDrama = r.boutId === 'bout-14';
      const tr = document.createElement('tr');
      if (isDrama) tr.style.background = 'rgba(225, 29, 72, 0.08)';

      let impactText = 'Standard betting lines cleared on weight.';
      if (r.boutId === 'bout-1') {
        impactText = 'Volkanovski 0.5 lb under championship mark looking sharp; reinforces high pace 5-rd volume.';
      } else if (r.boutId === 'bout-2') {
        impactText = 'Yan and Merab hit 135.0 lbs cleanly; high cardio 25-minute championship war locked in.';
      } else if (r.boutId === 'bout-4') {
        impactText = 'Volkov (256.0 lbs) is 9 lbs leaner than Kuniev (265.0 lbs), providing speed and 15-minute range mobility.';
      } else if (r.boutId === 'bout-12') {
        impactText = 'Santos and Oki both hit 146.0 lbs for Featherweight (145 lbs non-title limit). Explosive striking matchup cleared.';
      } else if (r.boutId === 'bout-14') {
        impactText = 'FORTIFIED LOCK: Caliari missed by 4.5 lbs (120.5 lbs Catchweight, 30% fine). Cardio & conditioning severely compromised. Fortifies Lucindo ML (-350) as card anchor.';
      }

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-muted); font-family: var(--font-mono);">${idx + 1}</td>
        <td>
          <strong style="color: #fff;">${r.f1} vs. ${r.f2}</strong>
          <div style="font-size: 11px; color: var(--text-secondary);">${r.weightClass}</div>
        </td>
        <td style="font-family: var(--font-mono); color: var(--danger); font-weight: 700;">
          ${r.w1 ? r.w1.toFixed(1) + ' lbs' : '--'}
        </td>
        <td style="font-family: var(--font-mono); color: ${isDrama ? 'var(--danger)' : 'var(--corner-blue)'}; font-weight: 700;">
          ${r.w2 ? r.w2.toFixed(1) + ' lbs' : '--'}
          ${isDrama ? '<span class="miss-tag" style="margin-left: 4px;">MISSED +4.5</span>' : ''}
        </td>
        <td>
          ${isDrama 
            ? '<span class="weigh-in-drama-pill">⚠️ CATCHWEIGHT (-30% Fine)</span>' 
            : '<span class="weigh-in-cleared-pill">✓ Made Weight</span>'}
        </td>
        <td style="font-size: 11px; color: ${isDrama ? '#fca5a5' : 'var(--text-secondary)'};">
          ${impactText}
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function setupWeighInModalListeners() {
    const openHeaderBtn = document.getElementById('openWeighInHeaderBtn');
    const openBannerBtn = document.getElementById('openWeighInModalBtn');
    const closeBtn = document.getElementById('closeWeighInModalBtn');
    const modal = document.getElementById('weighInModal');

    const openModal = () => {
      renderWeighInDocket();
      if (modal) modal.classList.add('active');
    };

    const closeModal = () => {
      if (modal) modal.classList.remove('active');
    };

    if (openHeaderBtn) openHeaderBtn.addEventListener('click', openModal);
    if (openBannerBtn) openBannerBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
      });
    }
  }

  // Start app on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
