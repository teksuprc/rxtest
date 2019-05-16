const fs = require('fs-extra');
const request = require('request-promise');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const url = require('url');

const memdb = require('./MemDB');
const graphTemplate = require('./templates').GraphTemplate;

const { Observable, bindNodeCallback, of, fromEvent, from, interval } = require('rxjs');
const { merge, forkJoin, map, take, filter, tap, flatMap, switchMap, catchError } = require('rxjs/operators');


let writeToJson = ((filename, data) => {
    let nodes = [];
    Object.keys(data.nodes).forEach(n => nodes.push(data.nodes[n]));
    fs.outputJsonSync(filename, {nodes: nodes, links: data.links});
    console.log(`file [${filename}] written successfully`);
});

let writeToFile = ((filename, data) => {
    fs.outputFileSync(filename, data);
    console.log(`file [${filename}] written successfully`);
});

let maxDepth = 500;
let rootIdx = 0;
let gIdx = 0;
let pages = [];
pages.push('');

class Node {
    constructor(name) {
        this.id = gIdx++;
        this.name = name;
        this.domain = url.parse(name).host;
        this.links = [];
    }
};

let graph = {
    nodes: {},
    links: []
};

let loadPages = ((uri) => {

    let opts = {
        method: 'GET',
        url: uri,
        transform: (body) => cheerio.load(body)
    };

    let idx = 1;

    let purl = url.parse(uri);
    let pp = `${purl.protocol}//${purl.hostname}${purl.pathname}`;
    
    let parent = null;
    if(graph.nodes[pp]) {
        parent = graph.nodes[pp];
    }
    else {
        parent = new Node(pp);
        graph.nodes[pp] = parent;
    }

    console.log(`${rootIdx}`, pp);

    from(request(opts)).pipe(
        flatMap($ => $("a")),
        filter(a => a.attribs.href),
        map(a => a.attribs.href),
        filter(a => a.startsWith('http') && a.includes('twa')),
        catchError(err => {
            console.log('got error for site:', pp)
            pages.shift();
            return of(pages[0]);
        })
    )
    .subscribe(
        ((res) => {
            if(res != null && res != uri) {
                let uurl = url.parse(res);
                let u = `${uurl.protocol}//${uurl.host}${uurl.pathname}`;
                let n = null;
                if(graph.nodes[u]) {
                    n = graph.nodes[u];
                }
                else {
                    n = new Node(u);
                    graph.nodes[u] = n;
                }

                graph.links.push({ source: parent.id, target: n.id });
                parent.links.push({id: n.id, url: n.name});
                if(!pages.includes(u))
                    pages.push(u);
            }
        }),
        ((err) => console.log('error happened when reading data', err)),
        (() => {
            parent.processed = true;
            pages.shift();

            if(rootIdx < maxDepth) {
                rootIdx++;
                loadPages(pages[0]);
            }
            else {
                writeToJson(`sites.json`, graph);
                writeToFile(`sites.html`, graphTemplate.getHtml(`sites.json`));
                writeToFile(`sites3d.html`, graphTemplate.getHtml3d(`sites.json`));
                console.timeEnd('site_reads');
            }
        })
    );
});

console.time('site_reads');
loadPages(pages[0]);
