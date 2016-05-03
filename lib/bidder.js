var Db = require('./db');
var mongoDb = require('./mongo');
var Campaigns = require('./Campaigns');
var uuid = require('node-uuid');
var querystring = require('querystring');
var co = require('co');
var Classifier = require('./classifier');
var URL = require("url");

var Bidder = function (req, res, next) {

    this.req = req;
    this.res = res;
    this.next = next;
    this.campaign = null;
    this.SanityCheck_MAX_BID_VALUE = 0.02;
    this.SanityCheck_MAX_DAILY_BIDs = 1000;
    this.SanityCheck_MIN_URL_LENGTH = 7;
    this.bidId = uuid.v4();
    this.logs = {};
    this.errors = [];
    this.reason = '';
    this.startTime = new Date().getTime();

    this.noBid = {
        status: 'NOBID'
    };

    this.populateBidReqData();
    this.getCampaigns();
};


Bidder.prototype.SanityCheck = function () {


    var self = this;


    return new Promise(function (fulfill, reject) {

        co(function *() {

            if (self.campaign.BID_Value > self.SanityCheck_MAX_BID_VALUE) {
                self.reason = 'BID_Value_High';
                fulfill([false]);
            }

            if (!self.bidReqData.URL || self.bidReqData.URL.length < self.SanityCheck_MIN_URL_LENGTH) {
                self.reason = 'BID_URL_Fail';
                fulfill([false]);
            }

            var _DailyNumOfBid = yield  mongoDb.collections.dailyStat.findOne({id: self.getDateStr() + "_DailyNumOfBid"});

            if (_DailyNumOfBid && _DailyNumOfBid.count >= self.SanityCheck_MAX_DAILY_BIDs) {
                self.reason = 'MAX_Daily_BIDs';
                fulfill([false]);
            }

            fulfill([true]);
        }).catch(function (err) {
            console.log("SanityCheck err ", err);
            self.reason = JSON.stringify(err);
            fulfill([false]);
        });

    });

};


Bidder.prototype.getCampaigns = function () {
    var self = this;
    Campaigns.getCampaign(self.bidReqData, function (err, campaign) {
        self.logs.timeToGetCampaign = new Date().getTime() - self.startTime;
        global.logger.debug('timeToGetCampaign ', self.logs.timeToGetCampaign);
        global.logger.debug('getCampaigns err', err);
        self.process(err, campaign);
    })
};


Bidder.prototype.populateBidReqData = function () {

    var self = this, data = this.req.query;

    var bidReqData = {};
    bidReqData.URL = decodeURIComponent(data.url) || '';
    bidReqData.Referrer = decodeURIComponent(data.referer) || '';
    bidReqData.Browser = data.browser || '';
    bidReqData.Browser_Ver = data.browser_version || '';
    bidReqData.Language = data.language;
    bidReqData.IP = data.ip;
    bidReqData.UserAgent = data.ua || '';
    bidReqData.SearchEngine = data.se || '';
    bidReqData.Source_ID = data.cid;
    bidReqData.Query = data.query || '';
    bidReqData.GEO = data.country;
    bidReqData.BID_ID = self.bidId;
    bidReqData.Publisher_ID = self.req.params.id;
    bidReqData.DateTS = new Date().getTime();
    bidReqData.Date = new Date();
    bidReqData.Job_Predict_URL = Classifier.predictFromUrl(bidReqData.URL);
    bidReqData.Job_Predict_Referrer = Classifier.predictFromUrl(bidReqData.Referrer);


    var parsedurl = URL.parse(bidReqData.URL, true);

    bidReqData.URL_Protocol = parsedurl.protocol;
    bidReqData.URL_Pathname = parsedurl.pathname;
    bidReqData.URL_Query = parsedurl.query;

    // console.log("parsedurl ", parsedurl);

    self.bidReqData = bidReqData;
};

