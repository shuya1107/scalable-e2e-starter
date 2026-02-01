// Socket.ioの初期化
const socket = io();

// DOM要素の取得
const logList = document.getElementById('log-list');
const statTotal = document.getElementById('stat-total');
const statPass = document.getElementById('stat-pass');
const statFail = document.getElementById('stat-fail');
const connectionStatus = document.getElementById('connection-status');

// カウンター変数
let totalCount = 0;
let successCount = 0;
let failCount = 0;

// --- Socketイベント ---

// 接続時
socket.on('connect', () => {
    connectionStatus.textContent = 'Live Connected';
    connectionStatus.style.background = 'var(--success)';
    connectionStatus.style.color = '#111';
});

// 切断時
socket.on('disconnect', () => {
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.style.background = 'var(--error)';
});

// データ受信時（init-logsという名前で配列が来る想定）
socket.on('init-logs', (logs) => {
    renderLogs(logs);
});

// --- 描画処理 ---

function renderLogs(logs) {
    // 一旦リセット
    logList.innerHTML = '';
    totalCount = logs.length;
    successCount = 0;
    failCount = 0;

    // ログをループして描画（新しいものが上に来るように処理）
    // 配列の並び順次第ですが、通常は末尾に追加したい場合は forEach
    // 上に追加したい場合は prepend を使います。
    logs.forEach(log => {
        createLogRow(log);
    });

    updateStats();
}

function createLogRow(log) {
    // データの取り出し（日本語キーと英語キーの両対応）
    const time = log['実行日時'] || log.timestamp || '-';
    const id = log['会員コード'] || log.memberCode || 'Unknown';
    const rawStatus = log['ステータス'] || log.status || 'FAIL';
    const msg = log['メッセージ'] || log.message || '';
    const trace = log['トレースパス'] || log.tracePath || null;

    // ステータスの正規化とカウント
    let statusType = 'unknown';
    if (rawStatus === 'SUCCESS') {
        statusType = 'success';
        successCount++;
    } else if (rawStatus === 'FAIL' || rawStatus === 'ERROR') {
        statusType = 'fail';
        failCount++;
    } else {
        // その他のステータスは失敗扱いにするか、カウントしないかはお好みで
        failCount++; 
    }

    // HTML要素の作成
    const row = document.createElement('div');
    row.className = 'log-row';

    // ★ここを変更！アイコンをクリックしたら開くようにする
    let traceHtml = '';
    if (trace) {
        // Windowsのパス(\)がHTMLの中で壊れないように (\\) に変換する
        // これがないとクリックしても無反応になります
        const safePath = trace.replace(/\\/g, '\\\\');

        traceHtml = `<i class="fas fa-play-circle trace-btn" 
                        title="トレースを再生" 
                        style="cursor: pointer; color: #89b4fa; font-size: 1.2rem;"
                        onclick="window.openTrace('${safePath}')"></i>`;
    }

    row.innerHTML = `
        <div class="col-time">${time}</div>
        <div class="col-id">${id}</div>
        <div class="col-status"><span class="tag ${statusType}">${rawStatus}</span></div>
        <div class="col-msg" title="${msg}">${msg}</div>
        <div class="col-link">${traceHtml}</div>
    `;

    // リストの先頭に追加
    logList.prepend(row);
}

function updateStats() {
    statTotal.textContent = totalCount;
    statPass.textContent = successCount;
    statFail.textContent = failCount;
}

window.openTrace = (path) => {
    console.log('👆 クリックされました！ パス:', path);
    // サーバーに送信
    socket.emit('request-open-trace', path);
};
