cd "C:/"

echo "Povlacim server..."

REM git clone "https://github.com/Ftumble/pescanik-server.git"

echo "Skinut server, menjam folder"

cd pescanik-server

echo "Skidam biblioteke (0/2)..."

npm init -y

echo "Skidam biblioteke (1/2)..."

npm install

echo "Skinute biblioteke (2/2)"

echo "Pokrecem server..."

node index.js

pause