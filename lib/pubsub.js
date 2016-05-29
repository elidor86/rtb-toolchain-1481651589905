var gcloud = require('gcloud');

// Authenticating on a per-API-basis. You don't need to do this if you
// auth on a global basis (see Authentication section above).

var pubsub = gcloud.pubsub({
    projectId: 'rtb-server',
    keyFilename: global.appRoot + '/ssl/rtb-server-d387c47b2a8f.json'
});


var topic = pubsub.topic('bids');


var options = {
    reuseExisting: true,
    autoAck: true
};


var PubSub = {};

PubSub.publish = function (bidData) {


    // console.log("bidData ", bidData);

    var attributes = {
        Language: bidData.Language,
        IP: bidData.IP,
        os: bidData.Operating_System,
        GEO: bidData.GEO,
        DateTS: bidData.DateTS.toString(),
        URL: bidData.URL,
        Query: bidData.Query,
        UserAgent: bidData.UserAgent
        //  Job_Predict_URL: bidData.Job_Predict_URL
    };

    console.log("JSON.stringify(bidData) ", JSON.stringify(bidData));

    topic.publish({
        data: bidData
        //attributes: attributes
    }, function (err) {
        console.log("err ", err);
    });
};

topic.subscribe('bids', options, function (err, subscription) {
    // Register listeners to start pulling for messages.

    if (err) {
        console.log("onError err", err);
    }


    function onError(err) {
        console.log("onError err", err);
    }

    function onMessage(message) {

        try {
            message = JSON.parse(message);
        } catch (e) {

        }
        console.log("message ", message);
    }

    // console.log("err ", err);
    //console.log("subscription ", subscription);

    //  return;
    subscription.on('error', onError);
    subscription.on('message', onMessage);

    // Remove listeners to stop pulling for messages.
    //subscription.removeListener('message', onMessage);
    //subscription.removeListener('error', onError);
});


module.exports = PubSub;