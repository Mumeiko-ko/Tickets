// content.js - 全新版本

// ====== 即時訊息面板（右上角）+ 快速設定表單 ======
(function () {
    if (document.getElementById('ticket-helper-log')) return;
    const logDiv = document.createElement('div');
    logDiv.id = 'ticket-helper-log'; logDiv.style.position = 'fixed';
    logDiv.style.top = '16px';
    logDiv.style.right = '16px';
    logDiv.style.zIndex = '99999';
    logDiv.style.background = 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(35,35,35,0.95))';
    logDiv.style.backdropFilter = 'blur(10px)';
    logDiv.style.border = '2px solid rgba(255,255,255,0.1)';
    logDiv.style.color = '#fff';
    logDiv.style.fontSize = '13px';
    logDiv.style.fontFamily = 'Consolas, Monaco, "Courier New", monospace';
    logDiv.style.width = '420px';
    logDiv.style.maxHeight = '65vh';
    logDiv.style.overflowY = 'auto';
    logDiv.style.borderRadius = '12px';
    logDiv.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)';
    logDiv.style.padding = '0';
    logDiv.style.pointerEvents = 'auto';
    logDiv.style.lineHeight = '1.5'; logDiv.innerHTML = `
      <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); padding: 16px; border-radius: 12px 12px 0 0; border-bottom: 2px solid rgba(255,255,255,0.1);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 12px; height: 12px; background: #00ff88; border-radius: 50%; box-shadow: 0 0 8px #00ff88;"></div>
          <span style="font-weight: bold; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">無名子大王搶票小幫手</span>
        </div>
      </div>
      
      <div style="padding: 16px; background: rgba(0,0,0,0.2); border-radius: 0 0 12px 12px;">
        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 16px;">
          <form id="ticket-helper-form" style="display: grid; gap: 12px;">
            <div style="display: grid; grid-template-columns: 1fr 80px; gap: 10px;">
              <div style="position: relative;">
                <input id="th-area" type="text" placeholder="場區關鍵字" required
                  style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff; font-size: 13px; transition: all 0.3s ease;">
                <label style="position: absolute; top: -8px; left: 8px; background: linear-gradient(90deg, #667eea, #764ba2); padding: 2px 8px; border-radius: 4px; font-size: 10px; color: #fff;">場區</label>
              </div>              <div style="position: relative;">
                <select id="th-qty" style="width: 100%; padding: 10px 32px 10px 8px; background: rgba(40,40,40,0.9); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff; font-size: 13px; cursor: pointer;">
                  <option value="1" style="background: #2c2c2c; color: #ffffff;">1 張</option>
                  <option value="2" style="background: #2c2c2c; color: #ffffff;">2 張</option>
                  <option value="3" style="background: #2c2c2c; color: #ffffff;">3 張</option>
                  <option value="4" style="background: #2c2c2c; color: #ffffff;">4 張</option>
                </select>
                <label style="position: absolute; top: -8px; left: 8px; background: linear-gradient(90deg, #667eea, #764ba2); padding: 2px 8px; border-radius: 4px; font-size: 10px; color: #fff;">數量</label>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: center; padding: 8px; background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.2); border-radius: 6px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
                <input id="th-semi-auto" type="checkbox" style="width: 16px; height: 16px; accent-color: #00ff88;">
                <span style="font-size: 13px; color: #00ff88; font-weight: 500;">🤖 半自動模式</span>
              </label>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">
              <button id="th-start" type="submit" 
                style="padding: 12px 16px; background: linear-gradient(45deg, #00ff88, #00cc6a); color: #000; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,255,136,0.3);">
                🚀 戰爭開始
              </button>
              <button id="th-stop" type="button" 
                style="padding: 12px 16px; background: linear-gradient(45deg, #ff4757, #ff3742); color: #fff; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(255,71,87,0.3);">
                ⏹️ 戰爭結束
              </button>
            </div>
          </form>
        </div>
        
        <div id="log-container" style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; max-height: 300px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); font-family: Consolas, monospace; font-size: 12px;">
          <div style="color: #00ff88; margin-bottom: 8px; font-weight: bold;">📋 執行日誌</div>
        </div>
      </div>
    `;
    document.body.appendChild(logDiv);

    // 添加動態樣式效果
    const style = document.createElement('style');
    style.textContent = `
        #ticket-helper-log input:focus {
            outline: none;
            border-color: rgba(0,255,136,0.6) !important;
            box-shadow: 0 0 0 2px rgba(0,255,136,0.2) !important;
            background: rgba(0,255,136,0.1) !important;
        }
          #ticket-helper-log select:focus {
            outline: none;
            border-color: rgba(0,255,136,0.6) !important;
            box-shadow: 0 0 0 2px rgba(0,255,136,0.2) !important;
        }
        
        /* 修復選擇框下拉選單的顯示問題 */
        #th-qty {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 8px center;
            background-size: 16px;
            padding-right: 32px !important;
        }
        
        #th-qty option {
            background: #2c2c2c !important;
            color: #ffffff !important;
            padding: 8px 12px !important;
            border: none !important;
        }
        
        #th-qty option:hover {
            background: #404040 !important;
            color: #00ff88 !important;
        }
        
        #th-qty option:checked {
            background: #00ff88 !important;
            color: #000000 !important;
        }
        
        #th-start:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(0,255,136,0.4) !important;
            background: linear-gradient(45deg, #00ff88, #00aa55) !important;
        }
        
        #th-stop:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(255,71,87,0.4) !important;
            background: linear-gradient(45deg, #ff4757, #ee2233) !important;
        }
        
        #ticket-helper-log button:active {
            transform: translateY(0px) !important;
        }
        
        #log-container::-webkit-scrollbar {
            width: 6px;
        }
        
        #log-container::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
        }
        
        #log-container::-webkit-scrollbar-thumb {
            background: rgba(0,255,136,0.6);
            border-radius: 3px;
        }
        
        #log-container::-webkit-scrollbar-thumb:hover {
            background: rgba(0,255,136,0.8);
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(0,255,136,0.7); }
            70% { box-shadow: 0 0 0 10px rgba(0,255,136,0); }
            100% { box-shadow: 0 0 0 0 rgba(0,255,136,0); }
        }
          .pulse-effect {
            animation: pulse 2s infinite !important;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
    `;
    document.head.appendChild(style); function appendLog(msg, color = '#fff') {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;

        const p = document.createElement('div');
        p.style.padding = '4px 0';
        p.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        p.style.color = color;
        p.style.wordBreak = 'break-word';

        // 添加時間戳
        const timestamp = new Date().toLocaleTimeString();
        const timestampSpan = document.createElement('span');
        timestampSpan.textContent = `[${timestamp}] `;
        timestampSpan.style.color = 'rgba(255,255,255,0.5)';
        timestampSpan.style.fontSize = '11px';

        p.appendChild(timestampSpan);
        p.appendChild(document.createTextNode(msg));

        logContainer.appendChild(p);
        logContainer.scrollTop = logContainer.scrollHeight;

        // 限制日誌條數，保持性能
        const logs = logContainer.children;
        if (logs.length > 100) {
            for (let i = 1; i < 20; i++) { // 保留標題，刪除舊日誌
                if (logs[i]) logs[i].remove();
            }
        }
    }
    // 攔截 console.log/console.error
    const rawLog = console.log;
    const rawErr = console.error;
    console.log = function (...args) {
        appendLog(args.join(' '));
        rawLog.apply(console, args);
    };
    console.error = function (...args) {
        appendLog(args.join(' '), '#ff7070');
        rawErr.apply(console, args);
    };    // 快速設定表單事件
    document.getElementById('ticket-helper-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const startBtn = document.getElementById('th-start');
        const areaKeyword = document.getElementById('th-area').value.trim();
        const ticketQuantity = document.getElementById('th-qty').value;
        const semiAutoMode = document.getElementById('th-semi-auto').checked;

        if (!areaKeyword) {
            appendLog('❌ 請輸入場區關鍵字！', '#ff7070');
            // 輸入框抖動效果
            const areaInput = document.getElementById('th-area');
            areaInput.style.animation = 'shake 0.5s';
            setTimeout(() => areaInput.style.animation = '', 500);
            return;
        }

        // 按鈕載入效果
        startBtn.innerHTML = '🔄 啟動中...';
        startBtn.style.background = 'linear-gradient(45deg, #ffa502, #ff6348)';
        startBtn.disabled = true;

        // 儲存到 chrome.storage 並啟動流程
        chrome.storage.local.set({
            ticketConfig: {
                areaKeyword: areaKeyword,
                ticketQuantity: ticketQuantity,
                isRunning: true,
                semiAutoMode: semiAutoMode
            }
        }, () => {
            const mode = semiAutoMode ? '🤖 半自動模式' : '⚡ 全自動模式';
            appendLog(`✅ 設定已儲存，流程啟動！(${mode})`, '#00ff88');
            appendLog(`🎯 目標場區: ${areaKeyword}`, '#00bfff');
            appendLog(`🎫 票券數量: ${ticketQuantity} 張`, '#00bfff');

            // 重新整理頁面
            setTimeout(() => location.reload(), 1000);
        });
    });    // 戰爭結束按鈕事件
    document.getElementById('th-stop').addEventListener('click', function (e) {
        e.preventDefault();
        const stopBtn = this;

        // 按鈕效果
        stopBtn.innerHTML = '⏳ 停止中...';
        stopBtn.style.background = 'linear-gradient(45deg, #orange, #red)';
        stopBtn.disabled = true;

        // 清除設定並停止腳本
        chrome.storage.local.remove('ticketConfig', () => {
            appendLog('🛑 搶票流程已手動停止！', '#ff7070');
            appendLog('💤 系統進入待機狀態', '#ffa502');

            // 恢復按鈕
            setTimeout(() => {
                stopBtn.innerHTML = '⏹️ 戰爭結束';
                stopBtn.style.background = 'linear-gradient(45deg, #ff4757, #ff3742)';
                stopBtn.disabled = false;
            }, 1000);
        });
    });
})();

