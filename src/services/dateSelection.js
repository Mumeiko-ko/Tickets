// dateSelection.js - 演出日期選擇服務
window.TicketHelperDateSelection = {
    // 處理演出日期選擇
    async handle(config) {
        const constants = window.TicketHelperConstants;
        const utils = window.TicketHelperUtils;

        if (!config.performanceDate) {
            console.log('[日期選擇] 未設定演出日期，跳過日期選擇');
            return;
        }

        console.log(`[日期選擇] 尋找演出日期: ${config.performanceDate}`);

        // 等待頁面載入完成
        await utils.sleep(constants.TIMEOUTS.PAGE_LOAD);

        // 查找所有立即訂購按鈕
        const orderButtons = this.findOrderButtons();

        if (orderButtons.length === 0) {
            console.log('[日期選擇] 未找到立即訂購按鈕');
            return;
        }

        // 根據設定的日期尋找對應按鈕
        const targetButton = this.findButtonByDate(orderButtons, config.performanceDate); if (targetButton) {
            console.log(`[日期選擇] 找到目標日期按鈕，準備點擊`);
            targetButton.click();
            await utils.sleep(constants.TIMEOUTS.CLICK_DELAY);
        } else {
            console.log(`[日期選擇] 未找到 ${config.performanceDate} 對應的按鈕`);
            console.log(`[日期選擇] 啟動除錯模式...`);
            this.debugPageStructure();
        }
    },    // 查找所有立即訂購按鈕
    findOrderButtons() {
        const constants = window.TicketHelperConstants;

        let buttons = [];

        // 針對拓元售票網的特殊選擇器
        const tixcraftSelectors = [
            'a[onclick*="order"]',           // 拓元常用的 onclick 事件
            'button[onclick*="order"]',      // 按鈕形式的訂購
            '.btn-order',                    // CSS 類別
            '#orderBtn',                     // ID 選擇器
            'td a',                          // 表格中的連結（演出時間表）
            '.show-time a',                  // 演出時間區塊的連結
            '.performance-list a',           // 演出列表的連結
            'tr td:last-child a',            // 表格最後一欄的連結
            '.purchase-btn',                 // 購買按鈕類別
            '[href*="order"]'                // href 包含 order 的連結
        ];

        // 先嘗試特殊選擇器
        for (const selector of tixcraftSelectors) {
            try {
                const found = Array.from(document.querySelectorAll(selector));
                buttons.push(...found);
            } catch (e) {
                // 如果選擇器無效就跳過
            }
        }

        // 使用文字內容搜尋立即訂購按鈕
        const allButtons = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
        const textBasedButtons = allButtons.filter(btn => {
            const text = (btn.textContent || btn.value || '').trim();
            return text.includes('立即訂購') ||
                text.includes('訂購') ||
                text.includes('購買') ||
                text.includes('立即購票') ||
                text.includes('買票') ||
                text.includes('purchase') ||
                text.includes('buy');
        });

        // 合併結果並去重
        buttons.push(...textBasedButtons);
        buttons = [...new Set(buttons)]; // 去重

        // 如果沒找到，嘗試使用 constants 中的選擇器
        if (buttons.length === 0 && constants && constants.SELECTORS && constants.SELECTORS.ORDER_BUTTONS) {
            buttons = Array.from(document.querySelectorAll(constants.SELECTORS.ORDER_BUTTONS))
                .filter(btn => btn.textContent &&
                    btn.textContent.replace(/\s+/g, '').includes('立即訂購')
                );
        }

        console.log(`[日期選擇] 找到 ${buttons.length} 個可能的訂購按鈕`);

        // 記錄找到的按鈕詳細資訊
        if (buttons.length > 0) {
            console.log(`[日期選擇] 按鈕詳細資訊：`);
            buttons.slice(0, 5).forEach((btn, index) => {
                const text = (btn.textContent || btn.value || '').trim();
                const tag = btn.tagName.toLowerCase();
                const className = btn.className || '無';
                const onclick = btn.onclick ? '有 onclick' : '無 onclick';
                console.log(`[日期選擇] 按鈕 ${index + 1}: <${tag}> "${text}" class="${className}" ${onclick}`);
            });
        }

        return buttons;
    },    // 根據日期查找對應按鈕
    findButtonByDate(buttons, targetDate) {
        const target = new Date(targetDate);
        const targetDateStr = this.formatDate(target);

        console.log(`[日期選擇] 目標日期格式: ${targetDateStr} (${target.toLocaleDateString()})`);

        for (const button of buttons) {
            // 擴大搜尋範圍，特別針對表格結構
            const containers = [
                button.closest('tr'),                                    // 表格行
                button.closest('div, td, li, .item, .date-item'),       // 一般容器
                button.closest('.show-info, .event-row, .performance'), // 演出資訊容器
                button.parentElement,                                    // 直接父元素
                button                                                   // 按鈕本身
            ].filter(Boolean); // 過濾掉 null 值

            for (const container of containers) {
                const fullText = container.textContent || '';

                console.log(`[日期選擇] 檢查容器文字: "${fullText.trim().substring(0, 100)}..."`);

                // 提取可能的日期格式
                const dateMatches = this.extractDatesFromText(fullText);

                for (const dateMatch of dateMatches) {
                    if (this.isSameDate(dateMatch, target)) {
                        console.log(`[日期選擇] 匹配成功！目標: ${targetDateStr}, 找到: ${this.formatDate(dateMatch)}`);
                        console.log(`[日期選擇] 匹配的完整文字: "${fullText.trim()}"`);
                        return button;
                    }
                }
            }
        }

        console.log(`[日期選擇] 未找到匹配的日期按鈕`);

        // 提供詳細的除錯資訊
        if (buttons.length > 0) {
            console.log(`[日期選擇] 除錯資訊 - 找到的按鈕及其容器文字：`);
            buttons.slice(0, 5).forEach((btn, index) => {
                const tr = btn.closest('tr');
                const div = btn.closest('div');
                const trText = tr ? tr.textContent?.trim().substring(0, 100) : '無表格行';
                const divText = div ? div.textContent?.trim().substring(0, 100) : '無 div 容器';
                console.log(`[日期選擇] 按鈕 ${index + 1}:`);
                console.log(`  - 表格行: "${trText}..."`);
                console.log(`  - Div容器: "${divText}..."`);
            });
        }

        return null;
    },    // 從文字中提取日期
    extractDatesFromText(text) {
        const dates = [];

        console.log(`[日期選擇] 正在解析文字: "${text.substring(0, 200)}..."`);

        // 各種日期格式的正則表達式，針對拓元售票網優化
        const patterns = [
            // 標準格式
            { regex: /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/g, type: 'standard' },  // 2025-06-22, 2025/6/22
            { regex: /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/g, type: 'reverse' },   // 06-22-2025, 6/22/2025

            // 中文格式
            { regex: /(\d{4})年(\d{1,2})月(\d{1,2})日/g, type: 'chinese_full' }, // 2025年6月22日
            { regex: /(\d{1,2})月(\d{1,2})日/g, type: 'chinese_short' },         // 6月22日

            // 點分隔格式
            { regex: /(\d{4})\.(\d{1,2})\.(\d{1,2})/g, type: 'dot_standard' },  // 2025.06.22
            { regex: /(\d{1,2})\.(\d{1,2})\.(\d{4})/g, type: 'dot_reverse' },   // 22.06.2025

            // 拓元特殊格式
            { regex: /(\d{1,2})\/(\d{1,2})\s*\([一二三四五六日週]\)/g, type: 'week_format' }, // 6/22 (五)
            { regex: /(\d{1,2})\/(\d{1,2})\s*\(\w+\)/g, type: 'week_en_format' },             // 6/22 (Fri)
            { regex: /(\d{1,2})\/(\d{1,2})/g, type: 'simple_format' },                        // 6/22
            { regex: /(\d{4})\/(\d{1,2})\/(\d{1,2})\s*\([一二三四五六日週]\)/g, type: 'full_week_format' }, // 2025/6/22 (五)

            // 時間包含的格式 
            { regex: /(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/g, type: 'time_format' }      // 6/22 18:30
        ];

        patterns.forEach(({ regex, type }) => {
            let match;
            regex.lastIndex = 0; // 重置正則表達式
            while ((match = regex.exec(text)) !== null) {
                let year, month, day;

                switch (type) {
                    case 'standard':
                    case 'dot_standard':
                    case 'full_week_format':
                        [, year, month, day] = match;
                        break;
                    case 'reverse':
                    case 'dot_reverse':
                        [, month, day, year] = match;
                        break;
                    case 'chinese_full':
                        [, year, month, day] = match;
                        break;
                    case 'chinese_short':
                    case 'week_format':
                    case 'week_en_format':
                    case 'simple_format':
                    case 'time_format':
                        [, month, day] = match;
                        year = new Date().getFullYear(); // 使用當前年份
                        break;
                }

                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                if (!isNaN(date.getTime())) {
                    dates.push(date);
                    console.log(`[日期選擇] 提取到日期: ${this.formatDate(date)} (格式: ${type}, 原文: "${match[0]}")`);
                }
            }
        });

        return dates;
    },

    // 比較兩個日期是否相同（只比較年月日）
    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    },

    // 格式化日期為字串
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 除錯輔助：分析頁面結構
    debugPageStructure() {
        console.log('[日期選擇] === 頁面結構分析 ===');

        // 檢查表格結構
        const tables = document.querySelectorAll('table');
        console.log(`[日期選擇] 找到 ${tables.length} 個表格`);

        tables.forEach((table, index) => {
            const rows = table.querySelectorAll('tr');
            console.log(`[日期選擇] 表格 ${index + 1}: ${rows.length} 行`);

            // 檢查前幾行的內容
            Array.from(rows).slice(0, 3).forEach((row, rowIndex) => {
                const text = row.textContent?.trim().substring(0, 100);
                console.log(`[日期選擇]   行 ${rowIndex + 1}: "${text}..."`);
            });
        });

        // 檢查所有連結
        const allLinks = document.querySelectorAll('a');
        const orderLinks = Array.from(allLinks).filter(link => {
            const text = link.textContent?.trim() || '';
            const href = link.href || '';
            return text.includes('訂購') || text.includes('購買') || href.includes('order');
        });

        console.log(`[日期選擇] 找到 ${orderLinks.length} 個可能的訂購連結`);
        orderLinks.slice(0, 5).forEach((link, index) => {
            const text = link.textContent?.trim();
            const href = link.href;
            console.log(`[日期選擇] 連結 ${index + 1}: "${text}" href="${href}"`);
        });
    },
};
