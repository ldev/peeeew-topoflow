class topoflow{
    constructor(){
        /*
            Initialize the SVG element
        */
        this.svg_container = d3.select("#canvas");
        this.svg = this.svg_container.append("g").attr('class', 'main_group');

        /*
            #########################
            #                       #
            #       VARIABLES       #
            #                       #
            #########################
        */

        /*
            Defines the default options for the maps. This is to be able to override options by each JSON source.
        */
        this.options = {
            /*
                All colors definitions goes here
            */
            'colors': {
                'circle_fill': '#000',
                'circle_outline': '#fff',
                'circle_outline_down': '#f00',
                'arrow_pointer': '#fff',
                'svg_background_color': '#000',
                'link': '#fff',
                'link_down': '#f00',
                'link_text': '#f0a',
                'node_text': '#fff',
                'load': [
                    '#f00', // >0%
                    '#ff0', // >33%
                    '#0f0' // > 66%
                ]
            },

            /*
                All text/font properties goes here
            */
            'text': {
                /*
                    Where node text position should be. Supported: 
                        * bottom, top, right, left
                        * <anything else> (which will be drawn centered)
                */
                'node_position': 'bottom',

                /*
                    Whether or not the optional text on the links should be rotated along the link or not
                    false: no rotation
                    true: text is rotated along the link
                */
                'link_follow_angle': true,

                /*
                    Prevents the link text from being displayed upside down (180 degrees)
                */
                'link_prevent_upside_down': true,

                /*
                    Default offset of text to node. This is multiplied by "node_radius" 
                */
                'node_offset': 1.4
            },


            /*
                Sets the radius of the node, if node type is not specified, or node type is "circle"
                default: 40
            */
            'node_radius': 40,

            /*
                Link properties goes here
            */
            'link': {
                /*
                    Width of the link in points
                */
                'width': 20,

                /*
                    Then drawing multiple links between the same two nodes, this spacing will be used to space the links evenly out.
                    In points
                */
                'spacing': 20
            },

            /*
                Sets the height and width of the <svg> element. Can be specified either as percent ("100%") or pixels ("1000")
            */
            'svg_width': 1500,
            'svg_height': 1000,

            /*
                Not implemented yet
            */
            'display_fullscreen': false
        };


        // var node_radius = 40;

        this.markerBoxWidth = 20;
        this.markerBoxHeight = 20;
        this.arrowPoints = [[0, 0], [0, 20], [20, 10]];


        /*
            New, "experimental" dataset
        */
        this.main_dataset = {
            'links': [],
            'nodes': []
        };


        /*
            To hold all the magic. All the links and nodes
            dataset.nodes.blabla
            dataset.links.blabla
        */
        let dataset = {};


        /*
            Required parameters for adding a node
        */
        let required_node_parameters = [
            'x', // x coordinate
            'y', // y coordinate
            'name' // name of node
        ]


        /*
            Required parameters for adding a link
        */
        let required_link_parameters = [
            'x1', // start x coordinate
            'y1', // start y coordinate
            'x2', // end y coordinate
            'y2' // end y coordinate
        ]

        let load_color_steps = {};

        /*
            Create marker(s)
            Logic ensures that <defs> exists inside the <svg> element
        */
        let defs = d3.select("defs");
        if(defs.size() == 0){
            console.log('<defs> not found, creating it');
            defs = this.svg_container.append('defs');
        }

        defs.append('marker')
                .attr('id', 'arrow')
                .attr('class', 'arrow')
                .attr('viewBox', [0, 0, this.markerBoxWidth, this.markerBoxHeight])
                .attr('refX', 1) // 1 point overlap on marker and line
                .attr('refY', 10)
                .attr('markerWidth', this.markerBoxWidth)
                .attr('markerHeight', this.markerBoxHeight)
                .attr('orient', 'auto-start-reverse')
                .attr('markerUnits', 'userSpaceOnUse') // Needed, or the arrow head will inherit the stroke-width of the line "parent"
                .attr('fill', this.options.colors.arrow_pointer)
                .append('path')
                    .attr('d', d3.line()(this.arrowPoints));
    }


    /**
        * Will provide a list of link spacing placements. This enables us to draw multiple links between nodes.
        * In the example "number_of_links" being 5 and "link_spacing" being 10 will wield the following result: [-20, -10, 0, 10, 20].
        * If number_of_links === 1, the result will be [0] ("center the link")

        * @param {number} number_of_links: Number of links, to calculate the correct spacing
        * @returns {list}: spacing values, from lowest to highest
    */
    calculate_spacing(number_of_links){
        /*
            Prevents "division by zero" crash
        */
        if(number_of_links === 0){
            return false;
        }

        /*
            Quick and dirty "if its 1, lets just return the center position"
        */
        if(number_of_links === 1){
            return [0];
        }

        /*
            Do the calculations
        */
        let data = [];
        let half_link_spacing= this.options.link.spacing/2;
        let lowest_spacing = (half_link_spacing*number_of_links-half_link_spacing)*-1;
        // let i = lowest_spacing; // why do i need this?
        for (let i = lowest_spacing; i <= lowest_spacing*-1; i += this.options.link.spacing){
            data.push(i);
        }
        return data;
    }


    /**
        Used for creating the "steps" in load coloring.
        options.colors.load is now an array with n colors like this:
        We need to make it an object with steps, like this:
        [
            {
                "step": 75,
                "color": "#aaf"
            },
            {
                "step": 50,
                "color": "#00f"
            },
            {
                "step": 25,
                "color": "#fa0"
            },
            {
                "step": 0,
                "color": "#f0a"
            }
        ]

        @returns array of objects with color steps
    */
    calculate_load_color_streps(){
        // let load = parseInt(load);
        let new_load_array = [];
        let number_of_colors = this.options.colors.load.length;
        for (let i = 0; i < number_of_colors; i++){
            new_load_array.push({
                step: Math.floor((100/number_of_colors)*i),
                color: this.options.colors.load[i]
            });
        }
        return new_load_array.reverse(); // flip the array, as it's used for "matching upwards"

    }

    /**
        Then we can do "for each of the colors starting from high to low, if load is higher than color use color, else iterate further"
        Uses the array created with calculate_load_color_streps()

        @param {float|int} load (percent)
        @returns {string} hex link color (e.g. "#f0a")
    */
    link_load_color(load){
        if(load === undefined){
            return this.options.colors.link;
        }
        let color_steps = this.load_color_steps;
        for(var i = 0; i < color_steps.length; i++){
            if(load > color_steps[i].step){
                return color_steps[i].color;
            }
        }
        return this.options.colors.link;
    }



    /**
        * Will draw a node on the map

        * @param {object}       Parameters. See "required_node_parameters" variable for list of required variables.
        * @return {boolean}     True on success, false on error (like missing parameters). Check console output for errors.
    */
    draw_node(args){
        /*
            Validating args to confirm required node parameters
        */
        for(prop in this.required_node_parameters){
            if(this.required_node_parameters[prop] in args !== true){
                console.log('Error: unable to draw node. Missing parameter "' + this.required_node_parameters[prop] + '"');
                return false;
            }
        }

        console.log('Drawing node ' + args.name);

        /*
            Add node

                Jquery stuff for hilighting link - not currently in use
                .on("click", function(){
                    console.log(d3.select(this));
                })
                .on("mouseover", function(d) {
                    d3.select(this).style("fill", "#3236a8");
                }).on("mouseout", function(d) {
                    d3.select(this).style("fill", this.options.colors.circle_fill);
                })

        */
        let node = this.svg.append("circle")
            .attr('cx', args.x)
            .attr('cy', args.y)
            .attr('r', this.options.node_radius)
            .attr('stroke-width', 5)
            .attr('stroke', this.options.colors.circle_outline)
            .style('fill', this.options.colors.circle_fill)
            .attr('data-node-name', 'asdf');

        /*
            Where the node text is supposed be drawn.
            This is the default fallback, if nothing is defined in $text_pos_defs
        */
        let node_text_location_y = args.y+(this.options.node_radius*this.options.text.node_offset);
        let node_text_location_x = args.x;
        let text_anchor = 'middle';
        let text_position = args.text_position;



        /*
            Text position definitions
            @todo: Separate function: draw_node_text(x, y, placement, text)
        */
        let text_pos_defs = {
            'center': {
                'position_y': args.y
            },
            'top': {
                'position_y': args.y-(this.options.node_radius*this.options.text.node_offset)
            },
            'top-left': {
                'anchor': 'end',
                'position_x': args.x-(this.options.node_radius*this.options.text.node_offset*0.7),
                'position_y': args.y-(this.options.node_radius*this.options.text.node_offset*0.7)
            },
            'top-right': {
                'anchor': 'start',
                'position_x': args.x+(this.options.node_radius*this.options.text.node_offset*0.7),
                'position_y': args.y-(this.options.node_radius*this.options.text.node_offset*0.7)
            },
            'bottom': {
                'position_y': args.y+(this.options.node_radius*this.options.text.node_offset)
            },
            'bottom-left': {
                'anchor': 'end',
                'position_x': args.x-(this.options.node_radius*this.options.text.node_offset*0.7),
                'position_y': args.y+(this.options.node_radius*this.options.text.node_offset*0.7)
            },
            'bottom-right': {
                'anchor': 'start',
                'position_x': args.x+(this.options.node_radius*this.options.text.node_offset*0.7),
                'position_y': args.y+(this.options.node_radius*this.options.text.node_offset*0.7)
            },
            'right': {
                'anchor': 'start',
                'position_x': args.x+(this.options.node_radius*this.options.text.node_offset)
            },
            'left': {
                'anchor': 'end',
                'position_x': args.x-(this.options.node_radius*this.options.text.node_offset)
            },
        }

        /*
            override the default settings - e.g. "{options: {text: {node_position: xxx}}}" is set in the JSON object
        */
        if('text' in this.options && 'node_position' in this.options.text){
            if(this.options.text.node_position in text_pos_defs){
                if('anchor' in text_pos_defs[this.options.text.node_position]){
                    text_anchor = text_pos_defs[this.options.text.node_position]['anchor'];
                }

                if('position_x' in text_pos_defs[this.options.text.node_position]){
                    node_text_location_x = text_pos_defs[this.options.text.node_position]['position_x'];
                }

                if('position_y' in text_pos_defs[this.options.text.node_position]){
                    node_text_location_y = text_pos_defs[this.options.text.node_position]['position_y'];
                }
            }else{
                console.log('Unknown options.text.node_position, falling back');
            }
        }
        

        /*
            Override the previous text position settings if it's defined at the node level in the JSON file
        */
        if(args.text_position in text_pos_defs){
            if('anchor' in text_pos_defs[args.text_position]){
                text_anchor = text_pos_defs[args.text_position]['anchor'];
            }

            if('position_x' in text_pos_defs[args.text_position]){
                node_text_location_x = text_pos_defs[args.text_position]['position_x'];
            }

            if('position_y' in text_pos_defs[args.text_position]){
                node_text_location_y = text_pos_defs[args.text_position]['position_y'];
            }
        }

        /*


        /*
            Draw text.
        */
        this.svg.append("text")
            .attr('class', 'node-text')
            .attr('x', node_text_location_x)
            .attr('y', node_text_location_y)
            .attr('text-anchor', text_anchor)
            .attr('dominant-baseline', 'middle')
            .style('fill', this.options.colors.node_text)
            .text(args.name)

        /*
        if('state' in args){
            if(args.state == 'down'){
                console.log('node down');
                node.attr('stroke', this.options.colors.circle_outline_down);
            }
        }
        */
    }

    /*
        arg must contain:
        * from
        * to
    */
    draw_link_2way(args){
        try{
            console.log('Drawing regular (2way) link from ' + args.from + ' to ' + args.to, args);
            // console.log(args);

            // global settings
            let split_point = 0.5;
            let text_pos = 0.5;
            let arrow_offset =20;

            /*
                The Math.atan2() function returns the angle in the plane (in radians) between the positive x-axis and the ray from (0,0) to the point (x,y), for Math.atan2(y,x)
            */
            let angle_a_to_b = Math.atan2(this.main_dataset.nodes[args.to].y - this.main_dataset.nodes[args.from].y, this.main_dataset.nodes[args.to].x - this.main_dataset.nodes[args.from].x);
            let degrees = angle_a_to_b*(180/Math.PI)
            let sin_to_angle = Math.sin(angle_a_to_b);
            let cos_to_angle = Math.cos(angle_a_to_b);

            /*
                Link coloring based on load
            */
            let link_color_in = this.link_load_color(args.load_in);
            let link_color_out = this.link_load_color(args.load_out);

            /*
                Adjust for spacing
            */

            let spacing_x = sin_to_angle * args.spacing;
            let spacing_y = cos_to_angle * args.spacing;

            let to_node_pos_x = this.main_dataset.nodes[args.to].x - spacing_x;
            let to_node_pos_y = this.main_dataset.nodes[args.to].y + spacing_y;
            let from_node_pos_x = this.main_dataset.nodes[args.from].x - spacing_x;
            let from_node_pos_y = this.main_dataset.nodes[args.from].y + spacing_y;
            
            /*
                Caclulate half way point
            */

            let halfway_pos_x = to_node_pos_x-(to_node_pos_x-from_node_pos_x)*split_point;
            let halfway_pos_y = to_node_pos_y-(to_node_pos_y-from_node_pos_y)*split_point;

            /*
                To flip the text rotation the easy way for humans to read (e.g. never upside down)
            */
            let text_degrees = 0;
            if(this.options.text.link_follow_angle === true){
                text_degrees = degrees;

                if(this.options.text.link_prevent_upside_down === true && text_degrees > 90 && text_degrees <= 180){
                    text_degrees += 180;
                }
            }

            /*
                Assign rate (used bandwidth)
            */
            let rate_in = '',
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
            let link_state = 'up';
            if('state' in args){
                if(args.state == 'down'){
                    link_state = 'down';
                }
            }

            /*


                    .on("click", function(){
                        console.log(d3.select(this).attr('y1'));
                    }


                    .on("mouseover", function(d) {
                        d3.select(this).style("stroke", "#3236a8");
                    })
                    .on("mouseout", function(d) {
                        d3.select(this).style("stroke", this.options.colors.link);
                    })
                    .on("click", function(){
                        console.log(d3.select(this).attr('y1'));
                    }
            */

            let link_a_b = this.svg
                .append('line')
                    .attr('class', 'link link-' + link_state)
                    .attr('x1', from_node_pos_x)
                    .attr('y1', from_node_pos_y)
                    .attr('x2', (halfway_pos_x - cos_to_angle * arrow_offset) )
                    .attr('y2', (halfway_pos_y - sin_to_angle * arrow_offset) )
                    .attr('stroke', link_color_out)
                    .attr('stroke-width', this.options.link.width)
                    .attr('marker-end', 'url(#arrow)');

            let link_b_a = this.svg
                .append('line')
                    .attr('class', 'link link-' + link_state)
                    .attr('x1', to_node_pos_x)
                    .attr('y1', to_node_pos_y)
                    .attr('x2', (halfway_pos_x- Math.cos(angle_a_to_b + Math.PI) * arrow_offset) )
                    .attr('y2', (halfway_pos_y- Math.sin(angle_a_to_b + Math.PI) * arrow_offset) )
                    .attr('stroke', link_color_in)
                    .attr('stroke-width', this.options.link.width)
                    .attr('marker-end', 'url(#arrow)')
                    ;

            /*
                Draw link as "link down"
            */
            if(link_state == 'down'){
                link_a_b.attr('stroke', this.options.colors.link_down);
                link_b_a.attr('stroke', this.options.colors.link_down);
            }

            /*
                Do not draw text on links if the link is down
            */
            if(link_state !== 'down'){

                this.draw_text_on_link({
                    x: from_node_pos_x+((to_node_pos_x-from_node_pos_x)*split_point*text_pos),
                    y: from_node_pos_y+((to_node_pos_y-from_node_pos_y)*split_point*text_pos),
                    text: rate_in,
                    degrees: text_degrees
                });

                this.draw_text_on_link({
                    x: to_node_pos_x-((to_node_pos_x-from_node_pos_x)*split_point*text_pos),
                    y: to_node_pos_y-((to_node_pos_y-from_node_pos_y)*split_point*text_pos),
                    text: rate_out,
                    degrees: text_degrees
                });
            }
        }catch(err){
            console.error('Error in draw_link_2way():');
            console.error(err);
        }
    }

    /*
        * Used for drawing a 1 way link
        * @param args
    */
    draw_link_1way(args){
        try{
            console.log('Drawing 1way link from ' + args.from + ' to ' + args.to + ' with the following args', args);

            //Global settings
            let text_pos = 0.5;
            let arrow_offset = 20;

            /*
                The Math.atan2() function returns the angle in the plane (in radians) between the positive x-axis and the ray from (0,0) to the point (x,y), for Math.atan2(y,x)
            */
            let angle_a_to_b = Math.atan2(this.main_dataset.nodes[args.to].y - this.main_dataset.nodes[args.from].y, this.main_dataset.nodes[args.to].x - this.main_dataset.nodes[args.from].x);
            let degrees = angle_a_to_b*(180/Math.PI)
            let sin_to_angle = Math.sin(angle_a_to_b);
            let cos_to_angle = Math.cos(angle_a_to_b);

            /*
                Link coloring based on load
            */
            let link_color = this.link_load_color(args.load);

            /*
                Adjust for offset
            */
            let spacing_x = sin_to_angle * args.spacing;
            let spacing_y = cos_to_angle * args.spacing;

            let to_node_pos_x = (this.main_dataset.nodes[args.to].x - spacing_x) - cos_to_angle * (this.options.node_radius + arrow_offset);
            let to_node_pos_y = (this.main_dataset.nodes[args.to].y + spacing_y) - sin_to_angle * (this.options.node_radius + arrow_offset);
            let from_node_pos_x = this.main_dataset.nodes[args.from].x - spacing_x;
            let from_node_pos_y = this.main_dataset.nodes[args.from].y + spacing_y;

            /*
                To flip the text rotation the easy way for humans to read (e.g. never upside down)
            */
            let text_degrees = 0;
            if(this.options.text.link_follow_angle === true){
                text_degrees = degrees;

                if(this.options.text.link_prevent_upside_down === true && text_degrees > 90 && text_degrees <= 180){
                    text_degrees += 180;
                }
            }


            /*
                Assign rate (used bandwidth)
            */
            let rate = '',
                rate_out = '';

            if('rate' in args){
                rate = args.rate; 
            }


            /*
                Assign state
            */
            let link_state = 'up';
            if('state' in args && args['state'] == 'down'){
                link_state = 'down';
            }

            let link_a_b = this.svg
                .append('line')
                    .attr('class', 'link link-' + link_state)
                    .attr('x1', from_node_pos_x)
                    .attr('y1', from_node_pos_y)
                    .attr('x2', to_node_pos_x)
                    .attr('y2', to_node_pos_y)
                    .attr('stroke', link_color)
                    .attr('stroke-width', this.options.link.width)
                    .attr('marker-end', 'url(#arrow)')
                    .on("click", function(){
                        console.log(d3.select(this).attr('y1'));
                    });

            /*
                Draw link as "link down"
            */
            if(link_state == 'down'){
                link_a_b.attr('stroke', this.options.colors.link_down);
            }

            /*
                Do not draw text on links if the link is down
            */
            if(link_state !== 'down'){
                this.draw_text_on_link({
                    x: from_node_pos_x+((to_node_pos_x-from_node_pos_x)*text_pos),
                    y: from_node_pos_y+((to_node_pos_y-from_node_pos_y)*text_pos),
                    text: rate,
                    degrees: text_degrees
                });
            }
        }catch(err){
            console.error('Error in draw_link_1way():', err);
        }
    }

    /**
        * Used for placing text on links
        * @param {object} args: must contain 'x', 'y' and 'text'
        * @return {boolean}
    */
    draw_text_on_link(args){
        let newly_drawn_text = this.svg.append("text")
            .attr('class', 'link-text')
            .attr('x', args.x)
            .attr('y', args.y)
            .attr('transform', 'rotate(' + args.degrees + ', ' + (args.x) + ', ' + (args.y) + ')') // rotates the text
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', this.options.colors.link_text)
            .text(args.text)
        return true;
    }

    /*
        Used for overwriting the default options.
        Calling set_default_options() from class initialization overwrites the default options
        "options" from the JSON file overwrites set_default_options()
    */
    overwrite_options(args){
        console.log('Attempting to overwrite the current options with this', args);

        for(const [key, value] of Object.entries(args)){                    
            // Check if the value is an object
            if(key in this.options && typeof value === 'object' && value !== null){
                for(const [key2, value2] of Object.entries(args[key])){
                    this.options[key][key2] = args[key][key2];
                }
            }else if(key in this.options){
                this.options[key] = args[key];
            }else{
                console.log('Not accepting option "' + key + '"');
            }
        }
    }


    /*
        Populate the dataset
    */
    run(json_file){
        console.log('run() called (json file: ' + json_file + ')');
        // prevent caching
        let class_this = this; // because getJSON overwrites "this"
        $.getJSON(json_file, {_: new Date().getTime()})
        .done(function(data){

            console.log('data loaded from json file', data);
            let dataset = data;
            

            /**
                * Populates a new "main dataset", which will make us be able to detect multiple links
                @todo: Factor away the "exploding dataset". Will iterate over an object for each key in another object.
                @todo: More about the topic: https://stackoverflow.com/questions/13964155/get-javascript-object-from-array-of-objects-by-value-of-property
            */
            try{
                // Create load color steps


                // loop over each link object in the JSON dataset
                $.each(data.links, function(not_in_use, y1){
                    let state_machine_multiple_link_detected = false;
                    let link_type = y1.type || '2way';

                    // loop over each link in the json provided data
                    $.each(class_this.main_dataset.links, function(x2_index, y2){
                        // if we've seen the [from, to] or [to, from] pair before, append to that
                        if((y2.to === y1.to && y2.from === y1.from) || (y2.to === y1.from && y2.from === y1.to)){
                            state_machine_multiple_link_detected = true;
                            console.log("Multiple link detected (" + y1.to + ", " + y1.from + "), x2_index (" + x2_index + ")");

                            if(link_type == '2way'){
                                /*
                                    2 way link
                                */
                                // checkin if a -> b
                                if(y2.to === y1.to && y2.from === y1.from){
                                    // console.log('replacing index (a->b) ' + x2_index);
                                    class_this.main_dataset['links'][x2_index]['links'].push({
                                        'type': link_type,
                                        'state': 'up',
                                        'rate_in': y1.rate_in,
                                        'rate_out': y1.rate_out,
                                        'load_in': y1.load_in,
                                        'load_out': y1.load_out
                                    })
                                }

                                // checkin if b -> a
                                if(y2.to === y1.from && y2.from === y1.to){
                                    // console.log('replacing index (b->a) ' + x2_index);
                                    class_this.main_dataset['links'][x2_index]['links'].push({
                                        'type': link_type,
                                        'state': 'up',
                                        'rate_out': y1.rate_in, // reversed
                                        'rate_in': y1.rate_out, // reversed
                                        'load_in': y1.load_out, // reversed
                                        'load_out': y1.load_in // reversed
                                    })
                                }
                            }else{
                                /*
                                    1 way link
                                */
                                if(y2.to === y1.to && y2.from === y1.from){
                                    // console.log('replacing index (a->b) ' + x2_index);
                                    class_this.main_dataset['links'][x2_index]['links'].push({
                                        'type': link_type,
                                        'state': 'up',
                                        'rate': y1.rate,
                                        'load': y1.load,
                                    })
                                }
                            }
                        }
                    });
                    if(state_machine_multiple_link_detected === false){
                        if(link_type == '2way'){
                            /*
                                2 way link
                            */
                            class_this.main_dataset['links'].push({
                                'to': y1.to,
                                'from': y1.from,
                                'links': [{
                                    'type': link_type,
                                    'state': 'up',
                                    'rate_in': y1.rate_in,
                                    'rate_out': y1.rate_out,
                                    'load_in': y1.load_in,
                                    'load_out': y1.load_out
                                }]
                            });
                        }else{
                            /*
                                1 way link
                            */
                            class_this.main_dataset['links'].push({
                                'to': y1.to,
                                'from': y1.from,
                                'links': [{
                                    'type': link_type,
                                    'state': 'up',
                                    'rate': y1.rate,
                                    'load': y1.load,
                                }]
                            });
                        }
                    }
                });
                // Copy over the nodes from JSON data to $main_dataset
                if('nodes' in data){
                    class_this.main_dataset.nodes = data.nodes;
                }else{
                    console.error('No nodes found in JSON data');
                }
            }catch(error){
                console.error(error);
            }



            /**
                * Conditionally overrides the default options from the options in the loaded JSON object "data"
                * Will only override if the option is already defined in the "options" object
                @todo Fix ugly hax, actually iterate recursively through object
            */
            try{
                if('options' in data){
                    for(const [key, value] of Object.entries(data.options)){                    
                        // Check if the value is an object
                        if(key in class_this.options && typeof value === 'object' && value !== null){
                            for(const [key2, value2] of Object.entries(data.options[key])){
                                class_this.options[key][key2] = data.options[key][key2];
                            }
                        }else if(key in class_this.options){
                            class_this.options[key] = data.options[key];
                        }
                        
                    }
                }
            }catch(error){
                console.error('Error while parsing "options" from JSON: ' + error);
            }
            console.log('options now', class_this.options);

            /*
                Find the links in the dataset, and draw them
                Note:_ the "main_dataset.links" is a bit unclear, as that is a collection of nodes, and in that a collection of link between nodes
            */
            try{
                // Generate load color steps
                class_this.load_color_steps = class_this.calculate_load_color_streps();
                console.log('load_color_steps', class_this.load_color_steps);


                $.each(class_this.main_dataset.links, function(not_in_use, link_props){
                    let link_to = link_props.to;
                    let link_from = link_props.from;
                    let number_of_links = link_props.links.length;

                    console.log('Processing a total of ' + number_of_links+ ' links from ' + link_to + ' to ' + link_from);
                    let link_spacing_array = class_this.calculate_spacing(number_of_links);
                    $.each(link_props.links, function(link_index, link){
                        /*
                            Draw each separate link
                        */
                        let spacing = link_spacing_array[link_index];

                        /*
                            Merge data into a new object to feed the draw_link*() functions
                        */
                        let new_properties_formated = Object.assign({}, link, {'to': link_to, 'from': link_from, 'spacing': spacing});

                        // The draw_* functions does not need to know of the type (1way, 2way), as it's dedicated functions beaing called for each type.
                        delete new_properties_formated.type;

                        // console.log('new_properties_formated', new_properties_formated)

                        if(link.type == '2way'){
                            class_this.draw_link_2way(new_properties_formated);
                        }else{
                            class_this.draw_link_1way(new_properties_formated);
                        }
                      
                    });
                });
            }catch(error){
                console.error('Error while drawing links: ' + error);
            }


            try{
                $.each(class_this.main_dataset.nodes, function(node_name, node_prop){
                    node_prop.name = node_name;
                    class_this.draw_node(node_prop);
                });
            }catch(error){
                console.error('Error while drawing nodes: ' + error);
            }



            /*
                Applying the colors defined in options
            */

            // background color of SVG
            class_this.svg_container.style('background-color', class_this.options.colors.svg_background_color);

            // set size of the <svg> object
            class_this.svg_container.attr('height', class_this.options.svg_height);
            class_this.svg_container.attr('width', class_this.options.svg_width);

            // Link arrow color
            d3.select("#arrow").style('fill', class_this.options.colors.arrow_pointer);
        })
        .fail(
            function(jqXHR, textStatus, errorThrown){
                console.error('Unable to load JSON file "' + json_file + '", status: ' + errorThrown)
            }
        );
    }
}