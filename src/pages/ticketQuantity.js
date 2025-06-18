// ticketQuantity.js - 票券數量頁面處理
window.TicketHelperTicketQuantity = {
    // 處理票券數量頁面
    async handle(config) {
        const constants = window.TicketHelperConstants;
        const utils = window.TicketHelperUtils;
        const captchaService = window.TicketHelperCaptcha;

        console.log('[數量頁] 進入數量選擇頁面，開始快速自動化流程...');

        try {
            // 並行處理數量選擇和同意條款
            console.log('[數量頁] 同時執行：選擇數量 + 勾選同意條款...');
            const [quantitySelect, agreeCheckbox] = await Promise.all([
                utils.waitForElement(constants.SELECTORS.QUANTITY_SELECT),
                utils.waitForElement(constants.SELECTORS.AGREE_CHECKBOX)
            ]);

            // 設置數量
            if (quantitySelect) {
                quantitySelect.value = config.ticketQuantity;
                quantitySelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`[數量頁] 數量已選擇: ${config.ticketQuantity}`);
            }

            // 勾選同意條款
            if (agreeCheckbox && !agreeCheckbox.checked) {
                agreeCheckbox.click();
                console.log('[數量頁] 同意條款已勾選');
            }

            // 開始驗證碼處理
            const mode = config.semiAutoMode ? '半自動' : '全自動';
            console.log(`[數量頁] 開始${mode}驗證碼處理流程...`);

            const captchaInput = await utils.waitForElement(constants.SELECTORS.CAPTCHA_INPUT);
            if (!captchaInput) {
                console.error('[數量頁] 找不到驗證碼輸入框，1秒後重試整個流程');
                setTimeout(() => location.reload(), constants.TIMEOUTS.LONG_WAIT);
                return;
            }

            // 檢查是否已有驗證碼
            if (captchaInput.value && captchaInput.value.length >= 4) {
                console.log(`[數量頁] 發現已有驗證碼: ${captchaInput.value}，直接嘗試提交`);
                const confirmButton = utils.findConfirmButton();
                if (confirmButton) {
                    console.log('[數量頁] 點擊「確認張數」按鈕');
                    confirmButton.click();
                    return;
                }
            }

            // 根據模式處理驗證碼
            if (config.semiAutoMode) {
                await captchaService.handleSemiAuto(captchaInput);
            } else {
                await captchaService.handleFullAuto(captchaInput);
            }
        } catch (error) {
            console.error("處理票券頁面時發生錯誤，1秒後重新整理頁面重試:", error);
            setTimeout(() => location.reload(), constants.TIMEOUTS.LONG_WAIT);
        }
    }
};
