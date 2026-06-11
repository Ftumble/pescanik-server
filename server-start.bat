start "" claudflare.bat
call server-setup-npm.bat

set TOUT=20

echo "Dajem lufta cloudflare-u (%TOUT%s)..."
timeout /t %TOUT%
cls
node index.js