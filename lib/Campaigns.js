//var mongoDb = require('./mongo');
var Classifier = require('./classifier');
var UrlParser = require('./url-parser');
//var Aerospike = require('./aerospike');
var memcached = require('./memcached');
var Elasticsearch = require('./elasticsearch');
var debugCampaigns = require('./debugCampaigns');
var listsRtb = require('./listsRtb');
var buyingList = require('./buyingList');
var Keywords = require('./keywords');
var Travel = require('./travel');
var co = require('co');

var Campaigns = function (data, cb) {

    this.bidReqData = data;
    this.cb = cb;
    this.campaigns = [];
    this.BuyingList = {};
    this.Defualt_Max_Imp_Per_Cmp = 1;


    if (process.env.DEV == 'true') {
        //this.Defualt_Max_Imp_Per_Cmp = 100;
    }


    this.campaigns = JSON.parse(JSON.stringify(allCmp));
    this.selectCampaign();
    //this.getAllCampaigns();
};

Campaigns.prototype.callbackNetworkMapper = {
    mb: 's2'
};

var allCmp = [];

var fetchCampaigns = function () {

    Elasticsearch.getAllCmp().then(function (data) {

        /// console.log('getAllCmp ', data);


        if (process.env.DEV == 'true') {
            //data.campaigns = data.campaigns.concat(debugCampaigns);
        }


        // console.log("campaigns ", data.campaigns);
        allCmp = data.campaigns;
    }, function (err) {
        console.trace(err.message);
        self.cb(null, null);
    });


};

fetchCampaigns();
setInterval(function () {
    fetchCampaigns();
}, 1000 * 60);

Campaigns.prototype.getAllCampaigns = function () {
    var self = this;


    //console.log("getAllCampaigns ");
    Elasticsearch.getAllCmp().then(function (data) {

        /// console.log('getAllCmp ', data);


        if (process.env.DEV == 'true') {
            //data.campaigns = data.campaigns.concat(debugCampaigns);
        }


        //console.log("campaigns ", data.campaigns);
        self.campaigns = data.campaigns;
        self.bidReqData.Time_To_Get_Cmp = data.took;
        self.bidReqData.Time_To_Get_Cmp_Incluse_Net = data.tookIncludeNetwork;
        self.selectCampaign();
    }, function (err) {
        console.trace(err.message);
        self.cb(null, null);
    });
};


Campaigns.prototype.selectCampaign = function () {
    var self = this;
    var selectedCampaign = null;

    var campaigns = self.campaigns;


    if (!campaigns || campaigns.length == 0) {
        return self.cb(null, null);
    }

    co(function *() {

        for (var i = 0; i < campaigns.length; i++) {
            self.params = {};
            var campaign = campaigns[i];
            // console.log(" campaign", campaign);


            self.currentCmp = campaign;


            var filterByUrl = self.filterByUrl(campaign);
            var filterByKeywords = self.filterByKeywords(campaign);
            var filterByGeo = self.filterByGeo(campaign);
            var filterByPublisher = self.filterByPublisher(campaign);
            var filterByFunction = yield self.filterByFunction(campaign);
            var filterByBuyingList = self.filterByBuyingList(campaign);


            //console.log("\n\n\n\n\n\n\n ");
            //  console.log("campaign ", campaign);

            //  console.log(" campaign", campaign);
            //  console.log("filterByKeywords ", filterByKeywords);
            //  console.log("filterByUrl ", filterByUrl);
            //  console.log("filterByFunction ", filterByFunction);
            //  console.log("filterByGeo ", filterByGeo);
            // console.log("filterByPublisher ", filterByPublisher);
            // console.log("\n\n\n\n\n\n\n ");
            if (filterByPublisher == true && filterByKeywords == true && filterByUrl == true && filterByGeo == true && filterByFunction == true && filterByBuyingList == true) {
                //return self.cb(null, campaign);
                var impressionsCheck = yield self.impressionsCheck(campaign);
                //console.log("impressionsCheck ", impressionsCheck);
                if (impressionsCheck == true) {

                    var updateCmp = yield  Elasticsearch.getCmpById(campaign._id);

                    if (updateCmp.Num_Of_BIDs_Sent >= updateCmp.Max_Num_Of_BIDs) {
                        continue;
                    }

                    if (self.Redirect_URL) {
                        campaign.Redirect_URL = self.Redirect_URL;
                    }

                    selectedCampaign = campaign;
                    self.setCallBackParams(campaign);
                    selectedCampaign.params = self.params;
                    break;
                }
            }
        }

        self.cb(null, selectedCampaign);

    }).catch(function (err) {
        console.trace("err", err);
        return self.cb(null, null);
    });

};

