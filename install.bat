@echo off
chcp 65001 >nul
echo.
echo 🎫 無名子大王搶票小幫手 - Windows 自動安裝程式
echo ================================================
echo.

REM 檢查 Python 是否已安裝
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤：找不到 Python！
    echo.
    echo � 請先安裝 Python：
    echo    1. 前往 https://www.python.org/downloads/
    echo    2. 下載並安裝 Python 3.7 或更新版本
    echo    3. 安裝時記得勾選 "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo ✅ Python 已安裝
python --version

REM 檢查 pip 是否可用
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤：找不到 pip！
    echo 正在嘗試安裝 pip...
    python -m ensurepip --upgrade
)

echo.
echo 📦 正在安裝 Python 依賴套件...
echo.

REM 安裝 ddddocr
echo � 安裝 ddddocr（驗證碼識別庫）...
pip install ddddocr
if %errorlevel% neq 0 (
    echo ❌ ddddocr 安裝失敗！
    echo 正在嘗試替代安裝方法...
    pip install ddddocr --user
    if %errorlevel% neq 0 (
        echo ❌ 仍然失敗，請手動執行：pip install ddddocr
        pause
        exit /b 1
    )
)
echo ✅ ddddocr 安裝成功

REM 安裝 Flask
echo � 安裝 Flask（Web框架）...
pip install Flask
if %errorlevel% neq 0 (
    echo ❌ Flask 安裝失敗！
    pip install Flask --user
    if %errorlevel% neq 0 (
        echo ❌ 仍然失敗，請手動執行：pip install Flask
        pause
        exit /b 1
    )
)
echo ✅ Flask 安裝成功

REM 安裝 flask-cors
echo � 安裝 flask-cors（跨域支援）...
pip install flask-cors
if %errorlevel% neq 0 (
    echo ❌ flask-cors 安裝失敗！
    pip install flask-cors --user
    if %errorlevel% neq 0 (
        echo ❌ 仍然失敗，請手動執行：pip install flask-cors
        pause
        exit /b 1
    )
)
echo ✅ flask-cors 安裝成功

echo.
echo 🎉 所有依賴套件安裝完成！
echo.

REM 檢查所有必要檔案是否存在
set "missing_files="

if not exist "manifest.json" (
    set "missing_files=%missing_files% manifest.json"
)
if not exist "content.js" (
    set "missing_files=%missing_files% content.js"
)
if not exist "api_server.py" (
    set "missing_files=%missing_files% api_server.py"
)

if not "%missing_files%"=="" (
    echo ❌ 錯誤：缺少必要檔案：%missing_files%
    echo 請確認所有檔案都在當前資料夾中
    pause
    exit /b 1
)

echo 📋 接下來的步驟：
echo.
echo 1️⃣  載入 Chrome 擴充功能：
echo    • 打開 Chrome 瀏覽器
echo    • 輸入網址：chrome://extensions/
echo    • 開啟右上角的「開發者模式」
echo    • 點擊「載入未封裝項目」
echo    • 選擇這個資料夾：%~dp0
echo.
echo 2️⃣  啟動驗證碼識別服務：
echo    • 雙擊執行 start_api.bat（將會自動建立）
echo    • 或在命令提示字元中執行：python api_server.py
echo.
echo 3️⃣  開始使用：
echo    • 前往拓元售票網 (https://tixcraft.com/)
echo    • 進入搶票頁面
echo    • 右上角會出現搶票小幫手界面
echo.

REM 建立快速啟動 API 的批次檔
echo @echo off > start_api.bat
echo chcp 65001 ^>nul >> start_api.bat
echo echo 🚀 啟動驗證碼識別 API 服務... >> start_api.bat
echo echo. >> start_api.bat
echo python api_server.py >> start_api.bat
echo pause >> start_api.bat

echo 💡 已建立 start_api.bat 快速啟動檔案
echo.

REM 測試 API 服務是否可以正常啟動
echo 🧪 測試 API 服務...
timeout /t 2 /nobreak >nul
start /min python api_server.py
timeout /t 3 /nobreak >nul

REM 檢查服務是否啟動
netstat -an | find "9988" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API 服務測試成功！
    taskkill /f /im python.exe >nul 2>&1
) else (
    echo ⚠️  API 服務測試未完成，請稍後手動測試
)

echo.
echo 🎊 安裝完成！
echo.
echo 📝 快速提醒：
echo    • 使用前請確保 start_api.bat 正在運行
echo    • 如遇問題請查閱 README.md 疑難排解章節
echo    • 本工具僅供學習研究使用，請遵守相關法規
echo.

set /p "input=按下 Enter 鍵開啟 Chrome 擴充功能頁面，或按 Ctrl+C 取消..."

REM 開啟 Chrome 擴充功能頁面
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "chrome://extensions/"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "chrome://extensions/"
) else (
    echo 🔍 找不到 Chrome，請手動開啟 chrome://extensions/
)

echo.
echo 🎯 祝您搶票成功！
pause
    echo.
    pause
)

echo.
echo 👋 感謝使用無名子大王搶票小幫手！
pause
