function IslandviewerAlign() {
this.islandviewerAlignData {};
    IslandviewerAlign.prototype.add_islandviewerObj = function(islandviewerObj){    
        
    ext_id = islandviewerObj.ext_id;
    this.islandviewerAlignData[ext_id] = {
    ivObj = islandviewerObj
	}]  
   
    if('undefined' !== typeof islandviewerObj.circularplot) {
 
                  this.islandviewerAlignData[ext_id][circle_id] = islandviewerObj.circularplot.plotid;
   
   }
   
   if('undefined' !== typeof islandviewerObj.linearplot) {
             
            this.islandviewerAlignData[ext_id][linear_id] = islandviewerObj.linearplot.plotid;
             }         
   }
               
    console.log("Called islandviewerObj " + this.ext_id);
     	 
}

for each (ext_id in islandviewerAlignData) {
  
   if('undefined' !== typeof islandviewerAlignData[ext_id][circle_id]) {
    plotid = islandviewerAlignData[ext_id][circle_id];
   }
   else('undefined' !== typeof islandviewerAlignData[ext_id][linear_id]) {
    plotid = islandviewerAlignData[ext_id][linear_id];
   }
   
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
