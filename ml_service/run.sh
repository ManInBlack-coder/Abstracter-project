#!/bin/bash

# ==========================================================================
# ML Mudeli skriptide käivitaja
# ==========================================================================

# Värvid terminalile
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Skriptide kataloog
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SCRIPTS_PATH="$SCRIPT_DIR/scripts"

show_help() {
    echo -e "${BLUE}=== ML Mudeli skriptide käivitaja ===${NC}"
    echo "Kasutus: $0 [skript] [parameetrid]"
    echo ""
    echo "Saadaval olevad skriptid:"
    echo "  ml            - Käivita ML mudel põhifunktsionaalsusega (run_ml_scripts.sh)"
    echo "  monitor       - Käivita lihtsustatud monitooring (run_monitor.sh)"
    echo "  venv          - Käivita virtuaalkeskkonna põhine skript (run_with_venv.sh)"
    echo "  service       - Käivita ML teenus (run_ml_service.sh)"
    echo "  model         - Käivita baas mudeli skript (run_ml_model.sh)"
    echo "  advanced      - Käivita täiustatud diagnostikaga (run_ml_model_advanced.sh)"
    echo ""
    echo "ML skripti valikud (nt: $0 ml --debug):"
    echo "  --simple      - Lihtne käivitus"
    echo "  --venv        - Virtuaalkeskkonna põhine käivitus"
    echo "  --debug       - Importide jälgimisega käivitus"
    echo "  --advanced    - Täieliku diagnostikaga käivitus"
    echo ""
    echo "Näited:"
    echo "  $0 ml --debug        - Käivita ML mudel debug režiimis"
    echo "  $0 model             - Käivita lihtne mudeli skript"
    echo "  $0 advanced          - Käivita täiustatud mudeli skript"
}

# Kui ühtegi argumenti pole antud, näita abi
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

# Kontrolli kas scripts kaust on olemas
if [ ! -d "$SCRIPTS_PATH" ]; then
    echo -e "${RED}Viga: Scripts kaust ei eksisteeri: $SCRIPTS_PATH${NC}"
    exit 1
fi

# Analüüsi skripti valikut
SCRIPT=""
case "$1" in
    ml)
        SCRIPT="$SCRIPTS_PATH/run_ml_scripts.sh"
        shift
        ;;
    monitor)
        SCRIPT="$SCRIPTS_PATH/run_monitor.sh"
        shift
        ;;
    venv)
        SCRIPT="$SCRIPTS_PATH/run_with_venv.sh"
        shift
        ;;
    service)
        SCRIPT="$SCRIPTS_PATH/run_ml_service.sh"
        shift
        ;;
    model)
        SCRIPT="$SCRIPTS_PATH/run_ml_model.sh"
        shift
        ;;
    advanced)
        SCRIPT="$SCRIPTS_PATH/run_ml_model_advanced.sh"
        shift
        ;;
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        echo -e "${RED}Tundmatu skript: $1${NC}"
        show_help
        exit 1
        ;;
esac

# Kontrolli kas valitud skript on olemas
if [ ! -f "$SCRIPT" ]; then
    echo -e "${RED}Viga: Valitud skripti ei leitud: $SCRIPT${NC}"
    exit 1
fi

# Kontrolli kas skript on käivitatav
if [ ! -x "$SCRIPT" ]; then
    echo -e "${YELLOW}Hoiatus: Skript ei ole käivitatav, lisame käivitusõigused${NC}"
    chmod +x "$SCRIPT"
fi

# Käivita valitud skript koos ülejäänud parameetritega
echo -e "${GREEN}Käivitan skripti: $SCRIPT $*${NC}"
"$SCRIPT" "$@"

# Tagasta skripti lõpetamise kood
exit $? 