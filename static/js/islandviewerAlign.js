
var islandviewerAlignData={};

function IslandviewerAlign() {
    
    this.add_islandviewerObj = function(islandviewerObj){    
    
    if( $.isEmptyObject(islandviewerAlignData)){
    if('undefined' !== typeof islandviewerObj.ext_id) {
   
        first_ext_id = islandviewerObj.ext_id.replace('.', '');
        console.log("First ext id is "+first_ext_id);
    }
    
    }
    
    if('undefined' !== typeof islandviewerObj.ext_id) {
    
	// Replace the . with nothing so these ext_ids match
	// what we expect to see from a plotid
        ext_id = islandviewerObj.ext_id.replace('.', '');
    }
    
    console.log(islandviewerObj);
    console.log(ext_id);
    islandviewerAlignData[ext_id] = {};
    console.log("The ext_id is " + ext_id); 
    //var plotid = islandviewerObj.circularplot.layout.plotid;
    //console.log(plotid);
    //islandviewerAlignData[ext_id] = {};
    //ivObj = islandviewerObj;
    
    console.log("The typeof is " + typeof(islandviewerObj.circularplot)); 

    islandviewerAlignData[ext_id].obj = islandviewerObj;
    
    //Splitting the plotid into ext_id and plotid_root
    //plotid_pieces = islandviewerObj.circularplot.layout.plotid.split('_');
    //plotid_root = plotid_pieces[0];
                  
    
    if('undefined' !== typeof islandviewerObj.circularplot) {
                  
                  islandviewerAlignData[ext_id].circle_id = islandviewerObj.circularplot.layout.plotid;
                  console.log("Circle Id is " + islandviewerAlignData[ext_id].circle_id);
                  
                  
                  //islandviewerAlignData[ext_id].circle_id = plotid_root;
                  //console.log("Circel Id is" + islandviewerAlignData[ext_id].circle_id);
   }
   
   if('undefined' !== typeof islandviewerObj.linearplot) {
             
            islandviewerAlignData[ext_id].linear_id = islandviewerObj.linearplot.layout.plotid;
            console.log("Linear Id is " + islandviewerAlignData[ext_id].linear_id);
            
            
                  //plotid_pieces = islandviewerObj.linearplot.layout.plotid.split('_');
                  //plotid_root = plotid_pieces[0];
                  
                  //islandviewerAlignData[ext_id].linear_id = plotid_root;
                  //console.log("Linear Id is" + islandviewerAlignData[ext_id].linear_id);
            
   }                      
       	 
   }
}


var lock_flag = 0;
IslandviewerAlign.prototype.lock = function(flag) {
     lock_flag = flag;    
     console.log("First ext id is "+first_ext_id);
     
     var newStart = islandviewerAlignData[first_ext_id].obj.circularplot.brushStartBP;
     var newEnd = islandviewerAlignData[first_ext_id].obj.circularplot.brushEndBP; 
         
     for (ext_id in islandviewerAlignData){
     //console.log(islandviewerAlignData[ext_id].obj);
     //console.log(islandviewerAlignData[ext_id].obj.circularplot.brushStartBP);
     plot_id =  islandviewerAlignData[ext_id].obj.linearplot.layout.plotid;
     islandviewerAlignData[ext_id].obj.linearplot.update(newStart, newEnd);
     
     islandviewerAlignData[ext_id].obj.circularplot.moveBrushbyBP(newStart, newEnd);
     islandviewerAlignData[ext_id].obj.circularplot.showBrush();
     islandviewerAlignData[ext_id].obj.showHoverGenes({start: newStart, end: newEnd}, false);
     islandviewerAlignData[ext_id].obj.update_finished(newStart, newEnd);
     
     }
     
     
}






