class ScheduledTicketing {
    constructor(timeSync, mainRouter) {
        this.timeSync = timeSync;
        this.mainRouter = mainRouter;
        this.scheduledTime = null;
        this.countdownInterval = null;
        this.isScheduled = false;
        this.callbacks = {
            onCountdown: null,
            onStart: null,
            onError: null
        };
    }    // 設定搶票時間
    setScheduledTime(targetTime) {
        this.scheduledTime = new Date(targetTime).getTime();
        console.log(`已設定搶票時間: ${new Date(targetTime).toLocaleString()}`);
    }

    // 開始倒數計時
    startCountdown(callbacks = {}) {
        if (!this.scheduledTime) {
            throw new Error('請先設定搶票時間');
        }

        this.callbacks = { ...this.callbacks, ...callbacks };
        this.isScheduled = true;

        // 開始時間同步
        this.timeSync.startAutoSync();

        this.countdownInterval = setInterval(() => {
            const remainingTime = this.timeSync.getTimeUntilTarget(this.scheduledTime);

            if (remainingTime <= 0) {
                this.executeScheduledTicketing();
            } else {
                const countdown = this.timeSync.formatCountdown(remainingTime); if (this.callbacks.onCountdown) {
                    this.callbacks.onCountdown(countdown, remainingTime);
                }
                console.log(`距離搶票時間還有: ${countdown}`);
            }
        }, 1000);

        console.log('定時搶票已啟動，開始倒數計時...');
    }

    // 執行定時搶票
    async executeScheduledTicketing() {
        this.stopCountdown(); try {
            console.log('⏰ 搶票時間到！開始執行自動搶票...');

            if (this.callbacks.onStart) {
                this.callbacks.onStart();
            }

            // 觸發現有的搶票流程
            const form = document.getElementById('ticket-helper-form');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }

        } catch (error) {
            console.log(`定時搶票執行失敗: ${error.message}`);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
        }
    }

    // 停止倒數計時
    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        } this.timeSync.stopAutoSync();
        this.isScheduled = false;
        console.log('定時搶票已取消');
    }

    // 檢查是否正在倒數
    isCountdownActive() {
        return this.isScheduled && this.countdownInterval !== null;
    }

    // 獲取當前狀態
    getStatus() {
        if (!this.isScheduled) return '未設定';
        if (!this.scheduledTime) return '未設定時間';

        const remainingTime = this.timeSync.getTimeUntilTarget(this.scheduledTime); if (remainingTime <= 0) return '執行中';

        return `倒數中 (${this.timeSync.formatCountdown(remainingTime)})`;
    }
}

window.ScheduledTicketing = ScheduledTicketing;
