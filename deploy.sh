export g=`which gcloud || echo /tmp/google-cloud-sdk/bin/gcloud`
: ${DEPLOY_NAME:=autocrop}
echo deploying as $DEPLOY_NAME
$g functions deploy $DEPLOY_NAME  \
    --timeout=30s \
    --entry-point autocrop \
    --region=us-central1 \
    --trigger-http \
    --runtime nodejs12 \
    --memory 2048MB \
