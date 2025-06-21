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
        logDiv.id = 'ticket-helper-log'; Object.assign(logDiv.style, {
            position: 'fixed', top: '16px', right: '16px', zIndex: '99999',
            background: 'linear-gradient(135deg, rgba(24,28,36,0.75) 0%, rgba(35,39,47,0.75) 100%)', color: '#e0e0e0',
            fontSize: '13px', fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            width: '420px', maxHeight: '85vh', overflowY: 'auto', borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
            padding: '0', pointerEvents: 'auto', lineHeight: '1.4', border: '3px solid #23272f',
        });
        logDiv.innerHTML = `          <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); padding: 12px; border-radius: 12px 12px 0 0; border-bottom: 2px solid #23272f;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 10px; height: 10px; background: #00ff88; border-radius: 50%; box-shadow: 0 0 6px #00ff88;"></div>
              <span style="font-weight: bold; font-size: 15px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">無名子自動搶票小幫手</span>
            </div>
          </div>
          <div style="padding: 12px; background: rgba(0,0,0,0.2); border-radius: 0 0 12px 12px;">            <div style="background: #23272f; border-radius: 10px; padding: 14px; border: 3px solid #667eea; margin-bottom: 12px; box-shadow: 0 4px 16px rgba(102,126,234,0.15);">
              <div style="color: #667eea; margin-bottom: 10px; font-weight: bold; text-align: center; font-size: 14px; border-bottom: 1px solid #667eea; padding-bottom: 6px;">🎯 搶票設定</div>
              <form id="ticket-helper-form" style="display: grid; gap: 10px;">
                <div style="display: grid; grid-template-columns: 1fr 80px; gap: 10px;">                  <div style="position: relative;">
                    <label style="display: block; margin-bottom: 4px; background: linear-gradient(90deg, #667eea, #764ba2); padding: 2px 8px; border-radius: 4px; font-size: 13px; color: #fff; width: max-content; text-align: left; position: static; transform: none; box-shadow: 0 1px 3px rgba(102,126,234,0.3);">場區</label>
                    <input id="th-area" type="text" placeholder="場區關鍵字" required style="width: 100%; padding: 10px 12px; background: #1a1e26; border: 2px solid #667eea; border-radius: 6px; color: #e0e0e0; font-size: 13px; transition: border-color 0.3s ease;">
                  </div>                  <div style="position: relative;">
                    <label style="display: block; margin-bottom: 4px; background: linear-gradient(90deg, #667eea, #764ba2); padding: 2px 8px; border-radius: 4px; font-size: 13px; color: #fff; width: max-content; text-align: left; position: static; transform: none; box-shadow: 0 1px 3px rgba(102,126,234,0.3);">數量</label>
                    <select id="th-qty" style="width: 100%; padding: 10px 38px 10px 8px; background: #1a1e26; border: 2px solid #667eea; border-radius: 6px; color: #e0e0e0; font-size: 13px; cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill=\'white\' height=\'20\' viewBox=\'0 0 24 24\' width=\'20\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>'); background-repeat: no-repeat; background-position: right 10px center; background-size: 18px; transition: border-color 0.3s ease;">
                      <option value="1">1 張</option>
                      <option value="2">2 張</option>
                      <option value="3">3 張</option>
                      <option value="4">4 張</option>
                    </select>
                  </div>
                </div>
                <div style="background: rgba(102,126,234,0.05); border: 2px solid rgba(102,126,234,0.3); border-radius: 8px; padding: 10px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">                    <div style="position: relative;">
                      <label style="display: block; margin-bottom: 4px; background: linear-gradient(90deg, #667eea, #764ba2); padding: 2px 8px; border-radius: 4px; font-size: 13px; color: #fff; width: max-content; text-align: left; position: static; transform: none; box-shadow: 0 1px 3px rgba(102,126,234,0.3);">演出日期</label>
                      <input id="th-performance-date" type="date" style="width: 100%; padding: 10px 12px; background: #1a1e26; border: 2px solid #667eea; border-radius: 6px; color: #e0e0e0; font-size: 13px; transition: border-color 0.3s ease;" placeholder="選擇演出日期（可選）" title="選擇演出日期後將自動點擊對應日期的立即訂購按鈕">
                    </div>
                    <div style="display: flex; align-items: end;">
                      <div style="padding: 6px; background: rgba(102,126,234,0.15); border: 1px solid #667eea; border-radius: 6px; font-size: 9px; color: #8b9beb; text-align: center; width: 100%; line-height: 1.2; box-shadow: 0 1px 4px rgba(102,126,234,0.2);">
                        💡 自動選擇對應日期<br>
                        <span style="opacity: 0.8;">支援多種格式識別</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style="background: rgba(0,255,136,0.05); border: 2px solid rgba(0,255,136,0.4); border-radius: 8px; padding: 8px; display: flex; align-items: center; justify-content: center;">
                  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
                    <input id="th-semi-auto" type="checkbox" style="width: 16px; height: 16px; accent-color: #00ff88;">
                    <span style="font-size: 13px; color: #00ff88; font-weight: 600;">🤖 半自動模式</span>
                  </label>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <button id="th-start" type="submit" style="padding: 12px 16px; background: linear-gradient(45deg, #00ff88, #00cc6a); color: #181c24; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(0,255,136,0.4); border: 2px solid transparent;">🚀 戰爭開始</button>
                  <button id="th-stop" type="button" style="padding: 12px 16px; background: linear-gradient(45deg, #ff4757, #ff3742); color: #fff; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(255,71,87,0.4); border: 2px solid transparent;">❌ 戰爭結束</button>
                </div>
              </form>
            </div>
            <div style="background: #23272f; border-radius: 10px; padding: 14px; border: 3px solid #ffa502; margin-bottom: 12px; box-shadow: 0 4px 16px rgba(255,165,2,0.15);">
              <div style="color: #ffa502; margin-bottom: 10px; font-weight: bold; text-align: center; font-size: 14px; border-bottom: 1px solid #ffa502; padding-bottom: 6px;">⏰ 定時搶票</div>
              <div style="margin-bottom: 10px;">
                <div style="position: relative;">
                  <label style="display: block; margin-bottom: 4px; background: linear-gradient(90deg, #ffa502, #ff7675); padding: 2px 8px; border-radius: 4px; font-size: 13px; color: #fff; width: max-content; text-align: left; position: static; transform: none; box-shadow: 0 1px 3px rgba(255,165,2,0.3);">搶票時間</label>
                  <input id="th-scheduled-time" type="datetime-local" style="width: 100%; padding: 10px 12px; background: #1a1e26; border: 2px solid #ffa502; border-radius: 6px; color: #e0e0e0; font-size: 13px; transition: border-color 0.3s ease;">
                </div>
              </div>
              <div id="countdown-display" style="padding: 10px; background: rgba(0,0,0,0.4); border-radius: 6px; text-align: center; margin-bottom: 10px; border: 2px solid #333; color: #ccc; font-size: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);">請先設定搶票時間</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button id="th-start-scheduled" type="button" style="padding: 12px 16px; background: linear-gradient(45deg, #667eea, #764ba2); color: #fff; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(102,126,234,0.4); border: 2px solid transparent;">⏰ 開始定時</button>
                <button id="th-stop-scheduled" type="button" style="padding: 12px 16px; background: linear-gradient(45deg, #6c757d, #495057); color: #fff; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(108,117,125,0.4); border: 2px solid transparent;">❌ 取消定時</button>
              </div>
            </div>
            <div id="log-container" style="background: #181c24; border-radius: 10px; padding: 12px; max-height: 200px; overflow-y: auto; border: 3px solid #00ff88; font-family: Consolas, monospace; font-size: 11px; box-shadow: 0 4px 16px rgba(0,255,136,0.15);">
              <div style="color: #00ff88; margin-bottom: 8px; font-weight: bold; text-align: center; font-size: 13px; border-bottom: 1px solid #00ff88; padding-bottom: 4px;">📋 執行紀錄</div>
            </div>
          </div>
        `;
        document.body.appendChild(logDiv);
        this.addStyles();
    },    // 添加樣式
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 讓日期選擇器小圖示為白色 */
            #th-scheduled-time::-webkit-calendar-picker-indicator,
            #th-performance-date::-webkit-calendar-picker-indicator {
                filter: invert(1);
                cursor: pointer;
            }
            
            /* 輸入框 focus 效果 */
            #ticket-helper-log input:focus, #ticket-helper-log select:focus {
                outline: none;
                border-color: #00ff88 !important;
                box-shadow: 0 0 0 3px rgba(0,255,136,0.25) !important;
                background: #1a1e26 !important;
                transform: scale(1.02);
                transition: all 0.3s ease;
            }
            
            /* 下拉選單選項樣式 */
            #ticket-helper-log select option {
                background: #1a1e26 !important;
                color: #e0e0e0 !important;
                padding: 8px;
            }
            
            /* 按鈕 hover 和 active 效果 */
            #ticket-helper-log button:hover {
                transform: translateY(-2px) scale(1.05) !important;
                box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
                transition: all 0.3s ease !important;
            }
            
            #ticket-helper-log button:active {
                transform: translateY(0px) scale(1.02) !important;
                transition: all 0.1s ease !important;
            }
            
            /* 特定按鈕 hover 效果 */
            #th-start:hover {
                box-shadow: 0 8px 30px rgba(0,255,136,0.6) !important;
            }
            
            #th-stop:hover {
                box-shadow: 0 8px 30px rgba(255,71,87,0.6) !important;
            }
            
            #th-start-scheduled:hover {
                box-shadow: 0 8px 30px rgba(102,126,234,0.6) !important;
            }
            
            #th-stop-scheduled:hover {
                box-shadow: 0 8px 30px rgba(108,117,125,0.6) !important;
            }
            
            /* 日誌容器滾動條 */
            #log-container::-webkit-scrollbar {
                width: 8px;
            }
            #log-container::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #00ff88, #00cc6a) !important;
                border-radius: 4px;
            }
            #log-container::-webkit-scrollbar-track {
                background: #181c24 !important;
                border-radius: 4px;
            }
              /* 動畫效果 */
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
                20%, 40%, 60%, 80% { transform: translateX(3px); }
            }
            
            /* Checkbox 樣式增強 */
            #th-semi-auto {
                transition: transform 0.2s ease;
            }
            
            #th-semi-auto:checked {
                transform: scale(1.1);
            }
            
            /* 標籤發光效果 */
            #ticket-helper-log label[style*="linear-gradient"] {
                transition: all 0.3s ease;
            }
            
            #ticket-helper-log label[style*="linear-gradient"]:hover {
                transform: scale(1.05);
                filter: brightness(1.1);
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
        startBtn.disabled = true; chrome.storage.local.set({
            ticketConfig: {
                areaKeyword, ticketQuantity, isRunning: true, semiAutoMode,
                performanceDate: document.getElementById('th-performance-date').value
            }
        }, () => {
            const mode = semiAutoMode ? '🤖 半自動模式' : '⚡ 全自動模式';
            this.appendLog(`✅ 設定已儲存，流程啟動！(${mode})`, '#00ff88');
            this.appendLog(`🎯 目標場區: ${areaKeyword}`, '#00bfff');
            this.appendLog(`🎫 票券數量: ${ticketQuantity} 張`, '#00bfff');

            const performanceDate = document.getElementById('th-performance-date').value;
            if (performanceDate) {
                this.appendLog(`📅 演出日期: ${new Date(performanceDate).toLocaleDateString()}`, '#00bfff');
            } else {
                this.appendLog(`📅 演出日期: 未指定（將點擊第一個可用按鈕）`, '#ccc');
            }

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
        logContainer.scrollTop = logContainer.scrollHeight;        // 限制日誌條數為4條（含標題）
        const logs = logContainer.children;
        while (logs.length > 5) logContainer.removeChild(logs[1]);
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
