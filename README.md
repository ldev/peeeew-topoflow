
# peeeew-topoflow
Topology flowchart, with live values, drawn by SVG with your web browser. Relies on JSON files to feed topology/data

Relies on D3 javascript library - https://d3js.org/

# Todo

I proiritert rekkefølge

1. stoette for 1-way links
    *Json format
    *Ny draw funksjon
2. støtte for flere linker mellom samme noder
    * Finne ut antall linker mellom 2 noder (før man starter tegning)
    * Angi hvilken link av totalt antall man tegner til draw line funksjonen (draw funksjon på ha nr og n) typ link 1 av 4
    * kalkulere offset i draw line funksjon basert på nr av n
3. navngi variabler så det er generelt og ikke nettverks spesifikt. Feks at det kan være også strøm.
4. render-options i JSON. Styrer farger osv. Ha en fornuftig default der, så man ikke trenger å sette noe.
        4.1. farging av linker
        4.2. posisjon av node label
5. alt annet
