var MMDBReader = require('mmdb-reader');
var https = require('https');
var fs = require('fs');
var ee = require("./events-emitter").event;

var reader = null;
reader = new MMDBReader('GeoIP2-City.mmdb');




var getDataFromIp = function (ip) {
    if (!reader) {
        return null;
    }

    var ipLookUp = null, ipRes = {}, formatLocation = "";
    var geoNamesMap = {
        jp: 'ja',
        us: 'en',
        de: 'de',
        fr: 'fr',
        gb: 'en'
    };


    ipLookUp = reader.lookup(ip);


    if (!ipLookUp) {
        return null;
    }

    if (ipLookUp.country && ipLookUp.country.iso_code) {
        ipRes.geo = ipLookUp.country.iso_code.toLowerCase() || 'us';
    } else {
        return null;
    }

    if (ipLookUp.city && ipLookUp.city.names) {
        if (ipLookUp.city.names[geoNamesMap[ipRes.geo]]) {
            ipRes.city = ipLookUp.city.names[geoNamesMap[ipRes.geo]];
        } else {
            ipRes.city = ipLookUp.city.names.en;
        }
        ipRes.city = ipRes.city.replace("-", " ");
        formatLocation = ipRes.city;
    }

    if (ipLookUp.subdivisions) {
        var subdivisionsLength = ipLookUp.subdivisions.length;
        var subdivisions = ipLookUp.subdivisions[subdivisionsLength - 1];

        if (subdivisions.names[geoNamesMap[ipRes.geo]]) {
            ipRes.region = subdivisions.names[geoNamesMap[ipRes.geo]];
        } else {
            ipRes.region = subdivisions.names.en;
        }

        ipRes.region = ipRes.region.replace("-", " ");

        if (ipRes.region && (ipRes.region != ipRes.city)) {
            formatLocation = formatLocation + ", " + ipRes.region;
        }


        ipRes.formatLocation = formatLocation;


        if (ipLookUp.subdivisions[0] && ipLookUp.subdivisions[0].iso_code) {
            ipRes.state = ipLookUp.subdivisions[0].iso_code.toLowerCase();
        }


    }

    if (ipLookUp.postal && ipLookUp.postal.code) {
        ipRes.postal = ipLookUp.postal.code;
    }

    if (ipLookUp.location && ipLookUp.location.latitude) {
        ipRes.latlon = {};
        ipRes.latlon.latitude = ipLookUp.location.latitude;
        ipRes.latlon.longitude = ipLookUp.location.longitude;
    }


    //console.log("ipLookUp ", ipLookUp);
    //console.log("ipLookUp ", ipRes);

    return ipRes;
};

var getLocFromIpReq = function (req, res) {

    if (!reader) {
        return res.json({error: 'not init'});
    }

    var data = req.query;
    var ip = data.ip || req.remoteIp;

    console.log("ip is :", ip);


    if (ip) {
        res.json(getDataFromIp(ip));
    } else {
        res.json({error: 'not init'});
    }
};

var getheaders = function (req, res) {
    return res.json(req.headers);
};

var getLocFromIp = function (ip) {

    if (!reader) {
        return null;
    }

    if (ip) {
        return getDataFromIp(ip);
    } else {
        return null;
    }
};

module.exports = {
    getLocFromIpReq: getLocFromIpReq,
    getheaders: getheaders,
    getLocFromIp: getLocFromIp
};

