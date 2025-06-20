// floatingPanel.js - 浮動控制面板
window.TicketHelperUI = {
    // 初始化浮動面板
    init() {
        if (document.getElementById('ticket-helper-log')) return;
        this.createPanel();
        this.setupEventListeners();
        this.overrideConsole();
    },

    // 創建面板
    createPanel() {
        const logDiv = document.createElement('div');
        logDiv.id = 'ticket-helper-log';
        Object.assign(logDiv.style, {
            position: 'fixed', top: '16px', right: '16px', zIndex: '99999',
            background: 'linear-gradient(135deg, rgba(24,28,36,0.75) 0%, rgba(35,39,47,0.75) 100%)', color: '#e0e0e0',
            fontSize: '13px', fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            width: '420px', maxHeight: '65vh', overflowY: 'auto', borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
            padding: '0', pointerEvents: 'auto', lineHeight: '1.5', border: '2px solid #23272f',
        });
        logDiv.innerHTML = `
          <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); padding: 16px; border-radius: 12px 12px 0 0; border-bottom: 2px solid #23272f;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 12px; height: 12px; background: #00ff88; border-radius: 50%; box-shadow: 0 0 8px #00ff88;"></div>
              <span style="font-weight: bold; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">無名子自動搶票小幫手</span>
            </div>
          </div>
          <div style="padding: 16px; background: rgba(0,0,0,0.2); border-radius: 0 0 12px 12px;">
            <div style="background: #23272f; border-radius: 8px; padding: 16px; border: 1px solid #23272f; margin-bottom: 16px;">
              <form id="ticket-helper-form" style="display: grid; gap: 12px;">
                <div style="display: grid; grid-template-columns: 1fr 80px; gap: 10px; margin-top: 8px;">
                  <div style="position: relative;">
                    <label style="display: block; margin-bottom: 4px; background: linear-gradient(90deg, #667eea, #764ba2); padding: 2px 8px; border-radius: 4px; font-size: 14px; color: #fff; width: max-content; text-align: left; position: static; transform: none;">場區</label>
                    <input id="th-area" type="text" placeholder="場區關鍵字" required style="width: 100%; padding: 10px 12px; background: #23272f; border: 1px solid #333; border-radius: 6px; color: #e0e0e0; font-size: 13px;">
                  </div>
                  <div style="position: relative;">
                    <label style="display: block; margin-bottom: 4px; background: linear-gradient(90deg, #667eea, #764ba2); padding: 2px 8px; border-radius: 4px; font-size: 14px; color: #fff; width: max-content; text-align: left; position: static; transform: none;">數量</label>
                    <select id="th-qty" style="width: 100%; padding: 10px 40px 10px 8px; background: #23272f; border: 1px solid #333; border-radius: 6px; color: #e0e0e0; font-size: 13px; cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill=\'white\' height=\'20\' viewBox=\'0 0 24 24\' width=\'20\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>'); background-repeat: no-repeat; background-position: right 10px center; background-size: 20px;">
                      <option value="1">1 張</option>
                      <option value="2">2 張</option>
                      <option value="3">3 張</option>
                      <option value="4">4 張</option>
                    </select>
                  </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: center; padding: 8px; background: rgba(0,255,136,0.1); border: 1px solid #00ff88; border-radius: 6px;">
                  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
                    <input id="th-semi-auto" type="checkbox" style="width: 16px; height: 16px; accent-color: #00ff88;">
                    <span style="font-size: 13px; color: #00ff88; font-weight: 500;">🤖 半自動模式</span>
                  </label>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">
                  <button id="th-start" type="submit" style="padding: 12px 16px; background: linear-gradient(45deg, #00ff88, #00cc6a); color: #181c24; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,255,136,0.3);">🚀 戰爭開始</button>
                  <button id="th-stop" type="button" style="padding: 12px 16px; background: linear-gradient(45deg, #ff4757, #ff3742); color: #fff; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(255,71,87,0.3);">❌ 戰爭結束</button>
                </div>
              </form>
            </div>
            <div style="background: #23272f; border-radius: 8px; padding: 16px; border: 1px solid #23272f; margin-bottom: 16px;">
              <div style="color: #ffa502; margin-bottom: 12px; font-weight: bold; text-align: center; font-size: 14px;">⏰ 定時搶票</div>
              <div style="margin-bottom: 12px;">
                <div style="position: relative;">
                  <label style="display: block; margin-bottom: 4px; background: linear-gradient(90deg, #667eea, #764ba2); padding: 2px 8px; border-radius: 4px; font-size: 14px; color: #fff; width: max-content; text-align: left; position: static; transform: none;">搶票時間</label>
                  <input id="th-scheduled-time" type="datetime-local" style="width: 100%; padding: 10px 12px; background: #23272f; border: 1px solid #333; border-radius: 6px; color: #e0e0e0; font-size: 13px;">
                </div>
              </div>
              <div id="countdown-display" style="padding: 12px; background: rgba(0,0,0,0.3); border-radius: 6px; text-align: center; margin-bottom: 12px; border: 1px solid #23272f; color: #ccc; font-size: 13px;">請先設定搶票時間</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button id="th-start-scheduled" type="button" style="padding: 12px 16px; background: linear-gradient(45deg, #667eea, #764ba2); color: #fff; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102,126,234,0.3);">⏰ 開始定時</button>
                <button id="th-stop-scheduled" type="button" style="padding: 12px 16px; background: linear-gradient(45deg, #6c757d, #495057); color: #fff; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(108,117,125,0.3);">❌ 取消定時</button>
              </div>
            </div>
            <div id="log-container" style="background: #181c24; border-radius: 8px; padding: 12px; max-height: 300px; overflow-y: auto; border: 1px solid #23272f; font-family: Consolas, monospace; font-size: 12px;">
              <div style="color: #00ff88; margin-bottom: 8px; font-weight: bold;">執行紀錄</div>
            </div>
          </div>
        `;
        document.body.appendChild(logDiv);
        this.addStyles();
    },

    // 添加樣式
    addStyles() {
        // 只保留必要的暗色系樣式，細節可再微調
        const style = document.createElement('style');
        style.textContent = `
            /* 讓日期選擇器小圖示為白色 */
            #th-scheduled-time::-webkit-calendar-picker-indicator {
                filter: invert(1);
            }
            #ticket-helper-log input:focus, #ticket-helper-log select:focus {
                outline: none;
                border-color: #00ff88 !important;
                box-shadow: 0 0 0 2px rgba(0,255,136,0.2) !important;
                background: #23272f !important;
            }
            #ticket-helper-log select option {
                background: #23272f !important;
                color: #e0e0e0 !important;
            }
            #ticket-helper-log button:active {
                transform: translateY(0px) !important;
            }
            #log-container::-webkit-scrollbar {
                width: 6px;
            }
            #log-container::-webkit-scrollbar-thumb {
                background: #333 !important;
            }
            #log-container::-webkit-scrollbar-track {
                background: #23272f !important;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                20%, 40%, 60%, 80% { transform: translateX(2px); }
            }
        `;
        document.head.appendChild(style);
    },

    // 事件監聽
    setupEventListeners() {
        document.getElementById('ticket-helper-form').addEventListener('submit', e => {
            e.preventDefault();
            this.handleStart();
        });
        document.getElementById('th-stop').addEventListener('click', e => {
            e.preventDefault();
            this.handleStop();
        });
        this.setupScheduledEvents();
    },
    setupScheduledEvents() {
        const startBtn = document.getElementById('th-start-scheduled');
        const stopBtn = document.getElementById('th-stop-scheduled');
        const timeInput = document.getElementById('th-scheduled-time');
        startBtn?.addEventListener('click', () => {
            const targetTime = timeInput.value;
            if (!targetTime) {
                this.appendLog('⚠️ 請先選擇搶票時間！', '#ffa502');
                timeInput.style.animation = 'shake 0.5s';
                setTimeout(() => timeInput.style.animation = '', 500);
                return;
            }
            if (new Date(targetTime).getTime() <= Date.now()) {
                this.appendLog('⚠️ 搶票時間必須是未來時間！', '#ffa502');
                timeInput.style.animation = 'shake 0.5s';
                setTimeout(() => timeInput.style.animation = '', 500);
                return;
            }
            const areaKeyword = document.getElementById('th-area').value.trim();
            if (!areaKeyword) {
                this.appendLog('⚠️ 請先設定場區關鍵字！', '#ffa502');
                return;
            }
            this.initializeScheduledTicketing(targetTime);
        });
        stopBtn?.addEventListener('click', () => {
            if (window.scheduledTicketing && window.scheduledTicketing.isCountdownActive()) {
                window.scheduledTicketing.stopCountdown();
                this.updateCountdownDisplay('❌ 已取消定時搶票');
                this.appendLog('🛑 定時搶票已手動取消', '#ff7070');
            } else {
                this.appendLog('⚠️ 目前沒有進行中的定時搶票', '#ffa502');
            }
        });
    },

    // 處理開始/停止
    handleStart() {
        const startBtn = document.getElementById('th-start');
        const areaKeyword = document.getElementById('th-area').value.trim();
        const ticketQuantity = document.getElementById('th-qty').value;
        const semiAutoMode = document.getElementById('th-semi-auto').checked;
        if (!areaKeyword) {
            this.appendLog('❌ 請輸入場區關鍵字！', '#ff7070');
            const areaInput = document.getElementById('th-area');
            areaInput.style.animation = 'shake 0.5s';
            setTimeout(() => areaInput.style.animation = '', 500);
            return;
        }
        startBtn.innerHTML = '🔄 啟動中...';
        startBtn.style.background = 'linear-gradient(45deg, #ffa502, #ff6348)';
        startBtn.disabled = true;
        chrome.storage.local.set({
            ticketConfig: {
                areaKeyword, ticketQuantity, isRunning: true, semiAutoMode
            }
        }, () => {
            const mode = semiAutoMode ? '🤖 半自動模式' : '⚡ 全自動模式';
            this.appendLog(`✅ 設定已儲存，流程啟動！(${mode})`, '#00ff88');
            this.appendLog(`🎯 目標場區: ${areaKeyword}`, '#00bfff');
            this.appendLog(`🎫 票券數量: ${ticketQuantity} 張`, '#00bfff');
            // 立即觸發購票主流程（不 reload）
            if (window.TicketHelperRouter && typeof window.TicketHelperRouter.start === 'function') {
                window.TicketHelperRouter.start();
            } else {
                this.appendLog('⚠️ 主流程未載入，請確認 TicketHelperRouter 是否正確注入', '#ffa502');
            }
            // UI 1秒後恢復按鈕狀態
            setTimeout(() => {
                startBtn.innerHTML = '🚀 戰爭開始';
                startBtn.style.background = 'linear-gradient(45deg, #00ff88, #00cc6a)';
                startBtn.disabled = false;
            }, 1000);
        });
    },
    handleStop() {
        const stopBtn = document.getElementById('th-stop');
        stopBtn.innerHTML = '⏳ 停止中...';
        stopBtn.style.background = 'linear-gradient(45deg, #ffa502, #ff6348)';
        stopBtn.disabled = true;
        chrome.storage.local.remove('ticketConfig', () => {
            this.appendLog('🛑 搶票流程已手動停止！', '#ff7070');
            this.appendLog('💤 系統進入待機狀態', '#ffa502');
            setTimeout(() => {
                stopBtn.innerHTML = '⏹️ 戰爭結束';
                stopBtn.style.background = 'linear-gradient(45deg, #ff4757, #ff3742)';
                stopBtn.disabled = false;
            }, 1000);
        });
    },

    // 日誌與倒數
    appendLog(msg, color = '#fff') {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;
        const p = document.createElement('div');
        p.style.padding = '4px 0';
        p.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        p.style.color = color;
        p.style.wordBreak = 'break-word';
        const timestamp = new Date().toLocaleTimeString();
        const timestampSpan = document.createElement('span');
        timestampSpan.textContent = `[${timestamp}] `;
        timestampSpan.style.color = 'rgba(255,255,255,0.5)';
        timestampSpan.style.fontSize = '11px';
        p.appendChild(timestampSpan);
        p.appendChild(document.createTextNode(msg));
        logContainer.appendChild(p);
        logContainer.scrollTop = logContainer.scrollHeight;
        // 限制日誌條數為5條（含標題）
        const logs = logContainer.children;
        while (logs.length > 6) logContainer.removeChild(logs[1]);
    },
    updateCountdownDisplay(text) {
        const display = document.getElementById('countdown-display');
        if (display) {
            display.textContent = text;
            if (text.includes('⏰')) {
                display.style.background = 'rgba(0,0,0,0.3)';
                display.style.color = '#ccc';
                display.style.border = '1px solid #23272f';
            }
        }
    },

    // Console 攔截
    overrideConsole() {
        const rawLog = console.log;
        const rawErr = console.error;
        console.log = (...args) => { this.appendLog(args.join(' ')); rawLog.apply(console, args); };
        console.error = (...args) => { this.appendLog(args.join(' '), '#ff7070'); rawErr.apply(console, args); };
    },

    // 定時搶票初始化
    initializeScheduledTicketing(targetTime) {
        try {
            if (!window.TimeSync) return this.appendLog('❌ 時間同步服務未載入', '#ff7070');
            if (!window.ScheduledTicketing) return this.appendLog('❌ 定時搶票服務未載入', '#ff7070');
            if (!window.timeSync) window.timeSync = new window.TimeSync();
            if (!window.scheduledTicketing) window.scheduledTicketing = new window.ScheduledTicketing(window.timeSync, window.TicketHelperRouter);
            window.scheduledTicketing.setScheduledTime(targetTime);
            window.scheduledTicketing.startCountdown({
                onCountdown: (countdown, remainingMs) => {
                    this.updateCountdownDisplay(`倒數 ${countdown}`);
                    const display = document.getElementById('countdown-display');
                    if (remainingMs <= 30000) {
                        display.style.background = 'rgba(255,165,2,0.2)';
                        display.style.color = '#ffa502';
                        display.style.border = '1px solid #ffa502';
                    }
                },
                onStart: () => {
                    this.updateCountdownDisplay('🚀 搶票開始執行！');
                    this.appendLog('⏰ 定時搶票時間到！開始自動搶票...', '#00ff88');
                },
                onError: (error) => {
                    this.updateCountdownDisplay('❌ 執行失敗');
                    this.appendLog(`❌ 定時搶票執行失敗: ${error.message}`, '#ff7070');
                }
            });
            this.appendLog(`✅ 定時搶票已設定: ${new Date(targetTime).toLocaleString()}`, '#00ff88');
        } catch (error) {
            this.appendLog(`❌ 定時搶票設定失敗: ${error.message}`, '#ff7070');
        }
    }
};