// 輔助函式：延遲
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 輔助函式：等待元素出現
async function waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);
        if (element) return element;
        await sleep(100);
    }
    console.log(`waitForElement: 超時，找不到元素 ${selector}`);
    return null;
}

// 輔助函式：等待使用者輸入驗證碼
function waitForCaptcha(inputElement, minLength = 4) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (inputElement.value.length >= minLength) {
                clearInterval(interval);
                resolve();
            }
        }, 200);
    });
}
// 輔助函式：將圖片 URL 轉換為 Base64
async function imageUrlToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // 只取 base64 部分
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
// 流程函式：在「區域選擇頁」選擇場區 (更新版)
async function handleAreaPage(config) {
    console.log(`[區域頁] 正在尋找關鍵字為 "${config.areaKeyword}" 且可購買的場區...`);

    // 1. 我們直接尋找所有可點擊的區域連結 (<a>)。
    //    拓元的結構通常是 li.select_form_b > a
    const allAreaLinks = await waitForElement('li.select_form_b a');
    if (!allAreaLinks) {
        console.error("[區域頁] 找不到任何場區連結元素 (li.select_form_b a)。");
        chrome.storage.local.remove('ticketConfig');
        return;
    }

    const allClickableElements = document.querySelectorAll('li.select_form_b a');

    // 2. 遍歷所有找到的連結元素
    for (const linkElement of allClickableElements) {
        const fullText = linkElement.textContent || ""; // 獲取 <a> 標籤內所有文字

        // 3. 條件判斷
        const isKeywordMatch = fullText.includes(config.areaKeyword);
        const isAvailable = !fullText.includes("已售完") && !fullText.includes("Sold Out");

        // 4. 如果條件符合，點擊這個 <a> 標籤並結束
        if (isKeywordMatch && isAvailable) {
            console.log(`[區域頁] 找到目標場區: ${fullText.trim()}，正在點擊連結...`);
            linkElement.click(); // <-- 點擊的是 <a> 標籤，而不是 li
            return; // 成功點擊，結束函式
        }
    }

    // 如果迴圈跑完都沒找到
    console.error(`[區域頁] 找不到關鍵字為 "${config.areaKeyword}" 且有票的場區。`);
    // 清除設定以停止腳本
    chrome.storage.local.remove('ticketConfig');
}

