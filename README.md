# peeeew-topoflow
Topology flowchart ("network weathermap"), with live values, drawn by SVG with your web browser. Relies on JSON files to feed topology/data.

**Disclaimer: This is not production ready in any way, we're still adding basic stuff and basicly making it work as intended.**

## Dependancies
PS: No need to install anything :-)
* Relies on D3 javascript library - https://d3js.org/. This is being loaded from the d3js CDN.
* Will soon utilize the excellent graphics from the ecceman's affinity repo for network graphics - https://github.com/ecceman/affinity. The vector images we want to use will be included in the javascript directly (drawn by D3 into the SVG object).



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
    }
  ],
  "links_1way": [
    {
      "from": "node 2",
      "to": "node 3",
      "rate": "12.3 G"
    }
  ]
}
```


Will give the following topology:
![Minimal network topology](/example-images/example-minimal.png)


# Todo (somewhat in prioritized order)
1. Parsing the JSON object and calculating a new object. To be able to create multiple links, some being 1way and some being 2way
2. Making the terms less network specific, as this could be used to other things than network topologies
4. Multiple links between nodes. Think link-aggregation
5. Implement link offset


# Made by who
Two network engineers, not satisfied with what we could find in the open source world.
* Marius Larsen
* Jonas H. Lindstad