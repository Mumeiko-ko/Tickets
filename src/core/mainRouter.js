// mainRouter.js - 主路由控制器
window.TicketHelperRouter = {
    // 自動重跑監控
    init() {
        this.setupAutoRetry();
        this.startMainRouter();
    },

    // 設置自動重跑
    setupAutoRetry() {
        const constants = window.TicketHelperConstants;
        let running = false;
        let lastSubmitTime = 0;

        const tryAutoRunTicketPage = async () => {
            const currentTime = Date.now();

            if (window.location.pathname.includes(constants.PATHS.TICKET_PAGE)) {
                const captchaInput = document.querySelector(constants.SELECTORS.CAPTCHA_INPUT);

                // 檢查冷卻期
                if (currentTime - lastSubmitTime < constants.RETRY.SUBMIT_COOLDOWN) {
                    return;
                }

                if (captchaInput && !running) {
                    running = true;
                    console.log('[自動重跑] 偵測到驗證碼頁面，立即執行搶票流程');

                    chrome.storage.local.get('ticketConfig', async (data) => {
                        if (data.ticketConfig && data.ticketConfig.isRunning) {
                            await window.TicketHelperTicketQuantity.handle(data.ticketConfig);
                            lastSubmitTime = Date.now();
                        }
                        running = false;
                    });
                }
            } else {
                running = false;
                lastSubmitTime = 0;
            }
        };

        setInterval(tryAutoRunTicketPage, constants.RETRY.INTERVAL);
    },

    // 啟動主路由
    async startMainRouter() {
        const constants = window.TicketHelperConstants;
        const data = await chrome.storage.local.get('ticketConfig');

        if (!data.ticketConfig || !data.ticketConfig.isRunning) {
            return;
        }

        const config = data.ticketConfig;
        const url = window.location.href;

        console.log("搶票腳本已啟動，當前URL:", url);

        // 路由 1: 活動詳情頁
        if (url.includes(constants.PATHS.ACTIVITY_DETAIL)) {
            await this.handleActivityPage();
        }
        // 路由 2: 區域選擇頁
        else if (this.isAreaSelectionPage(url)) {
            console.log("[區域頁] 偵測到區域選擇頁面");
            await window.TicketHelperAreaSelection.handle(config);
        }
        // 路由 3: 票券數量選擇頁
        else if (url.includes(constants.PATHS.TICKET_PAGE)) {
            await window.TicketHelperTicketQuantity.handle(config);
        }
    },    // 檢查是否為區域選擇頁
    isAreaSelectionPage(url) {
        const constants = window.TicketHelperConstants;

        return url.includes(constants.PATHS.TICKET_AREA) ||
            url.includes(constants.PATHS.ACTIVITY_GAME) ||
            url.includes(constants.PATHS.GAME) ||
            constants.SELECTORS.AREA_CONTAINERS.some(selector =>
                document.querySelector(selector)
            );
    },

    // 處理活動頁面
    async handleActivityPage() {
        const constants = window.TicketHelperConstants;
        const utils = window.TicketHelperUtils;

        console.log("[活動頁] 偵測到活動詳情頁。");

        const buyButton = await utils.waitForElement(constants.SELECTORS.BUY_BUTTON);
        if (buyButton) {
            console.log("[活動頁] 點擊 '立即購票'。");
            buyButton.click();

            await utils.sleep(constants.TIMEOUTS.POPUP_WAIT);

            // 取得目前設定
            const data = await chrome.storage.local.get('ticketConfig');
            const config = data.ticketConfig || {};

            // 如果有設定演出日期，使用日期選擇服務
            if (config.performanceDate && window.TicketHelperDateSelection) {
                console.log("[活動頁] 使用演出日期選擇服務");
                await window.TicketHelperDateSelection.handle(config);
            } else {
                // 沒有設定日期或服務未載入，使用原有邏輯（含過濾機制）
                console.log("[活動頁] 使用預設「立即訂購」邏輯");

                // 取得所有可能的訂購按鈕
                const allButtons = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));

                // 過濾出購票相關按鈕
                let orderButtons = allButtons.filter(btn => {
                    const text = (btn.textContent || btn.value || '').trim();
                    return text.includes('立即訂購') ||
                        text.includes('立即購票') ||
                        text.includes('購買') ||
                        text.includes('買票');
                });

                // 排除不相關的連結（與 dateSelection.js 一致）
                orderButtons = orderButtons.filter(btn => {
                    const text = (btn.textContent || btn.value || '').trim();
                    const href = btn.href || '';

                    // 排除明顯不相關的連結
                    const excludePatterns = [
                        '訂單查詢', '查詢訂單', '訂單明細',
                        '會員', '登入', '註冊', '客服', '幫助',
                        '關於', '聯絡', '首頁', '回上頁', '返回',
                        'logout', 'login', 'member', 'help', 'about',
                        'contact', 'home', 'query', 'search',
                        '已售完', '售完', '停售'
                    ];

                    // 檢查文字和 href 是否包含排除關鍵字
                    for (const pattern of excludePatterns) {
                        if (text.toLowerCase().includes(pattern.toLowerCase()) ||
                            href.toLowerCase().includes(pattern.toLowerCase())) {
                            console.log(`[活動頁] 過濾掉不相關連結: "${text}"`);
                            return false;
                        }
                    }
                    return true;
                });

                let clicked = false;
                for (const btn of orderButtons) {
                    if (!btn.disabled && btn.offsetParent !== null) {
                        console.log(`[活動頁] 點擊「立即訂購」按鈕: "${btn.textContent?.trim()}"`);
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
    },

    // 直接啟動主流程
    start() {
        this.startMainRouter();
    }
};
