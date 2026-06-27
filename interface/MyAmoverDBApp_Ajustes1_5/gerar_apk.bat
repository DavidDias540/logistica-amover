@echo off
echo ========================================================
echo A compilar a App Android com o motor Keycloak + .NET...
echo ========================================================
echo.
echo Passo 1: Preparar o contentor Docker para compilar...
docker build -t amover-android -f Dockerfile.android .

echo.
echo Passo 2: A extrair o APK (Isto vai demorar algum tempo na primeira vez)...
mkdir app\build\outputs\apk\debug 2>NUL
docker run --rm -v "%CD%\app\build\outputs\apk\debug:/output" amover-android sh -c "./gradlew assembleDebug --no-daemon && cp app/build/outputs/apk/debug/app-debug.apk /output/"

echo.
echo ========================================================
echo CONCLUIDO!
echo O seu ficheiro APK deve estar guardado na seguinte pasta:
echo %CD%\app\build\outputs\apk\debug\app-debug.apk
echo ========================================================
pause
