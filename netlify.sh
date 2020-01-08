set -e
echo TESTING API
echo STARTING WEB SERVER
npm start &
PID=$!
echo $PID
sleep 10
echo STARTING A TEST
(node test.js && echo "test finished" && kill -9 $PID)  || (echo "test failed" && kill -9 $PID && exit 1)

echo DEPLOYING STATIC PAGE

mkdir -p dist/
cp _redirects index.html dist/
curl https://landscape.cncf.io/favicon.ico > dist/favicon.ico

echo DEPLOYING TO GOOGLE CLOUD

echo $BASE64GOOGLETOKEN | base64 -d > /tmp/key.json
curl https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-274.0.1-linux-x86_64.tar.gz > /tmp/gcloud.tar.gz
(cd /tmp && tar zxf gcloud.tar.gz)
/tmp/google-cloud-sdk/bin/gcloud auth activate-service-account --key-file=/tmp/key.json --project=cncf-svg-autocrop
bash deploy.sh
