@echo off
echo Neko's FastFlags Saver - Build Helper
echo.

:menu
echo Pilih opsi:
echo 1. Jalankan Aplikasi (Development)
echo 2. Build Installer (NSIS)
echo 3. Build Versi Portable
echo 4. Build Kedua Versi
echo 5. Install Dependencies
echo 6. Keluar
echo.

set /p choice="Masukkan pilihan (1-6): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto build_installer
if "%choice%"=="3" goto build_portable
if "%choice%"=="4" goto build_all
if "%choice%"=="5" goto install_deps
if "%choice%"=="6" goto exit

echo Pilihan tidak valid!
pause
cls
goto menu

:start
echo.
echo Menjalankan aplikasi...
npm start
pause
goto menu

:build_installer
echo.
echo Membangun installer NSIS...
npm run dist
pause
goto menu

:build_portable
echo.
echo Membangun versi portable...
npm run dist:portable
pause
goto menu

:build_all
echo.
echo Membangun kedua versi...
npm run dist:all
pause
goto menu

:install_deps
echo.
echo Menginstal dependencies...
npm install
pause
goto menu

:exit
echo.
echo Sampai jumpa!
exit /b 0