Campaigns.prototype.setCallBackParams = function (campaign) {
    var self = this;

    if (!campaign || !campaign.network) {
        return;
    }

    //callbackNetworkMapper
    var paramName = self.callbackNetworkMapper[campaign.network];
    if (!paramName) {
        return;
    }
    self.params[paramName] = self.bidReqData.BID_ID;
    //console.log("self.params ", self.params);
    return;
};

Campaigns.prototype.filterByUrl = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;
    var reg = new RegExp(campaign.Filter_URLs);
    try {
        return reg.test(bidReqData.URL);
    } catch (e) {
        return false;
    }
};

Campaigns.prototype.filterByKeywords = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;

    var reg = new RegExp(campaign.Filter_KeyWords);


    try {
        return reg.test(bidReqData.Query);
    } catch (e) {
        return false;
    }
};

Campaigns.prototype.filterByPublisher = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;


    if (campaign.publishers) {
        var publishers = campaign.publishers.split(",");
        if (publishers.indexOf(bidReqData.Publisher_ID) > -1) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }

};

Campaigns.prototype.filterByGeo = function (campaign) {
    var self = this;
    var bidReqData = self.bidReqData;

    var reg = new RegExp(campaign.Filter_GEO);
    try {


        return reg.test(bidReqData.GEO);
    } catch (e) {
        return false;
    }
};

Campaigns.prototype.filterByBuyingList = function (campaign) {
    var self = this;
    var BuyingListName = campaign.BuyingList;

    // console.log("BuyingListName ", BuyingListName);
    if (!BuyingListName) {
        return true;
    }
    //console.log("campaign ", campaign);

    //global.logger.debug('self.bidReqData.IP ', self.bidReqData.IP);
    if (buyingList.list[BuyingListName] && buyingList.list[BuyingListName].indexOf(self.bidReqData.IP) > -1) {
        global.logger.debug('filterByBuyingList  true');
        return true;
    } else {
        return false;
    }
};

Campaigns.prototype.filterByFunction = function (campaign) {
    var self = this;
    var funcName = campaign.Filter_Function;
    //console.log("campaign ", campaign);

    return new Promise(function (fulfill, reject) {

        if (self[funcName]) {
            return self[funcName].call(self).then(function (res) {
                fulfill(res);
            }, function () {
                fulfill(false)
            });
        } else {
            fulfill(true);
        }
    });
};

Campaigns.prototype.impressionsCheck = function (campaign) {
    var self = this;
    return new Promise(function (fulfill, reject) {
        co(function *() {

            //  var userImpressionsPerCmp = yield Aerospike.getUserImpressionPerCampaign(self.bidReqData, campaign);
            var userImpressionsPerCmp = yield memcached.getUserImpressionPerCampaign(self.bidReqData, campaign);
            var maxImpPerCmp = campaign.Max_Imp || self.Defualt_Max_Imp_Per_Cmp;

            //console.log("userImpressionsPerCmp <= maxImpPerCmp ", userImpressionsPerCmp <= maxImpPerCmp);
            if (userImpressionsPerCmp < maxImpPerCmp) {
                return fulfill(true);
            }
            fulfill(false);
        }).catch(function (err) {
            console.trace("impressionsCheck err ", err);
            //self.reason = JSON.stringify(err);
            fulfill(false);
        });

    });
};

