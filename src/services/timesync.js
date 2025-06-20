class TimeSync {
    constructor() {
        this.serverTimeOffset = 0; // 與伺服器時間的偏移量（毫秒）
        this.lastSyncTime = 0;
        this.syncInterval = null;
    }

    // 獲取伺服器時間
    async getServerTime() {
        try {
            const response = await fetch('https://tixcraft.com/', {
                method: 'HEAD',
                cache: 'no-cache'
            });

            const serverTime = new Date(response.headers.get('Date')).getTime();
            const localTime = Date.now();

            // 計算時間偏移量
            this.serverTimeOffset = serverTime - localTime;
            this.lastSyncTime = localTime;

            console.log(`時間同步完成，偏移量: ${this.serverTimeOffset}ms`);
            return serverTime;
        } catch (error) {
            console.warn('無法獲取伺服器時間，使用本地時間');
            return Date.now();
        }
    }

    // 獲取同步後的當前時間
    getCurrentTime() {
        return Date.now() + this.serverTimeOffset;
    }

    // 開始定期同步
    startAutoSync(intervalMinutes = 5) {
        this.getServerTime(); // 立即同步一次

        this.syncInterval = setInterval(() => {
            this.getServerTime();
        }, intervalMinutes * 60 * 1000);
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

