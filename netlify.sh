set -e
echo DEPLOYING STATIC PAGE

mkdir -p dist/
cp _redirects index.html bg.jpeg dist/
curl https://landscape.cncf.io/favicon.ico > dist/favicon.ico

exit 0
echo INSTALLING GOOGLE CLOUD CLI

echo $BASE64GOOGLETOKEN | base64 -d > /tmp/key.json
curl https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-274.0.1-linux-x86_64.tar.gz > /tmp/gcloud.tar.gz
(cd /tmp && tar zxf gcloud.tar.gz)
/tmp/google-cloud-sdk/bin/gcloud auth activate-service-account --key-file=/tmp/key.json --project=cncf-svg-autocrop

echo DEPLOYING TO DIFFERENT URL AND THEN TESTING API
DEPLOY_NAME=ci-autocrop bash deploy.sh
URL=https://us-central1-cncf-svg-autocrop.cloudfunctions.net/ci-autocrop npm run test 

echo DEPLPOYING API
node embedSlackVariable.js
bash deploy.sh
