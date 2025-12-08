# Arkkitehtuuri

## Yleiskatsaus

Sovellus koostuu kolmesta pääkomponentista:

```
┌─────────────────────────────────────────────────────────┐
│                      index.html                         │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │                 │  │     Käyttöliittymä           │  │
│  │    Canvas       │  │  ┌─────────────────────┐    │  │
│  │   (Pyörä)       │  │  │ Tekstikentät (1-8)  │    │  │
│  │                 │  │  └─────────────────────┘    │  │
│  │                 │  │  ┌─────────────────────┐    │  │
│  │                 │  │  │ Pyöritä-nappi       │    │  │
│  │                 │  │  └─────────────────────┘    │  │
│  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
           │                        │
           ▼                        ▼
    ┌─────────────┐          ┌─────────────┐
    │  wheel.js   │◄────────►│   app.js    │
    │  (Piirto)   │          │  (Logiikka) │
    └─────────────┘          └─────────────┘
                                   │
                                   ▼
                            ┌─────────────┐
                            │ storage.js  │
                            │ (Tallennus) │
                            └─────────────┘
                                   │
                                   ▼
                            ┌─────────────┐
                            │localStorage │
                            └─────────────┘
```

## Komponentit

### 1. HTML-rakenne (index.html)

Pääsivun elementit:

| Elementti | Tarkoitus |
|-----------|-----------|
| `<canvas>` | Pyörän piirtoalue |
| `<input>` x8 | Sektorien tekstikentät |
| `<button>` | Pyöritys-nappi |
| `<div>` | Tuloksen näyttö |

### 2. Pyörämoduuli (wheel.js)

Vastaa pyörän piirtämisestä ja animaatiosta.

```
FortuneWheel
├── constructor(canvas, options)
├── draw()                    # Piirtää pyörän
├── spin()                    # Käynnistää animaation
├── updateSectors(texts)      # Päivittää sektorit
├── getCurrentAngle()         # Palauttaa nykyisen kulman
└── onSpinComplete(callback)  # Callback pyörityksen päättyessä
```

**Piirtoalgoritmi:**
1. Laske sektorin koko: `360° / sektorien_määrä`
2. Jokaiselle sektorille:
   - Piirrä sektorin kaari (`arc`)
   - Täytä väri
   - Piirrä teksti keskelle sektoria

### 3. Tallennusmoduuli (storage.js)

LocalStorage-käsittely:

```
Storage
├── save(key, data)      # Tallentaa JSON-muodossa
├── load(key)            # Lataa ja parsii JSON:n
├── clear()              # Tyhjentää tallennuksen
└── exists(key)          # Tarkistaa olemassaolon
```

**Tallennettava data:**
```json
{
  "sectors": [
    "Vaihtoehto 1",
    "Vaihtoehto 2",
    ...
  ],
  "lastModified": "2025-12-08T10:00:00Z"
}
```

### 4. Pääsovellus (app.js)

Yhdistää komponentit ja käsittelee käyttäjän toiminnot.

```
App
├── init()                    # Alustus
├── handleSpin()              # Pyörityksen käsittely
├── handleTextChange(index)   # Tekstin muutos
├── showResult(winner)        # Tuloksen näyttö
└── loadSavedData()           # Lataa tallennetut tiedot
```

## Tietovirta

```
Käyttäjä kirjoittaa tekstin
         │
         ▼
   ┌───────────┐
   │ input     │ ──► app.js ──► wheel.updateSectors()
   │ onChange  │               │
   └───────────┘               ▼
                         storage.save()

Käyttäjä painaa nappia
         │
         ▼
   ┌───────────┐
   │ button    │ ──► app.handleSpin() ──► wheel.spin()
   │ onClick   │                               │
   └───────────┘                               ▼
                                    onSpinComplete(winner)
                                               │
                                               ▼
                                      app.showResult()
```

## Animaatiomekaniikka

### Pyöritysanimaatio

Käytetään **ease-out** -hidastusta realistiseen vaikutelmaan:

```
nopeus(t) = alkunopeus × (1 - t)²
```

missä `t` on normalisoitu aika välillä [0, 1].

### Voittajan määritys

1. Lopullinen kulma = `kokonaiskulma mod 360`
2. Voittajasektori = `floor(lopullinen_kulma / sektorin_koko)`
3. Osoitin on yläreunassa (0°/360°)

## Väripaletti

Sektorien värit valitaan automaattisesti:

| Sektori | Väri |
|---------|------|
| 1 | #FF6B6B (punainen) |
| 2 | #4ECDC4 (turkoosi) |
| 3 | #45B7D1 (sininen) |
| 4 | #96CEB4 (vihreä) |
| 5 | #FFEAA7 (keltainen) |
| 6 | #DDA0DD (violetti) |
| 7 | #98D8C8 (minttu) |
| 8 | #F7DC6F (kulta) |
