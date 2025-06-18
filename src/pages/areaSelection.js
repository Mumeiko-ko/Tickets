// areaSelection.js - 區域選擇頁面處理
window.TicketHelperAreaSelection = {
    // 處理區域選擇頁面
    async handle(config) {
        const constants = window.TicketHelperConstants;
        const utils = window.TicketHelperUtils;

        console.log(`[區域頁] 正在尋找關鍵字為 "${config.areaKeyword}" 且可購買的場區...`);

        const allClickableElements = await this.findClickableElements();

        if (allClickableElements.length === 0) {
            console.error("[區域頁] 找不到任何場區連結元素，嘗試等待1秒後重試...");
            await utils.sleep(constants.TIMEOUTS.LONG_WAIT);

            const retryElements = document.querySelectorAll('a[href*="ticket"], a[onclick*="ticket"], a[onclick*="select"]');
            if (retryElements.length > 0) {
                console.log(`[區域頁] 重試找到 ${retryElements.length} 個連結`);
                return this.selectBestMatch(Array.from(retryElements), config);
            } else {
                chrome.storage.local.remove('ticketConfig');
                return;
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
    },

    // 選擇最佳匹配
    selectBestMatch(elements, config) {
        const utils = window.TicketHelperUtils;
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
        }

        // 選擇目標元素
        let targetElement = null;
        let targetText = '';

        if (foundMatches.length > 0) {
            targetElement = foundMatches[0].element;
            targetText = foundMatches[0].text;
            console.log(`[區域頁] 找到 ${foundMatches.length} 個關鍵字匹配，選擇: ${targetText}`);
        } else if (availableBackups.length > 0) {
            targetElement = availableBackups[0].element;
            targetText = availableBackups[0].text;
            console.log(`[區域頁] 沒有完全匹配，選擇第一個可用選項: ${targetText}`);
        }

        if (targetElement) {
            console.log(`[區域頁] 準備點擊: ${targetText}`);
            console.log(`[區域頁] 點擊場區: ${targetText}`);
            targetElement.click();
            return;
        }

        // 沒找到任何選項
        console.error(`[區域頁] 找不到關鍵字為 "${config.areaKeyword}" 且有票的場區`);
        console.log('[區域頁] 可用的場區選項:');
        elements.forEach((el, index) => {
            console.log(`  ${index + 1}. ${el.textContent?.trim()}`);
        });

        chrome.storage.local.remove('ticketConfig');
    }
};
