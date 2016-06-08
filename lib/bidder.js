//var mongoDb = require('./mongo');
var Campaigns = require('./Campaigns');
var uuid = require('node-uuid');
var querystring = require('querystring');
var co = require('co');
var Classifier = require('./classifier');
var useragent = require('useragent');
//var Aerospike = require('./aerospike');
var Elasticsearch = require('./elasticsearch');
var Bq = require('./BigQuery');
var catMapper = require('./catMapper');
var Lists = require('./listsRtb');
var geoip = require('./geoip');
//var pubsub = require('./pubsub');
var URL = require("url");
var tld = require('tldjs');

var Bidder = function (req, res, next) {

    this.req = req;
    this.res = res;
    this.next = next;
    this.campaign = null;
    this.SanityCheck_MAX_BID_VALUE = 0.09;
    this.SanityCheck_MAX_DAILY_BIDs = 50000;
    this.SanityCheck_MIN_URL_LENGTH = 7;
    this.Defualt_Max_Imp_Per_Cmp = 1;
    this.bidId = uuid.v4();
    this.logs = {};
    this.errors = [];
    this.reason = '';
    this.startTime = new Date().getTime();


    this.noBid = {
        "result": {
            "status": "NOBID"
        }
    };

    this.populateBidReqData();
    //pubsub.publish(this.bidReqData);
    //this.doNoBid();
    this.emailExtractor();
    this.getCampaigns();
};

Bidder.prototype.queryMapper = [
    'field-keywords',
    'query',
    'q',
    'k',
    'kw',
    'searchTerm',
    'Ntt',
    'keyword',
    'st',
    '_odkw',
    '_nkw',
    'find_desc',
    'find',
    'keywords',
    'Tpk',
    'search',
    'SearchText',
    'sl',
    'inputbox',
    'kword',
    'origSearch',
    'searchToken'
];

Bidder.prototype.queryToSave = [
    'utm_source',
    'utm_medium',
    'utm_content',
    'utm_campaign',
    'utm_term'
];


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
        self.bidReqData.Cmp_Es_ID = campaign._id;

        var SanityCheck = yield self.SanityCheck();

        global.logger.debug('SanityCheck ', SanityCheck);
        if (SanityCheck[0] == false) {
            return self.doNoBid();
        }

        self.populateBidReqCampaignData();


        yield  Elasticsearch.incCountersForBidSent({
            date: self.getDateStr() + "_DailyNumOfBid",
            campaignId: campaign._id
        });

        self.doBid();
        //self.doNoBid();
    }).catch(function (err) {

        console.trace("process err", err);
        self.errors.push(err);
        return self.doNoBid();
    });
};


