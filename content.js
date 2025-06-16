// content.js - 全新版本

// ====== 即時訊息面板（右上角）+ 快速設定表單 ======
(function () {
    if (document.getElementById('ticket-helper-log')) return;
    const logDiv = document.createElement('div');
    logDiv.id = 'ticket-helper-log';
    logDiv.style.position = 'fixed';
    logDiv.style.top = '16px';
    logDiv.style.right = '16px';
    logDiv.style.zIndex = '99999';
    logDiv.style.background = 'rgba(30,30,30,0.92)';
    logDiv.style.color = '#fff';
    logDiv.style.fontSize = '14px';
    logDiv.style.maxWidth = '400px';
    logDiv.style.maxHeight = '60vh';
    logDiv.style.overflowY = 'auto';
    logDiv.style.borderRadius = '8px';
    logDiv.style.boxShadow = '0 2px 8px #0006';
    logDiv.style.padding = '12px 18px 12px 12px';
    logDiv.style.pointerEvents = 'auto';
    logDiv.style.lineHeight = '1.6';
    logDiv.innerHTML = `
      <b>無名子大王搶票小幫手 LOG</b>
      <form id="ticket-helper-form" style="margin:8px 0 8px 0;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
        <input id="th-area" type="text" placeholder="場區關鍵字" style="width:110px;padding:2px 6px;" required>
        <select id="th-qty" style="padding:2px 6px;">
          <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
        </select>
        <button id="th-start" type="submit" style="background:#00ff00;color:#222;font-weight:bold;padding:2px 12px;border-radius:4px;border:none;cursor:pointer;">戰爭開始</button>
      </form>
      <hr style="margin:4px 0 8px 0;border:0;border-top:1px solid #444;">
    `;
    document.body.appendChild(logDiv);

    function appendLog(msg, color) {
        const p = document.createElement('div');
        p.textContent = msg;
        if (color) p.style.color = color;
        logDiv.appendChild(p);
        logDiv.scrollTop = logDiv.scrollHeight;
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
    };

    // 快速設定表單事件
    document.getElementById('ticket-helper-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const areaKeyword = document.getElementById('th-area').value.trim();
        const ticketQuantity = document.getElementById('th-qty').value;
        if (!areaKeyword) {
            appendLog('請輸入場區關鍵字！', '#ff7070');
            return;
        }
        // 儲存到 chrome.storage 並啟動流程
        chrome.storage.local.set({
            ticketConfig: {
                areaKeyword: areaKeyword,
                ticketQuantity: ticketQuantity,
                isRunning: true
            }
        }, () => {
            appendLog('設定已儲存，流程啟動！', '#00ff00');
            // 重新整理頁面
            location.reload();
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

// 驗證碼頁重試次數限制
let ticketPageRetry = parseInt(sessionStorage.getItem('ticketPageRetry') || '0', 10);

// 流程函式：在「票券數量頁」完成操作 (完整重構版)
async function handleTicketPage(config) {
    if (ticketPageRetry > 5) {
        console.error('[數量頁] 驗證碼重試超過 5 次，自動停止。');
        chrome.storage.local.remove('ticketConfig');
        return;
    }
    ticketPageRetry++;
    sessionStorage.setItem('ticketPageRetry', ticketPageRetry);

    console.log('[數量頁] 進入數量選擇頁面，開始執行自動化流程...');

    try {
        // --- 步驟 1: 選擇數量 (獨立執行) ---
        console.log('[數量頁] 步驟 1: 正在選擇數量...');
        const quantitySelect = await waitForElement('select.form-select');
        if (quantitySelect) {
            quantitySelect.value = config.ticketQuantity;
            quantitySelect.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`[數量頁] 數量已選擇: ${config.ticketQuantity}`);
        } else {
            console.error('[數量頁] 找不到數量選擇下拉選單，腳本終止。');
            return; // 關鍵步驟失敗，直接退出
        }
        await sleep(200); // 短暫停頓，讓頁面反應

        // --- 步驟 2: 勾選同意框 (獨立執行) ---
        console.log('[數量頁] 步驟 2: 正在勾選同意條款...');
        const agreeCheckbox = await waitForElement('input[type="checkbox"]');
        if (agreeCheckbox && !agreeCheckbox.checked) {
            agreeCheckbox.click();
            console.log('[數量頁] 同意條款已勾選。');
        } else if (!agreeCheckbox) {
            console.error('[數量頁] 找不到同意條款勾選框，但腳本將繼續嘗試。');
        }
        await sleep(200);        // --- 步驟 3: 處理驗證碼 (自動識別，帶有失敗後備方案) ---
        console.log('[數量頁] 步驟 3: 正在處理驗證碼...');
        const captchaInput = await waitForElement('#TicketForm_verifyCode');
        if (!captchaInput) {
            console.error('[數量頁] 找不到驗證碼輸入框，腳本終止。');
            return;
        }

        // 驗證碼辨識與重新整理的循環
        let captchaAttempts = 0;
        const maxCaptchaAttempts = 3;

        while (captchaAttempts < maxCaptchaAttempts) {
            captchaAttempts++;
            console.log(`[數量頁] 驗證碼辨識嘗試 ${captchaAttempts}/${maxCaptchaAttempts}`);

            try {
                const captchaImage = await waitForElement('#TicketForm_verifyCode-image');
                if (!captchaImage) throw new Error("找不到驗證碼圖片");

                console.log('[數量頁] 找到驗證碼圖片，嘗試自動識別...');
                const imageUrl = new URL(captchaImage.src, window.location.origin).href;
                const imageBase64 = await imageUrlToBase64(imageUrl);

                const response = await fetch('http://127.0.0.1:9988/solve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_base64: imageBase64 }),
                });

                if (!response.ok) throw new Error(`API 伺服器錯誤: ${response.status}`);

                const data = await response.json();
                if (data.result && data.result.length >= 4) {
                    console.log(`[數量頁] ddddocr 識別成功: ${data.result}`);
                    captchaInput.value = data.result;
                    break; // 成功識別且長度足夠，跳出循環
                } else if (data.result) {
                    console.log(`[數量頁] 驗證碼長度不足 (${data.result.length} < 4): ${data.result}，嘗試更換驗證碼`);
                    // 點擊更換驗證碼按鈕
                    const refreshButton = document.querySelector('#TicketForm_verifyCode-image') ||
                        document.querySelector('img[onclick*="refresh"]') ||
                        document.querySelector('a[onclick*="refresh"]');
                    if (refreshButton) {
                        refreshButton.click();
                        await sleep(1000); // 等待新驗證碼載入
                        continue; // 重新辨識
                    } else {
                        throw new Error("找不到更換驗證碼按鈕");
                    }
                } else {
                    throw new Error("API 未返回有效結果");
                }
            } catch (error) {
                console.error(`[數量頁] 驗證碼辨識嘗試 ${captchaAttempts} 失敗:`, error.message);
                if (captchaAttempts >= maxCaptchaAttempts) {
                    console.error('[數量頁] 自動識別驗證碼失敗，請立即手動輸入！');
                    alert('自動識別驗證碼失敗！請您立即手動輸入！');
                } else {
                    // 嘗試點擊更換驗證碼
                    const refreshButton = document.querySelector('#TicketForm_verifyCode-image') ||
                        document.querySelector('img[onclick*="refresh"]') ||
                        document.querySelector('a[onclick*="refresh"]');
                    if (refreshButton) {
                        refreshButton.click();
                        await sleep(1000);
                    }
                }
            }
        }

        // --- 步驟 4: 等待驗證碼輸入完成 (無論是自動還是手動) ---
        console.log('[數量頁] 步驟 4: 等待驗證碼輸入框內容確認...');
        await waitForCaptcha(captchaInput, 4); // 假設驗證碼至少4碼
        console.log('[數量頁] 偵測到驗證碼已輸入。');

        // --- 步驟 5: 點擊最終確認按鈕 (獨立執行) ---
        console.log('[數量頁] 步驟 5: 正在點擊確認張數按鈕...');
        // 以 class btn-primary 且文字為「確認張數」來找按鈕
        const confirmButton = Array.from(document.querySelectorAll('button.btn-primary'))
            .find(btn => btn.textContent.replace(/\s+/g, '') === '確認張數');
        if (confirmButton) {
            console.log('[數量頁] 點擊「確認張數」按鈕。');
            confirmButton.click();
            sessionStorage.removeItem('ticketPageRetry');
            chrome.storage.local.remove('ticketConfig');
        } else {
            console.error('[數量頁] 找不到「確認張數」按鈕。');
        }

    } catch (error) {
        // 捕獲整個流程中的任何意外錯誤
        console.error("處理票券頁面時發生了未預期的錯誤:", error);
    }
}


// ====== 票券數量頁自動偵測與自動重跑功能 ======
(function () {
    let lastRun = 0;
    let running = false;
    const TICKET_PAGE_URL = '/ticket/ticket/';
    const RETRY_INTERVAL = 1000; // 每秒檢查一次
    const MAX_RETRY = 10;
    let retryCount = 0;

    async function tryAutoRunTicketPage() {
        if (window.location.pathname.includes(TICKET_PAGE_URL)) {
            // 只要驗證碼輸入框出現且不是剛剛執行過就自動執行
            const captchaInput = document.querySelector('#TicketForm_verifyCode');
            if (captchaInput && !running) {
                running = true;
                retryCount++;
                if (retryCount > MAX_RETRY) {
                    console.error('[數量頁] 自動重試超過上限，停止自動化。');
                    running = false;
                    return;
                }
                chrome.storage.local.get('ticketConfig', async (data) => {
                    if (data.ticketConfig && data.ticketConfig.isRunning) {
                        await handleTicketPage(data.ticketConfig);
                    }
                    running = false;
                });
            }
        } else {
            retryCount = 0;
            running = false;
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