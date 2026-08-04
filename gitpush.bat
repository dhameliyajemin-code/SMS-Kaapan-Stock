@echo off
cd /d "%~dp0"
echo Staging index.html...
git add index.html
echo Committing changes...
git commit -m "update stock system"
echo Pushing to GitHub...
git push origin main
echo.
echo Process complete!
pause
