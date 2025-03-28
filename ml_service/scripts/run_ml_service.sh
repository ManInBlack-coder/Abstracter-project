#!/bin/bash

# ML teenuse käivitamise peaskript
# See skript võimaldab kasutajal valida, millist skripti käivitada

# Värvidega kujundus
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktsionaalse toe kontroll
clear
echo -e "${BLUE}===================================${NC}"
echo -e "${GREEN}ML Teenuse Käivitamise Peaskript${NC}"
echo -e "${BLUE}===================================${NC}"
echo

# Kontrolli skriptide kataloogi
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
SCRIPTS_FOLDER="$SCRIPT_DIR/scripts"

if [ ! -d "$SCRIPTS_FOLDER" ]; then
    echo -e "${RED}Viga: Skriptide kataloogi ei leitud: $SCRIPTS_FOLDER${NC}"
    exit 1
fi

# Kontrolli skriptide olemasolu
if [ ! -f "$SCRIPTS_FOLDER/run_monitor.sh" ] || 
   [ ! -f "$SCRIPTS_FOLDER/run_with_venv.sh" ] ||
   [ ! -f "$SCRIPTS_FOLDER/run_ml_model.sh" ] ||
   [ ! -f "$SCRIPTS_FOLDER/run_ml_model_advanced.sh" ]; then
    echo -e "${RED}Viga: Mõni vajalik skript puudub scripts kataloogist${NC}"
    exit 1
fi

# Tee skriptid täitmisõigusega
chmod +x "$SCRIPTS_FOLDER"/*.sh

# Valikute kuvamine
echo -e "${YELLOW}Vali, millist käivitamise skripti soovid kasutada:${NC}"
echo
echo -e "  ${GREEN}1) Lihtne monitooring${NC} (run_monitor.sh)"
echo -e "     - Töötab ilma virtuaalkeskkonnata"
echo -e "     - Salvestab ühe täieliku logi"
echo
echo -e "  ${GREEN}2) Täielik venv-põhine monitooring${NC} (run_with_venv.sh)"
echo -e "     - Kasutab virtuaalkeskkonda"
echo -e "     - Loob eraldi logifailid importide ja täieliku tegevuse jaoks"
echo
echo -e "  ${GREEN}3) Tavaline debug režiim${NC} (run_ml_model.sh)"
echo -e "     - Lihtne venv-põhine jälgimisega käivitus"
echo
echo -e "  ${GREEN}4) Täiendatud info ja analüüs${NC} (run_ml_model_advanced.sh)"
echo -e "     - Põhjalik TensorFlow diagnostika"
echo -e "     - Pakub detailseid vihjeid võimalikest probleemidest"
echo
echo -e "  ${RED}0) Välju${NC}"
echo

# Küsi kasutaja valikut
read -p "Sisesta oma valik (0-4): " choice
echo

# Käivita valitud skript
case $choice in
    1)
        echo -e "${BLUE}Käivitan lihtsa monitooringu...${NC}"
        "$SCRIPTS_FOLDER/run_monitor.sh"
        ;;
    2)
        echo -e "${BLUE}Käivitan venv-põhise monitooringu...${NC}"
        "$SCRIPTS_FOLDER/run_with_venv.sh"
        ;;
    3)
        echo -e "${BLUE}Käivitan tavalise debug režiimi...${NC}"
        "$SCRIPTS_FOLDER/run_ml_model.sh"
        ;;
    4)
        echo -e "${BLUE}Käivitan täiendatud info ja analüüsi...${NC}"
        "$SCRIPTS_FOLDER/run_ml_model_advanced.sh"
        ;;
    0)
        echo -e "${YELLOW}Väljun...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Vigane valik!${NC}"
        exit 1
        ;;
esac 