// 流程函式：在「票券數量頁」完成操作 (優化無限重試版)
async function handleTicketPage(config) {
    console.log('[數量頁] 進入數量選擇頁面，開始快速自動化流程...');

    try {
        // === 優化後的並行處理流程 ===

        // 同時處理數量選擇和同意條款（並行執行）
        console.log('[數量頁] 同時執行：選擇數量 + 勾選同意條款...');
        const [quantitySelect, agreeCheckbox] = await Promise.all([
            waitForElement('select.form-select'),
            waitForElement('input[type="checkbox"]')
        ]);

        // 立即設置數量
        if (quantitySelect) {
            quantitySelect.value = config.ticketQuantity;
            quantitySelect.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`[數量頁] 數量已選擇: ${config.ticketQuantity}`);
        }

        // 立即勾選同意框
        if (agreeCheckbox && !agreeCheckbox.checked) {
            agreeCheckbox.click();
            console.log('[數量頁] 同意條款已勾選');
        }        // 立即開始驗證碼處理
        const mode = config.semiAutoMode ? '半自動' : '全自動';
        console.log(`[數量頁] 開始${mode}驗證碼處理流程...`);
        const captchaInput = await waitForElement('#TicketForm_verifyCode');
        if (!captchaInput) {
            console.error('[數量頁] 找不到驗證碼輸入框，1秒後重試整個流程');
            setTimeout(() => location.reload(), 1000);
            return;
        }

        // 檢查是否已經有驗證碼內容（可能是手動輸入的）
        if (captchaInput.value && captchaInput.value.length >= 4) {
            console.log(`[數量頁] 發現已有驗證碼: ${captchaInput.value}，直接嘗試提交`);
            const confirmButton = Array.from(document.querySelectorAll('button.btn-primary'))
                .find(btn => btn.textContent.replace(/\s+/g, '') === '確認張數');
            if (confirmButton) {
                console.log('[數量頁] 點擊「確認張數」按鈕');
                confirmButton.click();
                return;
            }
        }

        // 根據模式選擇不同的驗證碼處理方式
        if (config.semiAutoMode) {
            // 半自動模式：等待手動輸入驗證碼
            await handleSemiAutoMode(captchaInput);
        } else {
            // 全自動模式：自動識別驗證碼
            await handleFullAutoMode(captchaInput);
        }
    } catch (error) {
        console.error("處理票券頁面時發生錯誤，1秒後重新整理頁面重試:", error);
        setTimeout(() => location.reload(), 1000);
    }
}

