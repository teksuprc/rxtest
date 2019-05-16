
const GraphTemplate = {

    getHtml: ((filename) => {
        return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <style> html,body { margin: 0; padding: 0 }</style>
        <!--script src="https://unpkg.com/force-graph@1.15.0/dist/force-graph.min.js"></script-->
        <script src="https://unpkg.com/3d-force-graph@1.46.3/dist/3d-force-graph.min.js"></script>
    </head>
    <body>
        <div id="graph"></div>
        <script>
            const N = 30;
            fetch('${filename}').then(res => res.json()).then(data => {
                const Graph = ForceGraph()
                (document.getElementById('graph'))
                  .graphData(data)
                  .nodeId('id')
                  .nodeLabel('name')
                  .nodeAutoColorBy('domain')
                  .linkSource('source')
                  .linkTarget('target')
            });
        </script>
    </body>
</html>`;
    }),

    getHtml3d: ((filename) => {
        return '<!doctype html> \
        <html lang="en"> \
            <head> \
                <meta charset="utf-8"> \
                <style> html,body { margin: 0; padding: 0 }</style> \
                <!--script src="https://unpkg.com/force-graph@1.15.0/dist/force-graph.min.js"></script--> \
                <script src="https://unpkg.com/3d-force-graph@1.46.3/dist/3d-force-graph.min.js"></script> \
                <style> \
                    #info { \
                        z-index: 1000;  \
                        width: 400px;  \
                        height: 180px;  \
                        position: absolute;  \
                        top: 40px;  \
                        right: 40px;  \
                        background-color: #333; \
                        color: red; \
                        padding: 12px; \
                        opacity: 0.85; \
                        border-radius: 15px; \
                    } \
                </style> \
            </head> \
            <body> \
                <div id="graph"></div> \
                <div id="info"></div> \
                <script> \
                    const N = 30; \
                    fetch("sites.json").then(res => res.json()).then(data => { \
                        const elem = document.getElementById("graph"); \
                        const Graph = ForceGraph3D({ antialias: true, alpha: false }) \
                        //(document.getElementById("graph")) \
                        (elem) \
                        .graphData(data) \
                        .nodeId("id") \
                        .nodeLabel("name") \
                        .nodeAutoColorBy("domain") \
                        .linkSource("source") \
                        .linkTarget("target") \
                        .onNodeHover(node => elem.style.cursor = node ? "pointer" : null) \
                        .onNodeClick(node => { \
                            let el = document.getElementById("info"); \
                            let html = \` \
                                <p>ID: ${node.id}</p> \
                                <p>Name: <a href="${node.name}" target="_blank">${node.name}</a></p> \
                                <p>Domain: ${node.domain}</p> \
                                <p># Links: ${node.links}</p> \
                            \`; \
                            el.innerHTML = html; \
                            const distance = 40; \
                            const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z); \
                            Graph.cameraPosition( \
                                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position \
                                node, // lookAt ({ x, y, z }) \
                                5500  // ms transition duration \
                            ); \
                        }) \
                    }); \
                </script> \
            </body> \
        </html>';
    })
};

module.exports = {
    GraphTemplate 
};