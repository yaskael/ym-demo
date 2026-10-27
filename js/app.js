/**
 * Onnenpyörä - Pääsovellus
 */
document.addEventListener('DOMContentLoaded', () => {
    // Elementit
    const canvas = document.getElementById('wheel');
    const spinBtn = document.getElementById('spin-btn');
    const resultDiv = document.getElementById('result');
    const inputsContainer = document.getElementById('inputs-container');
    const addBtn = document.getElementById('add-sector');
    const removeBtn = document.getElementById('remove-sector');
    const sectorCountDisplay = document.getElementById('sector-count');
    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    const shareBtn = document.getElementById('share-btn');
    const themeSelect = document.getElementById('theme-select');
    const soundToggle = document.getElementById('sound-toggle');
    const confettiContainer = document.getElementById('confetti-container');
    const pointer = document.querySelector('.pointer');

    let inputs = [];
    let sectorCount = 8;

    // Web Audio API tick-ääntä varten
    let audioCtx = null;
    function getAudioContext() {
        if (!soundToggle.checked) return null;
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return null;
        if (!audioCtx) audioCtx = new AudioCtor();
        // Selaimet voivat käynnistää kontekstin keskeytettynä
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function playTone(ctx, freq, start, length, volume) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + length);
        osc.start(start);
        osc.stop(start + length);
    }

    function playTick() {
        pointer.classList.remove('tick');
        // Pakota reflow, jotta animaatio käynnistyy uudelleen
        void pointer.offsetWidth;
        pointer.classList.add('tick');

        const ctx = getAudioContext();
        if (ctx) playTone(ctx, 800, ctx.currentTime, 0.05, 0.08);
    }

    function playWinSound() {
        const ctx = getAudioContext();
        if (!ctx) return;
        const notes = [523, 659, 784]; // C5, E5, G5
        notes.forEach((freq, i) => {
            playTone(ctx, freq, ctx.currentTime + 0.15 * i, 0.45, 0.12);
        });
    }

    function showConfetti() {
        confettiContainer.innerHTML = '';
        const colors = ['#FF6B6B', '#4ECDC4', '#FFEAA7', '#DDA0DD', '#ffd700', '#74B9FF'];
        for (let i = 0; i < 40; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = Math.random() * 0.5 + 's';
            piece.style.animationDuration = (1.5 + Math.random()) + 's';
            confettiContainer.appendChild(piece);
        }
        setTimeout(() => { confettiContainer.innerHTML = ''; }, 3000);
    }

    // Luo pyörä
    const wheel = new FortuneWheel(canvas);

    // Tarkista URL-hash ensin, muuten lataa localStorage
    if (!loadFromHash()) {
        loadSavedData();
    }

    // Luo syöttökentät
    buildInputs();
    applySavedValues();
    updateSpinButton();
    updateSectorButtons();
    renderHistory();
    loadTheme();

    // Teeman vaihto
    themeSelect.addEventListener('change', () => {
        const theme = themeSelect.value;
        wheel.setTheme(theme);
        Storage.saveTheme(theme);
    });

    // Tyhjennä historia
    clearHistoryBtn.addEventListener('click', () => {
        Storage.clearHistory();
        renderHistory();
    });

    // Jaa linkki
    shareBtn.addEventListener('click', () => {
        const texts = inputs.map(input => input.value.trim()).filter(Boolean);
        const hash = '#sectors=' + texts.map(encodeURIComponent).join(',');
        const url = window.location.origin + window.location.pathname + hash;
        navigator.clipboard.writeText(url).then(() => {
            shareBtn.textContent = 'Kopioitu!';
            shareBtn.classList.add('copied');
            setTimeout(() => {
                shareBtn.textContent = 'Jaa linkki';
                shareBtn.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            // Varasuunnitelma jos clipboard ei ole käytettävissä:
            // linkki asetetaan osoiteriville kopioitavaksi
            history.replaceState(null, '', hash);
            shareBtn.textContent = 'Kopioi osoiteriviltä';
            setTimeout(() => { shareBtn.textContent = 'Jaa linkki'; }, 3000);
        });
    });

    // Lisää sektori
    addBtn.addEventListener('click', () => {
        if (sectorCount >= wheel.MAX_SECTORS) return;
        sectorCount++;
        wheel.setSectorCount(sectorCount);
        buildInputs();
        applySavedValues();
        saveData();
        updateSpinButton();
        updateSectorButtons();
    });

    // Poista sektori
    removeBtn.addEventListener('click', () => {
        if (sectorCount <= wheel.MIN_SECTORS) return;
        sectorCount--;
        wheel.setSectorCount(sectorCount);
        buildInputs();
        applySavedValues();
        saveData();
        updateSpinButton();
        updateSectorButtons();
    });

    // Pyöritysnapin tapahtumankäsittelijä
    spinBtn.addEventListener('click', triggerSpin);

    // Pyörää voi pyörittää myös klikkaamalla sitä
    canvas.addEventListener('click', triggerSpin);

    // Näppäimistötuki: välilyönti tai Enter pyörittää, kun fokus ei ole
    // jollain muulla säätimellä (napit, kentät ja valikot toimivat normaalisti)
    document.addEventListener('keydown', (e) => {
        if (e.code !== 'Space' && e.code !== 'Enter') return;
        if (e.target !== document.body && e.target !== canvas) return;
        e.preventDefault();
        triggerSpin();
    });

    function triggerSpin() {
        if (wheel.spinning() || spinBtn.disabled) return;

        hideResult();
        setControlsLocked(true);

        spinBtn.disabled = true;
        spinBtn.setAttribute('aria-disabled', 'true');
        spinBtn.textContent = 'Pyörii...';

        wheel.spin((winner) => {
            playWinSound();
            showConfetti();
            showResult(winner.text);
            setControlsLocked(false);
            updateSpinButton();
            spinBtn.setAttribute('aria-disabled', 'false');
        }, playTick);
    }

    /**
     * Estää vaihtoehtojen muokkauksen pyörityksen ajaksi, jotta tulos
     * ei muutu kesken pyörimisen
     */
    function setControlsLocked(locked) {
        inputs.forEach(input => { input.readOnly = locked; });
        canvas.classList.toggle('spinning', locked);
        if (locked) {
            addBtn.disabled = true;
            removeBtn.disabled = true;
        } else {
            updateSectorButtons();
        }
    }

    /**
     * Luo syöttökentät dynaamisesti
     */
    function buildInputs() {
        inputsContainer.innerHTML = '';
        inputs = [];

        for (let i = 0; i < sectorCount; i++) {
            const group = document.createElement('div');
            group.className = 'input-group';

            const label = document.createElement('label');
            label.setAttribute('for', `sector-${i + 1}`);
            label.textContent = `${i + 1}.`;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `sector-${i + 1}`;
            input.maxLength = 20;
            input.placeholder = `Vaihtoehto ${i + 1}`;

            input.addEventListener('input', () => {
                const text = input.value.trim();
                wheel.updateSector(i, text);
                saveData();
                updateSpinButton();
            });

            group.appendChild(label);
            group.appendChild(input);
            inputsContainer.appendChild(group);
            inputs.push(input);
        }
    }

    /**
     * Asettaa tallennetut arvot syöttökenttiin
     */
    function applySavedValues() {
        const saved = Storage.load();
        if (saved && Array.isArray(saved)) {
            saved.forEach((text, i) => {
                if (i < inputs.length && text) {
                    inputs[i].value = text;
                    wheel.updateSector(i, text);
                }
            });
        }
    }

    /**
     * Lataa sektorit URL-hashista
     * @returns {boolean} true jos hash löytyi ja ladattiin
     */
    function loadFromHash() {
        const hash = window.location.hash;
        if (!hash.startsWith('#sectors=')) return false;

        const raw = hash.substring('#sectors='.length);
        const texts = raw.split(',').map(s => decodeURIComponent(s).substring(0, 20));
        if (texts.length < 2) return false;

        sectorCount = Math.max(wheel.MIN_SECTORS, Math.min(wheel.MAX_SECTORS, texts.length));
        wheel.setSectorCount(sectorCount);

        // Aseta arvot suoraan (buildInputs kutsutaan myöhemmin)
        // Tallennetaan hash-data localStorageen
        Storage.save(texts);

        // Poista hash URL:stä
        history.replaceState(null, '', window.location.pathname);
        return true;
    }

    /**
     * Lataa tallennetut tiedot (sektorien lukumäärä ja tekstit)
     */
    function loadSavedData() {
        const saved = Storage.load();
        if (saved && Array.isArray(saved)) {
            // Käytä tallennettua sektorien lukumäärää (min 2, max 12)
            sectorCount = Math.max(wheel.MIN_SECTORS, Math.min(wheel.MAX_SECTORS, saved.length));
            wheel.setSectorCount(sectorCount);
        }
    }

    function saveData() {
        const texts = inputs.map(input => input.value.trim());
        Storage.save(texts);
    }

    function loadTheme() {
        const theme = Storage.loadTheme();
        if (theme) {
            themeSelect.value = theme;
            wheel.setTheme(theme);
        }
    }

    function showResult(text) {
        resultDiv.textContent = `🎉 ${text} 🎉`;
        resultDiv.title = text;
        resultDiv.classList.add('show');
        Storage.addHistory(text);
        renderHistory();
    }

    function hideResult() {
        resultDiv.classList.remove('show');
    }

    function updateSpinButton() {
        const canSpin = wheel.filledCount() >= 2;
        spinBtn.disabled = !canSpin;
        if (!canSpin) {
            spinBtn.textContent = 'Täytä vähintään 2';
        } else {
            spinBtn.textContent = 'Pyöritä!';
        }
    }

    function updateSectorButtons() {
        sectorCountDisplay.textContent = sectorCount;
        removeBtn.disabled = sectorCount <= wheel.MIN_SECTORS;
        addBtn.disabled = sectorCount >= wheel.MAX_SECTORS;
    }

    function renderHistory() {
        const history = Storage.loadHistory();
        historySection.hidden = history.length === 0;
        if (history.length === 0) return;
        historyList.innerHTML = '';
        history.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item.text;
            historyList.appendChild(li);
        });
    }
});
