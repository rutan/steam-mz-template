@echo off

rem Node.js がインストールされているかチェック
node -v >nul 2>&1
if %errorlevel% neq 0 (
  echo Node.js がインストールされていません
  pause
  exit /b
)

:menu
echo ----------------------------------------
echo RPGツクールMZ Steam 向けテンプレート
echo ----------------------------------------
echo 1. ツールをセットアップ（ npm install ）
echo 2. ゲームをデバッグ起動（ npm run dev ）
echo 3. ゲームをパッケージ化（ npm run package ）
echo 0. 終了
echo.
set /p choice=選択肢を入力してください: 

if "%choice%"=="1" goto command_setup
if "%choice%"=="2" goto command_dev
if "%choice%"=="3" goto command_package
if "%choice%"=="0" goto end
echo 無効な選択肢です。再度入力してください。
echo.
goto menu

:command_setup
echo セットアップのため npm install を実行します
call npm install
echo.
echo セットアップが完了しました
echo.
goto menu

:command_dev
echo ゲームをデバッグ起動します
echo もし止まってしまった場合は、この画面で Ctrl + c で終了してください
call npm run dev
echo.
echo ゲームを終了しました
echo.
goto menu

:command_package
echo ゲームをパッケージ化します
call npm run package
echo.
echo ゲームのパッケージ化が完了しました
echo 出力されたゲームは out フォルダに保存されています
echo.
goto menu

:end
echo 終了します。
exit
