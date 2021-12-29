class Topoflow {
    // This is just the example syntax, and this variable will not be used anywhere
    public main_dataset_suggested_format = {
        "links": [
            {
                "from": "00a-core-1",
                "to": "00a-core-2",
                "links": [
                    {
                        "type": "1way",
                        "load_out": "20",
                        "load_in": "20",
                        "rate_out": "331 M",
                        "rate_in": "337 M",
                        "state": "up"
                    },
                    {
                        "type": "1way",
                        "max_out": "20",
                        "max_in": "20",
                        "rate_out": "331",
                        "rate_in": "337 M",
                        "state": "up"
                    }
                ]
            },
            {
                "from": "00a-core-1",
                "to": "00b-core-1",
                "links": [
                    {
                        "type": "2way",
                        "load_out": "20",
                        "load_in": "20",
                        "rate_out": "331 M",
                        "rate_in": "337 M",
                        "state": "up"
                    },
                    {
                        "type": "2way",
                        "load_out": "20",
                        "load_in": "20",
                        "rate_out": "331 M",
                        "rate_in": "337 M",
                        "state": "up"
                    }
                ]
            },
            {
                "from": "00a-core-1",
                "to": "00a-core-2",
                "links": [
                    {
                        "type": "1way",
                        "load_out": "20",
                        "load_in": "20",
                        "rate_out": "331 M",
                        "rate_in": "337 M",
                        "state": "up"
                    }
                ]
            },
        ]
    };
}