Campaigns.prototype.jobsPredict = function () {
    var self = this;

    return new Promise(function (fulfill, reject) {

        var bidReqData = self.bidReqData;
        var predict = Classifier.predictFromUrl(bidReqData.URL);
        var params = UrlParser.parseReqUrl(bidReqData.URL);

        // console.log("predict ", predict);
        if (predict == 100 && bidReqData.URL.search("_11") == -1) {
            self.params = params;
            fulfill(true);
        } else {
            fulfill(false);
        }

    });


    // console.log("predict ", predict);
    //console.log("params ", params);
};

Campaigns.prototype.onlyJobWithQ = function (campaign) {
    var self = this;

    return new Promise(function (fulfill, reject) {

        var bidReqData = self.bidReqData;
        var predict = Classifier.predictFromUrl(bidReqData.URL);
        var params = UrlParser.parseReqUrl(bidReqData.URL);

        if (bidReqData.URL && bidReqData.URL.search("\.indeed\.") > -1) {
            fulfill(false);
        }
        //console.log("predict ", predict);
        //console.log("params ", params);
        //console.log("params ", params);

        if (predict == 100 && params && params.q) {
            self.params = params;
            fulfill(true);
        } else {
            fulfill(false);
        }


    });
};

Campaigns.prototype.onlyMac = function () {
    var self = this;

    return new Promise(function (fulfill, reject) {

        var bidReqData = self.bidReqData;
        if (bidReqData && bidReqData.Operating_System && bidReqData.Operating_System.search("mac") > -1) {
            fulfill(true);
        } else {
            fulfill(false);
        }

    });
};

Campaigns.prototype.pcKeeperFr = function () {
    var self = this;

    var hostnameToKeepBuy = [
        'www.google.fr',
        'www.onesafe-software.com',
        'land.pckeeper.software',
        'www.avast.com',
        'securepccleaner.com',
        'fr.search.yahoo.com'
    ];

    var regStr = "(pckeeper|pc cleaner|trojan remover|ccleaner|anti virus|sparktrustpc|\\bavast\\b|avast 2016|télécharger avast|antivirus|spyware|virus removal|internet security|computer protection|pc security|pcmatic|panda security|\\bkaspersky\\b|\\beset\\b|malware)";
    var reg = new RegExp(regStr, 'igm');

    return new Promise(function (fulfill, reject) {

        var bidReqData = self.bidReqData;

        if (bidReqData && bidReqData.Operating_System && bidReqData.Operating_System.search("mac") > -1) {
            fulfill(false);
        }


        if (buyingList.list['pcKeeperFr'].indexOf(bidReqData.IP) > -1) {

            global.logger.debug('pcKeeperFr  in buing list', bidReqData.IP);
            return fulfill(true);
        }

        var regTest = reg.test(bidReqData.Query);

        if (regTest == false) {
            return fulfill(false);
        }

        fulfill(true);

        if (hostnameToKeepBuy.indexOf(bidReqData.URL_Hostname) > -1) {
            Elasticsearch.addToBuyingList('pcKeeperFr', {
                ip: bidReqData.IP,
                date: new Date().getTime()
            })
        }


    });
};


Campaigns.prototype.macKeeper = function () {
    var self = this;

    var hostnameToKeepBuy = /(google|yahoo|bing)/igm;

    var regStr = "(pckeeper|protectmac|spyhunter|trojan remover|macscan|pc cleaner|ccleaner|anti virus|sparktrustpc|\\bavast\\b|avast 2016|télécharger avast|antivirus|spyware|virus removal|internet security|computer protection|pc security|pcmatic|panda security|\\bkaspersky\\b|\\beset\\b|malware)";
    var reg = new RegExp(regStr, 'igm');

    return new Promise(function (fulfill, reject) {

        var bidReqData = self.bidReqData;

        if (bidReqData && bidReqData.Operating_System && bidReqData.Operating_System.search("mac") == -1) {
            return fulfill(false);
        }


        if (buyingList.list['macKeeper'].indexOf(bidReqData.IP) > -1) {

            global.logger.debug('macKeeper  in buing list', bidReqData.IP);
            return fulfill(true);
        }

        var regTest = reg.test(bidReqData.Query);

        if (regTest == false) {
            return fulfill(false);
        }

        fulfill(true);

        if (bidReqData.URL_Hostname.search(hostnameToKeepBuy) > -1) {
            Elasticsearch.addToBuyingList('macKeeper', {
                ip: bidReqData.IP,
                date: new Date().getTime()
            })
        }


    });
};


