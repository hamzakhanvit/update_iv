var circularTrackDefaults = {
    radius: 5,
    w: 600,
    h: 600,
    factor: 1,
    factorLegend: .85,
    TranslateX: 80,
    TranslateY: 30,
    ExtraWidthX: 100,
    ExtraWidthY: 100,
    radians: 2 * Math.PI,
    spacing: 100000,
    legend_spacing: 5,
    min_radians: .02 * Math.PI,
    dragresize: true,
    movecursor: false,
}

function circularTrack(layout,tracks) {

    this.tracks = tracks;
    this.layout = layout;
    this.numTracks = tracks.length;

    if('undefined' !== typeof layout) {
	    // Copy over any defaults not passed in
	    // by the user
	    for(var i in circularTrackDefaults) {
		if('undefined' == typeof layout[i]) {
		    this.layout[i] = circularTrackDefaults[i];
		}
	    }
	}

    if('undefined' == typeof layout.plotid) {
	this.layout.plotid = layout.container.slice(1);
    }

    this.layout.containerid =  layout.container.slice(1);

    // Setup some constants we'll need and build the canvas
    this.layout.radians_pre_bp = this.layout.radians/this.layout.genomesize;
    this.layout.min_bp_per_slice = this.layout.min_radians / this.layout.radians_pre_bp;
    this.layout.min_bp_per_slice_half = this.layout.min_bp_per_slice/2;
    this.layout.radius = this.layout.factor*Math.min(this.layout.w/2, this.layout.h/2);
    this.xScale = d3.scale.linear()
	.range([0,this.layout.radians])
	.domain([0, layout.genomesize]);
    var xScale = this.xScale;
    d3.select(layout.container).select("svg").remove();

    this.container = d3.select(layout.container)
	.append("svg")	
	.attr("id", function() { return layout.container.slice(1) + "_svg"; })
	.attr("width", this.layout.w+this.layout.ExtraWidthX)
	.attr("height", this.layout.h+this.layout.ExtraWidthY); 
   
    this.g = this.container
	.append("g")
	.attr("id", function() { return layout.container.slice(1) + "_g"; })
	.attr("transform", "translate(" + this.layout.TranslateX + "," + this.layout.TranslateY + ")");

    // Add the double click functionality, but we needed to define g first
    this.container.on("dblclick", function(d,i) {
	    if('undefined' !== typeof this.layout.dblclick) {
		var node = this.g.node();
		var curBP = calcRadBPfromXY((d3.mouse(node)[0] - (this.layout.w/2)),
						  -(d3.mouse(node)[1] - (this.layout.h/2)),
						  xScale)[1];
		var fn = window[this.layout.dblclick];

		if('object' ==  typeof fn) {
		    return fn.ondblclick(this.layout.plotid, curBP); //This needs to be altered. plotid does not have an accession number
		} else if('function' == typeof fn) {
		    return fn(this.layout.plotid, curBP);
		}

	    } else {
		null;
	    }
	}.bind(this));

    this.defs = this.g.append("defs");

    this.defs.append('svg:marker')
	.attr('id', 'end-arrow')
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', 6)
	.attr('markerWidth', 7)
	.attr('markerHeight', 7)
	.attr('orient', 'auto')
	.append('svg:path')
	.attr('d', 'M0,-5L10,0L0,5')
	.attr('class', "move-cross");

    this.defs.append('svg:marker')
	.attr('id', 'start-arrow')
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', 4)
	.attr('markerWidth', 7)
	.attr('markerHeight', 7)
	.attr('orient', 'auto')
	.append('svg:path')
	.attr('d', 'M10,-5L0,0L10,5')
	.attr('class', "move-cross");
	//    .attr('fill', '#000');

    // Display the dragging cross if needed
    if(this.layout.movecursor == true) {
	this.g.append("rect")
	    .attr("width", 18)
	    .attr("height", 18)
	    .attr("fill-opacity", 0)
	    .attr("class", "move-shadow move_" + this.layout.containerid);

	this.g.append("line")
	    .attr("x1", 0)
	    .attr("x2", 18)
	    .attr("y1", 9)
	    .attr("y2", 9)
	    .style('marker-start', 'url(#start-arrow)')
	    .style('marker-end', 'url(#end-arrow)')
	    .attr("class", "move-cross move_" + this.layout.containerid);

	this.g.append("line")
	    .attr("x1", 9)
	    .attr("x2", 9)
	    .attr("y1", 0)
	    .attr("y2", 18)
	    .style('marker-start', 'url(#start-arrow)')
	    .style('marker-end', 'url(#end-arrow)')
	    .attr("class", "move-cross move_" + this.layout.containerid);
    }

    // Resize drag shadow
    if(this.layout.dragresize == true) {
	this.drag_shadow = this.container.append("rect")
	    .attr("width", (this.layout.w+this.layout.ExtraWidthX))
	    .attr("height", (this.layout.h+this.layout.ExtraWidthY))
	    .attr("class", "dragbar-shadow linear_hidden");
    }

    // Now we can start drawing the plots, first the basic axis...
    this.drawAxis();

    // Draw the plots
    for(var i=0; i < this.tracks.length; i++) {

	if('undefined' !== typeof this.tracks[i].visible) {
	    if(! this.tracks[i].visible) {
		continue;
	    }
	}

	// We're going to see what type of tracks we have
	// and dispatch them appropriately

	switch(this.tracks[i].trackType) {
	case "plot":
	    this.drawPlot(i);
	    break;
	case "track":
	    this.drawTrack(i);
	    break;
	case "stranded":
	    this.drawTrack(i);
	    break;
	case "glyph":
	    this.findGlyphTypes(i);

	    if('undefined' !== typeof this.tracks[i].hideTypes) {
		this.maskGlyphTypes(i, this.tracks[i].hideTypes)
	    }
	    //	    this.tracks[i].container = 
	    //	this.g.append("g")
	    //	.attr("class", this.tracks[i].trackName + "_glyph_container")
	    this.drawGlyphTrack(i);
	    break;
	default:
	    // Do nothing for an unknown track type
	}
    }

    // Resize dragger
    if(this.layout.dragresize == true) {
	var dragright = d3.behavior.drag()
	.on("dragstart", this.dragresize_start.bind(this))
	    .on("drag", this.dragresize.bind(this))
	    .on("dragend", this.dragresize_end.bind(this));

	this.dragbar_y_mid = this.layout.h/2;
	this.dragbar = this.container.append("g")
	    .attr("transform", "translate(" + (this.layout.w+this.layout.ExtraWidthX-25) + "," +  (this.layout.h+this.layout.ExtraWidthY-25) + ")")
	    .attr("width", 25)
	    .attr("height", 20)
	    .attr("fill", "lightblue")
	    .attr("fill-opacity", .2)
	    .attr("cursor", "ew-resize")
	    .call(dragright);

	this.dragbar.append("rect")
	    .attr("width", 25)
	    .attr("height", 20)
	    .attr("fill-opacity", 0);

	this.dragbar.append("line")
	    .attr("x1", 16)
	    .attr("x2", 16)
	    .attr("y1", 0)
	    .attr("y2", 14)
	    .attr("class", "dragbar-line");
	this.dragbar.append("line")
	    .attr("x1", 2)
	    .attr("x2", 16)
	    .attr("y1", 14)
	    .attr("y2", 14)
	    .attr("class", "dragbar-line");
	this.dragbar.append("line")
	    .attr("x1", 19)
	    .attr("x2", 19)
	    .attr("y1", 0)
	    .attr("y2", 17)
	    .attr("class", "dragbar-line");
	this.dragbar.append("line")
	    .attr("x1", 2)
	    .attr("x2", 19)
	    .attr("y1", 17)
	    .attr("y2", 17)
	    .attr("class", "dragbar-line");
	this.dragbar.append("line")
	    .attr("x1", 22)
	    .attr("x2", 22)
	    .attr("y1", 0)
	    .attr("y2", 20)
	    .attr("class", "dragbar-line");
	this.dragbar.append("line")
	    .attr("x1", 2)
	    .attr("x2", 22)
	    .attr("y1", 20)
	    .attr("y2", 20)
	    .attr("class", "dragbar-line");
    }

}

