# peeeew-topoflow
Topology flowchart ("network weathermap"), with live values, drawn by JavaScript and SVG with your web browser. Relies on JSON files to feed topology/data.

**Disclaimer: This is not production ready in any way, we're still adding basic stuff and basicly making it work as intended.**

## Dependancies
PS: No need to install anything :-)
* Relies on D3 javascript library - https://d3js.org/. This is being loaded from the d3js CDN.
* Will soon utilize the excellent graphics from the ecceman's affinity repo for network graphics - https://github.com/ecceman/affinity. The vector images we want to use will be included in the javascript directly (drawn by D3 into the SVG object).
* Relies (... barely) on jQuery. This is being loaded from the jQuery CDN. Dependancy will probably be removed later on.


# Why?
* Ẁhen you need something to quick draw a topology flow map.
* When you need something lighter than php-weathermap for network weathermaps.
* When you do not want to run anything serverside.
* When you need something to update constantly, like once a second.


# Sample images
![BGP state machine as example](/example-images/example-bgp-state-machine.png)

![Sample network topology](/example-images/example-topology.png)

![ARP map](/example-images/example-arp.png)


# Minimal sample JSON file
Located at example-json/minimal.json
```json
{
  "nodes": {
    "node 1": {
      "x": 300,
      "y": 500
    },
    "node 2": {
      "x": 800,
      "y": 500
    },
    "node 3": {
      "x": 1300,
      "y": 500
    }
  },
  "links": [
    {
      "from": "node 1",
      "to": "node 2",
      "rate_out": "Some megabyters",
      "rate_in": "Even more gigabyters"
    },
    {
      "from": "node 2",
      "to": "node 3",
      "rate": "12.3 G",
      "type": "1way"
    }
  ]
}
```


# Minimal HTML example
```html
<!DOCTYPE html>
<html>
    <head>
        <!-- scripts -->
        <script src="https://d3js.org/d3.v6.min.js"></script>
        <script
            src="https://code.jquery.com/jquery-3.6.0.min.js"
            integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
            crossorigin="anonymous"></script>
        <script src="topoflow.js"></script>
    </head>
    <body>
        <svg id="canvas"></svg>
        <script>
            $(document).ready(function(){
                /**
                    Execute topoflow code
                */
                let tf = new topoflow();
                tf.run('/path/to/data.json');
            });
        </script>
    </body>
</html>
```


# Sample of minimal drawing
![Minimal network topology](/example-images/example-minimal.png)


# Script library
We will share some scripts here to generate JSON data files for topoflow. Feel free to modify them to your own liking. Most of them will probably be written in Python3.


# Todo (somewhat in prioritized order)
1. Optimization - only define things once
2. Making the terms less network specific, as topoflow could be used to other things than network topologies
  * Perhaps rename "rate" to "text" on the links? Since it can be with any text.
3. Figure out how to use the Ecceman stencils for symbols, and include some of them in Topoflow.
4. Remove the jQuery requirement 

# Format/options
Here are all the available things to set and toggle in json file topoflow loads.

## links
### Example
```
{
  "links": [
    {
      "from": "00a-core-1",
      "to": "00b-core-1",
      "rate_out": "1",
      "rate_in": "10"
    },
    {
      ...
    }
  ]
}
```

### Definitions
* `type`
  * Defines if a link is unidirectional or bidirectional
  * 1way
  * 2way (default)
* `state`
  * Defines if the link is up or down
  * up (default)
  * down
* `from` (required)
  * Name of the "from" node
* `to` (required)
  * Name of the "to" node
* `rate` (only applicable to type: 1way)
  * Defines the current rate of the link. Shown as overlay on the drawn link. Free text.
* `rate_in` (only applicable to type: 2way)
  * Defines the current inbound rate of the link. Shown as overlay on the drawn link. Free text.
* `rate_out` (only applicable to type: 2way)
  * Defines the current outbound rate of the link. Shown as overlay on the drawn link. Free text.
* `load` (only applicable to type: 1way)
  * Defines the current load on the unidirectional link.
    * Only accepts int from 0 to 100.
    * Colors are customizable through `options -> colors -> load_colors` []
* `load_in` (only applicable to type: 2way)
  * Defines the current inbound load on the bidirectional link.
    * Only accepts int from 0 to 100.
    * Colors are customizable through `options -> colors -> load_colors` []
