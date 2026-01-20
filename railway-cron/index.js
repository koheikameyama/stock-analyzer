const cron = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Stock Analyzer Cron Service started');
console.log('📅 Cron schedule: 0 9 * * * (毎日UTC 9:00 = 日本時間 18:00)');

// 毎日UTC 9:00（日本時間 18:00）に実行
cron.schedule('0 9 * * *', () => {
  console.log('\n' + '='.repeat(50));
  console.log('⏰ Cron job triggered at', new Date().toISOString());
  console.log('='.repeat(50) + '\n');

  runAnalysis();
}, {
  scheduled: true,
  timezone: "UTC"
});

// 起動時にテスト実行（オプション）
if (process.env.RUN_ON_START === 'true') {
  console.log('🔄 Running initial analysis on startup...\n');
  runAnalysis();
}

function runAnalysis() {
  const batchPath = path.join(__dirname, '..', 'batch');
  const pythonScript = path.join(batchPath, 'batch_analysis.py');

  console.log(`📂 Batch directory: ${batchPath}`);
  console.log(`🐍 Python script: ${pythonScript}\n`);

  const python = spawn('python3', [pythonScript], {
    cwd: batchPath,
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1'
    }
  });

  python.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  python.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  python.on('close', (code) => {
    console.log(`\n✅ バッチ処理が終了しました (exit code: ${code})\n`);

    // 通知を送信
    if (code === 0 && process.env.API_BASE_URL) {
      sendNotification();
    }
  });

  python.on('error', (error) => {
    console.error(`❌ バッチ処理でエラーが発生しました: ${error.message}`);
  });
}

async function sendNotification() {
  const fetch = require('node-fetch');
  const apiUrl = `${process.env.API_BASE_URL}/api/push-notifications/send`;

  const today = new Date();
  const dateStr = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '年').replace(/年(\d+)年/, '年$1月') + '日';

  const payload = {
    title: '📊 本日の分析が完了しました',
    body: `${dateStr}の株式分析が完了しました。最新の投資アイデアをチェックしましょう！`,
    url: '/'
  };

  try {
    console.log(`📤 プッシュ通知を送信中: ${apiUrl}`);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ 通知送信成功:`, result);
    } else {
      const error = await response.text();
      console.log(`⚠️  通知送信失敗: ${response.status} ${error}`);
    }
  } catch (error) {
    console.error(`❌ 通知送信エラー: ${error.message}`);
  }
}

// Keep the process alive
console.log('✅ Cron service is running... (Press Ctrl+C to stop)');
