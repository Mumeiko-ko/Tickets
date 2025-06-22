// captchaService.js - 驗證碼處理服務
window.TicketHelperCaptcha = {    // 半自動模式處理
    async handleSemiAuto(captchaInput) {
        const constants = window.TicketHelperConstants;
        const utils = window.TicketHelperUtils;

        console.log('[半自動模式] 等待您手動輸入驗證碼...');

        while (true) {
            await utils.waitForCaptcha(captchaInput, 4);
            console.log(`[半自動模式] 已輸入驗證碼: ${captchaInput.value}，準備提交`);

            const confirmButton = utils.findConfirmButton();
            if (confirmButton) {
                console.log('[半自動模式] 自動點擊「確認張數」按鈕');
                confirmButton.click();

                await utils.sleep(constants.TIMEOUTS.SUBMIT_WAIT);

                // 檢查是否成功跳轉到下一頁或完成流程
                if (utils.hasErrorMessage()) {
                    console.log('[半自動模式] 驗證碼錯誤，請重新輸入');
                    captchaInput.value = '';
                    captchaInput.focus();
                    continue; // 使用 continue 而非遞迴調用
                } else if (window.location.pathname.includes(constants.PATHS.TICKET_PAGE)) {
                    console.log('[半自動模式] 仍在票務頁面，可能需要重新嘗試');
                    captchaInput.value = '';
                    captchaInput.focus();
                    continue;
                } else {
                    console.log('[半自動模式] 提交成功！');
                    return; // 成功完成
                }
            } else {
                console.log('[半自動模式] 找不到確認按鈕，請手動點擊');
                await utils.sleep(constants.TIMEOUTS.MEDIUM_WAIT);
                // 重新檢查按鈕
                continue;
            }
        }
    },

    // 全自動模式處理
    async handleFullAuto(captchaInput) {
        const constants = window.TicketHelperConstants;
        const utils = window.TicketHelperUtils;
        let captchaAttempts = 0;

        while (true) {
            captchaAttempts++;
            console.log(`[全自動模式] 驗證碼辨識第 ${captchaAttempts} 次嘗試...`);

            try {
                const captchaImage = await utils.waitForElement(constants.SELECTORS.CAPTCHA_IMAGE);
                if (!captchaImage) {
                    console.log('[全自動模式] 等待驗證碼圖片載入...');
                    await utils.sleep(constants.TIMEOUTS.MEDIUM_WAIT);
                    continue;
                } console.log('[全自動模式] 快速識別驗證碼中...');
                const imageUrl = new URL(captchaImage.src, window.location.origin).href;
                console.log(`[全自動模式] 驗證碼圖片 URL: ${imageUrl}`);

                const imageBase64 = await utils.imageUrlToBase64(imageUrl);
                if (!imageBase64) {
                    console.log('[全自動模式] 圖片轉換 Base64 失敗，跳過此次識別');
                    continue;
                }

                const response = await fetch(constants.API.CAPTCHA_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': constants.API.CONTENT_TYPE },
                    body: JSON.stringify({ image_base64: imageBase64 }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.result && data.result.length >= 4) {
                        console.log(`[全自動模式] 識別成功: ${data.result}，正在驗證和提交`);

                        // 填入驗證碼
                        captchaInput.value = '';
                        await utils.sleep(50);
                        captchaInput.value = data.result;

                        captchaInput.dispatchEvent(new Event('input', { bubbles: true }));
                        captchaInput.dispatchEvent(new Event('change', { bubbles: true }));

                        await utils.sleep(constants.TIMEOUTS.INPUT_WAIT);                        // 提交
                        const confirmButton = utils.findConfirmButton();
                        if (confirmButton) {
                            console.log('[全自動模式] 立即點擊「確認張數」按鈕！');
                            confirmButton.click();

                            await utils.sleep(constants.TIMEOUTS.SUBMIT_WAIT);

                            // 檢查結果
                            if (utils.hasErrorMessage()) {
                                console.log('[全自動模式] 驗證碼錯誤，清空輸入框並重新識別');
                                captchaInput.value = '';
                            } else if (window.location.pathname.includes(constants.PATHS.TICKET_PAGE)) {
                                console.log('[全自動模式] 仍在票務頁面，繼續嘗試');
                                captchaInput.value = '';
                            } else {
                                console.log('[全自動模式] 提交成功，頁面已跳轉！');
                                return;
                            }
                        } else {
                            console.log('[全自動模式] 找不到確認按鈕，等待手動操作...');
                            await utils.sleep(constants.TIMEOUTS.SUBMIT_WAIT);
                            continue;
                        }
                    } else if (data.result) {
                        console.log(`[全自動模式] 驗證碼長度不足: ${data.result}，更換驗證碼重試`);
                    } else {
                        console.log('[全自動模式] API未返回結果，更換驗證碼重試');
                    }
                } else {
                    console.log('[全自動模式] API請求失敗，更換驗證碼重試');
                }
            } catch (error) {
                console.log(`[全自動模式] 第 ${captchaAttempts} 次識別失敗: ${error.message}，更換驗證碼重試`);
            }

            // 更換驗證碼
            console.log('[全自動模式] 更換驗證碼中...');
            const refreshButton = document.querySelector(constants.SELECTORS.CAPTCHA_IMAGE) ||
                document.querySelector('img[onclick*="refresh"]') ||
                document.querySelector('a[onclick*="refresh"]');

            if (refreshButton) {
                refreshButton.click();
                await utils.sleep(constants.TIMEOUTS.MEDIUM_WAIT);
            } else {
                await utils.sleep(constants.TIMEOUTS.SHORT_WAIT * 3);
            }
        }
    }
};
