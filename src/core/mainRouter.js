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
    },

    // 檢查是否為區域選擇頁
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

            const orderButtons = Array.from(document.querySelectorAll(constants.SELECTORS.ORDER_BUTTONS))
                .filter(btn => btn.textContent &&
                    btn.textContent.replace(/\s+/g, '').includes(constants.TEXT.ORDER_BUTTON_TEXT)
                );

            let clicked = false;
            for (const btn of orderButtons) {
                if (!btn.disabled && btn.offsetParent !== null) {
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
    },

    // 直接啟動主流程
    start() {
        this.startMainRouter();
    }
};
