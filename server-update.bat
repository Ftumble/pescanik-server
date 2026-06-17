taskkill /F /pid %1

pause

timeout /t 5


call server-github.setup.bat
call server-setup-npm.bat

cls
node index.js