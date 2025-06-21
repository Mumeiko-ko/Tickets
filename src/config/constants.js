// constants.js - 常數配置
window.TicketHelperConstants = {
    // 頁面URL路徑
    PATHS: {
        ACTIVITY_DETAIL: '/activity/detail/',
        TICKET_AREA: '/ticket/area/',
        ACTIVITY_GAME: '/activity/game/',
        GAME: '/game/',
        TICKET_PAGE: '/ticket/ticket/'
    },

    // DOM選擇器
    SELECTORS: {
        // 活動頁
        BUY_BUTTON: '#tab-func li.buy a',
        ORDER_BUTTONS: 'button',

        // 區域選擇頁
        AREA_SELECTORS: [
            'li.select_form_b a',
            'li.select_form_a a',
            '.zone.area-list li a',
            '.area-list a',
            'li[class*="select_form"] a',
            '.select_form_a a',
            'ul[id*="group"] li a'
        ],
        AREA_CONTAINERS: [
            '.zone.area-list',
            'li.select_form_a',
            'li.select_form_b'
        ],

        // 票券數量頁
        QUANTITY_SELECT: 'select.form-select',
        AGREE_CHECKBOX: 'input[type="checkbox"]',
        CAPTCHA_INPUT: '#TicketForm_verifyCode',
        CAPTCHA_IMAGE: '#TicketForm_verifyCode-image',
        CONFIRM_BUTTON: 'button.btn-primary',

        // 錯誤訊息
        ERROR_SELECTORS: '.alert-danger, .error, .text-danger, [class*="error"]',

        // 日期選擇按鈕
        DATE_BUTTONS: 'button.date-item' // 假設日期按鈕的 class 為 date-item
    },

    // 時間設定
    TIMEOUTS: {
        ELEMENT_WAIT: 5000,
        SHORT_WAIT: 100,
        MEDIUM_WAIT: 500,
        LONG_WAIT: 1000,
        POPUP_WAIT: 800,
        INPUT_WAIT: 200,
        SUBMIT_WAIT: 2000
    },

    // 重試設定
    RETRY: {
        INTERVAL: 500,
        SUBMIT_COOLDOWN: 3000,
        MAX_LOG_ENTRIES: 100,
        OLD_LOG_CLEANUP: 20
    },

    // API設定
    API: {
        CAPTCHA_URL: 'http://127.0.0.1:9988/solve',
        CONTENT_TYPE: 'application/json'
    },

    // 文字識別
    TEXT: {
        SOLD_OUT_KEYWORDS: ["已售完", "Sold Out", "售完", "soldout"],
        ERROR_KEYWORDS: ['驗證碼', 'verification', 'captcha', '錯誤', 'invalid', 'incorrect'],
        CONFIRM_BUTTON_TEXT: '確認張數',
        ORDER_BUTTON_TEXT: '立即訂購'
    }
};
