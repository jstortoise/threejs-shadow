npm install
node_modules/.bin/grunt
cp -r build/js/ ../public_html/
cp -r build/img/ ../public_html/
cp -r build/models/ ../public_html/
cp -r build/fonts/ ../public_html/
cp -r build/css/ ../public_html/
cp -r build/shaders/ ../public_html/
cat build/index.html > ../public_html/test.html
cat build/test.html > ../public_html/index.html
cat build/assets.json > ../public_html/assets.json