Campaigns.prototype.jobSeekersExchangeNetworks = function () {
    var self = this;

    var whiteList = /(job|employment)/igm;
    var StopWords = /(blow|eagermoney|jobseeker|nose|interview|signup|apply|tube|teenager|xxx|porn)/igm;


    return new Promise(function (fulfill, reject) {

        var bidReqData = self.bidReqData;

        if (!bidReqData || !bidReqData.Query) {
            return fulfill(false);
        }

        if (buyingList.list['jobSeekersExchangeNetworks'].indexOf(bidReqData.IP) > -1) {
            global.logger.debug('jobSeekersExchangeNetworks  in buing list', bidReqData.IP);
            return fulfill(true);
        }

        if (bidReqData.Query.search(StopWords) > -1) {
            return fulfill(false);
        }


        if (bidReqData.Query.search(whiteList) == -1) {
            return fulfill(false);
        }

        var q = '';

        for (var i = 0; i < listsRtb.jobSearchQ.length; i++) {
            var tmpQ = listsRtb.jobSearchQ[i];
            if (bidReqData.Query.search(tmpQ) > -1) {
                q = tmpQ;
                break;
            }
        }

        self.params = {
            q: q,
            l: bidReqData.formatLocation
        };

        // global.logger.debug(' .params ', self.params);

        fulfill(true);

        Elasticsearch.addToBuyingList('jobSeekersExchangeNetworks', {
            ip: bidReqData.IP,
            date: new Date().getTime()
        });

    });
};

Campaigns.prototype.vhmDirect = function () {
    var self = this;

    return new Promise(function (fulfill, reject) {

        var bidReqData = self.bidReqData;
        var predict = Classifier.predictFromUrl(bidReqData.URL);
        var params = UrlParser.parseReqUrl(bidReqData.URL);


        if (predict == 100 && params) {

            var siteid = bidReqData.GEO || "";
            siteid = siteid.toLowerCase();
            if (siteid == 'gb') {
                siteid = 'uk';
            }
            siteid = siteid.toUpperCase();

            var sub_id = siteid + "_11";

            self.params = {
                keyword: params.q,
                siteid: siteid,
                sub_id: sub_id,
                location: params.l || bidReqData.formatLocation
            };

            fulfill(true);
        } else {
            fulfill(false);
        }

    });

};


Campaigns.prototype.vhm = function () {
    var self = this;


    return new Promise(function (fulfill, reject) {
        co(function *() {
            var bidReqData = self.bidReqData;
            var predict = Classifier.predictFromUrl(bidReqData.URL);

            if (!predict || predict != 100) {
                return fulfill(false);
            }

            if (!bidReqData.latlon) {
                return fulfill(false);
            }

            var params = UrlParser.parseReqUrl(bidReqData.URL);

            var data = {
                lat: bidReqData.latlon.lat,
                lon: bidReqData.latlon.lon,
                q: bidReqData.Query
            };

            if (params && params.q) {
                data.q = params.q;
            }

            var jobUrl = yield Elasticsearch.getJobUrl(data);

            if (jobUrl && jobUrl.length > 0) {
                self.params = {
                    url: jobUrl + "&subid=C232_" + bidReqData.GEO,
                    q: data.q,
                    l: bidReqData.formatLocation
                };
                //console.log("self.params ", self.params);
                fulfill(true);
            } else {
                fulfill(false);
            }

            // console.log("jobUrl ", jobUrl);

        }).catch(function (err) {
            console.trace("vhm err ", err);
            //self.reason = JSON.stringify(err);
            fulfill(false);
        });

    });
};


