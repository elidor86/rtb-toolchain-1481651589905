a = {
    "query": {
        "filtered": {
            "query": {
                "match_all": {}
            },
            "filter": {
                "bool": {
                    "must": [{
                        "range": {
                            "Date": {
                                "gte": 1462395600000,
                                "lte": 1465480125399,
                                "format": "epoch_millis"
                            }
                        }
                    }], "must_not": []
                }
            }
        }
    }
}