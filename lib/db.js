var gcloud = require('gcloud')({
    projectId: 'rtb-server',
    keyFilename: appRoot + '/rtb-server-d0c82ed4dab8.json'
});


var datastore = gcloud.datastore();


module.exports = {
    datastore: datastore
};
