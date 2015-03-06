
var islandviewerAlignData={};

function IslandviewerAlign() {

    this.add_islandviewerObj = function(islandviewerObj){    
    if('undefined' !== typeof islandviewerObj.ext_id) {
    
        ext_id = islandviewerObj.ext_id;
    }
    if('undefined' !== typeof islandviewerObj.second_extid) {
    
        ext_id = islandviewerObj.second_extid;
    
    }
    
    console.log(islandviewerObj);
    islandviewerAlignData[ext_id] = {};
    console.log("The ext_id is " + ext_id); 
    //var plotid = islandviewerObj.circularplot.layout.plotid;
    //console.log(plotid);
    //islandviewerAlignData[ext_id] = {};
    //ivObj = islandviewerObj;
    
    console.log("The typeof is " + typeof(islandviewerObj.circularplot)); 
    
    if('undefined' !== typeof islandviewerObj.circularplot) {
 
                  islandviewerAlignData[ext_id].circle_id = islandviewerObj.circularplot.layout.plotid;
                  console.log("Circel Id is" + islandviewerAlignData[ext_id].circle_id);
   }
   
   if('undefined' !== typeof islandviewerObj.linearplot) {
             
            islandviewerAlignData[ext_id].linear_id = islandviewerObj.linearplot.layout.plotid;
            console.log("Linear Id is" + islandviewerAlignData[ext_id].linear_id);
   }                      
       	 
   }
}

IslandviewerAlign.prototype.ondblclick = function(plotid, bp) {

for (ext_id in islandviewerAlignData) {
  
   if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id  && plotid == islandviewerAlignData[ext_id].circle_id || plotid ==  islandviewerAlignData[ext_id].linear_id ) {

        islandviewerObj.ondblclick(plotid, bp)
    }
}
}

IslandviewerAlign.prototype.mouseover = function(trackname, d, plotid) {
   console.log("Got a callback " + d);
    console.log(trackname);
    console.log(d);
    console.log(plotid);
trackname = trackname;
d=d;
plotid=plotid;

for (ext_id in islandviewerAlignData) {
  
   if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id && plotid == islandviewerAlignData[ext_id].circle_id || plotid ==  islandviewerAlignData[ext_id].linear_id) {

        //Islandviewer.mouseover(trackname, d, plotid)
    islandviewerObj.mouseover(trackname, d, plotid)
    }

}
}

IslandviewerAlign.prototype.onclick = function(trackname, d, plotid,skip_half_range) {

    console.log("value of d is " + d);
    console.log("value of skip_half_range is " + skip_half_range);
    console.log("value of trackname is " + trackname);
    console.log("value of ext_id_circle_id is " + islandviewerAlignData[ext_id].circle_id);
    
    

    if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id && plotid == islandviewerAlignData[ext_id].circle_id|| plotid ==  islandviewerAlignData[ext_id].linear_id) {

        islandviewerObj.onclick(trackname, d, plotid, skip_half_range) 

        }
}


IslandviewerAlign.prototype.mouseout = function(trackname, d, plotid) {
//    console.log("mouseout callback " + d);
//    console.log(trackname);
//    console.log(d);
//    console.log(plotid);

for (ext_id in islandviewerAlignData) {
  
   if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id && plotid == islandviewerAlignData[ext_id].circle_id || plotid ==  islandviewerAlignData[ext_id].linear_id) {

      islandviewerObj.mouseout(trackname, d, plotid)
    }
}
}


IslandviewerAlign.prototype.update = function(startBP, endBP, params) {

for (ext_id in islandviewerAlignData) {
  
   if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id && params['plotid'] == islandviewerAlignData[ext_id].circle_id ||  params['plotid'] == islandviewerAlignData[ext_id].linear_id) {

    islandviewerObj.update(startBP, endBP, params)
    }
}
}


IslandviewerAlign.prototype.update_finished = function(startBP, endBP, params) {

for (ext_id in islandviewerAlignData) {
  
   if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id && params['plotid'] == islandviewerAlignData[ext_id].circle_id ||  params['plotid'] == islandviewerAlignData[ext_id].linear_id) {
    
      islandviewerObj.update_finished(startBP, endBP, params)
    }
}
}

IslandviewerAlign.prototype.remove = function(Obj_to_remove) {

remove_id = Obj_to_remove.ext_id;

//delete (islandviewerAlignData[remove_id])

delete(Obj_to_remove)
}

