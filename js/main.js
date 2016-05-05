var width = 960,
    height = 500,
    radius = 3;

var padding = 5; // separation between circles


$(function() {
	
	var svg = d3.select("#vis").append("svg")
		.attr("width", width)
		.attr("height", height)
			

	var fill = d3.scale.category20();

	var force = d3.layout.force()
		.gravity(.05)
		.charge(-240)
		.linkDistance(20)
		.size([width, height]);

	d3.json("data.json", function(error, graph) {
	if (error) throw error;
	
	
	
	var link = svg.selectAll("line")
		.data(graph.links)
		.enter().append("line")
		.style("fill", 'black');
		

	var node = svg.selectAll("circle")
		.data(graph.nodes)
		.enter().append("circle")
		.attr("class","node")
		.attr("r", function(d) {return d.count * radius - .75})
		.style("fill", function(d) {if(d.type == "Organization") {return "red"}
									else if(d.type == "PersonMode") {return "green"}
									else if(d.type == "HashTag") {return "yellow"}
									else if(d.type == "Event"){return "blue"}
									else { return "black"} })
		.style("stroke", 'black')
		.call(force.drag)
		// .on('mouseover', tip.show) //Added
		// .on('mouseout', tip.hide); //Added 

	force
		.nodes(graph.nodes)
		.links(graph.links)
		.on("tick", tick)
		.start();

	function tick() {
		 node.each(collide(0.5)); //Added 
		
		//THIS CRAZY SHIT KEEPS IT WITHIN THE FRAME
		//Pretty much I had to make it so that the new sizes of the nodes would fit within the window (by making the cx and cy adjust with the size of node (radius * d.count))
		node.attr("cx", function(d) { return d.x = Math.max((radius * d.count), Math.min(width - (radius * d.count), d.x)); })
			.attr("cy", function(d) { return d.y = Math.max((radius * d.count), Math.min(height - (radius * d.count), d.y)); });

		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
			
	}

	//working collision function
	//changing padding changes the collision detection distance between nodes
	function collide(alpha) {
	var quadtree = d3.geom.quadtree(graph.nodes);
	return function(d) {
		var rb = 2*(radius * d.count) + padding,
			nx1 = d.x - rb,
			nx2 = d.x + rb,
			ny1 = d.y - rb,
			ny2 = d.y + rb;
		quadtree.visit(function(quad, x1, y1, x2, y2) {
		if (quad.point && (quad.point !== d)) {
			var x = d.x - quad.point.x,
				y = d.y - quad.point.y,
				l = Math.sqrt(x * x + y * y);
			if (l < rb) {
			l = (l - rb) / l * alpha;
			d.x -= x *= l;
			d.y -= y *= l;
			quad.point.x += x;
			quad.point.y += y;
			}
		}
		return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
		});
	};
	}
	
	
	// $("circle").tooltip({
    //         'container': 'body',
    //         'placement': 'left',
	// });
	
	// var tip = d3.tip()
	// 	.attr('class', 'd3-tip')
	// 	.offset([-10, 0]);
	
	// $("link").tooltip({
    //         'container': 'body',
    //         'placement': 'left',
	// });
	
	});
});


//http://www.coppelia.io/2014/07/an-a-to-z-of-extra-features-for-the-d3-force-layout/
//http://bl.ocks.org/mbostock/4062045
//http://bl.ocks.org/mbostock/1129492