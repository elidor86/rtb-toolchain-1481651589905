//var mongoDb = require('./mongo');
var memcached = require('./memcached');
var Elasticsearch = require('./elasticsearch');

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

    Elasticsearch.isBidInBidsWon(self.BID_ID).then(function (isBidInBidsWon) {
        //console.log("getBidData isBidInBidsWon ", isBidInBidsWon);


        if (isBidInBidsWon == true) {
            self.bidData = null;
            self.process();
        } else {
            Elasticsearch.getBidData(self.BID_ID).then(function (bidata) {

                //console.log("getBidData err", err);
                self.bidData = bidata;
                self.process();
            });
        }
    });


};

Tracking.prototype.process = function () {

    var self = this;

    if (!self.bidData) {
        self.res.writeHead(302, {
            'Location': 'http://www.target-talent.com/'
        });
        self.res.end();
        return;
    }

    memcached.incUserImpressionPerCampaign(self.bidData);

    self.res.writeHead(302, {
        'Location': self.bidData.Redirect_URL
    });

    // console.log("self.bidData.Redirect_URL ", self.bidData.Redirect_URL);
    self.res.end();
    self.updateBidWon();
};

Tracking.prototype.updateBidWon = function () {

    var self = this;

    Elasticsearch.incCountersForBidWon({
        Cmp_Es_ID: self.bidData.Cmp_Es_ID
    });

    self.bidData.date = new Date();
    self.bidData.Redirect_Duration = new Date().getTime() - self.startTime;


    Elasticsearch.client.create({
        index: 'bids',
        type: 'BIDs_Won',
        body: self.bidData
    }, function (error, response) {

        //console.log("error ",error);
        //console.log("response ",response);
    });

};


var bidTracking = function (req, res, next) {
    new Tracking(req, res, next);
};

module.exports = {
    bidTracking: bidTracking
};