circularTrack.prototype.drawAxis = function() {
    var cfg = this.layout;
    var g = this.g;

    this.axis_container = this.g
	.append("g")
	.attr("id", "axis_container");

    var axis = this.axis_container.selectAll(".axis")
    .data(d3.range(0,cfg.genomesize, cfg.spacing))
    .enter()
    .append("g")
    .attr("class", "axis");

    axis.append("line")
    .attr("x1", function(d, i){return cfg.w/2 + (20*Math.cos((d*cfg.radians_pre_bp)-Math.PI/2));})
    .attr("y1", function(d, i){return cfg.h/2 + (20*Math.sin((d*cfg.radians_pre_bp)-Math.PI/2));})
    .attr("x2", function(d, i){return cfg.w/2 + (cfg.radius*Math.cos((d*cfg.radians_pre_bp)-Math.PI/2));})
    .attr("y2", function(d, i){return cfg.h/2 + (cfg.radius*Math.sin((d*cfg.radians_pre_bp)-Math.PI/2));})
    .attr("class", "line")
    .style("stroke", "grey")
    .style("stroke-width", "1px");

    var axis_label = this.axis_container.selectAll(".axislabel")
    .data(d3.range(0,cfg.genomesize, cfg.spacing*cfg.legend_spacing))
    .enter()
    .append("g")
    .attr("class", "axislabel");
      
    axis_label.append("text")
    .attr("class", "legend")
    .text(function(d){ var prefix = d3.formatPrefix(d);
	    return prefix.scale(d) + prefix.symbol;
	})
    .style("font-family", "sans-serif")
    .style("font-size", "11px")
    .attr("text-anchor", "middle")
    .attr("dy", "1.5em")
    .attr("transform", function(d, i){return "translate(0, -10)"})
    .attr("x", function(d, i){return cfg.w/2 + ((cfg.radius+10)*Math.cos((d*cfg.radians_pre_bp)-Math.PI/2));})
    .attr("y", function(d, i){return cfg.h/2 + ((cfg.radius+10)*Math.sin((d*cfg.radians_pre_bp)-Math.PI/2));});

    // And draw the pretty outer circle for the axis
    this.drawCircle("outerAxis", cfg.radius-10, 'grey');
}

circularTrack.prototype.moveAxis = function() {
    var cfg = this.layout;

    this.axis_container
	.selectAll("line")
	.data(d3.range(0,cfg.genomesize, cfg.spacing))
        .transition()
        .duration(1000)
	.attr("x1", function(d, i){return cfg.w/2 + (20*Math.cos((d*cfg.radians_pre_bp)-Math.PI/2));})
	.attr("y1", function(d, i){return cfg.h/2 + (20*Math.sin((d*cfg.radians_pre_bp)-Math.PI/2));})
	.attr("x2", function(d, i){return cfg.w/2 + (cfg.radius*Math.cos((d*cfg.radians_pre_bp)-Math.PI/2));})
	.attr("y2", function(d, i){return cfg.h/2 + (cfg.radius*Math.sin((d*cfg.radians_pre_bp)-Math.PI/2));});

    this.axis_container
	.selectAll("text")
	.data(d3.range(0,cfg.genomesize, cfg.spacing*cfg.legend_spacing))
        .transition()
        .duration(1000)
	.attr("x", function(d, i){return cfg.w/2 + ((cfg.radius+10)*Math.cos((d*cfg.radians_pre_bp)-Math.PI/2));})
	.attr("y", function(d, i){return cfg.h/2 + ((cfg.radius+10)*Math.sin((d*cfg.radians_pre_bp)-Math.PI/2));});

    // And draw the pretty outer circle for the axis
    this.moveCircle("outerAxis", cfg.radius-10);

}
// Helper function for drawing needed circles such
// as in stranded tracks
// Can be called standalone in setting up the look
// of your genome

circularTrack.prototype.drawCircle = function(name, radius, line_stroke, animate) {
    var g = this.g;
    var cfg = this.layout;

    g.append("circle")
    .attr("r", (('undefined' == typeof animate) ? radius : 1 ))
    .attr("class", name + "_circle")
    .style("fill", "none")
    .style("stroke", line_stroke)
    .attr("cx", cfg.w/2)
    .attr("cy", cfg.h/2);

    // An animated entrance
    if('undefined' !== typeof animate) {
	this.moveCircle(name, radius);
    }

}

// Change the radius of an inscribed circle

circularTrack.prototype.moveCircle = function(name, radius) {
    var g = this.g;
    var cfg = this.layout;

    g.selectAll("." + name + "_circle")
    .transition()
    .duration(1000)
    .attr("r", radius)
    .attr("cx", cfg.w/2)
    .attr("cy", cfg.h/2);

}

