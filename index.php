<?php
    if(!isset($_GET['source'])){
        header('Location: ?source=data.json');
    }

    foreach(glob("*.json") as $json_file){
        echo '<a style="margin-right: 1em; font-size: 2em;" href="?source=' . $json_file . '">' . $json_file . '</a>';
    }
?><br><!DOCTYPE html>
<html>
    <head>
        <title>Weathermap test</title>

        <script src="https://d3js.org/d3.v6.min.js"></script>
        <script
            src="https://code.jquery.com/jquery-3.6.0.min.js"
            integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
            crossorigin="anonymous"></script>

        <style type="text/css">
            *{
                margin: 0;
                padding: 0;
            }
            html, body{
                width: 100%;
                height: 100%;
                font-size: 10px;
            }
            svg{
                width: 1500px;
                height: 1000px;
                background-color: #000;
            }
                svg .link-text{
                    fill: #f0a;
                    font-size: 1.5rem;
                }

                svg .node-text{
                    font-size: 1.5rem;
                    font-weight: bold;
                    fill: #fff;
                }

                svg .link{
                    stroke: #fff;
                }

                svg .arrow{
                    fill: #fff;
                }

                svg .link-down{
                    stroke-dasharray: 10;
                    stroke: #f00;
                }
        </style>



    </head>
    <body>
        <svg id="canvas">
            <defs>
                <svg id="router" width="100%" height="100%" viewBox="0 0 300 300" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                    <g>
                        <circle cx="150" cy="150" r="150" style="fill:rgb(255,254,254);"/>
                        <path d="M150,0C232.787,0 300,67.213 300,150C300,232.787 232.787,300 150,300C67.213,300 0,232.787 0,150C0,67.213 67.213,0 150,0ZM150,16C223.957,16 284,76.043 284,150C284,223.957 223.957,284 150,284C76.043,284 16,223.957 16,150C16,76.043 76.043,16 150,16Z" style="fill:rgb(77,77,77);"/>
                        <g transform="matrix(0.852016,0,0,0.852016,41.581,41.4926)">
                            <path d="M138.458,152.273L138.458,202.269L158.915,181.814L158.846,213.18L127.346,244.68L95.912,213.245L95.912,181.769L116.43,202.287L116.43,152.415L138.458,152.273ZM194.491,116.43L244.364,116.43L244.505,138.458L194.509,138.458L214.964,158.915L183.599,158.846L152.099,127.346L183.533,95.912L215.009,95.912L194.491,116.43ZM70.967,158.915L39.49,158.915L60.009,138.397L10.136,138.397L9.994,116.369L59.99,116.369L39.536,95.912L70.901,95.981L102.401,127.481L70.967,158.915ZM116.369,102.434L116.369,52.438L95.912,72.893L95.981,41.527L127.481,10.028L158.915,41.462L158.915,72.938L138.397,52.42L138.397,102.292L116.369,102.434Z" style="fill:rgb(77,77,77);"/>
                        </g>
                    </g>
                </svg>
            </defs>

        </svg>

        <script>
            $( document ).ready(function() {
                /*
                    colors
                */
                var color = {
                    // 'link_text': '#ff0000',
                    // 'link': '#fff',
                    // 'node_text': '#fff',
                    'circle_fill': '#000',
                    'circle_outline': '#fff',
                    'arrow_pointer': '#fff'
                }

                var svg_container = d3.select("#canvas");
                var main_group = svg_container.append("g")
                    .attr('class', 'main_group');
                var svg = main_group;


                /**
                    Defines the default options for the maps. This is to be able to override options by each JSON source.
                */
                var options = {

                    /*
                        Sets the radius of the node, if node type is not specified, or node type is "circle"
                        default: 40
                    */
                    "node_radius": 40,

                    /*
                        Whether or not the node text should be below or centered within the node.
                        false: below
                        true: centered
                    */
                    "node_text_centered": false,

                    /*
                        Whether or not the optional text on the links should be rotated along the link or not
                        false: no rotation
                        true: text is rotated along the link
                    */
                    "link_text_rotation": true,

                    /*
                        prevents the link text from being displayed upside down (180 degrees)
                    */
                    "link_text_prevent_upside_down": true,



                    /*
                        Not implemented yet
                    */
                    "display_fullscreen": false,
                    "svg_width": 1500,
                    "svg_height": 1000
                };


                // var node_radius = 40;

                var markerBoxWidth = 20
                var markerBoxHeight = 20
                var arrowPoints = [[0, 0], [0, 20], [20, 10]];

                var dataset_suggested_format = {
                    "links": [
                        {
                            "from": "00a-core-1",
                            "to": "00a-core-2",
                            "links": [
                                {
                                    "type": "1way",
                                    "max_out": "20",
                                    "max_in": "20",
                                    "rate_out": "331 M",
                                    "rate_in": "337 M",
                                    "state": "up"
                                },
                                {
                                    "type": "1way",
                                    "max_out": "20",
                                    "max_in": "20",
                                    "rate_out": "331 M",
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
                                    "max_out": "20",
                                    "max_in": "20",
                                    "rate_out": "331 M",
                                    "rate_in": "337 M",
                                    "state": "up"
                                },
                                {
                                    "type": "2way",
                                    "max_out": "20",
                                    "max_in": "20",
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
                                    "max_out": "20",
                                    "max_in": "20",
                                    "rate_out": "331 M",
                                    "rate_in": "337 M",
                                    "state": "up"
                                }
                            ]
                        },
                    ]
                };



                /*
                    To hold all the magic. All the links and nodes
                    dataset.nodes.blabla
                    dataset.links.blabla
                */
                var dataset = {};


                /*
                    Required parameters for adding a node
                */
                var required_node_parameters = [
                    'x', // x coordinate
                    'y', // y coordinate
                    'name' // name of node
                ]


                /*
                    Required parameters for adding a link
                */
                var required_link_parameters = [
                    'x1', // start x coordinate
                    'y1', // start y coordinate
                    'x2', // end y coordinate
                    'y2' // end y coordinate
                ]








                /*
                    #########################
                    #                       #
                    #       FUNCTIONS       #
                    #                       #
                    #########################
                */
                function draw_node(args){
                    /*
                        Validating args to confirm required node parameters
                    */
                    for(prop in required_node_parameters){
                        if(required_node_parameters[prop] in args !== true){
                            console.log('Error: unable to draw node. Missing parameter "' + required_node_parameters[prop] + '"');
                            return false;
                        }
                    }

                    console.log('Drawing node ' + args.name);

                    /*
                    if('type' in args){
                        if(args.type == 'router'){
                            console.log('ROUTER');
                        }
                    }
                    */


                    /*
                        Add node
                    */
                    console.log('options.node_radius:' + options.node_radius);
                    var node = svg.append("circle")
                        .attr('cx', args.x)
                        .attr('cy', args.y)
                        .attr('r', options.node_radius)
                        .attr('stroke-width', 5)
                        .attr('stroke', color.circle_outline)
                        .style('fill', color.circle_fill)
                        .attr('data-node-name', 'asdf')
                        .on("click", function(){
                            console.log(d3.select(this));
                        })
                        .on("mouseover", function(d) {
                            d3.select(this).style("fill", "#3236a8");
                        }).on("mouseout", function(d) {
                            d3.select(this).style("fill", color.circle_fill);
                        });

                    /*
                        If the node text should be drawn in center of the node, or below.
                        Defaults to below.
                    */
                    if(options.node_text_centered === true){
                        var node_text_location = args.y;
                    }else{
                        var node_text_location = args.y+(options.node_radius*1.4)
                    }

                    svg.append("text")
                        .attr('class', 'node-text')
                        .attr('x', args.x)
                        .attr('y', node_text_location)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .text(args.name)

                    if('state' in args){
                        if(args.state == 'down'){
                            console.log('ROUTER DOWN');
                            node.attr('stroke', '#f00');
                        }
                    }
                }

                /*
                    arg must contain:
                    * from
                    * to
                */
                function draw_link(args){
                    console.log('Drawing link from ' + args.from + ' to ' + args.to);
                    console.log(args);

                    //Global settings
                    var split_point = 0.5;
                    var text_pos = 0.5;

                    var midpoint_offset = 20;

                    var from_node_pos_x = dataset.nodes[args.from].x;
                    var from_node_pos_y = dataset.nodes[args.from].y;

                    var to_node_pos_x = dataset.nodes[args.to].x;
                    var to_node_pos_y = dataset.nodes[args.to].y;



                    var halfway_pos_x = to_node_pos_x-(to_node_pos_x-from_node_pos_x)*split_point;
                    var halfway_pos_y = to_node_pos_y-(to_node_pos_y-from_node_pos_y)*split_point;

                    /*
                        Calculate the angle of the line. used to rotate the text to fit inside the arrow line
                        https://stackoverflow.com/questions/34293488/d3-find-the-angle-of-line
                    */
                    var angle_a_to_b = Math.atan2(to_node_pos_y - from_node_pos_y, to_node_pos_x - from_node_pos_x);
                    var degrees = angle_a_to_b*(180/Math.PI)


                    /*
                        To flip the text rotation the easy way for humans to read (e.g. never upside down)
                    */
                    text_degrees = 0;
                    if(options.link_text_rotation === true){
                        text_degrees = degrees;

                        if(options.link_text_prevent_upside_down === true && text_degrees > 90 && text_degrees < 181){
                            text_degrees += 180;
                        }
                    }


                    /*
                        Assign rate (used bandwidth)
                    */
                    // var tx_rate = Math.floor(Math.random() * 10000) + ' Mb/s';
                    // var rx_rate = Math.floor(Math.random() * 10000) + ' Mb/s';
                    var rate_in = '',
                        rate_out = '';

                    if('rate_in' in args){
                        rate_in = args.rate_in; 
                    }
                    if('rate_out' in args){
                        rate_out = args.rate_out; 
                    }


                    /*
                        Assign state
                    */

                    if('state' in args){
                        if(args.state == 'down'){
                            var link_state = 'down';
                        }
                    }else{
                        var link_state = 'up';
                    }

                    /*
                        A -> B
                    */
                    svg
                        .append('line')
                            .attr('class', 'link link-' + link_state)
                            .attr('x1', from_node_pos_x)
                            .attr('y1', from_node_pos_y)
                            .attr('x2', halfway_pos_x - Math.cos(angle_a_to_b) * midpoint_offset)
                            .attr('y2', halfway_pos_y - Math.sin(angle_a_to_b) * midpoint_offset)
                            .attr('stroke', color.link)
                            .attr('stroke-width', 20)
                            .attr('marker-end', 'url(#arrow)')
                            .on("click", function(){
                                console.log(d3.select(this).attr('y1'));
                            });

                    /*
                        B -> A
                    */
                    svg
                        .append('line')
                            .attr('class', 'link link-' + link_state)
                            .attr('x1', to_node_pos_x)
                            .attr('y1', to_node_pos_y)
                            .attr('x2', halfway_pos_x- Math.cos(angle_a_to_b + Math.PI) * midpoint_offset)
                            .attr('y2', halfway_pos_y- Math.sin(angle_a_to_b + Math.PI) * midpoint_offset)
                            .attr('stroke', color.link)
                            .attr('stroke-width', 20)
                            .attr('marker-end', 'url(#arrow)')
                            .on("mouseover", function(d) {
                                d3.select(this).style("stroke", "#3236a8");
                            })
                            .on("mouseout", function(d) {
                                d3.select(this).style("stroke", color.link);
                            })
                            .on("click", function(){
                                console.log(d3.select(this).attr('y1'));
                            });

                    /*
                        Text on A -> B
                    */
                    if(link_state !== 'down'){
                        svg.append("text")
                            .attr('class', 'link-text')
                            .attr('x', from_node_pos_x+((to_node_pos_x-from_node_pos_x)*split_point*text_pos))
                            .attr('y', from_node_pos_y+((to_node_pos_y-from_node_pos_y)*split_point*text_pos))
                            .attr('transform', 'rotate(' + text_degrees + ', ' + (from_node_pos_x+((to_node_pos_x-from_node_pos_x)*split_point*text_pos)) + ', ' + (from_node_pos_y+((to_node_pos_y-from_node_pos_y)*split_point*text_pos)) + ')') // rotates the text
                            .attr('text-anchor', 'middle')
                            .attr('dominant-baseline', 'middle')
                            .text(rate_out)

                        /*
                            Text on B -> A
                        */
                        svg.append("text")
                            .attr('class', 'link-text')
                            .attr('x', to_node_pos_x-((to_node_pos_x-from_node_pos_x)*split_point*text_pos))
                            .attr('y', to_node_pos_y-((to_node_pos_y-from_node_pos_y)*split_point*text_pos))
                            .attr('transform', 'rotate(' + text_degrees + ', ' + (to_node_pos_x-((to_node_pos_x-from_node_pos_x)*split_point*text_pos)) + ', ' + (to_node_pos_y-((to_node_pos_y-from_node_pos_y)*split_point*text_pos)) + ')') // rotates the text
                            .attr('text-anchor', 'middle')
                            .attr('dominant-baseline', 'middle')
                            .text(rate_in)
                    }
                }


                /**
                    Used for placing text on links
                    @param {object} args: must contain 'x', 'y' and 'text'
                */
                function draw_text_on_link(args){

                }

                function draw_link_1way(args){
                    console.log('Drawing 1way link from ' + args.from + ' to ' + args.to);
                    console.log(args);

                    //Global settings

                    var text_pos = 0.5;
                    var rotate_text = true; 

                    var from_node_pos_x = dataset.nodes[args.from].x;
                    var from_node_pos_y = dataset.nodes[args.from].y;

                    var to_node_pos_x = dataset.nodes[args.to].x;
                    var to_node_pos_y = dataset.nodes[args.to].y;

                    var angle_a_to_b = Math.atan2(to_node_pos_y - from_node_pos_y, to_node_pos_x - from_node_pos_x);
                    var degrees = angle_a_to_b*(180/Math.PI)

                    /*
                        To flip the text rotation the easy way for humans to read (e.g. never upside down)
                    */
                    
                    if(rotate_text != false){
                        text_degrees = degrees;
                        if(text_degrees > 90 && text_degrees < 181){
                            text_degrees += 180;
                        }
                    }else{
                        text_degrees = 0;
                    }

                    /*
                        Assign state
                    */

                    if('state' in args){
                        if(args.state == 'down'){
                            var link_state = 'down';
                        }
                    }else{
                        var link_state = 'up';
                    }

                    /*
                        A -> B
                    */
                    svg
                        .append('line')
                            .attr('class', 'link link-' + link_state)
                            .attr('x1', from_node_pos_x)
                            .attr('y1', from_node_pos_y)
                            .attr('x2', to_node_pos_x- (Math.cos(angle_a_to_b) * (options.node_radius+25)))
                            .attr('y2', to_node_pos_y - (Math.sin(angle_a_to_b) * (options.node_radius+25)))
                            .attr('stroke', color.link)
                            .attr('stroke-width', 20)
                            .attr('marker-end', 'url(#arrow)')
                            .on("click", function(){
                                console.log(d3.select(this).attr('y1'));
                            });

                  
                    if('rate' in args){
                        /*
                            Draw text
                        */
                        if(link_state !== 'down'){
                            svg.append("text")
                                .attr('class', 'link-text')
                                .attr('x', from_node_pos_x+((to_node_pos_x-from_node_pos_x)*text_pos))
                                .attr('y', from_node_pos_y+((to_node_pos_y-from_node_pos_y)*text_pos))
                                .attr('transform', 'rotate(' + text_degrees + ', ' + (from_node_pos_x+((to_node_pos_x-from_node_pos_x)*text_pos)) + ', ' + (from_node_pos_y+((to_node_pos_y-from_node_pos_y)*text_pos)) + ')') // rotates the text
                                .attr('text-anchor', 'middle')
                                .attr('dominant-baseline', 'middle')
                                .text(args.rate)
                        }
                    }
                }

                d3.select("defs")
                    .append('marker')
                        .attr('id', 'arrow')
                        .attr('class', 'arrow')
                        .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
                        .attr('refX', 1) // 1 point overlap on marker and line
                        .attr('refY', 10)
                        .attr('markerWidth', markerBoxWidth)
                        .attr('markerHeight', markerBoxHeight)
                        .attr('orient', 'auto-start-reverse')
                        .attr('markerUnits', 'userSpaceOnUse') // Needed, or the arrow head will inherit the stroke-width of the line "parent"
                        // .attr('fill', '#f0a')
                        .append('path')
                            .attr('d', d3.line()(arrowPoints))
                            // .attr('stroke', color.arrow_pointer)
                            // .attr('fill', '#f0a');

                /*
                    Populate the dataset
                    Prevent caching
                */
                function run(){
                    console.log('run() called');
                    $.getJSON('<?php echo $_GET['source']?>', {_: new Date().getTime()}, function(data){
                        // svg.selectAll(".svg_container").remove();
                        dataset = data;

                        console.log(data);

                        /*
                            Conditionally overrides the default options from the options in the loaded JSON object "data"
                            Will only override if the option is already defined in the "options" object
                        */
                        if('options' in data){
                            for([key, value] of Object.entries(data.options)) {
                                if(key in options){
                                    console.log('valid property "' + key + '" found in object. Overriding it to "' + data.options[key] + '"');
                                    options.key = data.options[key];
                                }
                            }
                        }

                        $.each(data.links, function(key, link_prop){
                            //Identify multiple links
                        });

                        $.each(data.links_1way, function(key, link_prop){
                            draw_link_1way(link_prop);
                        });

                        $.each(data.links, function(key, link_prop){
                            draw_link(link_prop);
                        });

                        $.each(data.nodes, function(node_name, node_prop){
                            node_prop.name = node_name;
                            draw_node(node_prop);
                        });
                    });
                }
                run();
                /*
                setInterval(function() {
                    run();
                }, 5000);
                */
            });


        </script>


    </body>
</html>