Bidder.prototype.SanityCheck = function () {
    var self = this;
    return new Promise(function (fulfill, reject) {

        co(function *() {


            try {
                if (self.campaign.BID_Value > self.SanityCheck_MAX_BID_VALUE) {
                    self.reason = 'BID_Value_High';
                    fulfill([false]);
                }
            } catch (e) {
                console.log("SanityCheck err ", e);
            }


            if (!self.bidReqData.URL || self.bidReqData.URL.length < self.SanityCheck_MIN_URL_LENGTH) {
                self.reason = 'BID_URL_Fail';
                fulfill([false]);
            }

            try {
                var _DailyNumOfBid = yield  Elasticsearch.getDailyNumOfBid(self.getDateStr() + "_DailyNumOfBid");

                global.logger.debug('_DailyNumOfBid ', _DailyNumOfBid);

                if (typeof _DailyNumOfBid != "number" || _DailyNumOfBid >= self.SanityCheck_MAX_DAILY_BIDs) {
                    self.reason = 'MAX_Daily_BIDs';
                    fulfill([false]);
                }
            } catch (e) {
                console.log("SanityCheck err getDailyNumOfBid", e);
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


Bidder.prototype.blackCheck = function () {
    var self = this;

    if (self.bidReqData.URL_Hostname && Lists.blackHostnames.indexOf(self.bidReqData.URL_Hostname) > -1) {
        return true;
    }

    if (self.bidReqData.IP && Lists.blackIp.indexOf(self.bidReqData.IP) > -1) {
        return true;
    }
};

Bidder.prototype.getCampaigns = function () {
    var self = this;

    var blackCheck = self.blackCheck();

    if (blackCheck == true) {
        global.logger.debug("blackCheck ", blackCheck);
        self.reason = 'spam';
        return self.doNoBid();
    }

    Campaigns.getCampaign(self.bidReqData, function (err, campaign) {

        //global.logger.debug('SanityCheck ',SanityCheck);
        global.logger.debug("self.bidReqData.Time_To_Get_Cmp", self.bidReqData.Time_To_Get_Cmp);
        global.logger.debug("self.bidReqData.Time_To_Get_Cmp_Incluse_Net", self.bidReqData.Time_To_Get_Cmp_Incluse_Net);
        global.logger.debug("self.bidReqData.BID_ID", self.bidReqData.BID_ID);
        self.logs.timeToGetCampaign = new Date().getTime() - self.startTime;

        self.process(err, campaign);
    })
};


Bidder.prototype.populateBidReqData = function () {

    var self = this, data = this.req.query;
    var now = new Date();

    var bidReqData = {};
    bidReqData.Year = parseInt(now.getFullYear());
    bidReqData.Day = parseInt(now.getDate());
    bidReqData.Month = parseInt(now.getMonth() + 1);
    bidReqData.Browser_Ver = data.browser_version || '';
    bidReqData.Language = data.language || '';
    bidReqData.IP = data.ip;
    bidReqData.os = data.os;
    bidReqData.SearchEngine = data.se || '';
    bidReqData.Source_ID = data.cid;
    bidReqData.Operating_System = data.operatingsystem;
    bidReqData.GEO = data.geo || "";
    bidReqData.BID_ID = self.bidId;
    bidReqData.Publisher_ID = self.req.params.id;
    bidReqData.DateTS = new Date().getTime();
    bidReqData.Date = new Date();


    try {
        var locFromIp = geoip.getLocFromIp(bidReqData.IP);

        if (locFromIp) {
            bidReqData.stateFromIp = locFromIp.state;
            bidReqData.postalFromIp = locFromIp.postal;
            bidReqData.regionFromIp = locFromIp.region;
            bidReqData.regionFromIp = locFromIp.region;
            bidReqData.cityFromIp = locFromIp.city;
            bidReqData.formatLocation = locFromIp.formatLocation;
            bidReqData.latlon = {lon: locFromIp.latlon.longitude, lat: locFromIp.latlon.latitude};
        }

        //console.log(" locFromIp   ", locFromIp);
    } catch (e) {

    }

    try {
        bidReqData.GEO = bidReqData.GEO.toLowerCase();
    } catch (e) {

    }

    try {
        bidReqData.Query = decodeURIComponent(data.keywords) || '';
    } catch (e) {
        bidReqData.Query = "";
    }

    try {
        bidReqData.URL = decodeURIComponent(data.url) || '';
    } catch (e) {
        //console.log(" decodeURIComponent(data.url)  e ", e);
        bidReqData.URL = data.url;
    }

    try {
        bidReqData.UserAgent = decodeURIComponent(data.useragent) || '';
        if (!bidReqData.Operating_System || bidReqData.Operating_System.length == 0) {
            var agent = useragent.lookup(bidReqData.UserAgent);

            if (agent && agent.os && agent.os.family) {
                bidReqData.Operating_System = agent.os.family.toLowerCase();
            }
            if (agent && agent.family) {
                bidReqData.Browser = agent.family.toLowerCase();
            }
        }

    } catch (e) {
        bidReqData.UserAgent = "";
    }

    try {
        bidReqData.Browser = decodeURIComponent(data.browser) || '';
    } catch (e) {

    }

    try {
        bidReqData.Referrer = decodeURIComponent(data.referer) || '';
    } catch (e) {
        bidReqData.Referrer = "";
    }

    bidReqData.Job_Predict_URL = Classifier.predictFromUrl(bidReqData.URL);
    bidReqData.Job_Predict_Referrer = Classifier.predictFromUrl(bidReqData.Referrer) || 0;

    try {
        var parsedurl = URL.parse(bidReqData.URL, true);
        var parsedurlRef = URL.parse(bidReqData.Referrer, true);
        bidReqData.URL_Hostname = parsedurl.hostname;
        bidReqData.Referrer_Hostname = parsedurlRef.hostname;

        var domain = tld.getDomain(parsedurl.host);

        var cat = catMapper.getCat(domain);
        if (cat) {
            bidReqData.category = cat.category;
            bidReqData.subCategory = cat.subCategory;
        }

        //console.log("bidReqData. cat", cat);


        if (parsedurl.query) {


            self.queryToSave.forEach(function (q) {
                if (q in parsedurl.query) {
                    bidReqData[q] = parsedurl.query[q];
                }
            });

            for (var kw in self.queryMapper) {
                var item = self.queryMapper[kw];
                if (item in parsedurl.query) {
                    bidReqData.URL_Query_Q = parsedurl.query[item];
                    if (bidReqData.URL_Query_Q && bidReqData.URL_Query_Q.length > 0) {
                        bidReqData.URL_Query_Q = bidReqData.URL_Query_Q.toLowerCase();
                        bidReqData.URL_Query_Q = bidReqData.URL_Query_Q.replace(/\+/ig, " ").replace(/\-/ig, " ")
                    }
                    break;
                }
            }
        }

        //console.log("bidReqData.URL_Query_Q ", bidReqData.URL_Query_Q);

    } catch (e) {

    }


    // bidReqData.URL_Protocol = parsedurl.protocol;
    // bidReqData.URL_Pathname = parsedurl.pathname;
    //bidReqData.URL_Query = parsedurl.query;

    // console.log("parsedurl ", bidReqData);

    self.bidReqData = bidReqData;
};

Bidder.prototype.emailExtractor = function () {
    var self = this;
    var url = self.bidReqData.URL;
    var re = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

    if (url && url.length > 0) {
        try {
            var matchArr = url.match(re);
            if (matchArr && matchArr.length > 0) {
                var email = matchArr[0];
                var data = self.bidReqData;
                data.email = email;
                Elasticsearch.logEmail(data);
                //mongoDb.collections.emails.insert(data);
            }
        } catch (e) {
            console.trace("emailExtractor err", e);
        }
    }
};

Bidder.prototype.populateBidReqCampaignData = function () {
    var self = this;
    var campaign = self.campaign;

    var url = campaign.Bid_URL.replace('@@Campaign_ID@@', campaign.Campaign_ID).replace('@@BID_ID@@', self.bidId);
    self.bidReqData.BID_url = url;

    self.bidReqData.BID_Value = campaign.BID_Value;
    self.bidReqData.BID_Currency = campaign.BID_Currency || '';
    self.bidReqData.Campaign_ID = campaign.Campaign_ID;
    self.bidReqData.PARAMS = campaign.params;

    //global.logger.debug('campaign.params ', campaign.params);

    var paramsKeys = Object.keys(campaign.params || {});
    if (paramsKeys.length > 0) {
        if (campaign.Redirect_URL.search("\\?") > -1) {
            campaign.Redirect_URL += "&" + querystring.stringify(campaign.params);
        } else {
            campaign.Redirect_URL += "?" + querystring.stringify(campaign.params);
        }
    }

    self.bidReqData.Redirect_URL = campaign.Redirect_URL;
};


Bidder.prototype.doBid = function () {

    var self = this;

    var campaign = self.campaign;


    var bidJson = {
        "result": {
            "status": "BID",
            "listing": {
                "bid": campaign.BID_Value,
                "url": self.bidReqData.BID_url
            }
        }
    };


    // var bidXml = '<?xml version="1.0" encoding="UTF-8"?><result status="BID"> <listing bid="' + campaign.BID_Value + '" url="' + self.bidReqData.BID_url + '"/></result>';

    self.bidReqData.bidJson = bidJson;

    self.res.json(bidJson);
    //self.res.end(bidXml);
    self.logs.BID_Sending_Duration = new Date().getTime() - self.startTime;
    self.logBid();
};

Bidder.prototype.logBid = function () {


    var self = this;
    var data = self.bidReqData;


    data.logs = self.logs;
    data.BID_Sending_Duration = self.logs.BID_Sending_Duration;


    /*
     var key = Db.datastore.key('bid');
     Db.datastore.save({
     key: key,
     data: data
     }, function (err) {
     });*/

    //console.log("data ", data);

    Elasticsearch.logBid(data);
    // mongoDb.collections.BIDs_Sent.insert(data);


    /*mongoDb.collections.Campaigns.update({_id: self.campaign._id}, {
     "$push": {
     "BIDs_Sent": data
     }
     });*/
    //delete data.date;


    Bq.insert({
        tableName: 'BIDs',
        params: data
    }, function (err, res) {
        //console.log("err ", err);
        //console.log("res ", res);

    });
};

Bidder.prototype.logNoBid = function () {


    var self = this;
    var data = self.bidReqData;


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

    Elasticsearch.logNoBid(data);
    // mongoDb.collections.BIDs.insert(data);

    Bq.insert({
        tableName: 'BIDs_Test',
        params: data
    }, function (err, res) {
        //console.log("err ", err);
        //console.log("res ", JSON.stringify(res));

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
    return new Bidder(req, res, next);
};

module.exports = {
    bidder: bidReq
};

