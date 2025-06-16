#!/bin/bash

# 設定顏色
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo
echo -e "${PURPLE}🎫 無名子大王搶票小幫手 - Linux/macOS 自動安裝程式${NC}"
echo "================================================"
echo

# 檢查 Python 是否已安裝
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}❌ 錯誤：找不到 Python！${NC}"
    echo
    echo -e "${CYAN}� 請先安裝 Python：${NC}"
    echo "   • Ubuntu/Debian: sudo apt update && sudo apt install python3 python3-pip"
    echo "   • CentOS/RHEL: sudo yum install python3 python3-pip"
    echo "   • macOS: brew install python3"
    echo "   • 或從 https://www.python.org/downloads/ 下載安裝"
    echo
    exit 1
fi

# 檢查使用 python3 還是 python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    PIP_CMD="pip"
fi

echo -e "${GREEN}✅ Python 已安裝${NC}"
$PYTHON_CMD --version

# 檢查 pip 是否可用
if ! command -v $PIP_CMD &> /dev/null; then
    echo -e "${RED}❌ 錯誤：找不到 pip！${NC}"
    echo "正在嘗試安裝 pip..."
    
    if command -v curl &> /dev/null; then
        curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
        $PYTHON_CMD get-pip.py --user
        rm get-pip.py
    else
        echo -e "${RED}請手動安裝 pip 後再運行此腳本${NC}"
        exit 1
    fi
fi

echo
echo -e "${BLUE}📦 正在安裝 Python 依賴套件...${NC}"
echo

# 安裝 ddddocr
echo -e "${CYAN}� 安裝 ddddocr（驗證碼識別庫）...${NC}"
if $PIP_CMD install ddddocr; then
    echo -e "${GREEN}✅ ddddocr 安裝成功${NC}"
else
    echo -e "${YELLOW}⚠️  嘗試用戶安裝...${NC}"
    if $PIP_CMD install ddddocr --user; then
        echo -e "${GREEN}✅ ddddocr 用戶安裝成功${NC}"
    else
        echo -e "${RED}❌ ddddocr 安裝失敗！請手動執行：$PIP_CMD install ddddocr${NC}"
        exit 1
    fi
fi

# 安裝 Flask
echo -e "${CYAN}� 安裝 Flask（Web框架）...${NC}"
if $PIP_CMD install Flask; then
    echo -e "${GREEN}✅ Flask 安裝成功${NC}"
else
    echo -e "${YELLOW}⚠️  嘗試用戶安裝...${NC}"
    if $PIP_CMD install Flask --user; then
        echo -e "${GREEN}✅ Flask 用戶安裝成功${NC}"
    else
        echo -e "${RED}❌ Flask 安裝失敗！請手動執行：$PIP_CMD install Flask${NC}"
        exit 1
    fi
fi

# 安裝 flask-cors
echo -e "${CYAN}� 安裝 flask-cors（跨域支援）...${NC}"
if $PIP_CMD install flask-cors; then
    echo -e "${GREEN}✅ flask-cors 安裝成功${NC}"
else
    echo -e "${YELLOW}⚠️  嘗試用戶安裝...${NC}"
    if $PIP_CMD install flask-cors --user; then
        echo -e "${GREEN}✅ flask-cors 用戶安裝成功${NC}"
    else
        echo -e "${RED}❌ flask-cors 安裝失敗！請手動執行：$PIP_CMD install flask-cors${NC}"
        exit 1
    fi
fi

echo
echo -e "${GREEN}🎉 所有依賴套件安裝完成！${NC}"
echo

# 檢查所有必要檔案是否存在
missing_files=""

if [ ! -f "manifest.json" ]; then
    missing_files="$missing_files manifest.json"
fi
if [ ! -f "content.js" ]; then
    missing_files="$missing_files content.js"
fi
if [ ! -f "api_server.py" ]; then
    missing_files="$missing_files api_server.py"
fi

if [ -n "$missing_files" ]; then
    echo -e "${RED}❌ 錯誤：缺少必要檔案：$missing_files${NC}"
    echo "請確認所有檔案都在當前資料夾中"
    exit 1
fi

echo -e "${BLUE}📋 接下來的步驟：${NC}"
echo
echo -e "${CYAN}1️⃣  載入 Chrome 擴充功能：${NC}"
echo "   • 打開 Chrome 瀏覽器"
echo "   • 輸入網址：chrome://extensions/"
echo "   • 開啟右上角的「開發者模式」"
echo "   • 點擊「載入未封裝項目」"
echo "   • 選擇這個資料夾：$(pwd)"
echo
echo -e "${CYAN}2️⃣  啟動驗證碼識別服務：${NC}"
echo "   • 在終端中執行：$PYTHON_CMD api_server.py"
echo "   • 或執行：./start_api.sh（將會自動建立）"
echo
echo -e "${CYAN}3️⃣  開始使用：${NC}"
echo "   • 前往拓元售票網 (https://tixcraft.com/)"
echo "   • 進入搶票頁面"
echo "   • 右上角會出現搶票小幫手界面"
echo

