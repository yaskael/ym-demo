# Onnenpyörä (Fortune Wheel)

Mukautettava onnenpyörä-sovellus, joka toimii täysin selaimessa ilman verkkoyhteyttä.

## Ominaisuudet

- 🎡 Interaktiivinen onnenpyörä Canvas-elementillä
- ✏️ Mukautettavat tekstit jokaiselle sektorille
- 🔄 Animoitu pyöritys napinpainalluksella
- 💾 Asetusten tallennus selaimen localStorageen
- 🌐 Toimii täysin offline-tilassa

## Teknologiat

- **HTML5** - Rakenne
- **CSS3** - Tyylit ja animaatiot
- **JavaScript (ES6+)** - Logiikka ja Canvas-piirto
- **LocalStorage** - Tietojen tallennus

## Tiedostorakenne

```
onnenpyora/
├── index.html          # Pääsivu
├── css/
│   └── style.css       # Tyylit
├── js/
│   ├── wheel.js        # Pyörän piirto ja animaatio
│   ├── storage.js      # LocalStorage-käsittely
│   └── app.js          # Pääsovellus
└── docs/
    ├── ARCHITECTURE.md # Arkkitehtuurikuvaus
    ├── FEATURES.md     # Ominaisuudet
    └── IMPLEMENTATION.md # Toteutussuunnitelma
```

## Käyttö

1. Avaa `index.html` selaimessa
2. Muokkaa sektoreiden tekstejä syöttökentissä
3. Paina "Pyöritä" -nappia
4. Odota tulosta!

## Dokumentaatio

- [Arkkitehtuuri](docs/ARCHITECTURE.md)
- [Ominaisuudet](docs/FEATURES.md)
- [Toteutussuunnitelma](docs/IMPLEMENTATION.md)