IslandviewerAlign.prototype.ondblclick = function(plotid, bp) {

    // This could be broken in to a processing function,
    // copying and pasting the same lines of code screams
    // function or macro, but for now we'll be lazy and do this for
    // clarity and expediency
    plotid_pieces = plotid.split('|');
    plotid_root = plotid_pieces[0];
    ext_id = plotid_pieces[1];


    try{
    if('undefined' !== typeof islandviewerAlignData[ext_id]) {
	islandviewerAlignData[ext_id].obj.ondblclick(plotid, bp);
	}
	}
	
	finally{
     if(lock_flag == 1){
            var a =1;
            islandviewerAlignObj.lock(a);
        }
    }
    

    // Returning so I don't have to erase your code, just skip it
    return;
/*
if(lock_flag == 1){

    for (ext_id in islandviewerAlignData){
        console.log("outside if statement dblclick "+ islandviewerAlignData[ext_id].circle_id);
        if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id  && plotid == islandviewerAlignData[ext_id].circle_id || plotid ==  islandviewerAlignData[ext_id].linear_id ) {
        
            if(plotid == islandviewerAlignData[ext_id].circle_id){
               for (ext_id in islandviewerAlignData){
                 console.log("inside dblclick "+ islandviewerAlignData[ext_id].circle_id);
                 console.log("plotid inside "+plotid);
                 id1 = islandviewerAlignData[ext_id].circle_id
                 islandviewerAlignData[ext_id].obj.ondblclick(id1, bp);
            }
                }
            
             if(plotid == islandviewerAlignData[ext_id].linear_id){
                for (ext_id in islandviewerAlignData){
                 id2 = islandviewerAlignData[ext_id].linear_id
                 islandviewerAlignData[ext_id].obj.ondblclick(id2, bp);
                }
            }
            
        }
    }
}
if(lock_flag == 0){
*/
for (ext_id in islandviewerAlignData) {
  
// !!!! Remember, you only care about if an IslandviewerObj has a circle or linear plot for if
//      you're passing on locked move commands, for clicks, it's none of IslandviewerAlign's business,
//      just pass it on

   if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id  && plotid == islandviewerAlignData[ext_id].circle_id || plotid ==  islandviewerAlignData[ext_id].linear_id ) {

        islandviewerObj.ondblclick(plotid, bp)
    
    }
}
}


IslandviewerAlign.prototype.mouseover = function(trackname, d, plotid) {
   console.log("Got a callback in mouseover func" + d);
    console.log("Trackname in mouse over is "+trackname);
    console.log("d in mouseover func "+d);
    console.log("plotid in mouseover is " + plotid);
    console.log("value of ext_id_circle_id in mouseover func is " + islandviewerAlignData[ext_id].circle_id);
    console.log("value of ext_id_linear_id in mouseover func is " + islandviewerAlignData[ext_id].linear_id);
trackname = trackname;
d=d;
plotid=plotid;

    plotid_pieces = plotid.split('|');
    plotid_root = plotid_pieces[0];
    ext_id = plotid_pieces[1];

    if('undefined' !== typeof islandviewerAlignData[ext_id]) {
	islandviewerAlignData[ext_id].obj.mouseover(trackname, d, plotid);
    }

    return;

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
    console.log("plotid is " + plotid);
    console.log("Lock Flag is "+lock_flag);
    //console.log("value of ext_id_circle_id is " + islandviewerAlignData[ext_id].circle_id);
    
    plotid_pieces = plotid.split('|');
    plotid_root = plotid_pieces[0];
    ext_id = plotid_pieces[1];
    console.log(ext_id);
    try{
    if('undefined' !== typeof islandviewerAlignData[ext_id]) {
	islandviewerAlignData[ext_id].obj.onclick(trackname, d, plotid, skip_half_range);
	}
	}
	finally{
     if(lock_flag == 1){
            var a =1;
            islandviewerAlignObj.lock(a);
        }
    }
    

    return;

    if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id && plotid == islandviewerAlignData[ext_id].circle_id || plotid ==  islandviewerAlignData[ext_id].linear_id) {

        islandviewerObj.onclick(trackname, d, plotid, skip_half_range) 
 
        }
}


IslandviewerAlign.prototype.mouseout = function(trackname, d, plotid) {
    console.log("mouseout callback " + d);
//    console.log(trackname);
//    console.log(d);
    console.log(plotid);

    plotid_pieces = plotid.split('|');
    plotid_root = plotid_pieces[0];
    ext_id = plotid_pieces[1];
    console.log(ext_id);
    if('undefined' !== typeof islandviewerAlignData[ext_id]) {
	islandviewerAlignData[ext_id].obj.mouseout(trackname, d, plotid);
    }

    return;

for (ext_id in islandviewerAlignData) {
  
   if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id && plotid == islandviewerAlignData[ext_id].circle_id || plotid ==  islandviewerAlignData[ext_id].linear_id) {

      islandviewerObj.mouseout(trackname, d, plotid)
    }
}
}


