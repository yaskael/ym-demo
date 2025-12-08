/**
 * Onnenpyörä - Pääsovellus
 */
document.addEventListener('DOMContentLoaded', () => {
    // Elementit
    const canvas = document.getElementById('wheel');
    const spinBtn = document.getElementById('spin-btn');
    const resultDiv = document.getElementById('result');
    const inputs = [];

    // Kerää kaikki syöttökentät
    for (let i = 1; i <= 8; i++) {
        inputs.push(document.getElementById(`sector-${i}`));
    }

    // Luo pyörä
    const wheel = new FortuneWheel(canvas);

    // Lataa tallennetut tiedot
    loadSavedData();

    // Syöttökenttien tapahtumankäsittelijät
    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            const text = input.value.trim();
            wheel.updateSector(index, text);
            saveData();
        });
    });

    // Pyöritysnapin tapahtumankäsittelijä
    spinBtn.addEventListener('click', () => {
        if (wheel.spinning()) return;

        // Piilota edellinen tulos
        hideResult();

        // Estä nappi pyörityksen ajaksi
        spinBtn.disabled = true;
        spinBtn.textContent = 'Pyörii...';

        // Käynnistä pyöritys
        wheel.spin((winner) => {
            // Näytä tulos
            showResult(winner.text);

            // Palauta nappi
            spinBtn.disabled = false;
            spinBtn.textContent = 'Pyöritä!';
        });
    });

    /**
     * Lataa tallennetut tiedot
     */
    function loadSavedData() {
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
     * Tallentaa nykyiset tiedot
     */
    function saveData() {
        const texts = inputs.map(input => input.value.trim());
        Storage.save(texts);
    }

    /**
     * Näyttää tuloksen
     * @param {string} text - Voittajan teksti
     */
    function showResult(text) {
        resultDiv.textContent = `🎉 ${text} 🎉`;
        resultDiv.classList.add('show');
    }

    /**
     * Piilottaa tuloksen
     */
    function hideResult() {
        resultDiv.classList.remove('show');
    }
});