Campaigns.prototype.travelmediadirect = function () {
    var self = this;

    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }


    return new Promise(function (fulfill, reject) {
        co(function *() {
            var bidReqData = self.bidReqData;
            var classify = Travel.classify(bidReqData);

            global.logger.debug(" Travel.classify ", classify);

            if (!classify) {
                return fulfill(false);
            }

            var urls = {
                flights: [
                    'http://www.tripbase.com/flights/',
                    'http://lastmin-flights.com/'
                ],
                cars: [
                    'http://www.tripbase.com/cars/',
                    'http://cheap-auto-rentals.com/'
                ],
                hotels: [
                    'http://www.tripbase.com/hotels/'
                ],
                cruise: [
                    'http://cruise-compare.com/cruiseSearch.php'
                ]
            };

            var urlsArr = urls[classify.cat];
            var index = randomIntFromInterval(0, urlsArr.length - 1);
            var url = urls[classify.cat][index];

            url += '?utm_source=adt_' + bidReqData.BID_ID;
            self.Redirect_URL = url;

            global.logger.debug('self.Redirect_URL ', self.Redirect_URL);
            fulfill(true);


            //Redirect_URL

            // console.log("jobUrl ", jobUrl);

        }).catch(function (err) {
            console.trace("vhm err ", err);
            //self.reason = JSON.stringify(err);
            fulfill(false);
        });

    });
};

Campaigns.prototype.BookingBuddy = function () {
    var self = this;

    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }


    return new Promise(function (fulfill, reject) {
        co(function *() {
            var bidReqData = self.bidReqData;
            var classify = Travel.classify(bidReqData);

            global.logger.debug(" Travel.classify ", classify);

            if (!classify) {
                return fulfill(false);
            }

            var urls = {
                flights: [
                    'http://www.tripbase.com/flights/',
                    'http://lastmin-flights.com/'
                ],
                cars: [
                    'http://www.tripbase.com/cars/',
                    'http://cheap-auto-rentals.com/'
                ],
                hotels: [
                    'http://www.tripbase.com/hotels/'
                ],
                cruise: [
                    'http://top-cruise-deals.com/'
                ]
            };

            var urlsArr = urls[classify.cat];
            var index = randomIntFromInterval(0, urlsArr.length - 1);
            var url = urls[classify.cat][index];

            url += '?utm_source=adt_' + bidReqData.BID_ID;
            self.Redirect_URL = url;

            global.logger.debug('self.Redirect_URL ', self.Redirect_URL);
            fulfill(true);


            //Redirect_URL

            // console.log("jobUrl ", jobUrl);

        }).catch(function (err) {
            console.trace("vhm err ", err);
            //self.reason = JSON.stringify(err);
            fulfill(false);
        });

    });
};

Campaigns.prototype.ohoteldeals = function () {
    var self = this;


    return new Promise(function (fulfill, reject) {
        co(function *() {

            
            var bidReqData = self.bidReqData;
            var classify = Travel.classify(bidReqData);

            global.logger.debug(" Travel.classify ", classify);

            if (!classify) {
                return fulfill(false);
            }

            var urls = {
                flights: [
                    'http://www.tripbase.com/flights/',
                    'http://lastmin-flights.com/'
                ],
                cars: [
                    'http://www.tripbase.com/cars/',
                    'http://cheap-auto-rentals.com/'
                ],
                hotels: [
                    'http://www.tripbase.com/hotels/'
                ],
                cruise: [
                    'http://top-cruise-deals.com/'
                ]
            };

            var urlsArr = urls[classify.cat];
            var index = randomIntFromInterval(0, urlsArr.length - 1);
            var url = urls[classify.cat][index];

            url += '?utm_source=adt_' + bidReqData.BID_ID;
            self.Redirect_URL = url;

            global.logger.debug('self.Redirect_URL ', self.Redirect_URL);
            fulfill(true);


            //Redirect_URL

            // console.log("jobUrl ", jobUrl);

        }).catch(function (err) {
            console.trace("vhm err ", err);
            //self.reason = JSON.stringify(err);
            fulfill(false);
        });

    });
};


var getCampaign = function (data, cb) {
    return new Campaigns(data, cb)
};

module.exports = {
    getCampaign: getCampaign
};