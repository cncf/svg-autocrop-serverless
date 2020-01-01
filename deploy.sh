export g=`which gcloud || echo /tmp/google-cloud-sdk/bin/gcloud`
$g functions deploy autocrop \
    --region=us-central1 \
    --trigger-http \
    --runtime nodejs10 \
    --memory 2048MB \
