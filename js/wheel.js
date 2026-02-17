/**
 * FortuneWheel - Onnenpyörän piirto ja animaatio
 */
export class FortuneWheel {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // HiDPI / Retina -tuki
        this.dpr = window.devicePixelRatio || 1;
        const logicalWidth = 400;
        const logicalHeight = 400;
        canvas.width = logicalWidth * this.dpr;
        canvas.height = logicalHeight * this.dpr;
        canvas.style.width = logicalWidth + 'px';
        canvas.style.height = logicalHeight + 'px';
        this.ctx.scale(this.dpr, this.dpr);

        this.centerX = logicalWidth / 2;
        this.centerY = logicalHeight / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 10;

        this.MIN_SECTORS = 2;
        this.MAX_SECTORS = 12;

        // Sektorien oletustekstit
        this.sectors = [];
        this.initSectors(8);

        // Teemapaletit
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
                '#0077B6', '#00B4D8', '#48CAE4', '#90E0EF',
                '#023E8A', '#0096C7', '#ADE8F4', '#CAF0F8',
                '#03045E', '#0077B6', '#48CAE4', '#90E0EF'
            ]
        };

        this.colors = this.themes.default;

        // Seuraa mitkä sektorit käyttäjä on täyttänyt
        this.filledSectors = new Array(this.sectors.length).fill(false);

        // Animaation tila
        this.rotation = 0;
        this.isSpinning = false;
        this.onCompleteCallback = null;
        this.onTickCallback = null;
        this.lastSectorIndex = -1;

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
     * Piirtää pyörän
     */
    draw() {
        const ctx = this.ctx;
        const numSectors = this.sectors.length;
        const sectorAngle = (2 * Math.PI) / numSectors;

        // Tyhjennä canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Piirrä jokainen sektori
        this.sectors.forEach((text, i) => {
            const startAngle = i * sectorAngle + this.rotation - Math.PI / 2;
            const endAngle = startAngle + sectorAngle;

            // Piirrä sektorin kaari
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
            ctx.closePath();

            // Täytä väri (himmennä tyhjät sektorit)
            ctx.fillStyle = this.colors[i % this.colors.length];
            ctx.globalAlpha = this.filledSectors[i] ? 1.0 : 0.35;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Reunaviiva
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Piirrä teksti
            this.drawSectorText(text, startAngle, sectorAngle, i);
        });

        // Piirrä keskipiste
        this.drawCenter();
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
     * Piirtää sektorin tekstin
     */
    drawSectorText(text, startAngle, sectorAngle, colorIndex) {
        const ctx = this.ctx;
        const textAngle = startAngle + sectorAngle / 2;
        const textRadius = this.radius * 0.65;

        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(textAngle);

        // Valitse tekstin väri taustan luminanssin mukaan
        const bgColor = this.colors[colorIndex % this.colors.length];
        const textColor = this.getLuminance(bgColor) > 0.55 ? '#2d3436' : '#ffffff';

        // Skaalaa fonttikoko sektorien lukumäärän mukaan
        const fontSize = this.sectors.length <= 6 ? 14 : this.sectors.length <= 9 ? 12 : 10;

        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Lyhennä pitkät tekstit
        let displayText = text;
        if (text.length > 12) {
            displayText = text.substring(0, 11) + '…';
        }

        ctx.fillText(displayText, textRadius, 0);
        ctx.restore();
    }

    /**
     * Piirtää pyörän keskipisteen
     */
    drawCenter() {
        const ctx = this.ctx;

        // Ulompi ympyrä
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 25, 0, 2 * Math.PI);
        ctx.fillStyle = '#2d3436';
        ctx.fill();

        // Sisempi ympyrä
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 18, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffd700';
        ctx.fill();
    }

    /**
     * Käynnistää pyöritysanimaation
     * @param {function} onComplete - Callback kun pyöritys päättyy
     */
    spin(onComplete, onTick) {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.onCompleteCallback = onComplete;
        this.onTickCallback = onTick || null;
        this.lastSectorIndex = -1;

        // Satunnainen pyörimismäärä: 5-10 kierrosta + satunnainen kulma
        const extraSpins = 5 + Math.random() * 5;
        const randomAngle = Math.random() * 2 * Math.PI;
        const totalRotation = extraSpins * 2 * Math.PI + randomAngle;

        const duration = 4000; // 4 sekuntia
        const startTime = performance.now();
        const startRotation = this.rotation;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic hidastus
            const easeOut = 1 - Math.pow(1 - progress, 3);

            this.rotation = startRotation + totalRotation * easeOut;
            this.draw();

            // Tarkista sektorivaihto tick-ääntä varten
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
                // Normalisoi kulma välille [0, 2π]
                this.rotation = this.rotation % (2 * Math.PI);
                this.onSpinComplete();
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Palauttaa osoittimen kohdalla olevan sektorin indeksin
     */
    getCurrentSectorAtPointer() {
        const numSectors = this.sectors.length;
        const sectorAngle = (2 * Math.PI) / numSectors;
        let normalizedRotation = (2 * Math.PI - (this.rotation % (2 * Math.PI))) % (2 * Math.PI);
        return Math.floor(normalizedRotation / sectorAngle);
    }

    /**
     * Kutsutaan kun pyöritys päättyy
     */
    onSpinComplete() {
        const winner = this.getWinner();
        if (this.onCompleteCallback) {
            this.onCompleteCallback(winner);
        }
    }

    /**
     * Määrittää voittajan nykyisen kulman perusteella
     * @returns {object} Voittajan tiedot {index, text}
     */
    getWinner() {
        const numSectors = this.sectors.length;
        const sectorAngle = (2 * Math.PI) / numSectors;

        // Osoitin on yläreunassa (0°), joten lasketaan mikä sektori on siellä
        // Rotation on negatiivinen suunta (myötäpäivään), joten käännetään
        let normalizedRotation = (2 * Math.PI - (this.rotation % (2 * Math.PI))) % (2 * Math.PI);

        // Lasketaan sektori-indeksi
        const winnerIndex = Math.floor(normalizedRotation / sectorAngle);

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