// 半自動模式：等待手動輸入驗證碼
async function handleSemiAutoMode(captchaInput) {
    console.log('[半自動模式] 等待您手動輸入驗證碼...');

    // 高亮顯示驗證碼輸入框
    captchaInput.style.border = '3px solid #00ff00';
    captchaInput.style.boxShadow = '0 0 10px #00ff00';

    // 等待用戶輸入驗證碼
    await waitForCaptcha(captchaInput, 4);

    // 恢復原始樣式
    captchaInput.style.border = '';
    captchaInput.style.boxShadow = '';

    console.log(`[半自動模式] 已輸入驗證碼: ${captchaInput.value}，準備提交`);

    // 自動點擊確認按鈕
    const confirmButton = Array.from(document.querySelectorAll('button.btn-primary'))
        .find(btn => btn.textContent.replace(/\s+/g, '') === '確認張數');

    if (confirmButton) {
        console.log('[半自動模式] 自動點擊「確認張數」按鈕');
        confirmButton.click();

        // 等待提交結果
        await sleep(2000);

        // 檢查是否有錯誤訊息
        const errorMessages = document.querySelectorAll('.alert-danger, .error, .text-danger, [class*="error"]');
        let hasError = false;

        for (const errorEl of errorMessages) {
            const errorText = errorEl.textContent || '';
            if (errorText.includes('驗證碼') || errorText.includes('verification') ||
                errorText.includes('captcha') || errorText.includes('錯誤') ||
                errorText.includes('invalid') || errorText.includes('incorrect')) {
                console.log(`[半自動模式] 偵測到驗證碼錯誤: ${errorText.trim()}`);
                hasError = true;
                break;
            }
        }

        // 如果有錯誤，清空輸入框並遞歸重新開始
        if (hasError || window.location.pathname.includes('/ticket/ticket/')) {
            console.log('[半自動模式] 驗證碼錯誤，請重新輸入');
            captchaInput.value = '';
            await handleSemiAutoMode(captchaInput); // 遞歸重新開始
        } else {
            console.log('[半自動模式] 提交成功！');
        }
    } else {
        console.log('[半自動模式] 找不到確認按鈕，請手動點擊');
    }
}