// Remove a drawn circle, in a pretty animated way

circularTrack.prototype.removeCircle = function(name) {
    var g = this.g;

    g.selectAll("." + name + "_circle")
    .transition()
    .duration(1000)
    .attr("r", 1)
    .style("opacity", 0)
    .remove();
}

/////////////////////////////////////////
//
// Plot type tracks (as in line graphs)
//
/////////////////////////////////////////

circularTrack.prototype.drawPlot = function(i, animate) {
    var g = this.g;
    var cfg = this.layout;
    var track = this.tracks[i];

    this.tracks[i].plotRange = d3.scale.linear()
    .domain([track.plot_min, track.plot_max])
    .range([track.plot_radius-(track.plot_width/2), track.plot_radius+(track.plot_width/2)]);

    var plotRange = this.tracks[i].plotRange;

    var lineFunction = d3.svg.line()
    .x(function(d, i) { return cfg.w/2 + ((('undefined' == typeof animate) ? plotRange(d) : 1 )*Math.cos((i*track.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
    .y(function(d, i) { return cfg.h/2 + ((('undefined' == typeof animate) ? plotRange(d) : 1 )*Math.sin((i*track.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
    .interpolate("linear");

    g.append("path")
    .attr("d", lineFunction(track.items))
    .attr("class", track.trackName)
    .attr("id", track.trackName)
    .attr("stroke-width", 1)
    .attr("fill", "none");

    // Now do the mean circle if we have one
    if('undefined' !== typeof track.plot_mean) {
	this.drawCircle(track.trackName,  this.tracks[i].plotRange(track.plot_mean), "grey", animate);
    }  

    // And if we're doing an animated entrance...
    if('undefined' !== typeof animate) {
	this.movePlot(i, track.plot_radius);
    }

    // Mark the track as visible, if not already
    this.tracks[i].visible = true;
}

circularTrack.prototype.movePlot = function(i, radius) {
    var g = this.g;
    var cfg = this.layout;
    var track = this.tracks[i];

    // Save this in case this is a change of radius
    // ratherthan an animated entrance
    this.tracks[i].plot_radius = radius;

//     var plotRange = d3.scale.linear()
    this.tracks[i].plotRange
//    .domain([track.plot_min, track.plot_max])
	.range([track.plot_radius-(track.plot_width/2), track.plot_radius+(track.plot_width/2)]);

    var plotRange = this.tracks[i].plotRange;

    var lineFunction = d3.svg.line()
    .x(function(d, i, j) { return cfg.w/2 + (plotRange(d)*Math.cos((i*track.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
    .y(function(d, i) { return cfg.h/2 + (plotRange(d)*Math.sin((i*track.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
    .interpolate("linear");

    var plot = g.selectAll("." + track.trackName)

    plot.transition()
    .duration(1000)
    .attr("d", function(d,i) { return lineFunction(track.items)});

    // Now move the mean circle if we have one
    if('undefined' !== typeof track.plot_mean) {
	this.moveCircle(track.trackName, this.tracks[i].plotRange(track.plot_mean));
    }  
}

circularTrack.prototype.removePlot = function(i) {
    var g = this.g;
    var cfg = this.layout;
    var track = this.tracks[i];

    var plotRange = d3.scale.linear()
    .domain([track.plot_min, track.plot_max])
    .range([1-(track.plot_width/2), 1+(track.plot_width/2)]);

    var lineFunction = d3.svg.line()
    .x(function(d, i) { return cfg.w/2 + (plotRange(d)*Math.cos((i*track.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
    .y(function(d, i) { return cfg.h/2 + (plotRange(d)*Math.sin((i*track.bp_per_element*cfg.radians_pre_bp)-(Math.PI/2))); })
    .interpolate("linear");

    g.selectAll("." + track.trackName)
    .transition()
    .duration(1000)
    .attr("d", lineFunction(track.items))
    .style("opacity", 0)
    .remove();

      if('undefined' !== typeof track.plot_mean) {
	  this.removeCircle(track.trackName);
      }

    // Mark the track as not visible
    this.tracks[i].visible = false;
}

////////////////////////////////////////////////
//
// Track type tracks (as blocks without strands)
//
////////////////////////////////////////////////

circularTrack.prototype.drawTrack = function(i, animate) {
    var g = this.g;
    var cfg = this.layout;
    var track = this.tracks[i];

    // The arc object which will be passed in to each
    // set of data
    var arc = d3.svg.arc()
    .innerRadius(function(d){ return (('undefined' == typeof animate) ? 
				      calcInnerRadius(track.inner_radius, track.outer_radius, d.strand) 
				      : 1);})
    .outerRadius(function(d){ return (('undefined' == typeof animate) ? 
				      calcOuterRadius(track.inner_radius, track.outer_radius, d.strand)
				      : 2);})
    .startAngle(function(d){if(track.min_slice && (d.end - d.start) < cfg.min_bp_per_slice) {
		return (d.start - ((d.end - d.start - cfg.min_bp_per_slice_half) / 2))*cfg.radians_pre_bp;
	    } else {
		return cfg.radians_pre_bp*d.start;
	    }
	})
    .endAngle(function(d){if(track.min_slice && (d.end - d.start) < cfg.min_bp_per_slice) {
		return (d.end + ((d.end - d.start - cfg.min_bp_per_slice_half)/2))*cfg.radians_pre_bp;
	    } else {
		return cfg.radians_pre_bp*d.end;
	    }
	});
      
    // Draw the track, putting in elements such as hover colour change
    // if one exists, click events, etc
    g.selectAll(".tracks."+track.trackName)
    .data(track.items)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("class", function(d) { return track.trackName + ('undefined' !== typeof d.strand ? '_' + (d.strand == 1 ? 'pos' : 'neg') : '') })
    .attr("transform", "translate("+cfg.w/2+","+cfg.h/2+")")
    .on("click", function(d,i) {
	    if('undefined' !== typeof track.mouseclick) {
		var fn = window[track.mouseclick];
		if('object' ==  typeof fn) {
//		    console.log(fn);
		    return fn.onclick(track.trackName, d, cfg.plotid);
		} else if('function' == typeof fn) {
		    return fn(track.trackName, d, cfg.plotid);
		}

	    } else {
		null;
	    }
	})
    .on("mouseover", function(d, i) {
	    if('undefined' !== typeof track.mouseover_callback) {
		var fn = window[track.mouseover_callback];
		if('object' ==  typeof fn) {
		    fn.mouseover(track.trackName, d, cfg.plotid);
		    return true;
		} else if('function' == typeof fn) {
		    return fn(track.trackNamed, cfg.plotid);
		}

	    } else {
		return null;
	    }
	})
    .on("mouseout", function(d, i) {
    	    if('undefined' !== typeof track.mouseout_callback) {
		var fn = window[track.mouseout_callback];
		if('object' ==  typeof fn) {
		    return fn.mouseout(track.trackName, d, cfg.plotid);
		} else if('function' == typeof fn) {
		    return fn(track.trackNamed, cfg.plotid);
		}

    	    } else {
		return null;
	    }
    	});

    // If we're doing an animated addition, move the track out to its
    // new spot
    if('undefined' !== typeof animate) {
	this.moveTrack(i, track.inner_radius, track.outer_radius);
    }

    // And check if we've been asked to do a centre line
    if('undefined' !== typeof track.centre_line_stroke) {
	this.drawCircle(track.trackName, (track.inner_radius + track.outer_radius)/2, track.centre_line_stroke, animate);
      }

    this.tracks[i].visible = true;

}

circularTrack.prototype.moveTrack = function(i, innerRadius, outerRadius) {
    var g = this.g;
    var cfg = this.layout;
    var track = this.tracks[i];

    var arcShrink = d3.svg.arc()
    .innerRadius(function(d){return calcInnerRadius(innerRadius, outerRadius, d.strand);})
    .outerRadius(function(d){return calcOuterRadius(innerRadius, outerRadius, d.strand);})
    .startAngle(function(d){if(track.min_slice && (d.end - d.start) < cfg.min_bp_per_slice) {
		return (d.start - ((d.end - d.start - cfg.min_bp_per_slice_half) / 2))*cfg.radians_pre_bp;
	    } else {
		return cfg.radians_pre_bp*d.start;
	    }
	})
    .endAngle(function(d){if(track.min_slice && (d.end - d.start) < cfg.min_bp_per_slice) {
		return (d.end + ((d.end - d.start - cfg.min_bp_per_slice_half)/2))*cfg.radians_pre_bp;
	    } else {
		return cfg.radians_pre_bp*d.end;
	    }
	});
 

    //   .endAngle(function(d){return cfg.radians_pre_bp*d.start;})
    //    .startAngle(function(d){return cfg.radians_pre_bp*d.end;});

    g.selectAll("." + track.trackName + ", ." + track.trackName + "_pos, ." + track.trackName + "_neg")
    .transition()
    .duration(1000)
    .attr("d", arcShrink)
    .attr("transform", "translate("+cfg.w/2+","+cfg.h/2+")")

    // Just record the new radii in case we need them later
    this.tracks[i].inner_radius = innerRadius;
    this.tracks[i].outer_radius = outerRadius;

    // And check if we've been asked to do a centre line
    if('undefined' !== typeof track.centre_line_stroke) {
	this.moveCircle(track.trackName, (track.inner_radius + track.outer_radius)/2);
      }

}

circularTrack.prototype.removeTrack = function(i) {
    var g = this.g;
    var cfg = this.layout;
    var track = this.tracks[i];

    var arcShrink = d3.svg.arc()
    .innerRadius(1)
    .outerRadius(2)
    .endAngle(function(d){return cfg.radians_pre_bp*d.start;})
    .startAngle(function(d){return cfg.radians_pre_bp*d.end;});

    g.selectAll("." + track.trackName + ", ." + track.trackName + "_pos, ." + track.trackName + "_neg")
    .transition()
    .duration(1000)
    .attr("d", arcShrink)
    .style("opacity", 0)
    .remove();

    if('undefined' !== track.centre_line_stroke) {
	this.removeCircle(track.trackName);
    }

    this.tracks[i].visible = false;

}

////////////////////////////////////////////////
//
// Glyph type tracks
//
////////////////////////////////////////////////

// We will probably need to send a localized
// version of the data so the update works
// properly

circularTrack.prototype.drawGlyphTrack = function(i) {
    var g = this.g;
    var cfg = this.layout;
    var track = this.tracks[i];
    var stack_count = 0;

    var items = track.items.filter(function(d) { return track.visTypes.contains(d.type) } );

    // Because on update the order of processing changes we need
    // to recompute the stacking order manually each time
    for(var i = 0; i < items.length; i++) {
	if(i < 1) {
	    items[i].stackCount = 0;
	    continue;
	}

	xs = (cfg.h/2 + (track.radius*Math.sin((items[i].bp*cfg.radians_pre_bp)-Math.PI/2))) -
	(cfg.h/2 + (track.radius*Math.sin((items[i-1].bp*cfg.radians_pre_bp)-Math.PI/2)));
	ys = (cfg.h/2 + (track.radius*Math.cos((items[i].bp*cfg.radians_pre_bp)-Math.PI/2))) -
	(cfg.h/2 + (track.radius*Math.cos((items[i-1].bp*cfg.radians_pre_bp)-Math.PI/2)));
	xs = xs * xs;
	ys = ys * ys;
	var dist = Math.sqrt(xs + ys);

	if(dist < track.pixel_spacing) { 
	    items[i].stackCount = items[i-1].stackCount + 1; 
	    continue;
	}

	items[i].stackCount = 0;
    }

    var x = function(d,i) { return cfg.w/2 + (((track.glyph_buffer * d.stackCount) + track.radius)*Math.cos((d.bp*cfg.radians_pre_bp)-Math.PI/2)); };
    var y = function(d,i) { return cfg.h/2 + (((track.glyph_buffer * d.stackCount) + track.radius)*Math.sin((d.bp*cfg.radians_pre_bp)-Math.PI/2)); };

    var trackPath = g.selectAll("." + track.trackName)
    //    var trackPath = track.container.selectAll("." + track.trackName)
    .data(items, function(d) { return d.id; });

    trackPath.transition()
    .duration(1000)
    .attr("transform", function(d,i) { return "translate(" + x(d,i) + ","
		+ y(d,i) + ")" })
    .style("opacity", 1);    

    trackPath.exit()
    .transition()
    .duration(1000)
    .attr("transform", "translate(" + cfg.h/2 + "," + cfg.w/2 + ")")
    .style("opacity", 0)
    .remove();

    trackPath.enter()
    .append('path')
    .attr('id', function(d,i) { return track.trackName + "_glyph" + d.id; })
    .attr('class', function(d) {return track.trackName + '_' + d.type + ' ' + track.trackName})
    .attr("d", d3.svg.symbol().type(track.glyphType).size(track.glyphSize))
    .attr("transform", "translate(" + cfg.h/2 + "," + cfg.w/2 + ")")
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .attr("transform", function(d,i) { return "translate(" + x(d,i) + ","
				       + y(d,i) + ")" })
    .style("opacity", 1);


}

circularTrack.prototype.updateGlyphTrack = function(i) {
    var g = this.g;
    var cfg = this.layout;
    var track = this.tracks[i];
    var stack_count = 0;

    
}

////////////////////////////////////////////////
//
// Brush functionality
//
////////////////////////////////////////////////

circularTrack.prototype.attachBrush = function(callbackObj) {
    if('undefined' !== typeof this.callbackObj) {

	if( Object.prototype.toString.call( callbackObj ) === '[object Array]' ) { 
	    this.callbackObj.push(callbackObj);
	} else {
	    var tmpobj = this.callbackObj;
	    this.callbackObj = [tmpobj, callbackObj];
	}
    } else {
	this.callbackObj = callbackObj;
	this.createBrush();
    }

}

circularTrack.prototype.redrawBrush = function(startRad, endRad) {
    var cfg = this.layout;

    if('undefined' !== typeof this.brush) {

	this.brushArc
	    .outerRadius(cfg.radius-10);

	this.brush
	    .transition()
	    .duration(1000)
	    .attr("transform", "translate("+cfg.w/2+","+cfg.h/2+")");

	this.moveBrush(startRad, endRad);

	d3.select("#brushStart_" + cfg.containerid)		
	    .transition()
	    .duration(1000)
	    .attr("cx", cfg.h/2 + ((cfg.radius-10)*Math.cos(startRad-Math.PI/2)))
	    .attr("cy", cfg.h/2 + ((cfg.radius-10)*Math.sin(startRad-Math.PI/2)));

	d3.select("#brushEnd_" + cfg.containerid)		
	    .transition()
	    .duration(1000)
	    .attr("cx", cfg.w/2 + ((cfg.radius-10)*Math.cos(endRad-Math.PI/2)))
	    .attr("cy", cfg.h/2 + ((cfg.radius-10)*Math.sin(endRad-Math.PI/2)));

    }
}

circularTrack.prototype.createBrush = function() {
    var g = this.g;
    var cfg = this.layout;
    var xScale = this.xScale;
    var self = this;

    this.brushStart = 0;
    this.brushEnd = 0;
    this.brushStartBP = 0;
    this.brushEndBP = 0;

    this.brushArc = d3.svg.arc()
    .innerRadius(20)
    .outerRadius(cfg.radius-10)
    .endAngle(function(d){return xScale(0);})
    .startAngle(function(d){return xScale(0);});

    this.brush = g.insert("path", "defs")
    .attr("d", this.brushArc)
    .attr("id", "polarbrush_" + cfg.containerid)
    .attr("class", "polarbrush circularbrush")
    .attr("transform", "translate("+cfg.w/2+","+cfg.h/2+")")

    var dragStart = d3.behavior.drag()
    .on("drag", function(d) {
	    var mx = d3.mouse(this)[0];
	    var my = d3.mouse(this)[1];

	    var curRadandBP = calcRadBPfromXY((d3.mouse(this)[0] - (cfg.w/2)),
					      -(d3.mouse(this)[1] - (cfg.h/2)),
					      xScale);

	    // Don't allow the brush to go beyond the other
	    if(curRadandBP[0] >= self.brushEnd) {
		return;
	    }

	    g.select("#brushStart_" + cfg.containerid)		
	    .attr("cx", function(d, i){return cfg.h/2 + (cfg.radius-10)*Math.cos((curRadandBP[0])-Math.PI/2);})
	    .attr("cy", function(d, i){return cfg.h/2 + (cfg.radius-10)*Math.sin((curRadandBP[0])-Math.PI/2); });
		
	    self.brushStart = curRadandBP[0];
	    self.brushStartBP = curRadandBP[1];
	    self.moveBrush(self.brushStart, self.brushEnd);
	    if('undefined' !== typeof self.callbackObj) {
		self.doBrushCallback(self.brushStartBP, self.brushEndBP);
		//		self.callbackObj.update(self.brushStartBP, self.brushEndBP);
	    }
	})
    .on("dragend", function(d) {
	    self.doBrushFinishedCallback(self.brushStartBP, self.brushEndBP);
	});

    var dragEnd = d3.behavior.drag()
    .on("drag", function(d) {
	    var mx = d3.mouse(this)[0];
	    var my = d3.mouse(this)[1];

	    var curRadandBP = calcRadBPfromXY((d3.mouse(this)[0] - (cfg.w/2)),
					      -(d3.mouse(this)[1] - (cfg.h/2)),
					      xScale);

	    // Don't allow the brush to go beyond the other
	    if(curRadandBP[0] <= self.brushStart) {
		return;
	    }

	    g.select("#brushEnd_" + cfg.containerid)		
	    .attr("cx", function(d, i){return cfg.h/2 + (cfg.radius-10)*Math.cos((curRadandBP[0])-Math.PI/2);})
	    .attr("cy", function(d, i){return cfg.h/2 + (cfg.radius-10)*Math.sin((curRadandBP[0])-Math.PI/2); });
		
	    self.brushEnd = curRadandBP[0];
	    self.brushEndBP = curRadandBP[1];
	    self.moveBrush(self.brushStart, self.brushEnd);
	    if('undefined' !== typeof self.callbackObj) {
		self.doBrushCallback(self.brushStartBP, self.brushEndBP);
		//		self.callbackObj.update(self.brushStartBP, self.brushEndBP);
	    }
	})
    .on("dragend", function(d) {
	    self.doBrushFinishedCallback(self.brushStartBP, self.brushEndBP);
	});

    this.endBrushObj = g.append("circle")
    .attr({
	    id: 'brushEnd_' + cfg.containerid,
	    class: 'brushEnd circularbrush',
		cx: (cfg.w/2 + ((cfg.radius-10)*Math.cos((this.xScale(0))-Math.PI/2))),
		cy: (cfg.h/2 + ((cfg.radius-10)*Math.sin((this.xScale(0))-Math.PI/2))),
		r: 5,
	    })
            .call(dragEnd);

    this.startBrushObj = g.append("circle")
    .attr({
	    id: 'brushStart_' + cfg.containerid,
	    class: 'brushStart circularbrush',
		cx: (cfg.w/2 + ((cfg.radius-10)*Math.cos((this.xScale(0))-Math.PI/2))),
		cy: (cfg.h/2 + ((cfg.radius-10)*Math.sin((this.xScale(0))-Math.PI/2))),
		r: 5,
		})
    .call(dragStart);

    // Create the start and stop pointers

}

circularTrack.prototype.doBrushCallback = function(startBP, endBP) {
    var cfg = this.layout;

    if( Object.prototype.toString.call( this.callbackObj ) === '[object Array]' ) { 
	for(var obj in this.callbackObj) {
	    if(this.callbackObj.hasOwnProperty(obj)) {
		this.callbackObj[obj].update(startBP, endBP, { plotid: cfg.plotid } );
	    }
	}
    } else {
	this.callbackObj.update(startBP, endBP, { plotid: cfg.plotid });
    }

}

circularTrack.prototype.doBrushFinishedCallback = function(startBP, endBP) {
    var cfg = this.layout;

    if( Object.prototype.toString.call( this.callbackObj ) === '[object Array]' ) { 
	for(var obj in this.callbackObj) {
	    if(this.callbackObj.hasOwnProperty(obj)) {
		this.callbackObj[obj].update_finished(startBP, endBP, { plotid: cfg.plotid });
	    }
	}
    } else {
	this.callbackObj.update_finished(startBP, endBP, { plotid: cfg.plotid });
    }

}

circularTrack.prototype.moveBrush = function(startRad, endRad) {
    var g = this.g;
    var cfg = this.layout;

    //    console.log("moving brush to " + startRad, endRad);

    this.brushArc
    .startAngle(startRad)
    .endAngle(endRad);

    d3.select('#polarbrush_' + cfg.containerid)
    .attr("d", this.brushArc);

    this.currentStart = startRad;
    this.currentEnd = endRad;
    
}

circularTrack.prototype.moveBrushbyBP = function(startbp, endbp) {
    var cfg = this.layout;

    var startRad = startbp*this.layout.radians_pre_bp;
    var endRad = endbp*this.layout.radians_pre_bp;
    this.moveBrush(startRad,endRad);

    this.brushStart = startRad;
    this.brushStartBP = startbp;
    this.currentStart = startRad;
    this.currentEnd = endRad;
    d3.select("#brushStart_" + cfg.containerid)		
    .attr("cx", cfg.h/2 + ((cfg.radius-10)*Math.cos(startRad-Math.PI/2)))
    .attr("cy", cfg.h/2 + ((cfg.radius-10)*Math.sin(startRad-Math.PI/2)));

    this.brushEnd = endRad;
    this.brushEndBP = endbp;
    d3.select("#brushEnd_" + cfg.containerid)		
    .attr("cx", cfg.w/2 + ((cfg.radius-10)*Math.cos(endRad-Math.PI/2)))
    .attr("cy", cfg.h/2 + ((cfg.radius-10)*Math.sin(endRad-Math.PI/2)));


}

circularTrack.prototype.hideBrush = function() {
    var cfg = this.layout;

    d3.select("#brushStart_" + cfg.containerid)
    .style("visibility", "hidden");

    d3.select("#brushEnd_" + cfg.containerid)
    .style("visibility", "hidden");

    d3.select('#polarbrush_' + cfg.containerid)
    .style("visibility", "hidden");
}

circularTrack.prototype.showBrush = function() {
    var cfg = this.layout;

    d3.select("#brushStart_" + cfg.containerid)
    .style("visibility", "visible");

    d3.select("#brushEnd_" + cfg.containerid)
    .style("visibility", "visible");

    d3.select('#polarbrush_' + cfg.containerid)
    .style("visibility", "visible");
}

    circularTrack.prototype.update = function(startBP, endBP, params) {
    this.moveBrushbyBP(startBP, endBP);
}

	circularTrack.prototype.update_finished = function(startBP, endBP, params) {
    //    console.log("Thank you, got: " + startBP, endBP);
}

////////////////////////////////////////////////
//
// Export functionality
//
////////////////////////////////////////////////

// Allowed export formats are 'png' and 'svg'
// The extension will be added, just summply the base
// filename.

// Saving to raster format is dependent on FileSaver.js
// and canvg.js (which include rgbcolor.js & StackBlur.js),
// they must be loaded before circularplot.js

circularTrack.prototype.savePlot = function(scaling, filename, stylesheetfile, format) {

    // First lets get the stylesheet
    var sheetlength = stylesheetfile.length;
    var style = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
	style.textContent += "<![CDATA[\n";
    for (var i=0;i<document.styleSheets.length; i++) {
	str = document.styleSheets[i].href;
	if(null == str) continue;

	if (str.substr(str.length-sheetlength)==stylesheetfile){
      	    var rules = document.styleSheets[i].rules;
            for (var j=0; j<rules.length;j++){
		style.textContent += (rules[j].cssText + "\n");
            }
            break;
    	}
    }
    style.textContent += "]]>";

    // Now we clone the SVG element, resize and scale it up
    var container = this.layout.container.slice(1);
    var containertag = document.getElementById(container);
    var clonedSVG = containertag.cloneNode(true);
    var svg = clonedSVG.getElementsByTagName("svg")[0];

    // Remove drag-resize shadow element
    var tags = svg.getElementsByClassName("dragbar-shadow")
    for(var i=0; i<tags.length; i++) {
	if(tags[i].getAttributeNS(null, "name") === name) {
	    tags[i].parentNode.removeChild(tags[i]);
        }
    }

    // Remove the brush if it's on the chart
    var tags = svg.getElementsByClassName("circularbrush")
    for(var i=tags.length-1; i>=0; i--) {
//	if(tags[i].getAttributeNS(null, "name") === name) {
	    tags[i].parentNode.removeChild(tags[i]);
//        }
    }

    // Remove the move croshairs if on the chart
    var tags = svg.getElementsByClassName("move_circularchart")
    for(var i=tags.length-1; i>=0; i--) {
//	if(tags[i].getAttributeNS(null, "name") === name) {
	    tags[i].parentNode.removeChild(tags[i]);
//        }
    }

    // We need to resize the svg with the new canvas size
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('width', this.layout.w*scaling +  this.layout.TranslateX*scaling);
    svg.setAttribute('height', this.layout.h*scaling +  this.layout.TranslateY*scaling);

    // Update first g tag with the scaling
    g = svg.getElementsByTagName("g")[0];
    transform = g.getAttribute("transform");
    g.setAttribute("transform", transform + " scale(" + scaling + ")");

    // Append the stylehsheet to the cloned svg element
    // so when we export it the style are inline and 
    // get rendered
    svg.getElementsByTagName("defs")[0].appendChild(style);

    // Fetch the actual SVG tag and convert it to a canvas
    // element
    var content = clonedSVG.innerHTML.trim();

    if(format == 'svg') {
	var a = document.createElement('a');
	a.href = "data:application/octet-stream;base64;attachment," + btoa(content);
	a.download = filename + ".svg";
	a.click();

    } else if(format == 'png') {
	var canvas = document.createElement('canvas');
	canvg(canvas, content);

	// Convert the canvas to a data url (this could
	// be displayed inline by inserting it in to an 
	// <img> tag in the src attribute, ie
	// <img src="'+imgData+'">
	var theImage = canvas.toDataURL('image/png');

	// Convert to a blob
	var blob = this.dataURLtoBlob(theImage);

	// Prompt to save
	saveAs(blob, filename);
    }
}

// Saving to raster format is dependent on FileSaver.js
// and canvg.js (which include rgbcolor.js & StackBlur.js),
// they must be loaded before circularplot.js

circularTrack.prototype.saveRaster = function(scaling, filename, stylesheetfile) {
    // First lets get the stylesheet
    var sheetlength = stylesheetfile.length;
    var style = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
	style.textContent += "<![CDATA[\n";
    for (var i=0;i<document.styleSheets.length; i++) {
	str = document.styleSheets[i].href;
	if(null == str) continue;

	if (str.substr(str.length-sheetlength)==stylesheetfile){
      	    var rules = document.styleSheets[i].rules;
            for (var j=0; j<rules.length;j++){
		style.textContent += (rules[j].cssText + "\n");
            }
            break;
    	}
    }
    style.textContent += "]]>";

    // Now we clone the SVG element, resize and scale it up
    var container = this.layout.container.slice(1);
    var containertag = document.getElementById(container);
    var clonedSVG = containertag.cloneNode(true);
    var svg = clonedSVG.getElementsByTagName("svg")[0];

    // We need to resize the svg with the new canvas size
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('width', this.layout.w*scaling +  this.layout.TranslateX*scaling);
    svg.setAttribute('height', this.layout.h*scaling +  this.layout.TranslateY*scaling);

    // Update first g tag with the scaling
    g = svg.getElementsByTagName("g")[0];
    transform = g.getAttribute("transform");
    g.setAttribute("transform", transform + " scale(" + scaling + ")");

    // Append the stylehsheet to the cloned svg element
    // so when we export it the style are inline and 
    // get rendered
    svg.getElementsByTagName("defs")[0].appendChild(style);

    // Fetch the actual SVG tag and convert it to a canvas
    // element
    var content = clonedSVG.innerHTML.trim();
    var canvas = document.createElement('canvas');
    canvg(canvas, content);

    // Convert the canvas to a data url (this could
    // be displayed inline by inserting it in to an 
    // <img> tag in the src attribute, ie
    // <img src="'+imgData+'">
    var theImage = canvas.toDataURL('image/png');

    // Convert to a blob
    var blob = this.dataURLtoBlob(theImage);

    // Prompt to save
    saveAs(blob, filename);

}

circularTrack.prototype.dataURLtoBlob = function(dataURL) {
  // Decode the dataURL    
  var binary = atob(dataURL.split(',')[1]);
  // Create 8-bit unsigned array
  var array = [];
  for(var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
  }
  // Return our Blob object
  return new Blob([new Uint8Array(array)], {type: 'image/png'});
}

////////////////////////////////////////////////
//
// Utility functions
//
////////////////////////////////////////////////

circularTrack.prototype.showTrack = function(name) {
    var i = this.findTrackbyName(name);

    // We didn't find the track by that name
    if(i < 0) {
	return;
    }

    // Is it already visible? Do nothing
    if(this.tracks[i].visible) {
	return;
    }

    switch(this.tracks[i].trackType) {
    case "plot":
    this.drawPlot(i, true);
        break;
    case "track":
    this.drawTrack(i, true);
        break;
    case "stranded":
    this.drawTrack(i, true);
        break;
    case "glyph":
        // Do nothing for a glyph type, special case
        // but leave this as a placeholder for now
        break;
    default:
    // Do nothing for an unknown track type
    }

}

circularTrack.prototype.hideTrack = function(name) {
    var i = this.findTrackbyName(name);

    // We didn't find the track by that name
    if(i < 0) {
	return;
    }

    // Is it already not visible? Do nothing
    if(! this.tracks[i].visible) {
	return;
    }

    switch(this.tracks[i].trackType) {
    case "plot":
        this.removePlot(i);
        break;
    case "track":
        this.removeTrack(i);
        break;
    case "stranded":
        this.removeTrack(i);
        break;
    case "glyph":
        // Do nothing for a glyph type, special case
        // but leave this as a placeholder for now
        break;
    default:
    // Do nothing for an unknown track type
    }

}

circularTrack.prototype.hideGlyphTrackType = function(name, type) {
    var i = this.findTrackbyName(name);

    // We didn't find the track by that name
    if(i < 0) {
	return;
    }

    if(this.tracks[i].trackType !== "glyph") {
	// Wrong track type, bail
	return;
    }

    // Don't try to show if already visible
    if(! this.isvisibleGlyphTrackType(name, type)) {
	return;
    }

    for(var j = 0; j < this.tracks[i].visTypes.length; j++) {
	if(this.tracks[i].visTypes[j] == type) {
	    this.tracks[i].visTypes.splice(j, 1);
	    j--;
	}
    }

    this.drawGlyphTrack(i);

}

circularTrack.prototype.showGlyphTrackType = function(name, type) {
    var i = this.findTrackbyName(name);

    // We didn't find the track by that name
    if(i < 0) {
	return;
    }

    if(this.tracks[i].trackType !== "glyph") {
	// Wrong track type, bail
	return;
    }

    // Don't try to show if already visible
    if(this.isvisibleGlyphTrackType(name, type)) {
	return;
    }

    if(! this.tracks[i].visTypes.contains(type) ) {
	this.tracks[i].visTypes.push(type);
    }

    this.drawGlyphTrack(i);

}

circularTrack.prototype.isvisibleGlyphTrackType = function(name, type) {
    var i = this.findTrackbyName(name);

    // We didn't find the track by that name
    if(i < 0) {
	return;
    }

    if(this.tracks[i].trackType !== "glyph") {
	// Wrong track type, bail
	return;
    }

    for(var j = 0; j < this.tracks[i].visTypes.length; j++) {
	if(this.tracks[i].visTypes[j] == type) {
	    return true;
	}
    }

    return false;
}

circularTrack.prototype.dragresize = function() {
    var newWidth = d3.event.x - this.layout.ExtraWidthX;
    var newHeight = d3.event.y - this.layout.ExtraWidthY;

    var newSize = Math.max(newWidth, newHeight);

//    console.log(this.layout.w);
//    console.log("x " + newWidth);
//    console.log("y " + newHeight);

    this.layout.newSize = newSize
//    this.layout.w = newSize;
//    this.layout.h = newSize;

    this.dragbar
	.attr("transform", "translate(" + (newSize+this.layout.ExtraWidthX-25) + "," +  (newSize+this.layout.ExtraWidthY-25) + ")")

    this.drag_shadow
	.attr("width", (newSize+this.layout.ExtraWidthX))
	.attr("height", (newSize+this.layout.ExtraWidthY));

    if((newSize >= this.layout.w) || (newSize >= this.layout.h)) {
	this.container
	    .attr("width", newSize+this.layout.ExtraWidthX)
	    .attr("height", newSize+this.layout.ExtraWidthY)
    }
//    this.resize(newSize);

}

circularTrack.prototype.dragresize_start = function() {
    d3.event.sourceEvent.stopPropagation();

    this.drag_shadow
	.attr("class", "dragbar-shadow");
}

circularTrack.prototype.dragresize_end = function() {
    var newSize = this.layout.newSize;

    this.resize(this.layout.w);

    this.layout.w = newSize;
    this.layout.h = newSize;

    this.drag_shadow
	.attr("class", "linear_hidden dragbar-shadow");

    this.resize(newSize);

}

circularTrack.prototype.resize = function(newWidth) {
    
    var resize_ratio = newWidth / this.layout.radius / 2;

    this.layout.radius = this.layout.factor*Math.min(newWidth/2, newWidth/2);

    this.layout.w = newWidth;
    this.layout.h = newWidth;

    this.moveAxis();

    // Resize the plots
    for(var i=0; i < this.tracks.length; i++) {

	if('undefined' !== typeof this.tracks[i].visible) {
	    if(! this.tracks[i].visible) {
		continue;
	    }
	}

	// We're going to see what type of tracks we have
	// and dispatch them appropriately

	switch(this.tracks[i].trackType) {
	case "plot":
	    this.movePlot(i, (this.tracks[i].plot_radius*resize_ratio));
	    break;
	case "track":
	    this.moveTrack(i, (this.tracks[i].inner_radius*resize_ratio), (this.tracks[i].outer_radius*resize_ratio));
	    break;
	case "stranded":
	    this.moveTrack(i, (this.tracks[i].inner_radius*resize_ratio), (this.tracks[i].outer_radius*resize_ratio));
	    break;
	case "glyph":
//	    this.findGlyphTypes(i);
//	    this.tracks[i].container = 
//		this.g.append("g")
//		.attr("class", this.tracks[i].trackName + "_glyph_container")
	    this.tracks[i].radius = this.tracks[i].radius * resize_ratio;
	    this.drawGlyphTrack(i);
	    break;
	default:
	    // Do nothing for an unknown track type
	}
    }

    this.container
	.attr("width", newWidth+this.layout.ExtraWidthX)
	.attr("height", newWidth+this.layout.ExtraWidthY)

    this.redrawBrush(this.currentStart, this.currentEnd);

    this.dragbar
	.attr("transform", "translate(" + (newWidth+this.layout.ExtraWidthX-25) + "," +  (newWidth+this.layout.ExtraWidthY-25) + ")")

}

////////////////////////////////////////////////
//
// Helper functions
//
////////////////////////////////////////////////

circularTrack.prototype.findTrackbyName = function(name) {
    var tracks = this.tracks;

    for(var i=0; i < tracks.length; i++) {
	if(tracks[i].trackName == name) {
	    return i;
	}
    }

    return -1;

}

circularTrack.prototype.findGlyphTypes = function(i) {

    var classes = [];

    if('undefined' == typeof this.tracks[i].visItems) {
	this.tracks[i].visTypes = [];
    }

    for(var j=0; j < this.tracks[i].items.length; j++) {
	if(! this.tracks[i].visTypes.contains(this.tracks[i].items[j].type)) {
	    this.tracks[i].visTypes.push(this.tracks[i].items[j].type);
	    classes.push(this.tracks[i].trackName + "_" + this.tracks[i].items[j].type);
	}
    }

    this.tracks[i].visClasses = classes.join(' ');

}

circularTrack.prototype.maskGlyphTypes = function(i, types) {

    for(var j = this.tracks[i].visTypes.length - 1; j >= 0; j--) {
	if(types.contains(this.tracks[i].visTypes[j])) {
	    this.tracks[i].visTypes.splice(j, 1);
	}
    }

}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

// If we're displaying a stranded track, calculate
// the inner radius depending on which strand the 
// gene is on.

function calcInnerRadius(inner, outer, strand) {
    if('undefined' == typeof strand) {
	return inner;
    } else if(strand == -1) {
	return inner;
    } else {
	return (inner+outer)/2;
    }
}

// If we're displaying a stranded track, calculate
// the outer radius depending on which strand the 
// gene is on.
    
function calcOuterRadius (inner, outer, strand) {
    if('undefined' == typeof strand) {
	return outer;
    } else if(strand == -1) {
	return (inner+outer)/2;
    } else {
	return outer;
    }
}

function calcRadBPfromXY (x,y,xScale) {
    var rad = Math.PI/2 - Math.atan(y/x);
    if(x < 0) {
	// II & III quadrant
	rad = rad + Math.PI;
    }

    return [rad,Math.floor(xScale.invert(rad))];
}

function calcMinSliceSize () {
    var cfg = this.layout;

    
    //cfg.radians_pre_bp
}
