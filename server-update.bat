taskkill /F /pid %1

timeout /t 5


call server-github-setup.bat
call server-setup-npm.bat

cls
node index.js