// 全自動模式：自動識別驗證碼
async function handleFullAutoMode(captchaInput) {
    let captchaAttempts = 0;
    while (true) { // 無限循環直到成功
        captchaAttempts++;
        console.log(`[全自動模式] 驗證碼辨識第 ${captchaAttempts} 次嘗試...`);

        try {
            const captchaImage = await waitForElement('#TicketForm_verifyCode-image');
            if (!captchaImage) {
                console.log('[全自動模式] 等待驗證碼圖片載入...');
                await sleep(500);
                continue;
            }

            console.log('[全自動模式] 快速識別驗證碼中...');
            const imageUrl = new URL(captchaImage.src, window.location.origin).href;
            const imageBase64 = await imageUrlToBase64(imageUrl);

            const response = await fetch('http://127.0.0.1:9988/solve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: imageBase64 }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.result && data.result.length >= 4) {
                    console.log(`[全自動模式] 識別成功: ${data.result}，正在驗證和提交`);

                    // 清空輸入框並重新填入，確保內容正確
                    captchaInput.value = '';
                    await sleep(50);
                    captchaInput.value = data.result;

                    // 觸發輸入事件，確保網站檢測到輸入
                    captchaInput.dispatchEvent(new Event('input', { bubbles: true }));
                    captchaInput.dispatchEvent(new Event('change', { bubbles: true }));

                    // 給一點時間讓輸入框更新
                    await sleep(200);

                    // 立即嘗試點擊確認按鈕
                    const confirmButton = Array.from(document.querySelectorAll('button.btn-primary'))
                        .find(btn => btn.textContent.replace(/\s+/g, '') === '確認張數');
                    if (confirmButton) {
                        console.log('[全自動模式] 立即點擊「確認張數」按鈕！');
                        confirmButton.click();

                        // 等待提交結果並檢測是否有錯誤
                        await sleep(2000);

                        // 檢查是否有錯誤訊息
                        const errorMessages = document.querySelectorAll('.alert-danger, .error, .text-danger, [class*="error"]');
                        let hasError = false;

                        for (const errorEl of errorMessages) {
                            const errorText = errorEl.textContent || '';
                            if (errorText.includes('驗證碼') || errorText.includes('verification') ||
                                errorText.includes('captcha') || errorText.includes('錯誤') ||
                                errorText.includes('invalid') || errorText.includes('incorrect')) {
                                console.log(`[全自動模式] 偵測到驗證碼錯誤訊息: ${errorText.trim()}`);
                                hasError = true;
                                break;
                            }
                        }

                        // 檢查頁面是否還在票券頁面（驗證碼錯誤會留在原頁面）
                        if (hasError || window.location.pathname.includes('/ticket/ticket/')) {
                            console.log('[全自動模式] 驗證碼可能錯誤，清空輸入框並重新識別');
                            captchaInput.value = '';
                            // 繼續循環重新識別
                        } else {
                            console.log('[全自動模式] 提交成功，頁面已跳轉！');
                            return; // 成功跳轉，結束函式
                        }
                    } else {
                        console.log('[全自動模式] 找不到確認按鈕，等待手動操作...');
                        // 找不到按鈕時，不更換驗證碼，保持當前識別結果
                        await sleep(2000);
                        continue; // 重新嘗試找確認按鈕
                    }
                } else if (data.result) {
                    console.log(`[全自動模式] 驗證碼長度不足: ${data.result}，更換驗證碼重試`);
                    // 只有長度不足時才更換驗證碼
                } else {
                    console.log('[全自動模式] API未返回結果，更換驗證碼重試');
                }
            } else {
                console.log('[全自動模式] API請求失敗，更換驗證碼重試');
            }
        } catch (error) {
            console.log(`[全自動模式] 第 ${captchaAttempts} 次識別失敗: ${error.message}，更換驗證碼重試`);
        }

        // 只有在需要時才更換驗證碼
        console.log('[全自動模式] 更換驗證碼中...');
        const refreshButton = document.querySelector('#TicketForm_verifyCode-image') ||
            document.querySelector('img[onclick*="refresh"]') ||
            document.querySelector('a[onclick*="refresh"]');
        if (refreshButton) {
            refreshButton.click();
            await sleep(500); // 等待新驗證碼載入
        } else {
            await sleep(300); // 短暫等待後直接重試
        }
    }
}


