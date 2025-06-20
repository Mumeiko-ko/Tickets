無名子自動搶票小幫手

一個專為拓元售票網（Tixcraft）設計的 Chrome 擴充功能。

## 主要功能

- 自動場區選擇：根據關鍵字選擇目標場區
- 自動票數選擇：選擇所需張數（1-4 張）
- 自動驗證碼識別：整合 ddddocr 技術，自動辨識驗證碼，辨識有限可切換半自動
- 無限重試機制：驗證碼錯誤時自動重試
- 全自動/半自動雙模式
- 定時搶票：可預約搶票時間，自動倒數並於指定時間啟動搶票流程

## 安裝說明

### 自動安裝（推薦）

Windows：雙擊 install.bat

Linux/macOS：

```
chmod +x install.sh
./install.sh
```

### 手動安裝

1. 安裝 Python 依賴

```
pip install ddddocr flask flask-cors
```

2. 載入 Chrome 擴充功能

   - 打開 Chrome，進入 chrome://extensions/
   - 開啟「開發者模式」
   - 點「載入未封裝項目」選擇本資料夾

3. 啟動驗證碼 API

```
python api_server.py
```

## 使用教學

1. 啟動驗證碼 API（終端顯示 9988）
2. 登入拓元售票網，點右上角擴充功能圖示
3. 設定場區關鍵字、票數、模式
4. 設定「定時搶票」時間，面板會自動倒數並於指定時間啟動（可選）
5. 點「戰爭開始」即可自動搶票
6. 右上角日誌面板可監控狀態與倒數

## 專案結構

```
src/config/constants.js         # 常數配置
src/utils/helpers.js            # 工具函式
src/ui/floatingPanel.js         # 浮動控制面板
src/pages/areaSelection.js      # 區域選擇頁面邏輯
src/pages/ticketQuantity.js     # 票券數量頁面邏輯
src/services/captchaService.js  # 驗證碼處理服務
src/core/mainRouter.js          # 主路由控制器
content.js                      # 主入口檔案
content_original.js             # 原始檔案備份
manifest.json                   # 擴充功能配置
```

## 進階設定

- API 服務預設 http://localhost:9988
  可於 api_server.py 及 content.js 調整
- 票務流程、重試間隔、驗證碼延遲等可於 content.js 調整

## 技術架構

- manifest.json：Chrome 擴充功能配置，模組化內容腳本注入
- content.js：主入口，初始化 UI 與主流程
- api_server.py：驗證碼識別 API（Flask + ddddocr）
- popup.html/popup.js：彈出視窗設定

## 常見問題

- 驗證碼識別失敗：確認 api_server.py 運行，或切換半自動
- 找不到場區：檢查關鍵字、頁面是否載入
- 腳本無法啟動：重整頁面、檢查擴充功能
- 搶票慢：關閉多餘分頁、確保網路穩定

## 更新日誌

v2.0.0 (2025/06/20) - 改善點下啟動搶票後的速度，增加定時搶票功能，改善 UI 顯示
v1.2.0 (2025/06/18) - 模組化重構，主程式拆分為多檔案，維持原有功能與速度
v1.0.0 (2025/06/17) - 初始版本

## 致謝

ddddocr、Flask、Chrome Extensions API

祝您搶票成功！
