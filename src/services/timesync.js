class TimeSync {
    constructor() {
        this.serverTimeOffset = 0; // 與伺服器時間的偏移量（毫秒）
        this.lastSyncTime = 0;
        this.syncInterval = null;
        this.retryCount = 0;
        this.maxRetries = 3; // 時間同步最大重試次數
    }

    // 獲取伺服器時間（帶重試機制）
    async getServerTime(retryCount = 0) {
        try {
            const response = await fetch('https://tixcraft.com/', {
                method: 'HEAD',
                cache: 'no-cache',
                timeout: 5000 // 5秒超時
            });

            const serverTime = new Date(response.headers.get('Date')).getTime();
            const localTime = Date.now();

            // 計算時間偏移量
            this.serverTimeOffset = serverTime - localTime;
            this.lastSyncTime = localTime;
            this.retryCount = 0; // 重置重試計數

            console.log(`✅ 時間同步完成，偏移量: ${this.serverTimeOffset}ms`);
            return serverTime;
        } catch (error) {
            console.warn(`⚠️ 時間同步失敗 (第 ${retryCount + 1} 次): ${error.message}`);
            
            if (retryCount < this.maxRetries) {
                // 隨機等待 100-600ms 後重試
                const waitTime = Math.random() * 500 + 100;
                console.log(`等待 ${Math.round(waitTime)}ms 後重試時間同步...`);
                
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return this.getServerTime(retryCount + 1);
            } else {
                console.warn('❌ 時間同步失敗，達到最大重試次數，使用本地時間');
                this.retryCount = retryCount;
                return Date.now();
            }
        }
    }

    // 獲取同步後的當前時間
    getCurrentTime() {
        return Date.now() + this.serverTimeOffset;
    }    // 開始定期同步（帶容錯機制）
    startAutoSync(intervalMinutes = 5) {
        console.log('🕐 開始時間同步服務...');
        this.getServerTime(); // 立即同步一次

        this.syncInterval = setInterval(async () => {
            try {
                await this.getServerTime();
            } catch (error) {
                console.warn('⚠️ 定期時間同步失敗，將在下個週期重試');
            }
        }, intervalMinutes * 60 * 1000);

        console.log(`⏰ 時間同步已啟動，每 ${intervalMinutes} 分鐘同步一次`);
    }

    // 停止自動同步
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // 計算距離目標時間的剩餘時間
    getTimeUntilTarget(targetTime) {
        const currentTime = this.getCurrentTime();
        const target = new Date(targetTime).getTime();
        return target - currentTime;
    }

    // 格式化倒數時間顯示
    formatCountdown(milliseconds) {
        if (milliseconds <= 0) return '時間到！';

        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}時${minutes % 60}分${seconds % 60}秒`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }
}

window.TimeSync = TimeSync;

