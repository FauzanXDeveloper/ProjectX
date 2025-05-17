var graph = new joint.dia.Graph();

var paper = new joint.dia.Paper({
    el: $('#paper'),
    model: graph,
    width: 800,
    height: 600,
    gridSize: 1
});

var father = new joint.shapes.standard.Rectangle();
father.position(100, 100);
father.resize(100, 40);
father.attr({
    body: { fill: '#00a9e0' },
    label: { text: 'Father', fill: 'white' }
});
father.addTo(graph);

var mother = new joint.shapes.standard.Rectangle();
mother.position(300, 100);
mother.resize(100, 40);
mother.attr({
    body: { fill: '#ff3e00' },
    label: { text: 'Mother', fill: 'white' }
});
mother.addTo(graph);

var link = new joint.shapes.standard.Link();
link.source(father);
link.target(mother);
link.addTo(graph);
