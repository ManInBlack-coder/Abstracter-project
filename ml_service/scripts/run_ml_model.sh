#!/bin/bash

# Määrame skripti asukohta
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "=== Aktiveerime Python virtuaalkeskkonna ==="
source venv/bin/activate

echo "=== Python versioon ==="
python --version

echo "=== Installitud paketid ==="
pip list

echo "=== Käivitame mudeli verbose režiimis pakettide jälgimiseks ==="
# -v näitab importimise infot, rohkem v-sid näitab rohkem detaile
python -vv ml_model.py 2>&1 | tee ml_model_debug.log

# Kui soovite ootamatu lõppemise korral logida ka koodi, mis võib olla kasulik
# Lisage järgmised read:
if [ $? -ne 0 ]; then
    echo "=== Mudeli käivitamine ebaõnnestus, vaata logifaili ==="
    echo "Viimased 20 rida logist:"
    tail -n 20 ml_model_debug.log
fi 