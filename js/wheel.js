/**
 * FortuneWheel - Onnenpyörän piirto ja animaatio
 */
class FortuneWheel {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // HiDPI / Retina -tuki. Näyttökoko määritetään CSS:ssä, jotta
        // pyörä skaalautuu kapeille näytöille.
        this.dpr = window.devicePixelRatio || 1;
        this.size = 400;
        canvas.width = this.size * this.dpr;
        canvas.height = this.size * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);

        this.centerX = this.size / 2;
        this.centerY = this.size / 2;
        this.rimWidth = 14;
        this.radius = this.size / 2 - this.rimWidth - 4;

        this.MIN_SECTORS = 2;
        this.MAX_SECTORS = 12;

        this.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, sans-serif";

        // Sektorien oletustekstit
        this.sectors = [];
        this.initSectors(8);

        // Teemapaletit (12 eri väriä, jotta vierekkäiset sektorit eivät koskaan ole samanvärisiä)
        this.themes = {
            default: [
                '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
                '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
                '#74B9FF', '#A29BFE', '#FD79A8', '#55E6C1'
            ],
            pastel: [
                '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA',
                '#E8BAFF', '#FFD4BA', '#BAF2FF', '#D4FFBA',
                '#FFBAE1', '#BAD4FF', '#F2FFBA', '#FFBAF2'
            ],
            neon: [
                '#FF073A', '#39FF14', '#00F0FF', '#FF61F6',
                '#FFE600', '#7B00FF', '#FF6700', '#00FF87',
                '#FF00A0', '#00BFFF', '#BFFF00', '#FF4500'
            ],
            ocean: [
                '#0077B6', '#90E0EF', '#023E8A', '#48CAE4',
                '#03045E', '#ADE8F4', '#0096C7', '#CAF0F8',
                '#1B4965', '#00B4D8', '#2A6F97', '#62B6CB'
            ]
        };

        this.colors = this.themes.default;

        // Animaation tila
        this.rotation = 0;
        this.isSpinning = false;
        this.onCompleteCallback = null;
        this.onTickCallback = null;
        this.lastSectorIndex = -1;
        this.highlightIndex = -1;

        // Piirrä alkutila
        this.draw();
    }

    /**
     * Vaihtaa väripalettia
     * @param {string} themeName - Teeman nimi
     */
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.colors = this.themes[themeName];
            this.draw();
        }
    }

    /**
     * Alustaa sektorit annetulla lukumäärällä
     */
    initSectors(count) {
        this.sectors = [];
        this.filledSectors = [];
        for (let i = 0; i < count; i++) {
            this.sectors.push(`Vaihtoehto ${i + 1}`);
            this.filledSectors.push(false);
        }
    }

    /**
     * Asettaa sektorien lukumäärän, säilyttäen olemassa olevat tekstit
     * @param {number} count - Uusi sektorien lukumäärä (2-12)
     * @returns {number} Todellinen asetettu lukumäärä
     */
    setSectorCount(count) {
        count = Math.max(this.MIN_SECTORS, Math.min(this.MAX_SECTORS, count));
        const current = this.sectors.length;

        if (count > current) {
            for (let i = current; i < count; i++) {
                this.sectors.push(`Vaihtoehto ${i + 1}`);
                this.filledSectors.push(false);
            }
        } else if (count < current) {
            this.sectors.length = count;
            this.filledSectors.length = count;
        }

        this.highlightIndex = -1;
        this.draw();
        return count;
    }

    /**
     * Päivittää yhden sektorin tekstin
     * @param {number} index - Sektorin indeksi
     * @param {string} text - Uusi teksti
     */
    updateSector(index, text) {
        if (index >= 0 && index < this.sectors.length) {
            this.filledSectors[index] = !!text;
            this.sectors[index] = text || `Vaihtoehto ${index + 1}`;
            this.highlightIndex = -1;
            this.draw();
        }
    }

    /**
     * Päivittää kaikki sektorit
     * @param {string[]} texts - Sektorien tekstit
     */
    updateAllSectors(texts) {
        texts.forEach((text, i) => {
            if (i < this.sectors.length) {
                this.filledSectors[i] = !!text;
                this.sectors[i] = text || `Vaihtoehto ${i + 1}`;
            }
        });
        this.highlightIndex = -1;
        this.draw();
    }

    /**
     * Palauttaa sektorien tekstit
     * @returns {string[]}
     */
    getSectorTexts() {
        return [...this.sectors];
    }

    /**
     * Palauttaa pyörässä näytettävien sektorien alkuperäiset indeksit.
     * Kun vähintään kaksi sektoria on täytetty, tyhjät jätetään pois,
     * jolloin tyhjä sektori ei voi koskaan voittaa.
     * @returns {number[]}
     */
    getActiveIndices() {
        const all = this.sectors.map((_, i) => i);
        if (this.filledCount() < 2) return all;
        return all.filter(i => this.filledSectors[i]);
    }

    /**
     * Piirtää pyörän
     */
    draw() {
        const ctx = this.ctx;
        const active = this.getActiveIndices();
        const isPreview = this.filledCount() < 2;
        const sectorAngle = (2 * Math.PI) / active.length;

        ctx.clearRect(0, 0, this.size, this.size);

        this.drawRim();

        active.forEach((sectorIndex, i) => {
            const startAngle = i * sectorAngle + this.rotation - Math.PI / 2;
            const endAngle = startAngle + sectorAngle;
            const color = this.colors[i % this.colors.length];
            const dimmed = isPreview && !this.filledSectors[sectorIndex];
            const faded = this.highlightIndex !== -1 && this.highlightIndex !== i;

            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
            ctx.closePath();

            ctx.fillStyle = color;
            ctx.globalAlpha = dimmed ? 0.35 : faded ? 0.45 : 1.0;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 2;
            ctx.stroke();

            this.drawSectorText(this.sectors[sectorIndex], startAngle, sectorAngle, color, dimmed || faded);
        });

        // Kevyt sisävarjo antaa pyörälle syvyyttä
        const shade = ctx.createRadialGradient(
            this.centerX, this.centerY, this.radius * 0.6,
            this.centerX, this.centerY, this.radius
        );
        shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shade.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = shade;
        ctx.fill();

        this.drawCenter();
    }

    /**
     * Piirtää pyörän ulkokehän ja koristevalot
     */
    drawRim() {
        const ctx = this.ctx;
        const outer = this.radius + this.rimWidth;

        const rim = ctx.createLinearGradient(0, 0, this.size, this.size);
        rim.addColorStop(0, '#3d3d5c');
        rim.addColorStop(1, '#22223a');
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, outer, 0, 2 * Math.PI);
        ctx.fillStyle = rim;
        ctx.fill();

        // Valot pyörivät pyörän mukana, joten pyörimisen näkee myös kehästä
        const bulbs = 24;
        const bulbRadius = this.radius + this.rimWidth / 2;
        for (let i = 0; i < bulbs; i++) {
            const a = (i / bulbs) * 2 * Math.PI + this.rotation;
            ctx.beginPath();
            ctx.arc(
                this.centerX + Math.cos(a) * bulbRadius,
                this.centerY + Math.sin(a) * bulbRadius,
                2.6, 0, 2 * Math.PI
            );
            ctx.fillStyle = i % 2 === 0 ? '#ffd700' : '#fff6cc';
            ctx.fill();
        }
    }

    /**
     * Laskee värin suhteellisen luminanssin tekstin kontrastin valintaa varten
     * @param {string} hex - Värikoodi (#RRGGBB)
     * @returns {number} Luminanssi 0-1
     */
    getLuminance(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    /**
     * Lyhentää tekstin niin, että se mahtuu annettuun leveyteen
     */
    fitText(text, maxWidth) {
        const ctx = this.ctx;
        if (ctx.measureText(text).width <= maxWidth) return text;
        let end = text.length;
        while (end > 1 && ctx.measureText(text.substring(0, end) + '…').width > maxWidth) {
            end--;
        }
        return text.substring(0, end).trimEnd() + '…';
    }

    /**
     * Piirtää sektorin tekstin säteen suuntaisesti, tasattuna kehää vasten
     */
    drawSectorText(text, startAngle, sectorAngle, bgColor, muted) {
        const ctx = this.ctx;
        const textAngle = startAngle + sectorAngle / 2;
        const outerPadding = 14;
        const innerLimit = 38; // keskiön ulkopuolelle
        const maxWidth = this.radius - outerPadding - innerLimit;

        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(textAngle);

        // Fonttikoko sektorin kaaren korkeuden mukaan (tekstin kohdalla).
        // Pitkää tekstiä pienennetään ensin ja lyhennetään vasta sitten.
        const arcHeight = 2 * Math.sin(Math.min(sectorAngle, Math.PI) / 2) * (this.radius * 0.7);
        const minFontSize = 11;
        let fontSize = Math.max(minFontSize, Math.min(18, Math.floor(arcHeight * 0.42)));
        ctx.font = `600 ${fontSize}px ${this.fontFamily}`;
        while (fontSize > 13 && ctx.measureText(text).width > maxWidth) {
            fontSize--;
            ctx.font = `600 ${fontSize}px ${this.fontFamily}`;
        }

        // Himmennetty sektori näkyy tummaa taustaa vasten, joten silloin teksti on aina vaalea
        const darkText = !muted && this.getLuminance(bgColor) > 0.55;
        ctx.fillStyle = darkText ? '#2d3436' : '#ffffff';
        ctx.globalAlpha = muted ? 0.75 : 1.0;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        if (!darkText) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
            ctx.shadowBlur = 3;
        }

        ctx.fillText(this.fitText(text, maxWidth), this.radius - outerPadding, 0);
        ctx.restore();
    }

    /**
     * Piirtää pyörän keskipisteen
     */
    drawCenter() {
        const ctx = this.ctx;

        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 28, 0, 2 * Math.PI);
        ctx.fillStyle = '#2d3436';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.stroke();

        const gold = ctx.createRadialGradient(
            this.centerX - 6, this.centerY - 6, 2,
            this.centerX, this.centerY, 19
        );
        gold.addColorStop(0, '#fff3b0');
        gold.addColorStop(1, '#e6b800');
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 19, 0, 2 * Math.PI);
        ctx.fillStyle = gold;
        ctx.fill();
    }

    /**
     * Käynnistää pyöritysanimaation
     * @param {function} onComplete - Callback kun pyöritys päättyy
     * @param {function} [onTick] - Callback kun osoitin ylittää sektorirajan
     */
    spin(onComplete, onTick) {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.onCompleteCallback = onComplete;
        this.onTickCallback = onTick || null;
        this.lastSectorIndex = this.getCurrentSectorAtPointer();
        this.highlightIndex = -1;

        // Satunnainen pyörimismäärä: 5-8 kierrosta + satunnainen kulma
        const extraSpins = 5 + Math.floor(Math.random() * 4);
        const randomAngle = Math.random() * 2 * Math.PI;
        const totalRotation = extraSpins * 2 * Math.PI + randomAngle;

        const reduceMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const duration = reduceMotion ? 1200 : 4500;
        const startTime = performance.now();
        const startRotation = this.rotation;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out quart: pitkä, luonnollinen hidastuminen
            const easeOut = 1 - Math.pow(1 - progress, 4);

            this.rotation = startRotation + totalRotation * easeOut;
            this.draw();

            if (this.onTickCallback) {
                const currentSector = this.getCurrentSectorAtPointer();
                if (currentSector !== this.lastSectorIndex) {
                    this.lastSectorIndex = currentSector;
                    this.onTickCallback();
                }
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                this.rotation = this.rotation % (2 * Math.PI);
                this.onSpinComplete();
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Palauttaa osoittimen kohdalla olevan sektorin sijainnin pyörässä
     * (indeksi näytettävien sektorien joukossa)
     */
    getCurrentSectorAtPointer() {
        const numSectors = this.getActiveIndices().length;
        const sectorAngle = (2 * Math.PI) / numSectors;
        const normalizedRotation = (2 * Math.PI - (this.rotation % (2 * Math.PI))) % (2 * Math.PI);
        return Math.min(numSectors - 1, Math.floor(normalizedRotation / sectorAngle));
    }

    /**
     * Kutsutaan kun pyöritys päättyy
     */
    onSpinComplete() {
        const winner = this.getWinner();
        this.highlightIndex = this.getCurrentSectorAtPointer();
        this.draw();
        if (this.onCompleteCallback) {
            this.onCompleteCallback(winner);
        }
    }

    /**
     * Määrittää voittajan nykyisen kulman perusteella
     * @returns {object} Voittajan tiedot {index, text}
     */
    getWinner() {
        // Osoitin on yläreunassa; rotation kasvaa myötäpäivään
        const winnerIndex = this.getActiveIndices()[this.getCurrentSectorAtPointer()];

        return {
            index: winnerIndex,
            text: this.sectors[winnerIndex]
        };
    }

    /**
     * Palauttaa täytettyjen sektorien lukumäärän
     * @returns {number}
     */
    filledCount() {
        return this.filledSectors.filter(Boolean).length;
    }

    /**
     * Onko pyörä pyörimässä
     * @returns {boolean}
     */
    spinning() {
        return this.isSpinning;
    }
}
