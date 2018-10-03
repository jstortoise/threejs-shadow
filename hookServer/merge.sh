cd ~/usc3d
git checkout dev
git pull
git checkout staging
git merge dev
npm install
./clear.sh
./deploy.sh
