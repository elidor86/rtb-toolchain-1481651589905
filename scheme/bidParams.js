//rvzr params
bidReqData.Browser_Ver = data.browser_version || '';
bidReqData.Language = data.language || '';
bidReqData.IP = data.ip;
bidReqData.os = data.os;
bidReqData.SearchEngine = data.se || '';
bidReqData.Source_ID = data.cid;
bidReqData.Operating_System = data.operatingsystem;
bidReqData.GEO = data.geo;
bidReqData.Query = decodeURIComponent(data.keywords) || '';
bidReqData.URL = decodeURIComponent(data.url) || '';
bidReqData.UserAgent = decodeURIComponent(data.useragent) || '';
bidReqData.Browser = decodeURIComponent(data.browser) || '';
bidReqData.Referrer = decodeURIComponent(data.referer) || '';

//json do bid


var bidJson = {
    "result": {
        "status": "BID",
        "listing": {
            "bid": 0.01,
            "url": "http://rtb.dans-leads.com/tracking?Campaign_ID=204&BID_ID=4ceab61f-3621-4d20-938d-ad3d4c064337"
        }
    }
};


//json Nobid

var noBid = {
    "result": {
        "status": "NOBID"
    }
};


//url where they would send bid req

var url = "http://rtb.dans-leads.com/ch/3/?domain=ask.fm&ip=88.174.206.170&useragent=Mozilla%2F5.0%20(Windows%20NT%2010.0%3B%20WOW64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F50.0.2661.94%20Safari%2F537.36&keywords=salut%20%20stp%20%C3%A9coute%20ce%20son%20%20dun%20rappeur%20qui%20d%C3%A9bute%20et%20donne%20moi%20ton%20avis%20%20httpswwwyoutubecomwatchva65rjyx1yqgsnsfb%20jolielapdp&url=http%3A%2F%2Fask.fm%2FLeilaMouah&referer=https%3A%2F%2Fwww.google.fr%2F&language=fr&browser=chrome&browser_version=50&operatingsystem=windows&geo=fr"


