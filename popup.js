// popup.js - 引導功能
document.getElementById('goto-tixcraft').addEventListener('click', () => {
    chrome.tabs.create({
        url: 'https://tixcraft.com',
        active: true
    });
    window.close();
});

document.getElementById('goto-ticketplus').addEventListener('click', () => {
    chrome.tabs.create({
        url: 'https://ticketplus.com.tw',
        active: true
    });
    window.close();
});