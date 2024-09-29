@echo off

rem Node.js ���C���X�g�[������Ă��邩�`�F�b�N
node -v >nul 2>&1
if %errorlevel% neq 0 (
  echo Node.js ���C���X�g�[������Ă��܂���
  pause
  exit /b
)

:menu
echo ----------------------------------------
echo RPG�c�N�[��MZ Steam �����e���v���[�g
echo ----------------------------------------
echo 1. �c�[�����Z�b�g�A�b�v�i npm install �j
echo 2. �Q�[�����f�o�b�O�N���i npm run dev �j
echo 3. �Q�[�����p�b�P�[�W���i npm run package �j
echo 0. �I��
echo.
set /p choice=�I��������͂��Ă�������: 

if "%choice%"=="1" goto command_setup
if "%choice%"=="2" goto command_dev
if "%choice%"=="3" goto command_package
if "%choice%"=="0" goto end
echo �����ȑI�����ł��B�ēx���͂��Ă��������B
echo.
goto menu

:command_setup
echo �Z�b�g�A�b�v�̂��� npm install �����s���܂�
call npm install
echo.
echo �Z�b�g�A�b�v���������܂���
echo.
goto menu

:command_dev
echo �Q�[�����f�o�b�O�N�����܂�
echo �����~�܂��Ă��܂����ꍇ�́A���̉�ʂ� Ctrl + c �ŏI�����Ă�������
call npm run dev
echo.
echo �Q�[�����I�����܂���
echo.
goto menu

:command_package
echo �Q�[�����p�b�P�[�W�����܂�
call npm run package
echo.
echo �Q�[���̃p�b�P�[�W�����������܂���
echo �o�͂��ꂽ�Q�[���� out �t�H���_�ɕۑ�����Ă��܂�
echo.
goto menu

:end
echo �I�����܂��B
exit
