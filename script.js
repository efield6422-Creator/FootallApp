    console.log("loaded property")
        //Custom Playbook list
        let playbook=JSON.parse(localStorage.getItem("savedPlays")) || [];
        let scheme=["Inside Zone","Counter","Power","Pin & Pull","Outside Zone"];
        let tag=["Speed","Orbit","Hop","Jet","Motion","Play Action","Screen","RPO"];
        let availableTags=JSON.parse(localStorage.getItem("savedTags")) || tag;
        let availableSchemes=JSON.parse(localStorage.getItem("savedSchemes")) || scheme;
        console.log(playbook);
        let selectedHash = "";
        let selectedFront = "";
        let tagsArray = [];
        let schemesArray=[];
        let playsArray=[];
        loadPlaybook();
        loadTags();
        loadSchemes();
        let myChart = null;
        let myChartEff = null;
//nav bar 
        const btnInput = document.getElementById("btnInput");
        const btnAnalytics = document.getElementById("btnAnalytics");
        const inputTab = document.getElementById("inputTab");
        const analyticsTab = document.getElementById("analyticsTab");
        btnInput.addEventListener("click",function(){
            //show Input, Hide Analytics
            inputTab.classList.add("active");
            analyticsTab.classList.remove("active");

            //update active button Styling
            btnInput.classList.add("active");
            btnAnalytics.classList.remove("active");
        });
        btnAnalytics.addEventListener("click",function(){
            //show analytics, hide input
            analyticsTab.classList.add("active");
            inputTab.classList.remove("active");

            //update aactive button styling
            btnAnalytics.classList.add("active");
            btnInput.classList.remove("active");
        });
        //CSV Import Stuff
        //Download CSV Template
        document.getElementById("downloadTemplateButton").addEventListener("click",function(){
            const csvHeader = "Play,Scheme,Tags,Fronts\n";
            const sampleRow = ["zebra","Inside Zone","Speed","Over"];
            const blob = new Blob([csvHeader + sampleRow], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "play_call_template.csv";
            a.click();
            URL.revokeObjectURL(url);
        })
        //Import CSV File
        document.getElementById("importCsvButton").addEventListener("click",function(){
            const fileInput = document.getElementById("csvFileInput");
            const file = fileInput.files[0];
            if (!file) {
                alert("Please select a CSV file to import.");
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e){
                const text = e.target.result;
                const lines = text.split("\n");
                for (let i = 1; i < lines.length; i++) {
                    const row = lines[i].trim();
                    if (row) {
                        const [play, scheme, tags, front] = row.split(',')
                        let trimmedPlay  = play.trim();
                        let trimmedScheme = scheme ? scheme.trim():"";
                        let exists = playbook.some(function(item){
                            let existingName = typeof item === "object" ? item.play : item;
                            return existingName.toLowerCase() === trimmedPlay.toLowerCase();
                        });
                        if (!exists){
                            playbook.push({
                                play: play.trim(),
                                scheme: scheme.trim()
                            });
                        }
                        if (scheme && !availableSchemes.includes(scheme)) {
                            availableSchemes.push(scheme);
                        }
                        if (tags && !availableTags.includes(tags)) {
                            availableTags.push(...tags.split(';').map(tag => tag.trim()));
                        }
                    }
                }
                        localStorage.setItem("savedPlays", JSON.stringify(playbook));
                        localStorage.setItem("savedSchemes", JSON.stringify(availableSchemes));
                        localStorage.setItem("savedTags", JSON.stringify(availableTags));
                        if (typeof loadTags === "function") {
                            loadTags();
                        }
                        if (typeof loadSchemes === "function") {
                            loadSchemes();
                        }
                        if (typeof loadPlaybook === "function") {
                            loadPlaybook();
                        }
                        console.log("Imported Play:", play, "Scheme:", scheme, "Tags:", tags, "Front:", front);
                alert("CSV Import Complete.");
            };
            reader.readAsText(file);
        });
// Export CSV GameLog Data
        document.getElementById("exportGameLog").addEventListener("click",function(){
            const csvHeader = "down,distance,schemes,basePlay,tags,fronts,hash,yardsGained\n";
            let csvRows = gameLog.map(play=>{
                let schemesStr = play.schemes.join(",");
                let tagsStr = play.tags.join(",");
                return `${play.down},${play.distance},${schemesStr},${play.basePlay},${tagsStr},${play.front},${play.hash},${play.yardsGained}`;
            });
            const blob = new Blob([csvHeader + csvRows.join('\n')], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "play_call_template.csv";
            a.click();
            URL.revokeObjectURL(url);
        }); 
        //Load Schemes
        let schemesContainer = document.getElementById("schemesContainer");
        let newSchemeInput = document.getElementById("newSchemeInput");
        let addSchemeButton = document.getElementById("addSchemeButton");
        addSchemeButton.onclick = function addScheme(){
            let newScheme = newSchemeInput.value.trim();
            if(newScheme && !availableSchemes.includes(newScheme)){
                availableSchemes.push(newScheme);
                //saves to browser history
                localStorage.setItem("savedSchemes", JSON.stringify(availableSchemes));
                loadSchemes();
                newSchemeInput.value = "";
            }
        };
        // Create/display new plays from input field
        let playbookContainer = document.getElementById("playbookContainer");
        let newPlayInput = document.getElementById("newPlayInput"); 
        let addPlayButton = document.getElementById("addPlayButton");
        addPlayButton.onclick = function addPlay(){
            let newPlay = newPlayInput.value.trim();
            let exists = playbook.some(p=>(typeof p === "object" ? p.play:p) === newPlay);
            if(newPlay && !exists){
                let activeScheme = schemesArray.length>0 ? schemesArray[0]:"";
                playbook.push({play:newPlay, scheme:activeScheme});
                localStorage.setItem("savedPlays", JSON.stringify(playbook));
                loadPlaybook();
                newPlayInput.value = "";
            }
        };
        //load avaiable tags from local storage
        let tagsContainer = document.getElementById("tagsContainer");
        let newTagInput = document.getElementById("newTagInput");
        let addTagButton = document.getElementById("addTagButton");
        addTagButton.onclick = function addTag(){
            let newTag = newTagInput.value.trim();
            if(newTag && !availableTags.includes(newTag)){
                availableTags.push(newTag);
                localStorage.setItem("savedTags", JSON.stringify(availableTags));
                loadTags();
                newTagInput.value = "";
            }
        };
        //load plays from local storage and display them as buttons
        function loadPlaybook(){
            let container = document.getElementById("playbookContainer");
            container.innerHTML = ""; //clear old buttons
            let playsToDisplay = playbook.filter(function(play){
                if (schemesArray.length ===0) return true;
                let playScheme = typeof play === "object" ? play.scheme: "";
                return schemesArray.includes(playScheme);
            });
            // lopp through filtered list
            playsToDisplay.forEach(function(play){
            //loop through each play in our array
                //New Element Button
                let button = document.createElement("button");
                button.classList.add("select-btns");
                button.type = "button";
                let playName = typeof play === "object" ? play.play : play;
                let schemeName = typeof play === "object" ? play.scheme : "";
                button.innerText = playName;
                //Set What Happens when You Click Play
                button.onclick = function(){
                    console.log(play);
                    document.querySelectorAll("#playbookContainer .select-btns").forEach(btn=>btn.style.backgroundColor = "");
                    //highlight button clicked
                    button.style.background = "yellow";
                    //Save Selected PLay into Hidden Input
                    document.getElementById("selectedPlay").value = playName;
                    console.log("Selected Play Updated To:",playName);
                    schemesArray = [];
                    let schemesBtns = document.querySelectorAll("#schemesContainer .select-btns")
                    schemesBtns.forEach(btn => btn.style.backgroundColor = "");
                    console.log("looking for scheme:", schemeName)
                    if (schemeName){
                        schemesArray.push(schemeName);
                        schemesBtns.forEach(function(schemeBtn){
                            if (schemeBtn.innerText.trim() === schemeName.trim()){
                                schemeBtn.style.backgroundColor = "yellow";
                            }
                        });
                    }
                };
                let deletePlayBtn = document.createElement("button");
                deletePlayBtn.classList.add("delete-btn");
                deletePlayBtn.type = "button";
                deletePlayBtn.innerText = "X";
                deletePlayBtn.onclick = function(){
                    let index = playbook.indexOf(play);
                    playbook.splice(index,1);
                    localStorage.setItem("savedPlays", JSON.stringify(playbook));
                    loadPlaybook();
                };
                //add the new button to conatiner
                let wrapper = document.createElement("span");
                wrapper.classList.add("btn-pill");
                wrapper.appendChild(button);
                wrapper.appendChild(deletePlayBtn);
                container.appendChild(wrapper);
            });
        }
    
    

        //load Schemes from local storage and display them as buttons
        function loadSchemes(){
            let container = document.getElementById("schemesContainer");
            container.innerHTML=""; //clear the selction of old buttons
            //loops through each scheme to ensure no cop y and add X to each button
            availableSchemes.forEach(scheme=>{
                let wrapper=document.createElement("span");
                wrapper.classList.add("btn-pill");
                wrapper.style.marginRight="8px";
                //change background color for used/unused buttons
                let button=document.createElement("button");
                button.classList.add("select-btns");
                button.type="button";
                button.innerText=scheme;
                //yellow highlight seleceted
                if (schemesArray.includes(scheme)){
                    button.style.backgroundColor="yellow";
                }
                button.onclick=function(){
                    let index=schemesArray.indexOf(scheme);
                    if (index===-1){
                        schemesArray.push(scheme);
                        button.style.backgroundColor="yellow";
                    } else{
                        schemesArray.splice(index,1);
                        button.style.background="";
                    }
                    loadPlaybook();
                };
                let deleteBtn=document.createElement("button");
                deleteBtn.classList.add("delete-btn");
                deleteBtn.type="button";
                deleteBtn.innerText="X";
                deleteBtn.onclick=function(){
                    //remove stored schemes list
                    let sIndex=availableSchemes.indexOf(scheme);
                    if (sIndex!==-1) availableSchemes.splice(sIndex,1);
                    //remove from currently active selction
                    let selIndex=schemesArray.indexOf(scheme);
                    if (selIndex!==-1) schemesArray.splice(selIndex,1);
                    //update local storage
                    localStorage.setItem("savedSchemes", JSON.stringify(availableSchemes));
                    loadSchemes();
                };
                wrapper.appendChild(button);
                wrapper.appendChild(deleteBtn);
                container.appendChild(wrapper);
            });
        }
                function loadTags(){
            let container = document.getElementById("tagsContainer");
            container.innerHTML = ""; //clear old buttons
            //loop through each play in our array
            availableTags.forEach(tag=> {
                let wrapper=document.createElement("span");
                wrapper.classList.add("btn-pill");
                wrapper.style.marginRight="8px";
                //New Element Button
                let button = document.createElement("button");
                button.classList.add("select-btns");
                button.type = "button";
                button.innerText = tag;
                //Set What Happens when You Click Play
                button.onclick = function(){
                    console.log(tag);
                    let index=tagsArray.indexOf(tag);
                    if(index===-1){
                        tagsArray.push(tag);
                        //highlight button clicked
                        button.style.backgroundColor = "yellow";
                    } else {
                        tagsArray.splice(index,1);
                        button.style.background="";
                    };
                };
                //add delete button for each tag
                let deleteTagBtn = document.createElement("button");
                deleteTagBtn.classList.add("delete-btn");
                deleteTagBtn.type = "button";
                deleteTagBtn.innerText = "X";
                deleteTagBtn.onclick=function(){
                    //remove stored tags list
                    let tIndex=availableTags.indexOf(tag);
                    if (tIndex!==-1) availableTags.splice(tIndex,1);
                    //remove from currently active selction
                    let selIndex=tagsArray.indexOf(tag);
                    if (selIndex!==-1) tagsArray.splice(selIndex,1);
                    //update local storage
                    localStorage.setItem("savedTags", JSON.stringify(availableTags));
                    loadTags();
                };
                //add the new button to conatiner
                wrapper.appendChild(button);
                wrapper.appendChild(deleteTagBtn);
                container.appendChild(wrapper);
            });
        }
        //load avaiable tags
        loadTags();
        //Store logged in-game plays
        let gameLog = JSON.parse(localStorage.getItem("savedGame")) || [];
        function logPlay(){
            //get values from inputs
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
                down: +currentDown,
                distance: +currentDistance,
                schemes: schemesArray.length >0?[...schemesArray]:["None"], //uses active schemes
                basePlay: currentPlay, //OL call/Skill call
                tags: tagsArray.length>0?[...tagsArray]:["None"], //uses active tags
                front: selectedFront, //vs front
                hash: selectedHash, //left or right
                yardsGained: +currentYards
            };
            console.log(playData);

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
        function updateDashboard(){
                let totalYards=0;
                //Calculate total yards
                gameLog.forEach(play=>{
                    totalYards+= +play.yardsGained;
                });
                //Calulate AVG yards
                let totalPlays=gameLog.length;
                //Avoid dividing by zero
                let avgYards=totalPlays>0?(totalYards/totalPlays).toFixed(1):0;
                //Update HTML Displays
                document.getElementById("totalPlays").innerText=totalPlays;
                document.getElementById("totalYards").innerText=totalYards;
                document.getElementById("avgYards").innerText=avgYards;
            // Scheme Breakdwon Stats
                let schemeStats={};
                gameLog.forEach(play=>{
                    if (play.schemes){
                        play.schemes.forEach(scheme=>{
                            if (scheme === "None") return;

                            if (!schemeStats[scheme]){
                                schemeStats[scheme]={calls:0, totalYards:0, successful:0};
                            }
                            schemeStats[scheme].calls++;
                            schemeStats[scheme].totalYards+=play.yardsGained;
                            if (successfulPlay(play)){
                                schemeStats[scheme].successful++;
                            }
                        });
                    }
                });
//Load/Populate Scheme Counts chart 
                let labels = Object.keys(schemeStats);
                let dataCounts = labels.map(scheme => schemeStats[scheme].calls);
                renderSchemeChart(labels, dataCounts);
//Load/Populate Scheme Efficiency Chart
                let labelseff = Object.keys(schemeStats);
                let efficiencyData = labelseff.map(scheme => {
                    let stats = schemeStats[scheme];
                    return Math.round((stats.successful / stats.calls) * 100);
                });
                renderSchemeChartEff(labelseff, efficiencyData);
                // Update Scheme Breakdown Display
                let container=document.getElementById("playBreakdownContainer");
                let tableHtml="<table border='1' cellPadding='5'><tr><th>Scheme</th><th>Calls</th><th>Total Yards</th><th>Avg Yards</th><th>Success Rate</th></tr>";
                for (let scheme in schemeStats){
                    let stats=schemeStats[scheme];
                    let avgYards=(stats.totalYards/stats.calls).toFixed(1);
                    let successRate=Math.round((stats.successful/stats.calls)*100).toFixed(1)+"%";
                    tableHtml+=`<tr><td>${scheme}</td><td>${stats.calls}</td><td>${stats.totalYards}</td><td>${avgYards}</td><td>${successRate}</td></tr>`;
                }
                tableHtml+="</table>";
                container.innerHTML=tableHtml;
            }
            updateDashboard();
        function resetPlaySelection(){
            //clear playcall selection
            let playButtons=document.querySelectorAll("#playbookContainer button");
            playButtons.forEach(btn=>btn.style.backgroundColor="");
            document.getElementById("selectedPlay").value="";
            //clear hash selection
            let hashButtons=document.querySelectorAll("#hashContainer button");
            hashButtons.forEach(btn=>btn.style.backgroundColor="");
            selectedHash="";
            //clear front selection
            let frontButtons=document.querySelectorAll("#frontContainer button");
            frontButtons.forEach(btn=>btn.style.backgroundColor="");
            selectedFront="";    
            //clear tag selection
            let tagButtons=document.querySelectorAll("#tagsContainer button");
            tagButtons.forEach(btn=>btn.style.backgroundColor="");
            tagsArray=[];
            loadTags();  
            //clear Scheme Selection
            let schemeButtons=document.querySelectorAll("#schemesContainer button");
            schemeButtons.forEach(btn=>btn.style.backgroundColor="");
            schemesArray=[];
            loadSchemes();                  
        }
        function selectHash(hashValue){
            console.log("hash Clicked", hashValue);
            selectedHash=hashValue;
            let buttons=document.querySelectorAll("#hashContainer button");
            buttons.forEach(btn=>{
                if (btn.innerText === hashValue){
                    btn.style.backgroundColor="yellow";
                } else {
                    btn.style.background = "";
                }
            });
        }
        function selectFront(frontValue){
            selectedFront=frontValue;
            let buttons=document.querySelectorAll("#frontContainer button");
            buttons.forEach(btn=>{
                if (btn.innerText === frontValue){
                    btn.style.background="yellow";
                } else {
                    btn.style.background = "";
                }
            });
        }
//Function to determine if a play is successful based on down, distance, and yards gained
        function successfulPlay(play){
            let down = play.down;
            let distance = play.distance;
            let yardsGained = play.yardsGained;
            if (down === 1) return yardsGained >= .5 * distance;
            if (down === 2) return yardsGained >= .7 * distance;
            if (down === 3 || down === 4) return yardsGained >= distance;
            return false;
        }
//set yards to 0 for incomplete pass
        let incompleteBtn = document.getElementById("incomplete-btn");
        let sackBtn = document.getElementById("sack-btn");
        let penaltyBtn = document.getElementById("penalty-btn");
        incompleteBtn.addEventListener('click', ()=>{
            document.getElementById('yardsGained').value = 0;
        });
        sackBtn.addEventListener('click',()=>{
            const yardsInput = document.getElementById('yardsGained');
            yardsInput.focus();
            yardsInput.select();
        });
        penaltyBtn.addEventListener('click',() =>{
            penaltyBtn.classList.toggle('active');
        });

//render Pie Chart for Scheme Counts
        function renderSchemeChart(labels, dataCounts){
            const ctx = document.getElementById('schemeChart').getContext('2d');
            if (myChart) {
                myChart.destroy(); // Destroy the previous chart instance
            }
            myChart = new Chart(ctx, {
                type: 'pie',
                data:{
                    labels: labels,
                    datasets:[{
                        data: dataCounts,
                        backgroundColor:[
                            '#3498db', 
                            '#e74c3c', 
                            '#2ecc71', 
                            '#f1c40f', 
                            '#9b59b6', 
                            '#e67e22', 
                            '#1abc9c', 
                            '#34495e'
                        ]
                    }]
                },
                options:{
                    responsive:true,
                    plugins:{
                        legend:{
                            position:'bottom'
                        }
                    }
                }
            });
        }
//Pie Chart For Scheme Efficiency 
        function renderSchemeChartEff(labelsEff, efficiencyData){
            const ctx = document.getElementById('schemeEfficiencyChart').getContext('2d');
            if (myChartEff) {
                myChartEff.destroy(); // Destroy the previous chart instance
            }
            myChartEff = new Chart(ctx, {
                type: 'bar',
                data:{
                    labels: labelsEff,
                    datasets:[{
                        label: 'Efficiency (%)',
                        data: efficiencyData,
                        backgroundColor:[
                            '#3498db', 
                            '#e74c3c', 
                            '#2ecc71', 
                            '#f1c40f', 
                            '#9b59b6', 
                            '#e67e22', 
                            '#1abc9c', 
                            '#34495e'
                        ]
                    }]
                },
                options:{
                    responsive:true,
                    scales:{y: {beginAtZero:true, max:120}}
                    },
                    plugins: [{
                        id: 'barValues',
                        afterDatasetsDraw(chart){
                            const {ctx} = chart;
                            ctx.save();
                            ctx.font = 'bold 12px Arial';
                            ctx.fillStyle = '#333333';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            chart.data.datasets.forEach((dataset, datasetIndex)=>{
                                const meta = chart.getDatasetMeta(datasetIndex);
                                meta.data.forEach((bar, index)=>{
                                    const value = dataset.data[index];
                                    if (value !== undefined && value !== null){
                                    ctx.fillText(value + '%', bar.x, bar.y - 5);
                                    }
                                });
                            });
                            ctx.restore();
                        }
                    }]
            });
        }
        document.getElementById("resetGameLog").addEventListener("click",function(){
            if (confirm("Are you sure you want to reset the game log? This cannot be undone.")){
                gameLog = [];
                localStorage.removeItem("savedGame");
                updateDashboard();
            }
        });
    if ('serviceWorker' in navigator){
        navigator.serviceWorker.register('sw.js')
            .then(()=> console.log('Service Worker registered successfully'))
            .catch((error)=>console.error('Service Worker resistration failed:',error));
    }