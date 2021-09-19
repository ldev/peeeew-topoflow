#!/usr/bin/env python3
'''
    Python3 code. Requires "easysnmp" and "json" python3 modules
    This code is to generate a JSON object that can be rendered in Topoflow
    It collects the ARP table from a Juniper router and generates the corresponding JSON
'''

from easysnmp import Session
import math
import json

# the object that will be converted to JSON
dataset = {
    'nodes': {},
    'links': [],
    'options' = {
        'node_radius': 45,
        'text': {
            'node_position': 'center'
        },
        'link': {
            'width': 3
        }
    }
}

# Gets the ARP table via SNMP
host = 'gw'
session = Session(hostname=host, community='xxxxx', version=2)
mib = 'iso.3.6.1.2.1.4.35.1.4'
arp = session.walk(mib)



# list to hold all IP addresses collected
l = []

# Iterate over all ARP items
for item in arp:
    # We  need to get the SNMP ifindex (part of the SNMP key) to check what kind of ARP entry it is. E.g. if it's itself, or an actual IP neighbor
    x = item.oid.replace(mib + '.', '')
    parts = x.split('.')
    # Validate that the key has the correct length. This filters out some "garbage" for us
    if len(parts) == 7:
        # holds the ifIndex. We will use this to run separate SNMP get's
        ifindex = parts[0]

        # ip address in ARP table
        ip = '%s.%s.%s.%s' % (parts[3], parts[4], parts[5], parts[6])

        # Get the ipNetToPhysicalType value. "3" = actual known neighbor, not itself or some internal addresses related to internal interfaces
        y = '%s.%s.%s.%s' % ('iso.3.6.1.2.1.4.35.1.6', ifindex, '1.4', ip)
        if session.get(y).value == "3":
            l.append(ip)

# variables used to calculate the "circle" the nodes should form
iterator = 0
radius = 400
x_center = 500
y_center = 500
num = len(l)
for ip in l:
    iterator += 1
    x_pos = x_center + radius * math.cos(2 * math.pi * iterator / num)
    y_pos = y_center + radius * math.sin(2 * math.pi * iterator / num)
    dataset['nodes'][ip] = {
        'x': x_pos,
        'y': y_pos
    }

    # add links
    dataset['links'].append({
        'from': host,
        'to': ip
    })

# Add a center node to represent the current node
dataset['nodes'][host] = {
    'x': x_center,
    'y': y_center
}

print(json.dumps(dataset))