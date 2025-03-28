# ML Service

ML Service on TensorFlow põhinev masinõppe teenus, mis pakub abstraktse mõtlemise analüüsi ja soovitusi kasutajatele nende testitulemuste põhjal.

## Kataloogide struktuur

- `ml_service/` - Peakataloog masinõppe teenuse jaoks
  - `scripts/` - Kõik käivitusskriptid ja nende dokumentatsioon
  - `logs/` - Logifailid (genereeritakse skriptide käivitamisel)
  - `venv/` - Python virtuaalkeskkond
  - `src/` - Lähtekoodi kataloog
  - `tests/` - Testide kataloog

## Käivitamine

ML teenuse käivitamiseks kasutage peaskripti `run.sh`:

```bash
./run.sh [skript] [parameetrid]
```

Näiteks:

```bash
# Käivitab ML mudeli debug režiimis
./run.sh ml --debug

# Käivitab lihtsa mudeli skripti
./run.sh model
```

Täpsema info saamiseks, käivitage skript ilma parameetriteta või `-h` parameetriga:

```bash
./run.sh
# või
./run.sh -h
```

Täpsem dokumentatsioon skriptide kohta on saadaval failis `scripts/README_SCRIPTS.md`. 