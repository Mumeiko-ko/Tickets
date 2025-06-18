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
        logDiv.style.position = 'fixed';
        logDiv.style.top = '16px';
        logDiv.style.right = '16px';
        logDiv.style.zIndex = '99999';
        logDiv.style.background = 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(35,35,35,0.95))';
        logDiv.style.backdropFilter = 'blur(10px)';
        logDiv.style.border = '2px solid rgba(255,255,255,0.1)';
        logDiv.style.color = '#fff';
        logDiv.style.fontSize = '13px';
        logDiv.style.fontFamily = 'Consolas, Monaco, "Courier New", monospace';
        logDiv.style.width = '420px';
        logDiv.style.maxHeight = '65vh';
        logDiv.style.overflowY = 'auto';
        logDiv.style.borderRadius = '12px';
        logDiv.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)';
        logDiv.style.padding = '0';
        logDiv.style.pointerEvents = 'auto';
        logDiv.style.lineHeight = '1.5';

        logDiv.innerHTML = `
          <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); padding: 16px; border-radius: 12px 12px 0 0; border-bottom: 2px solid rgba(255,255,255,0.1);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 12px; height: 12px; background: #00ff88; border-radius: 50%; box-shadow: 0 0 8px #00ff88;"></div>
              <span style="font-weight: bold; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">無名子自動搶票小幫手</span>
            </div>
          </div>
          
          <div style="padding: 16px; background: rgba(0,0,0,0.2); border-radius: 0 0 12px 12px;">
            <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 16px;">
              <form id="ticket-helper-form" style="display: grid; gap: 12px;">
                <div style="display: grid; grid-template-columns: 1fr 80px; gap: 10px;">
                  <div style="position: relative;">
                    <input id="th-area" type="text" placeholder="場區關鍵字" required
                      style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff; font-size: 13px; transition: all 0.3s ease;">
                    <label style="position: absolute; top: -8px; left: 8px; background: linear-gradient(90deg, #667eea, #764ba2); padding: 2px 8px; border-radius: 4px; font-size: 10px; color: #fff;">場區</label>
                  </div>
                  <div style="position: relative;">
                    <select id="th-qty" style="width: 100%; padding: 10px 32px 10px 8px; background: rgba(40,40,40,0.9); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff; font-size: 13px; cursor: pointer;">
                      <option value="1" style="background: #2c2c2c; color: #ffffff;">1 張</option>
                      <option value="2" style="background: #2c2c2c; color: #ffffff;">2 張</option>
                      <option value="3" style="background: #2c2c2c; color: #ffffff;">3 張</option>
                      <option value="4" style="background: #2c2c2c; color: #ffffff;">4 張</option>
                    </select>
                    <label style="position: absolute; top: -8px; left: 8px; background: linear-gradient(90deg, #667eea, #764ba2); padding: 2px 8px; border-radius: 4px; font-size: 10px; color: #fff;">數量</label>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: center; padding: 8px; background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.2); border-radius: 6px;">
                  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
                    <input id="th-semi-auto" type="checkbox" style="width: 16px; height: 16px; accent-color: #00ff88;">
                    <span style="font-size: 13px; color: #00ff88; font-weight: 500;">🤖 半自動模式</span>
                  </label>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">
                  <button id="th-start" type="submit" 
                    style="padding: 12px 16px; background: linear-gradient(45deg, #00ff88, #00cc6a); color: #000; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,255,136,0.3);">
                    🚀 戰爭開始
                  </button>
                  <button id="th-stop" type="button" 
                    style="padding: 12px 16px; background: linear-gradient(45deg, #ff4757, #ff3742); color: #fff; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(255,71,87,0.3);">
                    ⏹️ 戰爭結束
                  </button>
                </div>
              </form>
            </div>
            
            <div id="log-container" style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; max-height: 300px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); font-family: Consolas, monospace; font-size: 12px;">
              <div style="color: #00ff88; margin-bottom: 8px; font-weight: bold;">📋 執行日誌</div>
            </div>
          </div>
        `;

        document.body.appendChild(logDiv);
        this.addStyles();
    },

    // 添加樣式
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #ticket-helper-log input:focus {
                outline: none;
                border-color: rgba(0,255,136,0.6) !important;
                box-shadow: 0 0 0 2px rgba(0,255,136,0.2) !important;
                background: rgba(0,255,136,0.1) !important;
            }
            #ticket-helper-log select:focus {
                outline: none;
                border-color: rgba(0,255,136,0.6) !important;
                box-shadow: 0 0 0 2px rgba(0,255,136,0.2) !important;
            }
            #th-qty {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
                background-repeat: no-repeat;
                background-position: right 8px center;
                background-size: 16px;
                padding-right: 32px !important;
            }
            #th-qty option {
                background: #2c2c2c !important;
                color: #ffffff !important;
                padding: 8px 12px !important;
                border: none !important;
            }
            #th-qty option:hover {
                background: #404040 !important;
                color: #00ff88 !important;
            }
            #th-qty option:checked {
                background: #00ff88 !important;
                color: #000000 !important;
            }
            #th-start:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 20px rgba(0,255,136,0.4) !important;
                background: linear-gradient(45deg, #00ff88, #00aa55) !important;
            }
            #th-stop:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 20px rgba(255,71,87,0.4) !important;
                background: linear-gradient(45deg, #ff4757, #ee2233) !important;
            }
            #ticket-helper-log button:active {
                transform: translateY(0px) !important;
            }
            #log-container::-webkit-scrollbar {
                width: 6px;
            }
            #log-container::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.1);
                border-radius: 3px;
            }
            #log-container::-webkit-scrollbar-thumb {
                background: rgba(0,255,136,0.6);
                border-radius: 3px;
            }
            #log-container::-webkit-scrollbar-thumb:hover {
                background: rgba(0,255,136,0.8);
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(0,255,136,0.7); }
                70% { box-shadow: 0 0 0 10px rgba(0,255,136,0); }
                100% { box-shadow: 0 0 0 0 rgba(0,255,136,0); }
            }
            .pulse-effect {
                animation: pulse 2s infinite !important;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                20%, 40%, 60%, 80% { transform: translateX(2px); }
            }
        `;
        document.head.appendChild(style);
    },

    // 設置事件監聽器
    setupEventListeners() {
        // 戰爭開始按鈕
        document.getElementById('ticket-helper-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStart();
        });

        // 戰爭結束按鈕
        document.getElementById('th-stop').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleStop();
        });
    },

    // 處理開始按鈕
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
                areaKeyword: areaKeyword,
                ticketQuantity: ticketQuantity,
                isRunning: true,
                semiAutoMode: semiAutoMode
            }
        }, () => {
            const mode = semiAutoMode ? '🤖 半自動模式' : '⚡ 全自動模式';
            this.appendLog(`✅ 設定已儲存，流程啟動！(${mode})`, '#00ff88');
            this.appendLog(`🎯 目標場區: ${areaKeyword}`, '#00bfff');
            this.appendLog(`🎫 票券數量: ${ticketQuantity} 張`, '#00bfff');

            setTimeout(() => location.reload(), 1000);
        });
    },

    // 處理停止按鈕
    handleStop() {
        const stopBtn = document.getElementById('th-stop');

        stopBtn.innerHTML = '⏳ 停止中...';
        stopBtn.style.background = 'linear-gradient(45deg, #orange, #red)';
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

    // 添加日誌
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

        // 限制日誌條數
        const constants = window.TicketHelperConstants;
        const logs = logContainer.children;
        if (logs.length > constants.RETRY.MAX_LOG_ENTRIES) {
            for (let i = 1; i < constants.RETRY.OLD_LOG_CLEANUP; i++) {
                if (logs[i]) logs[i].remove();
            }
        }
    },

    // 攔截 console
    overrideConsole() {
        const rawLog = console.log;
        const rawErr = console.error;

        console.log = (...args) => {
            this.appendLog(args.join(' '));
            rawLog.apply(console, args);
        };

        console.error = (...args) => {
            this.appendLog(args.join(' '), '#ff7070');
            rawErr.apply(console, args);
        };
    }
};