// ====== 票券數量頁自動偵測與無限重跑功能 ======
(function () {
    let running = false;
    let lastSubmitTime = 0;
    const TICKET_PAGE_URL = '/ticket/ticket/';
    const RETRY_INTERVAL = 500; // 縮短檢查間隔到0.5秒
    const SUBMIT_COOLDOWN = 3000; // 提交後3秒冷卻時間

    async function tryAutoRunTicketPage() {
        if (window.location.pathname.includes(TICKET_PAGE_URL)) {
            const captchaInput = document.querySelector('#TicketForm_verifyCode');
            const currentTime = Date.now();

            // 檢查是否在冷卻期間
            if (currentTime - lastSubmitTime < SUBMIT_COOLDOWN) {
                return;
            }

            if (captchaInput && !running) {
                running = true;
                console.log('[自動重跑] 偵測到驗證碼頁面，立即執行搶票流程');
                chrome.storage.local.get('ticketConfig', async (data) => {
                    if (data.ticketConfig && data.ticketConfig.isRunning) {
                        await handleTicketPage(data.ticketConfig);
                        lastSubmitTime = Date.now(); // 記錄提交時間
                    }
                    running = false;
                });
            }
        } else {
            running = false;
            lastSubmitTime = 0; // 離開票券頁面時重置
        }
    }
    setInterval(tryAutoRunTicketPage, RETRY_INTERVAL);
})();

// 主路由器函式
async function mainRouter() {
    const data = await chrome.storage.local.get('ticketConfig');
    // 如果沒有設定檔或 isRunning 不為 true，就直接退出
    if (!data.ticketConfig || !data.ticketConfig.isRunning) {
        return;
    }

    const config = data.ticketConfig;
    const url = window.location.href;

    console.log("搶票腳本已啟動，當前URL:", url);

    // 路由 1: 活動詳情頁 (包含立即購票)
    if (url.includes('/activity/detail/')) {
        console.log("[活動頁] 偵測到活動詳情頁。");
        // 點擊「立即購票」按鈕
        const buyButton = await waitForElement('#tab-func li.buy a');
        if (buyButton) {
            console.log("[活動頁] 點擊 '立即購票'。");
            buyButton.click();
            // 點完後通常會有一個彈窗，裡面有「立即訂購」
            // 由於彈窗是動態的，我們需要等待它
            await sleep(800); // 等待彈窗出現
            // 取得所有「立即訂購」按鈕，從上到下依序檢查
            const orderButtons = Array.from(document.querySelectorAll('button')).filter(
                btn => btn.textContent && btn.textContent.replace(/\s+/g, '').includes('立即訂購')
            );
            let clicked = false;
            for (const btn of orderButtons) {
                if (!btn.disabled && btn.offsetParent !== null) { // 可見且未 disabled
                    console.log("[活動頁] 點擊第一個可用的 '立即訂購' 按鈕。");
                    btn.click();
                    clicked = true;
                    break;
                }
            }
            if (!clicked) {
                console.log("[活動頁] 沒有可用的 '立即訂購' 按鈕。");
            }
        }
    }
    // 路由 2: 區域選擇頁
    else if (url.includes('/ticket/area/')) {
        await handleAreaPage(config);
    }
    // 路由 3: 票券數量選擇頁
    else if (url.includes('/ticket/ticket/')) {
        await handleTicketPage(config);
    }
}

// 執行主路由器
mainRouter();