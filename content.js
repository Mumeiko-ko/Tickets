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
        </select>        <button id="th-start" type="submit" style="background:#00ff00;color:#222;font-weight:bold;padding:2px 12px;border-radius:4px;border:none;cursor:pointer;">戰爭開始</button>
        <button id="th-stop" type="button" style="background:#ff4444;color:#fff;font-weight:bold;padding:2px 12px;border-radius:4px;border:none;cursor:pointer;">戰爭結束</button>
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
    };    // 快速設定表單事件
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
    });    // 戰爭結束按鈕事件
    document.getElementById('th-stop').addEventListener('click', function (e) {
        e.preventDefault();
        // 清除設定並停止腳本
        chrome.storage.local.remove('ticketConfig', () => {
            appendLog('搶票流程已手動停止！', '#ff7070');
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
        }        // 立即開始驗證碼處理（無需等待）
        console.log('[數量頁] 開始無限重試驗證碼識別流程...');
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

        // 無限重試驗證碼辨識循環
        let captchaAttempts = 0;
        while (true) { // 無限循環直到成功
            captchaAttempts++;
            console.log(`[數量頁] 驗證碼辨識第 ${captchaAttempts} 次嘗試...`);

            try {
                const captchaImage = await waitForElement('#TicketForm_verifyCode-image');
                if (!captchaImage) {
                    console.log('[數量頁] 等待驗證碼圖片載入...');
                    await sleep(500);
                    continue;
                }

                console.log('[數量頁] 快速識別驗證碼中...');
                const imageUrl = new URL(captchaImage.src, window.location.origin).href;
                const imageBase64 = await imageUrlToBase64(imageUrl);

                const response = await fetch('http://127.0.0.1:9988/solve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_base64: imageBase64 }),
                }); if (response.ok) {
                    const data = await response.json();
                    if (data.result && data.result.length >= 4) {
                        console.log(`[數量頁] 識別成功: ${data.result}，正在驗證和提交`);

                        // 清空輸入框並重新填入，確保內容正確
                        captchaInput.value = '';
                        await sleep(50);
                        captchaInput.value = data.result;

                        // 觸發輸入事件，確保網站檢測到輸入
                        captchaInput.dispatchEvent(new Event('input', { bubbles: true }));
                        captchaInput.dispatchEvent(new Event('change', { bubbles: true }));

                        // 給一點時間讓輸入框更新
                        await sleep(200);// 立即嘗試點擊確認按鈕
                        const confirmButton = Array.from(document.querySelectorAll('button.btn-primary'))
                            .find(btn => btn.textContent.replace(/\s+/g, '') === '確認張數');
                        if (confirmButton) {
                            console.log('[數量頁] 立即點擊「確認張數」按鈕！');
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
                                    console.log(`[數量頁] 偵測到驗證碼錯誤訊息: ${errorText.trim()}`);
                                    hasError = true;
                                    break;
                                }
                            }

                            // 檢查頁面是否還在票券頁面（驗證碼錯誤會留在原頁面）
                            if (hasError || window.location.pathname.includes('/ticket/ticket/')) {
                                console.log('[數量頁] 驗證碼可能錯誤，清空輸入框並重新識別');
                                captchaInput.value = '';
                                // 繼續循環重新識別
                            } else {
                                console.log('[數量頁] 提交成功，頁面已跳轉！');
                                return; // 成功跳轉，結束函式
                            }
                        } else {
                            console.log('[數量頁] 找不到確認按鈕，等待手動操作...');
                            // 找不到按鈕時，不更換驗證碼，保持當前識別結果
                            await sleep(2000);
                            continue; // 重新嘗試找確認按鈕
                        }
                    } else if (data.result) {
                        console.log(`[數量頁] 驗證碼長度不足: ${data.result}，更換驗證碼重試`);
                        // 只有長度不足時才更換驗證碼
                    } else {
                        console.log('[數量頁] API未返回結果，更換驗證碼重試');
                    }
                } else {
                    console.log('[數量頁] API請求失敗，更換驗證碼重試');
                }
            } catch (error) {
                console.log(`[數量頁] 第 ${captchaAttempts} 次識別失敗: ${error.message}，更換驗證碼重試`);
            }

            // 只有在需要時才更換驗證碼
            console.log('[數量頁] 更換驗證碼中...');
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
    } catch (error) {
        console.error("處理票券頁面時發生錯誤，1秒後重新整理頁面重試:", error);
        setTimeout(() => location.reload(), 1000);
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