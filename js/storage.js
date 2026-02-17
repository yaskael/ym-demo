/**
 * Storage-moduuli - LocalStorage-käsittely
 */
const Storage = {
    KEY: 'onnenpyora_data',

    /**
     * Tallentaa sektorien tekstit
     * @param {string[]} sectors - Sektorien tekstit
     */
    save(sectors) {
        try {
            const data = {
                sectors: sectors,
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(this.KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('LocalStorage tallennus epäonnistui:', e);
            return false;
        }
    },

    /**
     * Lataa tallennetut sektorien tekstit
     * @returns {string[]|null} Sektorien tekstit tai null
     */
    load() {
        try {
            const data = localStorage.getItem(this.KEY);
            if (data) {
                const parsed = JSON.parse(data);
                // Vahvista datan rakenne
                if (!parsed || !Array.isArray(parsed.sectors)) return null;
                // Varmista että jokainen elementti on merkkijono ja leikkaa pituus
                return parsed.sectors.map(s =>
                    typeof s === 'string' ? s.substring(0, 20) : ''
                );
            }
            return null;
        } catch (e) {
            console.warn('LocalStorage lataus epäonnistui:', e);
            return null;
        }
    },

    /**
     * Tyhjentää tallennetut tiedot
     */
    clear() {
        try {
            localStorage.removeItem(this.KEY);
            return true;
        } catch (e) {
            console.warn('LocalStorage tyhjennys epäonnistui:', e);
            return false;
        }
    },

    /**
     * Tarkistaa onko tallennettua dataa
     * @returns {boolean}
     */
    exists() {
        return localStorage.getItem(this.KEY) !== null;
    },

    // Historia
    HISTORY_KEY: 'onnenpyora_history',
    MAX_HISTORY: 10,

    /**
     * Lisää tuloksen historiaan
     * @param {string} text - Voittajan teksti
     */
    addHistory(text) {
        try {
            const history = this.loadHistory();
            history.unshift({
                text: typeof text === 'string' ? text.substring(0, 20) : '',
                time: new Date().toISOString()
            });
            if (history.length > this.MAX_HISTORY) {
                history.length = this.MAX_HISTORY;
            }
            localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
        } catch (e) {
            console.warn('Historia tallennus epäonnistui:', e);
        }
    },

    /**
     * Lataa historian
     * @returns {Array} Historia-taulukko
     */
    loadHistory() {
        try {
            const data = localStorage.getItem(this.HISTORY_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    return parsed.filter(item =>
                        item && typeof item.text === 'string'
                    ).slice(0, this.MAX_HISTORY);
                }
            }
            return [];
        } catch (e) {
            console.warn('Historia lataus epäonnistui:', e);
            return [];
        }
    },

    /**
     * Tyhjentää historian
     */
    clearHistory() {
        try {
            localStorage.removeItem(this.HISTORY_KEY);
        } catch (e) {
            console.warn('Historia tyhjennys epäonnistui:', e);
        }
    },

    // Teema
    THEME_KEY: 'onnenpyora_theme',

    saveTheme(theme) {
        try {
            localStorage.setItem(this.THEME_KEY, theme);
        } catch (e) {
            console.warn('Teema tallennus epäonnistui:', e);
        }
    },

    loadTheme() {
        try {
            return localStorage.getItem(this.THEME_KEY);
        } catch (e) {
            return null;
        }
    }
};
