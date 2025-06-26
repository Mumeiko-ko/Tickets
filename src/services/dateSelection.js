// dateSelection.js - 演出日期選擇服務
window.TicketHelperDateSelection = {
    retryCount: 0,

    get maxRetries() {
        return Infinity; // 無限重試
    },

    // 處理演出日期選擇
    async handle(config) {
        const constants = window.TicketHelperConstants;
        const utils = window.TicketHelperUtils;

        if (!config.performanceDate) {
            console.log('[日期選擇] 未設定演出日期，跳過日期選擇');
            return;
        }

        console.log(`[日期選擇] 尋找演出日期: ${config.performanceDate} (重試次數: ${this.retryCount}/${this.maxRetries})`);

        // 等待關鍵元素出現，而不是固定等待，以提升速度
        console.log('[日期選擇] 等待日期選擇區塊載入...');
        const orderButtonContainerSelector = 'a[onclick*="order"], .btn-order, table, .show-time, .performance-list';
        await utils.waitForElement(orderButtonContainerSelector, constants.TIMEOUTS.ELEMENT_WAIT);
        console.log('[日期選擇] 日期選擇區塊已載入');

        // 查找所有立即訂購按鈕
        const orderButtons = this.findOrderButtons();

        if (orderButtons.length === 0) {
            console.log('[日期選擇] 未找到立即訂購按鈕');
            return this.handleNoButtonsFoundRetry(config);
        }

        // 根據設定的日期尋找對應按鈕
        const targetButton = this.findButtonByDate(orderButtons, config.performanceDate);

        if (targetButton) {
            // 檢查目標日期是否已售完
            const isSoldOut = this.checkIfSoldOut(targetButton, config.performanceDate);

            if (isSoldOut) {
                console.log(`[日期選擇] 目標日期 ${config.performanceDate} 顯示已售完`);
                return this.handleSoldOutRetry(config);
            }

            console.log(`[日期選擇] 找到目標日期按鈕，準備點擊`);

            // 嘗試點擊按鈕
            const clickSuccess = await this.attemptClickButton(targetButton);
            if (!clickSuccess) {
                console.log(`[日期選擇] 點擊失敗，可能未開賣或無效`);
                return this.handleClickFailureRetry(config);
            }

            // 重置重試計數器
            this.retryCount = 0;
            await utils.sleep(constants.TIMEOUTS.CLICK_DELAY);
        } else {
            console.log(`[日期選擇] 未找到 ${config.performanceDate} 對應的按鈕`);
            console.log(`[日期選擇] 啟動除錯模式...`);
            this.debugPageStructure();

            // 如果找不到按鈕也嘗試重新整理
            return this.handleNotFoundRetry(config);
        }
    },// 查找所有立即訂購按鈕
    findOrderButtons() {
        const constants = window.TicketHelperConstants;

        let buttons = [];

        // 針對拓元售票網的特殊選擇器（更精確）
        const tixcraftSelectors = [
            'a[onclick*="order"]',           // 拓元常用的 onclick 事件
            'a[onclick*="OrderForm"]',       // 拓元常用的 OrderForm 事件
            'a[onclick*="buy"]',             // 購買相關事件
            'button[onclick*="order"]',      // 按鈕形式的訂購
            '.btn-order',                    // CSS 類別
            '#orderBtn',                     // ID 選擇器
            'td a[href*="order"]',           // 表格中包含 order 的連結
            'td a[onclick]',                 // 表格中有 onclick 的連結
            '.show-time a[onclick]',         // 演出時間區塊有 onclick 的連結
            '.performance-list a[onclick]',  // 演出列表有 onclick 的連結
            'tr td:last-child a[onclick]',   // 表格最後一欄有 onclick 的連結
            '.purchase-btn',                 // 購買按鈕類別
            '[href*="order"][onclick]'       // href 包含 order 且有 onclick 的連結
        ];

        // 先嘗試特殊選擇器
        for (const selector of tixcraftSelectors) {
            try {
                const found = Array.from(document.querySelectorAll(selector));
                buttons.push(...found);
            } catch (e) {
                // 如果選擇器無效就跳過
            }
        }        // 使用文字內容搜尋立即訂購按鈕（更嚴格的條件）
        const allButtons = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"]'));
        console.log(`[日期選擇] 頁面總共找到 ${allButtons.length} 個按鈕/連結元素`);

        const textBasedButtons = allButtons.filter(btn => {
            const text = (btn.textContent || btn.value || '').trim();

            // 先檢查是否包含排除關鍵字
            const excludeKeywords = ['查詢', '查看', '詳細', '說明', '會員', '登入'];
            const hasExcludeText = excludeKeywords.some(keyword => text.includes(keyword));
            if (hasExcludeText) {
                return false;
            }

            // 檢查是否有購票相關文字（放寬條件）
            const hasOrderText = text.includes('立即訂購') ||
                text.includes('立即購票') ||
                text.includes('購買') ||
                text.includes('買票') ||
                text.includes('訂購') ||
                text.includes('購票') ||
                (text.includes('purchase') && !text.includes('query')) ||
                (text.includes('buy') && !text.includes('query')) ||
                text.includes('order');

            // 放寬動作條件，不一定需要 onclick
            const hasAction = btn.onclick ||
                btn.href ||
                btn.type === 'submit' ||
                btn.tagName.toLowerCase() === 'button' ||
                btn.getAttribute('onclick');

            const isValid = hasOrderText && hasAction;

            if (isValid) {
                console.log(`[日期選擇] 找到潛在購票按鈕: "${text}" (${btn.tagName})`);
            }

            return isValid;
        });

        // 合併結果並去重
        buttons.push(...textBasedButtons);
        buttons = [...new Set(buttons)]; // 去重        // 過濾掉不相關的連結（加強版）
        buttons = buttons.filter(btn => {
            const text = (btn.textContent || btn.value || '').trim();
            const href = btn.href || '';
            const id = btn.id || '';
            const className = btn.className || '';

            // 排除明顯不相關的連結（擴充版）
            const excludePatterns = [
                '訂單查詢', '查詢訂單', '訂單明細', '查詢',
                '會員', '登入', '註冊', '客服', '幫助',
                '關於', '聯絡', '首頁', '回上頁', '返回',
                'logout', 'login', 'member', 'help', 'about',
                'contact', 'home', 'query', 'search', 'order_query',
                '已售完', '售完', '停售', '暫停販售',
                '更多', '詳細', '資訊', '說明', '規則',
                'more', 'detail', 'info', 'rule'
            ];

            // 檢查文字內容
            for (const pattern of excludePatterns) {
                if (text.toLowerCase().includes(pattern.toLowerCase())) {
                    console.log(`[日期選擇] 過濾掉不相關連結文字: "${text}"`);
                    return false;
                }
            }

            // 檢查 href
            for (const pattern of excludePatterns) {
                if (href.toLowerCase().includes(pattern.toLowerCase())) {
                    console.log(`[日期選擇] 過濾掉不相關 href: "${href}"`);
                    return false;
                }
            }

            // 檢查 id 和 className
            for (const pattern of excludePatterns) {
                if (id.toLowerCase().includes(pattern.toLowerCase()) ||
                    className.toLowerCase().includes(pattern.toLowerCase())) {
                    console.log(`[日期選擇] 過濾掉不相關 id/class: id="${id}", class="${className}"`);
                    return false;
                }
            }

            // 額外檢查：如果是空文字或只有空白，也過濾掉
            if (!text || text.length < 2) {
                console.log(`[日期選擇] 過濾掉空文字連結`);
                return false;
            }

            // 額外檢查：如果按鈕明顯是導航或查詢功能
            const navigationPatterns = ['nav', 'menu', 'tab', 'link'];
            for (const pattern of navigationPatterns) {
                if (className.toLowerCase().includes(pattern) &&
                    !text.toLowerCase().includes('購') &&
                    !text.toLowerCase().includes('訂購') &&
                    !text.toLowerCase().includes('buy')) {
                    console.log(`[日期選擇] 過濾掉導航連結: "${text}" (class: ${className})`);
                    return false;
                }
            }

            return true;
        });

        // 優先排序：有 onclick 的按鈕優先
        buttons.sort((a, b) => {
            const aHasOnclick = !!a.onclick;
            const bHasOnclick = !!b.onclick;

            if (aHasOnclick && !bHasOnclick) return -1;
            if (!aHasOnclick && bHasOnclick) return 1;
            return 0;
        });        // 如果沒找到，嘗試使用 constants 中的選擇器
        if (buttons.length === 0 && constants && constants.SELECTORS && constants.SELECTORS.ORDER_BUTTONS) {
            console.log(`[日期選擇] 使用 constants 選擇器進行搜尋...`);
            buttons = Array.from(document.querySelectorAll(constants.SELECTORS.ORDER_BUTTONS))
                .filter(btn => btn.textContent &&
                    btn.textContent.replace(/\s+/g, '').includes('立即訂購')
                );
        }

        // 如果仍然沒找到，使用廣泛搜尋模式
        if (buttons.length === 0) {
            console.log(`[日期選擇] 啟動廣泛搜尋模式...`);
            const allElements = Array.from(document.querySelectorAll('*'));
            buttons = allElements.filter(el => {
                const text = (el.textContent || '').trim();
                const isClickable = el.tagName.toLowerCase() === 'a' ||
                    el.tagName.toLowerCase() === 'button' ||
                    el.onclick ||
                    el.getAttribute('onclick') ||
                    el.style.cursor === 'pointer';

                const hasOrderKeywords = text.includes('訂購') ||
                    text.includes('購票') ||
                    text.includes('buy') ||
                    text.includes('order');

                return isClickable && hasOrderKeywords && text.length < 100;
            });

            console.log(`[日期選擇] 廣泛搜尋找到 ${buttons.length} 個可能元素`);
        }

        console.log(`[日期選擇] 找到 ${buttons.length} 個可能的訂購連結`);

        // 記錄找到的按鈕詳細資訊
        if (buttons.length > 0) {
            console.log(`[日期選擇] 連結詳細資訊：`);
            buttons.slice(0, 8).forEach((btn, index) => {
                const text = (btn.textContent || btn.value || '').trim();
                const tag = btn.tagName.toLowerCase();
                const className = btn.className || '無';
                const onclick = btn.onclick ? '有 onclick' : '無 onclick';
                const href = btn.href || '無 href';
                console.log(`[日期選擇] 連結 ${index + 1}: "${text}" <${tag}> class="${className}" ${onclick}`);
                if (href !== '無 href') {
                    console.log(`    └─ href: "${href}"`);
                }
            });
        }

        return buttons;
    },// 根據日期查找對應按鈕
    findButtonByDate(buttons, targetDate) {
        const target = new Date(targetDate);
        const targetDateStr = this.formatDate(target);
        const textCache = new Map(); // 建立快取以避免重複讀取相同容器的文字內容

        console.log(`[日期選擇] 目標日期格式: ${targetDateStr} (${target.toLocaleDateString()})`);

        for (const button of buttons) {
            // 擴大搜尋範圍，特別針對表格結構
            const containers = [
                button.closest('tr'), // 表格行
                button.closest('.show-info, .event-row, .performance, .item, .date-item'), // 常見的演出資訊容器
                button.parentElement // 直接父元素
            ].filter(Boolean);

            // 使用 Set 避免重複處理相同的容器
            for (const container of new Set(containers)) {
                let fullText;
                if (textCache.has(container)) {
                    fullText = textCache.get(container);
                } else {
                    fullText = container.textContent || '';
                    textCache.set(container, fullText);
                }

                // 快速檢查，如果文字中連年份或月日都不包含，就跳過耗時的正則表達式解析
                const targetMonth = (target.getMonth() + 1).toString();
                const targetDay = target.getDate().toString();
                if (!fullText.includes(target.getFullYear().toString()) && !(fullText.includes(targetMonth) && fullText.includes(targetDay))) {
                    continue;
                }

                // 提取可能的日期格式
                const dateMatches = this.extractDatesFromText(fullText);
                for (const dateMatch of dateMatches) {
                    if (this.isSameDate(dateMatch, target)) {
                        console.log(`[日期選擇] 匹配成功！目標: ${targetDateStr}, 找到: ${this.formatDate(dateMatch)}`);
                        console.log(`[日期選擇] 匹配的容器文字: "${fullText.trim().substring(0, 150)}..."`);
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
                    // console.log(`[日期選擇] 提取到日期: ${this.formatDate(date)} (格式: ${type}, 原文: "${match[0]}")`); // 註解掉以提升效能
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

    // 檢查目標日期是否已售完
    checkIfSoldOut(button, targetDate) {
        const containers = [
            button.closest('tr'),
            button.closest('div, td, li, .item, .date-item'),
            button.closest('.show-info, .event-row, .performance'),
            button.parentElement,
            button
        ].filter(Boolean);

        for (const container of containers) {
            const fullText = container.textContent || '';
            console.log(`[日期選擇] 檢查已售完狀態: "${fullText.trim().substring(0, 150)}..."`);

            // 檢查是否包含已售完相關文字
            const soldOutKeywords = [
                '已售完', '售完', 'sold out', 'soldout',
                '暫停販售', '停售', '無法購買',
                '不可購買', '已額滿', '額滿',
                'unavailable', 'not available'
            ];

            for (const keyword of soldOutKeywords) {
                if (fullText.toLowerCase().includes(keyword.toLowerCase())) {
                    console.log(`[日期選擇] 發現已售完關鍵字: "${keyword}"`);
                    return true;
                }
            }

            // 檢查按鈕是否被禁用
            if (button.disabled || button.classList.contains('disabled')) {
                console.log(`[日期選擇] 按鈕已被禁用`);
                return true;
            }

            // 檢查是否有售完的 CSS 類別
            const soldOutClasses = ['sold-out', 'soldout', 'disabled', 'unavailable'];
            for (const cls of soldOutClasses) {
                if (container.classList.contains(cls)) {
                    console.log(`[日期選擇] 發現已售完 CSS 類別: "${cls}"`);
                    return true;
                }
            }
        }

        return false;
    },

    // 嘗試點擊按鈕
    async attemptClickButton(button) {
        const utils = window.TicketHelperUtils;
        const constants = window.TicketHelperConstants;

        try {
            console.log(`[日期選擇] 點擊目標日期按鈕`);
            button.click();

            // 等待一段時間檢查頁面是否有變化
            await utils.sleep(constants.TIMEOUTS.MEDIUM_WAIT);

            // 檢查是否成功跳轉（URL變化或頁面內容變化）
            const currentUrl = window.location.href;
            console.log(`[日期選擇] 點擊後URL: ${currentUrl}`);

            // 如果仍在同一頁面且沒有明顯變化，判斷為點擊失敗
            if (this.isStillOnDateSelectionPage()) {
                console.warn(`[日期選擇] 點擊後頁面無變化，可能未開賣或無效`);
                return false;
            }

            return true;
        } catch (error) {
            console.error(`[日期選擇] 點擊失敗: ${error.message}`);
            return false;
        }
    },

    // 檢查是否仍在日期選擇頁面
    isStillOnDateSelectionPage() {
        // 檢查頁面上是否仍有日期選擇相關元素
        const dateElements = document.querySelectorAll('a[onclick*="order"], a[onclick*="buy"], .btn-order, table tr');
        return dateElements.length > 0;
    },    // 處理已售完的重試
    async handleSoldOutRetry(config) {
        this.retryCount++;
        console.log(`[日期選擇] 目標日期已售完，重新整理頁面等待開賣... (第 ${this.retryCount} 次重試)`);

        await this.waitAndRefresh();        // 重新整理後重新開始處理（縮短等待時間）
        setTimeout(() => {
            this.handle(config);
        }, 400); // 縮短到400ms
    },    // 處理點擊失敗的重試
    async handleClickFailureRetry(config) {
        this.retryCount++;
        console.log(`[日期選擇] 點擊失敗，重新整理頁面... (第 ${this.retryCount} 次重試)`);

        await this.waitAndRefresh(); setTimeout(() => {
            this.handle(config);
        }, 400); // 縮短到400ms
    },

    // 處理找不到按鈕的重試
    async handleNotFoundRetry(config) {
        this.retryCount++;
        console.log(`[日期選擇] 找不到目標日期按鈕，重新整理頁面... (第 ${this.retryCount} 次重試)`);

        await this.waitAndRefresh(); setTimeout(() => {
            this.handle(config);
        }, 400); // 縮短到400ms
    },    // 處理找不到任何按鈕的重試
    async handleNoButtonsFoundRetry(config) {
        this.retryCount++;
        console.log(`[日期選擇] 找不到立即訂購按鈕，重新整理頁面... (第 ${this.retryCount} 次重試)`);

        await this.waitAndRefresh(); setTimeout(() => {
            this.handle(config);
        }, 400); // 縮短到400ms
    },// 等待並重新整理頁面
    async waitAndRefresh() {
        const utils = window.TicketHelperUtils;        // 隨機等待時間避免過於頻繁（縮短到100-600ms）
        const waitTime = Math.random() * 500 + 100; // 100-600毫秒隨機等待
        console.log(`[日期選擇] 等待 ${Math.round(waitTime)}ms 後重新整理...`);

        await utils.sleep(waitTime);

        console.log(`[日期選擇] 重新整理頁面...`);
        window.location.reload();
    }
};
