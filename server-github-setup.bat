cd "C:/"

if exist "pescanik-server/"  echo "Server vec postoji, brisem..."
if exist "pescanik-server/" @RD /S /Q "C:/pescanik-server"


echo "Povlacim server..."

git clone "https://github.com/Ftumble/pescanik-server.git"

echo "Skinut server, menjam folder"

cd pescanik-server