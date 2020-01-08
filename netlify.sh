set -e
echo TESTING API
echo STARTING WEB SERVER
npm start &
PID=$!
echo $PID
sleep 10
curl -d '{"key1":"value1", "key2":"value2"}' -H "Content-Type: application/json" -X POST localhost:8080
echo STARTING A TEST
(node test.js && echo "test finished" && pkill -9 autocrop)  || (echo "test failed" && pkill -9 autocrop && exit 1)

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
