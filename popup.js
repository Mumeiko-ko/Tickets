document.getElementById('start-button').addEventListener('click', () => {
    const areaKeyword = document.getElementById('area-keyword').value;
    const ticketQuantity = document.getElementById('ticket-quantity').value;

    if (!areaKeyword) {
        alert('請輸入場區關鍵字！');
        return;
    }

    // 將設定儲存到 chrome.storage
    chrome.storage.local.set({
        ticketConfig: {
            areaKeyword: areaKeyword,
            ticketQuantity: ticketQuantity,
            isRunning: true // 新增一個狀態旗標，表示腳本正在運行
        }
    }, () => {
        // 自動關閉 popup
        window.close();
        // 可選：自動重新整理當前頁面以啟動流程
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.reload(tabs[0].id);
        });
    });
});