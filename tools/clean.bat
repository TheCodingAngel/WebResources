@echo off

pushd %~dp0

del /Q arch\*.zip

popd

if "%1" neq "nopause" (
    pause
)
