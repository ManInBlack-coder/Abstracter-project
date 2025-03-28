#!/bin/bash

# Määrame skripti asukohta
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "=== Süsteemi info ==="
uname -a

echo "=== Python versioon ==="
python --version
python3 --version

echo "=== Installitud paketid ==="
pip list || pip3 list

echo "=== Virtuaalkeskkonna katsetamine ==="
if [ -d "venv/bin" ]; then
    echo "Venv kataloog leitud, proovin aktiveerida..."
    source venv/bin/activate || echo "Aktiveerimine ebaõnnestus"
    which python
else
    echo "Venv kataloogi ei leitud asukohas $(pwd)/venv/bin"
    find . -name "activate" | head -n 5
fi

# Keskkonna muutujad
export TF_CPP_MIN_LOG_LEVEL=0 
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1

echo ""
echo "=== Käivitame mudeli verbose režiimis ==="
echo "Logitakse faili: ml_model_log_$(date +%Y%m%d_%H%M%S).log"
echo ""

# Salvestame jälgimise logifaili
LOG_FILE="ml_model_log_$(date +%Y%m%d_%H%M%S).log"

# Käivitame Python skripti
python3 -vv ml_model.py 2>&1 | tee "$LOG_FILE"

# Kontrollime käivitamise tulemust
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "=== Mudeli käivitamine ebaõnnestus koodiga $EXIT_CODE ==="
    echo "Viimased 30 rida logist:"
    tail -n 30 "$LOG_FILE"
else
    echo ""
    echo "=== Mudeli käivitamine õnnestus! ==="
fi

echo ""
echo "Täielik logi on saadaval: $LOG_FILE" 