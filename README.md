What is this:
A repo for a serverless (gcloud functions) api of svg-autocrop.

Development:
Install: npm install, at this moment a nodejs v10 is used
Debug locally: functions-framework --target=autocrop1
where autocrop1 is a function name from an index.js
Deploy: gcloud functions deploy --runtime=nodejs10 --region=us-central1 --trigger-http autocrop1
