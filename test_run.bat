@echo off
rem 文字コードをUTF-8に設定
chcp 65001 >nul

rem バッチファイルのある場所に移動
cd /d %~dp0

rem ■■■ ログファイルの設定 ■■■
rem 日付ごとのファイル名を作る (例: log_2026-02-09.log)
rem ※もし1つのファイルにずっと追記したいなら set LOGFILE=task_log.log だけでOK
set YYYYMMDD=%date:~0,4%-%date:~5,2%-%date:~8,2%
set LOGFILE=logs\task_log_%YYYYMMDD%.log

rem ログ保存用のフォルダがなければ作る
if not exist logs mkdir logs

echo ======================================================== >> %LOGFILE%
echo   実行開始: %date% %time% >> %LOGFILE%
echo ======================================================== >> %LOGFILE%

echo [Step 1/2] Playwrightテストを実行中... >> %LOGFILE%
rem エラーも含めてログに出力
call npx playwright test >> %LOGFILE% 2>&1

echo [Step 2/2] アップロード処理を開始... >> %LOGFILE%


call npx tsx src\server\upload-results.ts >> %LOGFILE% 2>&1

if %errorlevel% equ 0 (
    echo   ✅ 完了: %date% %time% >> %LOGFILE%
) else (
    echo   ❌ エラー発生: %date% %time% >> %LOGFILE%
)
echo -------------------------------------------------------- >> %LOGFILE%
echo. >> %LOGFILE%

exit