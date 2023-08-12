npm i
npm run build
cd dist
rm -rf .git
touch .nojekyll
git init
git add .
git commit -m 'deploy'
git remote add origin git@github.com:depthcreator/depthcreator.github.io.git
git push origin master -f
rm -rf .git
cd ..
