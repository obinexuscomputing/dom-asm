@REM dom-asm.bat - Windows Batch launcher
@echo off
node "%~dp0..\dist\cli" %*

@REM ================================================================

# dom-asm.ps1 - PowerShell launcher
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
& node "$scriptPath\..\dist\cli" $args

@REM ================================================================

:: install.bat - Windows installation helper
@echo off
echo Installing platform-specific launchers...

set "binPath=%~dp0"
set "batTarget=%binPath%dom-asm.bat"
set "ps1Target=%binPath%dom-asm.ps1"

echo @echo off > "%batTarget%"
echo node "%%~dp0..\dist\cli" %%* >> "%batTarget%"

echo $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition > "%ps1Target%"
echo ^& node "$scriptPath\..\dist\cli" $args >> "%ps1Target%"

echo Installation complete.
echo BAT created at: %batTarget%
echo PS1 created at: %ps1Target%