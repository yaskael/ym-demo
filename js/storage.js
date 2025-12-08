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
                return parsed.sectors || null;
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
    }
};
