export g=`which gcloud || echo /tmp/google-cloud-sdk/bin/gcloud`
: ${DEPLOY_NAME:=autocrop}
echo deploying as $DEPLOY_NAME
$g functions deploy $DEPLOY_NAME  \
    --timeout=70s \
    --entry-point autocrop \
    --region=us-central1 \
    --trigger-http \
    --runtime nodejs10 \
    --memory 2048MB \
