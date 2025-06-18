// helpers.js - 工具函式
window.TicketHelperUtils = {
    // 延遲函式
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // 等待元素出現
    async waitForElement(selector, timeout = window.TicketHelperConstants.TIMEOUTS.ELEMENT_WAIT) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) return element;
            await window.TicketHelperUtils.sleep(window.TicketHelperConstants.TIMEOUTS.SHORT_WAIT);
        }
        console.log(`waitForElement: 超時，找不到元素 ${selector}`);
        return null;
    },

    // 等待使用者輸入驗證碼
    waitForCaptcha(inputElement, minLength = 4) {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (inputElement.value.length >= minLength) {
                    clearInterval(interval);
                    resolve();
                }
            }, 200);
        });
    },

    // 將圖片 URL 轉換為 Base64
    async imageUrlToBase64(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    // 檢查元素是否可用（未售完）
    isElementAvailable(element) {
        const fullText = element.textContent || "";
        const constants = window.TicketHelperConstants;

        return !constants.TEXT.SOLD_OUT_KEYWORDS.some(keyword =>
            fullText.includes(keyword)
        ) && !element.classList.contains('disabled') &&
            !element.style.color.includes('red');
    },

    // 檢查關鍵字匹配
    isKeywordMatch(text, keyword) {
        return keyword.split(/[,，\s]+/).some(k =>
            k && text.includes(k.trim())
        );
    },

    // 檢查是否有錯誤訊息
    hasErrorMessage() {
        const constants = window.TicketHelperConstants;
        const errorMessages = document.querySelectorAll(constants.SELECTORS.ERROR_SELECTORS);

        for (const errorEl of errorMessages) {
            const errorText = errorEl.textContent || '';
            if (constants.TEXT.ERROR_KEYWORDS.some(keyword =>
                errorText.includes(keyword)
            )) {
                return true;
            }
        }
        return false;
    },

    // 尋找確認按鈕
    findConfirmButton() {
        const constants = window.TicketHelperConstants;
        return Array.from(document.querySelectorAll(constants.SELECTORS.CONFIRM_BUTTON))
            .find(btn => btn.textContent.replace(/\s+/g, '') === constants.TEXT.CONFIRM_BUTTON_TEXT);
    }
};