* `load_out` (only applicable to type: 2way)
  * Defines the current outbound load on the bidirectional link.
    * Only accepts int from 0 to 100.
    * Colors are customizable through `options -> colors -> load_colors` []



## nodes
### Example
```
{
  "nodes": {
    "node1": {
      "x": 100,
      "y": 100,
      "text_position" : "top"
    },
    "node2": {
      "x": 500,
      "y": 400
    }
  }
}
```

### Definitions
* `x` (required)
  * The x axis position, in points
* `y` (required)
  * The y axis position, in points
* `text_position`
  * Where should the text of the node name be placed in relation to the node?
  * center
  * top
  * top-left
  * top-right
  * bottom (default)
  * bottom-left
  * bottom-right
  * right
  * left

## boxes
Used to draw boxes in the background. Usefull for grouping of nodes. Boxes will be drawn in the background of everything else.

NB: "links" cannot be drawn from box to box directly.

![Box usage](/example-images/example-box.png)

### Example
```
{
  "boxes": [
    {
      "corner_a_x": 50,
      "corner_a_y": 600,
      "corner_b_x": 1450,
      "corner_b_y": 1000,
      "background_color": "#333",
      "border_color": "#f00",
      "border_width": 5,
      "opacity": 50,
      "text_placement": "top", <---- Not implemented yet
      "text": "Inet" <---- Not implemented yet
    },
    {
      "corner_a_x": 50,
      "corner_a_y": 10,
      "corner_b_x": 1450,
      "corner_b_y": 500
    }
  ]
}
```


## options
Options can, in addition to through the JSON file, be provided through the following javascript calls:
```
let tf = new topoflow();
tf.overwrite_options({
    'colors': {
        'svg_background_color': '#333',
        'circle_fill': '#333'
    },
    'node_radius': 60
});
tf.run(json_source);
```

### Example
In the JSON file
```
{
  "options": {
    "text": {
      "node_position": "center",
      "link_follow_angle": false
    },
    "node_radius": 60,
    "colors": {
      "circle_fill": "#fff",
      "circle_outline": "#000",
      "arrow_pointer": "#000",
      "svg_background_color": "#fff",
      "link": "#000",
      "node_text": "#000"
    }
  }
}
```

### Definitions
Everything under options are ... optional.

Possible options to toggle
* `text`
  * `node_position` Choose where to draw the text relative to the node
    * See nodes -> definitions -> text_position for possible values
    * Default: bottom
  * `link_follow_angle` Toggle if the text should follow the angle of the link or not. Makes sense if you are using wide links, and want the text to be "inside" the link
    * Default: true (boolean)
  * `link_prevent_upside_down` Prevents the link text to be shown upside down
    * Default: true (boolean)
  * `node_offset` The offset from the node center to the text.
    * This is multiplied by `node_radius`
    * Default: 1.4
* `node_radius`
  * node radius in points - e.g. the size of the node
  * Default: 40
* `colors`  
As we're lazy, here is the code directly from topoflow.js  
```
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
}
```
* `link`
  * `width` Width of link
    * Default: 20 points
  * `spacing` Spacing between muliple links between the same two nodes. Ignored if there is only one link between the two nodes.
    * Default: 20 points
* `svg_height` Height of the <svg> element
  * Can be set either as points (1000) or as percent ("100%") 
  * Default: 1000 (points/pixels)
* `svg_width` Width of the <svg> element
  * Can be set either as points (1000) or as percent ("100%") 
  * Default: 1500 (points/pixels)
* `boxes`
  * `background_color` Background color of all boxes unless overridden
    * Default: "#cccccc"
  * `border_color` Border color ("stroke color")
    * Defaults: "#666666"
  * `border_width` Width of the border
    * Defaults: 3 (points)
  * `radius` Corner radius, value covers both "rx" and "ry"
    * Defaults: 10 (points)
  * `opacity` Opacity of the box. Covers both background and border
    * Defaults: "50%"
  * `border_dashed` Whether or not the border should be "dashed" by default
    * Defaults: true
  * `text_placement` Where to place the text field in the box. Text is optional. This value is not implemented yet
    * Defaults: "top"


# Made by who
Two network engineers, not satisfied with what we could find in the open source world.
* Marius Larsen
* Jonas H. Lindstad