IslandviewerAlign.prototype.update = function(startBP, endBP, params) {

    if('undefined' == typeof params['plotid']) {
	console.log("Uh-oh, why is there no plotid?");
	return;
    }

   
    plotid_pieces = params['plotid'].split('|');
    plotid_root = plotid_pieces[0];
    ext_id = plotid_pieces[1];
     console.log("lock flag in update is "+ lock_flag);
    if(lock_flag == 1)
    {
        for (key in islandviewerAlignData){
        plot_id =  islandviewerAlignData[key].obj.linearplot.layout.plotid;
        console.log("update func plotid is "+islandviewerAlignData[key].obj.linearplot.layout.plotid);
        islandviewerAlignData[key].obj.update(startBP, endBP, plot_id);
       // plot_id =  islandviewerAlignData[key].obj.circularplot.layout.plotid;
       // console.log("update func plotid is "+islandviewerAlignData[key].obj.circularplot.layout.plotid);
        //islandviewerAlignData[key].obj.update(startBP, endBP, plot_id);
     
        }
    }
    if(lock_flag ==0){
    if('undefined' !== typeof islandviewerAlignData[ext_id]) {
	islandviewerAlignData[ext_id].obj.update(startBP, endBP, params);
	 }
   }
   /* try{
    if('undefined' !== typeof islandviewerAlignData[ext_id]) {
	islandviewerAlignData[ext_id].obj.update(startBP, endBP, params);
	 }
	 }
	finally{
     if(lock_flag == 1){
            var a =1;
            islandviewerAlignObj.lock(a);
        }
    }
	
    */

    return;

for (ext_id in islandviewerAlignData) {
  
   if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id && params['plotid'] == islandviewerAlignData[ext_id].circle_id ||  params['plotid'] == islandviewerAlignData[ext_id].linear_id) {

    islandviewerObj.update(startBP, endBP, params)
    
 
    }
}
}


IslandviewerAlign.prototype.update_finished = function(startBP, endBP, params) {

    if('undefined' == typeof params['plotid']) {
	console.log("Uh-oh, why is there no plotid?");
	return;
    }

     console.log("hiiiiii update finish");
    plotid_pieces = params['plotid'].split('|');
    plotid_root = plotid_pieces[0];
    ext_id = plotid_pieces[1];
   
   
   if(lock_flag == 1)
    {
     for (key in islandviewerAlignData){
     plot_id =  islandviewerAlignData[key].obj.linearplot.layout.plotid;
     islandviewerAlignData[key].obj.update_finished(startBP, endBP, plot_id);
     plot_id =  islandviewerAlignData[key].obj.circularplot.layout.plotid;
     islandviewerAlignData[key].obj.update_finished(startBP, endBP, plot_id);
    }
    }
    if(lock_flag == 0){
    if('undefined' !== typeof islandviewerAlignData[ext_id]) {
	islandviewerAlignData[ext_id].obj.update_finished(startBP, endBP, params);
	 }
   }
   
   
   
   /* try{
    if('undefined' !== typeof islandviewerAlignData[ext_id]) {
	islandviewerAlignData[ext_id].obj.update_finished(startBP, endBP, params);
     }
     }
     finally{
     if(lock_flag == 1){
            var a =1;
            islandviewerAlignObj.lock(a);
        }
    }
    
    */

    return;

for (ext_id in islandviewerAlignData) {
  
   if('undefined' !== typeof islandviewerAlignData[ext_id].circle_id && params['plotid'] == islandviewerAlignData[ext_id].circle_id ||  params['plotid'] == islandviewerAlignData[ext_id].linear_id) {
    
      islandviewerObj.update_finished(startBP, endBP, params)
   
    }
}
}

IslandviewerAlign.prototype.remove = function(ext_id) {

        shortened_ext_id = islandviewerObj.ext_id.replace('.', '');

    if('undefined' !== typeof islandviewerAlignData[shortened_ext_id]) {
	delete islandviewerAlignData[shortened_ext_id];
    }

    return;

remove_id = Obj_to_remove.ext_id;

//delete (islandviewerAlignData[remove_id])

delete(Obj_to_remove)
}



