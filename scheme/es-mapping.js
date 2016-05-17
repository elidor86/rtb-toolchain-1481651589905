var index = {
    "settings": {},
    "mappings": {
        "_default_": {
            "properties": {
                "date": {
                    "type": "date"
                },
                "Channel_ID": {"type": "integer"},
                "Campaign_ID": {"type": "integer"},
                "Campaign_Name": {"type": "string", "index": "not_analyzed"},
                "BID_Value": {"type": "float"},
                "Redirect_URL": {"type": "string", "index": "not_analyzed"},
                "Max_Num_Of_BIDs": {"type": "integer"},
                "Bid_URL": {"type": "string", "index": "not_analyzed"},
                "Filter_GEO": {"type": "string", "index": "not_analyzed"},
                "Filter_URLs": {"type": "string", "index": "not_analyzed"},
                "Filter_KeyWords": {"type": "string", "index": "not_analyzed"},
                "Filter_Function": {"type": "string", "index": "not_analyzed"},
                "Num_Of_BIDs_Sent": {"type": "integer"},
                "Num_Of_BIDS_Won": {"type": "integer"},

                "Browser_Ver": {"type": "string", "index": "not_analyzed"},
                "Language": {"type": "string", "index": "not_analyzed"},
                "IP": {"type": "string", "index": "not_analyzed"},
                "os": {"type": "string", "index": "not_analyzed"},
                "SearchEngine": {"type": "string", "index": "not_analyzed"},
                "Source_ID": {"type": "string", "index": "not_analyzed"},
                "Operating_System": {"type": "string", "index": "not_analyzed"},
                "GEO": {"type": "string", "index": "not_analyzed"},
                "BID_ID": {"type": "string", "index": "not_analyzed"},
                "Publisher_ID": {"type": "string", "index": "not_analyzed"},
                "latlon": {"type": "geo_point"},
                "Query": {"type": "string"},
                "URL": {"type": "string"},
                "UserAgent": {"type": "string", "index": "not_analyzed"},
                "Browser": {"type": "string", "index": "not_analyzed"},
                "Referrer": {"type": "string"},
                "URL_Protocol": {"type": "string", "index": "not_analyzed"},
                "URL_Pathname": {"type": "string"},

                "BID_url": {"type": "string", "index": "not_analyzed"},

                "BID_Currency": {"type": "string", "index": "not_analyzed"},


                "Redirect_URL": {"type": "string", "index": "not_analyzed"}
            }
        }
    }
}