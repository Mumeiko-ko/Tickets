// areaSelection.js - 區域選擇頁面處理
window.TicketHelperAreaSelection = {
    retryCount: 0,

    get maxRetries() {
        return Infinity; // 無限重試
    },

    // 處理區域選擇頁面
    async handle(config) {
        const constants = window.TicketHelperConstants;
        const utils = window.TicketHelperUtils;

        console.log(`[區域頁] 正在尋找關鍵字為 "${config.areaKeyword}" 且可購買的場區... (重試次數: ${this.retryCount}/${this.maxRetries})`);

        const allClickableElements = await this.findClickableElements();

        if (allClickableElements.length === 0) {
            console.error("[區域頁] 找不到任何場區連結元素，嘗試等待1秒後重試...");
            await utils.sleep(constants.TIMEOUTS.LONG_WAIT);

            const retryElements = document.querySelectorAll('a[href*="ticket"], a[onclick*="ticket"], a[onclick*="select"]');
            if (retryElements.length > 0) {
                console.log(`[區域頁] 重試找到 ${retryElements.length} 個連結`);
                return this.selectBestMatch(Array.from(retryElements), config);
            } else {
                return this.handleNoElementsFound(config);
            }
        }

        return this.selectBestMatch(allClickableElements, config);
    },

    // 尋找可點擊元素
    async findClickableElements() {
        const constants = window.TicketHelperConstants;
        let allClickableElements = [];

        // 嘗試多種選擇器
        for (const selector of constants.SELECTORS.AREA_SELECTORS) {
            console.log(`[區域頁] 嘗試選擇器: ${selector}`);
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`[區域頁] 找到 ${elements.length} 個元素，使用選擇器: ${selector}`);
                allClickableElements = Array.from(elements);
                break;
            }
        }

        // 廣泛搜尋模式
        if (allClickableElements.length === 0) {
            console.log('[區域頁] 使用廣泛搜尋模式...');
            const allLinks = document.querySelectorAll('a');
            allClickableElements = Array.from(allLinks).filter(link => {
                const text = link.textContent || '';
                const hasPrice = /[\$￥¥]\d+|^\d+元|^\d+$/.test(text);
                const hasArea = text.length > 2 && text.length < 50;
                return hasPrice || hasArea;
            });
            console.log(`[區域頁] 廣泛搜尋找到 ${allClickableElements.length} 個可能的連結`);
        }

        return allClickableElements;
    },    // 選擇最佳匹配
    async selectBestMatch(elements, config) {
        const utils = window.TicketHelperUtils;
        const constants = window.TicketHelperConstants;
        let foundMatches = [];
        let availableBackups = [];

        for (const linkElement of elements) {
            const fullText = linkElement.textContent || "";
            const cleanText = fullText.replace(/\s+/g, ' ').trim();

            const isAvailable = utils.isElementAvailable(linkElement);
            const isKeywordMatch = utils.isKeywordMatch(fullText, config.areaKeyword);

            if (isKeywordMatch && isAvailable) {
                foundMatches.push({ element: linkElement, text: cleanText, priority: 1 });
            } else if (isAvailable) {
                availableBackups.push({ element: linkElement, text: cleanText, priority: 2 });
            }
        }        // 選擇目標元素 - 僅選擇關鍵字匹配的場區
        let targetElement = null;
        let targetText = '';

        if (foundMatches.length > 0) {
            targetElement = foundMatches[0].element;
            targetText = foundMatches[0].text;
            console.log(`[區域頁] 找到 ${foundMatches.length} 個關鍵字匹配，選擇: ${targetText}`);
        } else {
            // 如果沒有關鍵字匹配，不選擇備選項目，直接重新整理
            console.log(`[區域頁] 未找到關鍵字 "${config.areaKeyword}" 的匹配場區`);
            if (availableBackups.length > 0) {
                console.log(`[區域頁] 發現 ${availableBackups.length} 個其他可用場區，但不符合關鍵字要求:`);
                availableBackups.forEach((backup, index) => {
                    console.log(`  ${index + 1}. ${backup.text}`);
                });
                console.log(`[區域頁] 為避免選擇錯誤場區，將重新整理頁面重試...`);
            }
            return this.handleNoAvailableOptions(elements, config);
        }

        if (targetElement) {
            console.log(`[區域頁] 準備點擊: ${targetText}`);

            // 嘗試點擊，如果失敗則重新整理
            const clickSuccess = await this.attemptClick(targetElement, targetText);
            if (!clickSuccess) {
                return this.handleClickFailure(config);
            }

            // 重置重試計數器
            this.retryCount = 0;
            return;
        }

        // 沒找到任何可用選項，檢查是否需要重新整理
        return this.handleNoAvailableOptions(elements, config);
    },

    // 嘗試點擊元素
    async attemptClick(element, text) {
        const utils = window.TicketHelperUtils;
        const constants = window.TicketHelperConstants;

        try {
            console.log(`[區域頁] 點擊場區: ${text}`);
            element.click();

            // 等待一段時間檢查頁面是否有變化
            await utils.sleep(constants.TIMEOUTS.MEDIUM_WAIT);

            // 檢查是否成功跳轉（URL變化或頁面內容變化）
            const currentUrl = window.location.href;
            console.log(`[區域頁] 點擊後URL: ${currentUrl}`);

            // 如果仍在同一頁面且沒有明顯變化，判斷為點擊失敗
            if (this.isStillOnAreaSelectionPage()) {
                console.warn(`[區域頁] 點擊 "${text}" 後頁面無變化，可能未開賣或無效`);
                return false;
            }

            return true;
        } catch (error) {
            console.error(`[區域頁] 點擊失敗: ${error.message}`);
            return false;
        }
    },

    // 檢查是否仍在區域選擇頁面
    isStillOnAreaSelectionPage() {
        // 檢查頁面上是否仍有區域選擇相關元素
        const areaElements = document.querySelectorAll('a[href*="ticket"], .area, .zone, .seat');
        return areaElements.length > 0;
    },    // 處理點擊失敗
    async handleClickFailure(config) {
        this.retryCount++;
        console.log(`[區域頁] 點擊失敗，準備重新整理頁面... (第 ${this.retryCount} 次重試)`);

        // 短暫等待後重新整理
        await this.waitAndRefresh();        // 重新整理後重新開始處理（縮短等待時間）
        setTimeout(() => {
            this.handle(config);
        }, 400); // 縮短到400ms
    },    // 處理找不到任何元素的情況
    async handleNoElementsFound(config) {
        this.retryCount++;
        console.log(`[區域頁] 找不到場區元素，重新整理頁面... (第 ${this.retryCount} 次重試)`);

        await this.waitAndRefresh(); setTimeout(() => {
            this.handle(config);
        }, 400); // 縮短到400ms
    },    // 處理沒有可用選項的情況
    async handleNoAvailableOptions(elements, config) {
        // 無限重試，等待目標關鍵字場區開賣或出現
        this.retryCount++;

        if (elements.length === 0) {
            console.error(`[區域頁] 找不到任何場區選項，重新整理頁面... (第 ${this.retryCount} 次重試)`);
        } else {
            console.error(`[區域頁] 找不到關鍵字為 "${config.areaKeyword}" 且有票的場區`);
            console.log('[區域頁] 目前可用的場區選項:');
            elements.forEach((el, index) => {
                const text = el.textContent?.trim() || '(無文字)';
                console.log(`  ${index + 1}. ${text}`);
            });
            console.log(`[區域頁] 僅接受關鍵字匹配的場區，重新整理頁面等待目標場區... (第 ${this.retryCount} 次重試)`);
        }

        await this.waitAndRefresh(); setTimeout(() => {
            this.handle(config);
        }, 400); // 縮短到400ms
    },// 等待並重新整理頁面
    async waitAndRefresh() {
        const utils = window.TicketHelperUtils;        // 隨機等待時間避免過於頻繁（縮短到100-600ms）
        const waitTime = Math.random() * 500 + 100; // 100-600毫秒隨機等待
        console.log(`[區域頁] 等待 ${Math.round(waitTime)}ms 後重新整理...`);

        await utils.sleep(waitTime);

        console.log(`[區域頁] 重新整理頁面...`);
        window.location.reload();
    }
};