Bidder.prototype.doBid = function () {

    var self = this;

    var campaign = self.campaign;

    var url = campaign.Bid_URL.replace('@@Campaign_ID@@', campaign.Campaign_ID).replace('@@BID_ID@@', self.bidId);

    self.bidReqData.BID_Value = campaign.BID_Value;
    self.bidReqData.BID_Currency = campaign.BID_Currency;
    self.bidReqData.Campaign_ID = campaign.Campaign_ID;
    self.bidReqData.BID_url = url;
    self.bidReqData.PARAMS = campaign.params;

    var paramsKeys = Object.keys(campaign.params || {});
    if (paramsKeys.length > 0) {
        if (campaign.Redirect_URL.search("\\?") > -1) {
            campaign.Redirect_URL += "&" + querystring.stringify(campaign.params);
        } else {
            campaign.Redirect_URL += "?" + querystring.stringify(campaign.params);
        }
    }
    self.bidReqData.Redirect_URL = campaign.Redirect_URL;


    var bidJson = {
        bid: campaign.BID_Value,
        url: url
    };

    self.res.json(bidJson);
    self.logs.BID_Sending_Duration = new Date().getTime() - self.startTime;
    self.logBid();
};


Bidder.prototype.logBid = function () {


    var self = this;
    var data = self.bidReqData;


    data.headers = self.req.headers;
    data.logs = self.logs;
    data.BID_Sending_Duration = self.logs.BID_Sending_Duration;


    /*
     var key = Db.datastore.key('bid');
     Db.datastore.save({
     key: key,
     data: data
     }, function (err) {
     });*/

    mongoDb.collections.BIDs_Sent.insert(data);
    mongoDb.collections.Campaigns.update({_id: self.campaign._id}, {
        "$push": {
            "BIDs_Sent": data
        }
    });
};

Bidder.prototype.logNoBid = function () {


    var self = this;
    var data = self.bidReqData;


    data.date = new Date();
    data.headers = self.req.headers;
    data.logs = self.logs;
    data.reason = self.reason;
    data.errors = self.errors;
    data.BID_Sending_Duration = self.logs.BID_Sending_Duration;


    /*var key = Db.datastore.key('bid');
     Db.datastore.save({
     key: key,
     data: data
     }, function (err) {
     // global.logger.debug(err); // [ 'Company', 5669468231434240 ]
     // global.logger.debug(key); // [ 'Company', 5669468231434240 ]

     });*/

    mongoDb.collections.BIDs.insert(data);

};


Bidder.prototype.process = function (err, campaign) {
    var self = this;

    co(function *() {
        if (err) {
            self.errors.push(err);
            return self.doNoBid();
        }

        if (!campaign) {
            self.reason = 'No_Campaign';
            return self.doNoBid();
        }

        self.campaign = campaign;

        var SanityCheck = yield self.SanityCheck();

        if (SanityCheck[0] == false) {
            return self.doNoBid();
        }


        global.logger.debug('this.campaign ', self.campaign);
        //global.logger.debug('this.res ', self.res);

        yield  mongoDb.collections.Campaigns.update({_id: campaign._id}, {$inc: {"Num_Of_BIDs_Sent": 1}});
        yield  mongoDb.collections.dailyStat.update({id: self.getDateStr() + "_DailyNumOfBid"}, {$inc: {"count": 1}}, {upsert: true});


        self.doBid();

    }).catch(function (err) {

        console.log("err", err);
        self.errors.push(err);
        return self.doNoBid();
    });
};

Bidder.prototype.getDateStr = function () {
    var now = new Date();
    var date = now.getDate() + "-" + ( parseInt(now.getMonth()) + 1 ) + "-" + now.getFullYear();
    return date;
};


Bidder.prototype.doNoBid = function () {

    var self = this;

    self.res.json(self.noBid);
    self.logs.BID_Sending_Duration = new Date().getTime() - self.startTime;
    self.logNoBid();
};

var bidReq = function (req, res, next) {
    new Bidder(req, res, next);
};

module.exports = {
    bidder: bidReq
};

/*
 campagin = {
 Channel_ID: 25,
 Campaign_ID: 1,
 Campaign_Name: 'indeed_revizer',
 BID_Value: 0.001,
 Max_Num_Of_BIDs: 50,
 Bid_URL: "htts://www.target-talent/tracking?Campaign_ID=xxxxxxxx&BID_ID=XXXXXXX",
 Filter_GEO: /(us)/,
 Filter_URLs: null,
 Filter_KeyWords: null,
 Filter_Function: 'jobsPredict',
 Num_Of_BIDs_Sent: 0,
 Num_Of_BIDS_Won: 0,
 BIDs_Sent: [],
 BIDs_Won: []
 };*/