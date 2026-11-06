import {gameLog, saveStateToStorage } from '../../core/state.js'
export let selectedHash = "";
export let selectedFront = "";
export let tagsArray = [];
export let schemesArray=[];
export let playsArray=[];
export let formationsArray=[];

window.selectHash =function (hashValue){
    console.log("hash Clicked", hashValue);
    selectedHash=hashValue;
    let buttons=document.querySelectorAll("#hashContainer button");
    buttons.forEach(btn=>{
        if (btn.innerText === hashValue){
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}
window.selectFront = function(frontValue){
    console.log("front Clicked", frontValue);
    let buttons=document.querySelectorAll("#frontContainer button");
    if (selectedFront === frontValue){
        selectedFront = "";
        buttons.forEach(btn=>btn.classList.remove('selected'));
    } else {
        selectedFront=frontValue;
        buttons.forEach(btn=>{
            if (btn.innerText === frontValue){
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }
}

function resetPlaySelection(){
    //clear playcall selection
    let playButtons=document.querySelectorAll("#playbookContainer button");
    playButtons.forEach(btn=>btn.classList.remove('selected'));
    document.getElementById("selectedPlay").value="";
    //clear hash selection
    let hashButtons=document.querySelectorAll("#hashContainer button");
    hashButtons.forEach(btn=>btn.classList.remove('selected'));
    selectedHash="";
    //clear front selection
    let frontButtons=document.querySelectorAll("#frontContainer button");
    frontButtons.forEach(btn=>btn.classList.remove('selected'));
    selectedFront="";    
    //clear tag selection
    let tagButtons=document.querySelectorAll("#tagsContainer button");
    tagButtons.forEach(btn=>btn.classList.remove('selected'));
    tagsArray=[];
    loadTags();  
    //clear Scheme Selection
    let schemeButtons=document.querySelectorAll("#schemesContainer button");
    schemeButtons.forEach(btn=>btn.classList.remove('selected'));
    schemesArray=[];
    loadSchemes();     
    //reset Peanlty
    penaltyBtn.classList.remove('selected');
}

window.logPlay =function(){
    //get values from inputs
    let currentQuarter=+document.getElementById("quarter").value;
    console.log("Current Quarter:", currentQuarter);
    const isPenalty = penaltyBtn.classList.contains('active');
    let currentDown=+document.getElementById("down").value;
    console.log("Current Down:", currentDown);
    let currentDistance=+document.getElementById("distance").value;
    console.log("Current Distance:", currentDistance);
    let currentPlay=document.getElementById("selectedPlay").value;
    console.log("Current Play:", currentPlay);
    let currentYards=+document.getElementById("yardsGained").value;
    console.log("Current Yards:", currentYards);
    //check if play is selected
    if (currentPlay===""){
        alert("Please Select a Play Call First");
        return;
    }
    //combine data into a single play object
    let playData={
        quarter: +currentQuarter,
        down: +currentDown,
        distance: +currentDistance,
        formations: formationsArray.length >0? [...formationsArray]:["none"],
        schemes: schemesArray.length >0?[...schemesArray]:["None"], //uses active schemes
        basePlay: currentPlay, //OL call/Skill call
        tags: tagsArray.length>0?[...tagsArray]:["None"], //uses active tags
        front: selectedFront, //vs front
        hash: selectedHash, //left or right
        yardsGained: +currentYards,
        isPenalty: isPenalty
    };
    console.log(playData);
    window.savePlayToCloud(playData);
    //print entire game log to browser console to verify
    console.log("Play Logged", playData);
    console.log("All Game Data:",gameLog);
    //Variable for next play
    let nextDown;
    let nextDistance;
    //calculate next down based off yards gained
    if (currentYards>=currentDistance){
        nextDown= 1;
        nextDistance= 10;
    } else{
        nextDown=+currentDown+1;
        nextDistance=+currentDistance- +currentYards;
    }
    gameLog.push(playData);
    localStorage.setItem("savedGame", JSON.stringify(gameLog));
    document.getElementById("down").value=nextDown;
    document.getElementById("distance").value=nextDistance;
    console.log(nextDown);
    console.log(nextDistance);
    updateDashboard();
    resetPlaySelection();
}

window.selectHash = selectHash;
window.selectFront = selectFront;
window.logPlay = logPlay;
window.resetPlaySelection = resetPlaySelection;
