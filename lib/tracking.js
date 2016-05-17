var mongoDb = require('./mongo');
var Aerospike = require('./aerospike');

var Tracking = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
    this.bidData = null;
    this.startTime = new Date().getTime();
    this.populateData();
    this.getBidData();
};


Tracking.prototype.populateData = function () {

    var self = this, data = this.req.query;

    self.BID_ID = data.BID_ID;
    self.Campaign_ID = data.Campaign_ID;


};

Tracking.prototype.getBidData = function () {


    var self = this;
    mongoDb.collections.BIDs_Sent.findOne({BID_ID: self.BID_ID}, {
        headers: 0,
        PARAMS: 0,
        BID_url: 0,
        logs: 0
    }, function (err, bidData) {

        console.log("getBidData bidData ", bidData);
        console.log("getBidData err", err);
        self.bidData = bidData;
        self.process();
    });
};

Tracking.prototype.process = function () {

    var self = this;


    Aerospike.incUserImpressionPerCampaign(self.bidData);
    self.res.writeHead(302, {
        'Location': self.bidData.Redirect_URL
    });
    self.res.end();
    self.updateBidWon();
};


Tracking.prototype.updateBidWon = function () {

    var self = this;

    mongoDb.collections.Campaigns.update({Campaign_ID: self.bidData.Campaign_ID}, {$inc: {"Num_Of_BIDS_Won": 1}});


    self.bidData.date = new Date();
    self.bidData.Redirect_Duration = new Date().getTime() - self.startTime;

    mongoDb.collections.BIDs_Won.insert(self.bidData);

    
    /*mongoDb.collections.Campaigns.update({Campaign_ID: self.bidData.Campaign_ID}, {
     "$push": {
     "BIDs_Won": self.bidData
     }
     });*/


};


var bidTracking = function (req, res, next) {
    new Tracking(req, res, next);
};

module.exports = {
    bidTracking: bidTracking
};