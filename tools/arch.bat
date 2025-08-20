@echo off

rem Note - this batch is simple enough to avoid enabling "Delayed Expansion":
rem https://ss64.com/nt/delayedexpansion.html
rem https://ss64.com/nt/syntax.html

setlocal

set "ARCH=tar.exe"
where %ARCH% > NUL 2>&1
if %ERRORLEVEL% neq 0 (
    echo Could not find %ARCH%
    if "%1" neq "nopause" (
        pause
    )
    exit /b 1
)

set "PHP=php.exe"
where %PHP% > NUL 2>&1
if %ERRORLEVEL% neq 0 (
    echo Could not find %PHP%
    if "%1" neq "nopause" (
        pause
    )
    exit /b 1
)



pushd %~dp0


md arch > NUL 2>&1


md images > NUL 2>&1
copy /Y ..\res\images\icon.png images > NUL 2>&1
copy /Y ..\res\images\arrow.png images > NUL 2>&1
copy /Y ..\res\images\close.png images > NUL 2>&1
copy /Y ..\favicon.ico images > NUL 2>&1


set "FN_RCA_301=RCA-301"
echo %FN_RCA_301%.zip
%PHP% %FN_RCA_301%.php offline > %FN_RCA_301%.html
%ARCH% --exclude-vcs --exclude "wizard_full.js" --exclude "assembler.js" --exclude "*_demo.*" ^
  -acf "arch\%FN_RCA_301%.zip" ^
  "%FN_RCA_301%.html" ^
  "scripts\_Common\base.css" ^
  "scripts\_Common\fonts_local.css" ^
  "scripts\_Common\utils_base.js" ^
  "scripts\_Common\popups.js" ^
  "scripts\_Common\wizard_base.js" ^
  "scripts\Rca301\*.*" ^
  "fonts\*.*" ^
  "images\*.*"

set "FN_RCA_301_FULL=RCA-301-Full"
echo %FN_RCA_301_FULL%.zip
%PHP% %FN_RCA_301_FULL%.php offline > %FN_RCA_301_FULL%.html
%ARCH% --exclude-vcs --exclude "wizard.js" --exclude "*_demo.*" ^
  -acf "arch\%FN_RCA_301_FULL%.zip" ^
  "%FN_RCA_301_FULL%.html" ^
  "scripts\_Common\base.css" ^
  "scripts\_Common\fonts_local.css" ^
  "scripts\_Common\utils_base.js" ^
  "scripts\_Common\popups.js" ^
  "scripts\_Common\wizard_base.js" ^
  "scripts\Rca301\*.*" ^
  "fonts\*.*" ^
  "images\*.*"

set "FN_CHARS=RCA-301-Characters"
echo %FN_CHARS%.zip
%PHP% %FN_CHARS%.php offline > %FN_CHARS%.html
%ARCH% --exclude-vcs ^
  -acf "arch\%FN_CHARS%.zip" ^
  "%FN_CHARS%.html" ^
  "scripts\_Common\base.css" ^
  "scripts\_Common\fonts_local.css" ^
  "scripts\_Common\utils_base.js" ^
  "scripts\_Common\popups.js" ^
  "scripts\_Common\table.js" ^
  "scripts\_Common\wizard_base.js" ^
  "scripts\Rca301_Characters\*.*" ^
  "fonts\*.*" ^
  "images\*.*"

set "FN_EXTENDED_ASCII=ExtendedASCII"
echo %FN_EXTENDED_ASCII%.zip
%PHP% %FN_EXTENDED_ASCII%.php offline > %FN_EXTENDED_ASCII%.html
%ARCH% --exclude-vcs ^
  -acf "arch\%FN_EXTENDED_ASCII%.zip" ^
  "%FN_EXTENDED_ASCII%.html" ^
  "scripts\_Common\base.css" ^
  "scripts\_Common\fonts_local.css" ^
  "scripts\_Common\utils_base.js" ^
  "scripts\_Common\popups.js" ^
  "scripts\_Common\table.js" ^
  "scripts\_Common\sounds.js" ^
  "scripts\Text\text.css" ^
  "scripts\Text\utils.js" ^
  "scripts\Text\ExtendedAscii.js" ^
  "fonts\*.*" ^
  "images\*.*"

set "FN_CODEPOINTS=CodePoints"
echo %FN_CODEPOINTS%.zip
%PHP% %FN_CODEPOINTS%.php offline > %FN_CODEPOINTS%.html
%ARCH% --exclude-vcs --exclude "ExtendedAscii.js" ^
  --exclude "GraphemeSplitter.js" --exclude "text.js" --exclude "init_text.js" ^
  -acf "arch\%FN_CODEPOINTS%.zip" ^
  "%FN_CODEPOINTS%.html" ^
  "scripts\_Common\base.css" ^
  "scripts\_Common\fonts_local.css" ^
  "scripts\_Common\utils_base.js" ^
  "scripts\_Common\popups.js" ^
  "scripts\Text\*.*" ^
  "data\categories.txt" ^
  "data\ppucd.txt" ^
  "fonts\*.*" ^
  "images\*.*"

set "FN_TEXT=Text"
echo %FN_TEXT%.zip
%PHP% %FN_TEXT%.php offline > %FN_TEXT%.html
%ARCH% --exclude-vcs ^
  -acf "arch\%FN_TEXT%.zip" ^
  "%FN_TEXT%.html" ^
  "scripts\_Common\base.css" ^
  "scripts\_Common\fonts_local.css" ^
  "scripts\_Common\utils_base.js" ^
  "scripts\_Common\popups.js" ^
  "scripts\Text\text.css" ^
  "scripts\Text\GraphemeSplitter.js" ^
  "scripts\Text\text.js" ^
  "scripts\Text\init_text.js" ^
  "fonts\*.*" ^
  "images\*.*"

set "FN_TOOLS=Tools"
echo %FN_TOOLS%.zip
%ARCH% --exclude-vcs --exclude "*_demo.*" --exclude "fonts.css" ^
  -acf "arch\%FN_TOOLS%.zip" ^
  "%FN_RCA_301%.html" "%FN_RCA_301_FULL%.html" "%FN_CHARS%.html" ^
  "%FN_EXTENDED_ASCII%.html" "%FN_CODEPOINTS%.html" "%FN_TEXT%.html" ^
  "scripts\*.*" "data\*.*" "fonts\*.*" "images\*.*"



for %%a in (%FN_RCA_301% %FN_RCA_301_FULL% %FN_CHARS% ^
            %FN_EXTENDED_ASCII% %FN_CODEPOINTS% %FN_TEXT%) do (
    del %%a.html
)

rd /S /Q images

popd

if "%1" neq "nopause" (
    pause
)