# 建立快速啟動 API 的腳本
cat > start_api.sh << 'EOF'
#!/bin/bash

# 設定顏色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 啟動驗證碼識別 API 服務...${NC}"
echo

# 檢查 Python 命令
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo -e "${RED}❌ 找不到 Python！${NC}"
    exit 1
fi

echo -e "${GREEN}� API 服務將在 http://127.0.0.1:9988 運行${NC}"
echo -e "${YELLOW}⚠️  請勿關閉此終端視窗${NC}"
echo -e "${YELLOW}⏹️  若要停止服務，請按 Ctrl+C${NC}"
echo

$PYTHON_CMD api_server.py
EOF

chmod +x start_api.sh

echo -e "${GREEN}💡 已建立 start_api.sh 快速啟動檔案${NC}"
echo

# 測試 API 服務是否可以正常啟動
echo -e "${YELLOW}🧪 測試 API 服務...${NC}"
sleep 1

# 在背景啟動服務進行測試
$PYTHON_CMD api_server.py &
API_PID=$!
sleep 3

# 檢查服務是否啟動
if netstat -an 2>/dev/null | grep -q ":9988" || ss -an 2>/dev/null | grep -q ":9988"; then
    echo -e "${GREEN}✅ API 服務測試成功！${NC}"
    kill $API_PID 2>/dev/null
else
    echo -e "${YELLOW}⚠️  API 服務測試未完成，請稍後手動測試${NC}"
    kill $API_PID 2>/dev/null
fi

wait $API_PID 2>/dev/null

echo
echo -e "${PURPLE}🎊 安裝完成！${NC}"
echo
echo -e "${BLUE}� 快速提醒：${NC}"
echo "   • 使用前請確保 API 服務正在運行"
echo "   • 如遇問題請查閱 README.md 疑難排解章節"
echo "   • 本工具僅供學習研究使用，請遵守相關法規"
echo

# 詢問是否立即開啟 Chrome 擴充功能頁面
echo -n -e "${CYAN}🤔 是否現在開啟 Chrome 擴充功能頁面？(y/n): ${NC}"
read -r choice

if [[ $choice =~ ^[Yy]$ ]]; then
    echo
    echo -e "${BLUE}🌐 正在開啟 Chrome 擴充功能頁面...${NC}"
    
    # 嘗試開啟 Chrome
    if command -v google-chrome &> /dev/null; then
        google-chrome "chrome://extensions/" &
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser "chrome://extensions/" &
    elif command -v chrome &> /dev/null; then
        chrome "chrome://extensions/" &
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open -a "Google Chrome" "chrome://extensions/" 2>/dev/null || \
        open -a "Chromium" "chrome://extensions/" 2>/dev/null || \
        echo -e "${YELLOW}🔍 找不到 Chrome，請手動開啟 chrome://extensions/${NC}"
    else
        echo -e "${YELLOW}🔍 找不到 Chrome，請手動開啟 chrome://extensions/${NC}"
    fi
else
    echo
    echo -e "${CYAN}💡 稍後請手動開啟 Chrome 並前往 chrome://extensions/${NC}"
fi

echo
echo -e "${GREEN}🎯 祝您搶票成功！${NC}"
echo

# 詢問是否立即啟動 API 服務
echo -n -e "${CYAN}🚀 是否現在啟動驗證碼識別服務？(y/n): ${NC}"
read -r start_choice

if [[ $start_choice =~ ^[Yy]$ ]]; then
    echo
    echo -e "${BLUE}🚀 啟動 API 服務...${NC}"
    echo -e "${YELLOW}⚠️  服務啟動後請勿關閉此終端${NC}"
    echo -e "${GREEN}🌐 API 服務將在 http://127.0.0.1:9988 運行${NC}"
    echo -e "${YELLOW}⏹️  若要停止服務，請按 Ctrl+C${NC}"
    echo
    $PYTHON_CMD api_server.py
else
    echo
    echo -e "${CYAN}💡 稍後可執行以下命令啟動服務：${NC}"
    echo "   $PYTHON_CMD api_server.py"
    echo -e "${CYAN}   或執行：${NC}"
    echo "   ./start_api.sh"
fi
