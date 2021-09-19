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
        <svg id="canvas">
            <defs></defs>
        </svg>
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


# Todo (somewhat in prioritized order)
1. Fix the custom color implementation (check out bgp-state-machine.json) ... or just finish the set_default_options() function.
2. Optimization - only define things once
3. Do "options" more modular, e.g. able to specify general options for all flow charts, JSON-loaded options for specific chart. This could be initialized before run().
4. Making the terms less network specific, as topoflow could be used to other things than network topologies
5. Write documentation for all the possible values to use in a JSON file


# Made by who
Two network engineers, not satisfied with what we could find in the open source world.
* Marius Larsen
* Jonas H. Lindstad