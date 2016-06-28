var Travel = function (bidData) {

    this.bidData = bidData;
    this.travelCat = null;

    //var classify = this.classify();

    //console.log("classify", classify);

    //return classify;


};


Travel.prototype.isTravel = function () {
    var self = this;
    var bidData = self.bidData;

    var oneWord = [
        '\\.enterprise\\.',
        '\\.hertz\\.',
        '\\.avis\\.',
        '\\.budget\\.',
        '\\.zipcar\\.',
        '\\.rentalcars\\.',
        '\\.carrentals\\.',
        '\\.nationalcar\\.',
        '\\.alamo\\.',
        '\\.thrifty\\.',
        '\\.sixt\\.',
        '\\.foxrentacar\\.',
        '\\.hirecentric\\.',
        '\\.paylesscar\\.',
        '\\.rentlingo\\.',
        '\\.europcar\\.',
        '\\.jetblue\\.',
        '\\.airportrentalcars\\.',
        '\\.economybookings\\.',
        '\\.autoslash\\.',
        '\\.autorentals\\.',
        '\\.skyscanner\\.',
        '\\.priceline\\.',
        '\\.tripadvisor\\.',
        '\\.expedia\\.',
        '\\.kayak\\.',
        '\\.cheaptickets\\.',
        '\\.spirit\\.',
        '\\.cheapoair\\.',
        '\\.royalcaribbean\\.',
        '\\.carnival\\.',
        '\\.aaa\\.',
        '\\.onetravel\\.',
        '\\.smartfares\\.',
        '\\.hotwire\\.',
        '\\.google\\.',
        '\\.orbitz\\.',
        '\\.farecompare\\.',
        '\\.travelocity\\.',
        '\\.bookingbuddy\\.',
        '\\.cheapfares\\.',
        '\\.jetcost\\.',
        '\\.farebuzz\\.',
        '\\.travelzoo\\.',
        '\\.hipmunk\\.',
        '\\.booking\\.',
        '\\.starwoodhotels\\.',
        '\\.cheapflights\\.',
        '\\.delta\\.',
        '\\.aa\\.',
        '\\.trivago\\.',
        '\\.southwest\\.',
        '\\.marriott\\.',
        '\\.vayama\\.',
        '\\.justfly\\.',
        '\\.united\\.',
        '\\.hotels\\.',
        '\\.vrbo\\.',
        '\\.hilton\\.',
        '\\.flightaware\\.',
        '\\.britishairways\\.',
        '\\.choicehotels\\.',
        '\\.flyfrontier\\.',
        '\\.allegiantair\\.',
        'flights',
        '(?=.*deals)(?=.*hotel)',
        '(?=.*best)(?=.*hotel)',
        '(?=.*cheap)(?=.*hotel)',
        '(?=.*car)(?=.*rental)',
        '\\.hyatt\\.'
    ];


    var str = oneWord.join("|");
    var regex = new RegExp("(" + str + ")", "igm");


    var blackWords = [
        'clashoflights',
        'used',
        'status',
        'admin',
        'porn',
        'apartment',
        'scars',
        'sale',
        'careers',
        'carshow',
        'google maps',
        'seriefly',
        'games',
        'flyer'
    ];

    var blackWordsStr = blackWords.join("|");
    var blackWordsRegex = new RegExp("(" + blackWordsStr + ")", "igm");


    var isBlack = blackWordsRegex.test(bidData.URL);


    if (isBlack == true) {
        return false;
    }

    var isBlack = blackWordsRegex.test(bidData.Query);


    if (isBlack == true) {
        return false;
    }


    var isInUrl = regex.test(bidData.URL);

    if (isInUrl == true) {
        return true;
    }

    var isInQuery = regex.test(bidData.Query);

    if (isInQuery == true) {
        return true;
    }

    return false;
};


Travel.prototype.classify = function () {
    var self = this;
    var bidData = self.bidData;

    var isTravel = self.isTravel();

    if (isTravel == false) {
        return null;
    }

    var categories = {
        flights: [
            'flight',
        ],
        cars: [
            'cars',
            '(?=.*car)(?=.*rental)'
        ],
        hotels: [
            'hotel'
        ]
    };

    var cat = null;
    for (var key in categories) {
        var str = categories[key].join("|");
        var regex = new RegExp(str, "ig");
        var catTestUrl = regex.test(bidData.URL);

        if (catTestUrl == true) {
            cat = key;
            break;
        }

        var catTestQuery = regex.test(bidData.Query);

        if (catTestQuery == true) {
            cat = key;
            break;
        }
    }

    if (cat != null) {
        return {cat: cat};
    }

    return null;

};


var demoBid = {
    Year: 2016,
    Day: 26,
    Month: 6,
    Browser_Ver: '51',
    Language: 'es',
    IP: '62.57.183.2012',
    os: undefined,
    SearchEngine: '',
    Source_ID: undefined,
    Operating_System: 'windows',
    GEO: 'fr',
    BID_ID: 'c4b6eb53-80ec-4e0b-a6cd-3b0ea8071f06',
    Publisher_ID: '2',
    DateTS: 1466964019796,
    stateFromIp: 'ct',
    postalFromIp: '08020',
    regionFromIp: 'Barcelona',
    cityFromIp: 'Barcelona',
    formatLocation: 'Barcelona',
    latlon: {lon: 2.159, lat: 41.3888},
    Query: 'antivirus',
    URL: 'https://www.biiger.com/cheap-ny-car',
    UserAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36',
    Browser: 'chrome',
    Referrer: 'https://www.google.es/',
    Job_Predict_URL: 0,
    Job_Predict_Referrer: 0,
    URL_Hostname: 'www.google.es',
    Referrer_Hostname: 'www.google.es',
    URL_Query_Q: 'real japonesa sexo'
}

a = new Travel(demoBid);
console.log("classify a", a.classify());


module.exports = {
    classify: function (bid) {
        var travel = new Travel(bid);
        return travel.classify();
    }
};