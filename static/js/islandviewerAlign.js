function IslandviewerAlign(islandviewerObj) {
    
    this.ext_id = islandviewerObj.ext_id;
    
    if('undefined' !== typeof islandviewerObj.plotid) {
            
            if(islandviewerObj.plotid == 'circularchart') {
                    this.circle_id = islandviewerObj.plotid;
             }
             
            if(islandviewerObj.plotid == 'circularchartlinear') {
                    this.linear_id = islandviewerObj.plotid;
             }
               
    console.log("Called islandviewerObj " + this.ext_id);
}


IslandviewerAlign.prototype.addCircularPlot = function(layout) {
    
    return Islandviewer.addCircularPlot(layout)
    
}

IslandviewerAlign.prototype.addLinearPlot = function(layout) {
  
 return Islandviewer.addCircularPlot(layout)

}

IslandviewerAlign.prototype.onclick = function(trackname, d, plotid, skip_half_range) {
//    console.log("Got a callback " + d);
//    console.log(trackname);
//    console.log(d);
//    console.log(plotid);

  islandviewer.onclick(trackname, d, plotid, skip_half_range)

}

IslandviewerAlign.prototype.ondblclick = function(plotid, bp) {

  islandviewer.ondblclick(plotid, bp)
    
}

IslandviewerAlign.prototype.mouseover = function(trackname, d, plotid) {
//    console.log("Got a callback " + d);
//    console.log(trackname);
//    console.log(d);
//    console.log(plotid);

  islandviewer.mouseover(trackname, d, plotid)
    
}

IslandviewerAlign.prototype.mouseout = function(trackname, d, plotid) {
//    console.log("mouseout callback " + d);
//    console.log(trackname);
//    console.log(d);
//    console.log(plotid);

  islandviewer.mouseout(trackname, d, plotid)
    
}

IslandviewerAlign.prototype.update = function(startBP, endBP, params) {

    islandviewer.update(startBP, endBP, params)
}

IslandviewerAlign.prototype.update_finished = function(startBP, endBP, params) {
    islandviewer.update_finished(startBP, endBP, params)
}

