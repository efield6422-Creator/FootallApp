    import {playbook, availableSchemes, availableTags, availableFormations, gameLog, setGameLog, saveStateToStorage} from './src/core/state.js';
    console.log("loaded property")
        //Custom Playbook list
        let scheme=["Inside Zone","Counter","Power","Pin & Pull","Outside Zone"];
        let tag=["Speed","Orbit","Hop","Jet","Motion","Play Action","Screen","RPO"];
        console.log(playbook);
    
        loadPlaybook();
        loadTags();
        loadSchemes();
        let myChart = null;
        let myChartEff = null;
        //Login Variables
        const authEmail = document.getElementById("authEmail");
        const authPassword = document.getElementById("authPassword");
        const loginBtn = document.getElementById("loginBtn");
        const signUpBtn = document.getElementById("signUpBtn");
        const logoutBtn = document.getElementById("logoutBtn");
        const authMessage = document.getElementById("authMessage");
        const filterIds = ['filter-quarter', 'filter-down', 'filter-formation', 'filter-front'];
        filterIds.forEach(id => {
            document.getElementById(id).addEventListener('change', updateDashboard);
        });
//nav bar 
        const btnInput = document.getElementById("btnInput");
        const btnAnalytics = document.getElementById("btnAnalytics");
        const btnPlaybook = document.getElementById("btnPlaybook");
        const inputTab = document.getElementById("inputTab");
        const analyticsTab = document.getElementById("analyticsTab");
        const playbookTab = document.getElementById("playbookTab");
        btnInput.addEventListener("click",function(){
            //show Input, Hide Analytics
            inputTab.classList.add("active");
            analyticsTab.classList.remove("active");
            playbookTab.classList.remove("active");

            //update active button Styling
            btnInput.classList.add("active");
            btnAnalytics.classList.remove("active");
            btnPlaybook.classList.remove("active");
        });
        btnAnalytics.addEventListener("click",function(){
            //show analytics, hide input
            analyticsTab.classList.add("active");
            inputTab.classList.remove("active");
            playbookTab.classList.remove("active");

            //update aactive button styling
            btnAnalytics.classList.add("active");
            btnInput.classList.remove("active");
            btnPlaybook.classList.remove("active");
        });
        btnPlaybook.addEventListener("click",function(){
            //show playbook, hide input and analytics
            playbookTab.classList.add("active");
            inputTab.classList.remove("active");
            analyticsTab.classList.remove("active");

            //update active button styling
            btnPlaybook.classList.add("active");
            btnInput.classList.remove("active");
            btnAnalytics.classList.remove("active");
        });
        //CSV Import Stuff
        //Download CSV Template
        document.getElementById("downloadTemplateButton").addEventListener("click",function(){
            const csvHeader = "Play,Scheme,Tags,Fronts,Formations\n";
            const sampleRow = ["zebra","Inside Zone","Speed","Over","12"];
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
                        const [play, scheme, tags, front, formations] = row.split(',');
                        let trimmedTags = tags ? tags.trim() : "";
                        let trimmedPlay  = play ? play.trim(): "";
                        if (!trimmedPlay) continue;
                        let trimmedScheme = scheme ? scheme.trim():"";
                        let exists = playbook.some(function(item){
                            let existingName = typeof item === "object" ? item.play : item;
                            return existingName.toLowerCase() === trimmedPlay.toLowerCase();
                        });
                        if (!exists){
                            playbook.push({
                                play: trimmedPlay,
                                scheme: trimmedScheme,
                                tags: trimmedTags,
                                fronts: front ? front.trim() : "",
                                formations: formations ? formations.trim() : ""
                            });
                        }
                        if (trimmedScheme && !availableSchemes.includes(trimmedScheme)) {
                            availableSchemes.push(trimmedScheme);
                        }
                        if (trimmedTags && !availableTags.includes(trimmedTags)) {
                            availableTags.push(trimmedTags);
                        }
                        if (formations && !availableFormations.includes(formations)) {
                            availableFormations.push(formations);
                        }
                        console.log("Imported Play:", trimmedPlay, "Scheme:", trimmedScheme, "Tags:", trimmedTags, "Front:", front ? front.trim() : "", "Formations:", formations ? formations.trim() : "");
                    }
                }
                        localStorage.setItem("savedPlays", JSON.stringify(playbook));
                        localStorage.setItem("savedSchemes", JSON.stringify(availableSchemes));
                        localStorage.setItem("savedTags", JSON.stringify(availableTags));
                        localStorage.setItem("savedFormations", JSON.stringify(availableFormations));
                loadSchemes();
                loadTags();
                loadFormations();
                loadPlaybook();
                alert("CSV Import Complete.");
                fileInput.value = "";
            };
            reader.readAsText(file);
        });
// Export CSV GameLog Data
        document.getElementById("exportGameLog").addEventListener("click",function(){
            const csvHeader = "down,distance,schemes,basePlay,tags,fronts,hash,yardsGained,formations\n";
            let csvRows = gameLog.map(play=>{
                let formationsStr = play.formations.join(",");
                let schemesStr = play.schemes.join(",");
                let tagsStr = play.tags.join(",");
                return `${play.down},${play.distance},${schemesStr},${play.basePlay},${tagsStr},${play.front},${play.hash},${play.yardsGained},${formationsStr}`;
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

//create foramtions display btns
        let formationContainer = document.getElementById("formationContainer");
        let newformationInput = document.getElementById("newFormationInput"); 
        let addformationButton = document.getElementById("addFormationButton");
        addformationButton.onclick = function addFormation(){
            let newFormation = newFormationInput.value.trim();
            if(newFormation && !availableFormations.includes(newFormation)){
                availableFormations.push(newFormation);
                localStorage.setItem("savedFormations", JSON.stringify(availableFormations));
                loadFormations();
                newFormationInput.value = "";
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
                    const selectedInput = document.getElementById("selectedPlay");
                    const isAlreadySelected = (selectedInput.value === playName);
                    document.querySelectorAll("#playbookContainer .select-btns").forEach(btn=>btn.classList.remove('selected'));
                    //highlight button clicked/Clear color is clicked again
                    if (isAlreadySelected){
                        selectedInput.value = "";
                        schemesArray = [];
                        loadSchemes();
                    } else {
                        button.classList.add('selected');
                        selectedInput.value = playName;
                    }
                    //Save Selected PLay into Hidden Input
                    schemesArray = [];
                    let schemesBtns = document.querySelectorAll("#schemesContainer .select-btns")
                    schemesBtns.forEach(btn => btn.classList.remove('selected'));
                    console.log("looking for scheme:", schemeName)
                    if (schemeName){
                        schemesArray.push(schemeName);
                        schemesBtns.forEach(function(schemeBtn){
                            if (schemeBtn.innerText.trim() === schemeName.trim()){
                                schemeBtn.classList.add('selected');
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
//sign  up  button
        signUpBtn.addEventListener("click", () => {
            const email = authEmail.value;
            const password = authPassword.value;
            window.signUpUser(email,password)
                .then((useerCredential) => {
                    authMessage.textContent = "Sign up successful." + useerCredential.user.email;
                }).catch((err) => {
                    authMessage.textContent = "Sign up failed: " + err.message;
                });
        });
//login  button
        loginBtn.addEventListener("click", () => {
            const email = authEmail.value;
            const password = authPassword.value;
            window.signInUser(email,password)
                .then((userCredential) => {
                    authMessage.textContent = "Login successful." + userCredential.user.email;
                }).catch((err) => {
                    authMessage.textContent = "Login failed: " + err.message;
                });
        });
//logout  button
        logoutBtn.addEventListener("click", () => {
            window.signOutUser()
                .then(() => {
                    authMessage.textContent = "Logout successful.";
                }).catch((err) => {
                    authMessage.textContent = "Logout failed: " + err.message;
                });
        });
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
                //#ff6b00 highlight seleceted
                if (schemesArray.includes(scheme)){
                    button.classList.add('selected');
                }
                button.onclick=function(){
                    let index=schemesArray.indexOf(scheme);
                    if (index===-1){
                        schemesArray.push(scheme);
                        button.classList.add('selected');
                    } else{
                        schemesArray.splice(index,1);
                        button.classList.remove('selected');
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
                        button.classList.add('selected');
                    } else {
                        tagsArray.splice(index,1);
                        button.classList.remove('selected');
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

//Load foramtions
function loadFormations(){
            let container = document.getElementById("formationsContainer");
            container.innerHTML = ""; //clear old buttons
            //loop through each play in our array
            availableFormations.forEach(formation=> {
                let wrapper=document.createElement("span");
                wrapper.classList.add("btn-pill");
                wrapper.style.marginRight="8px";
                //New Element Button
                let button = document.createElement("button");
                button.classList.add("select-btns");
                button.type = "button";
                button.innerText = formation;
                //Set What Happens when You Click Play
                button.onclick = function(){
                    console.log(formation);
                    let index=formationsArray.indexOf(formation);
                    if(index===-1){
                        formationsArray.push(formation);
                        //highlight button clicked
                        button.classList.add('selected');
                    } else {
                        formationsArray.splice(index,1);
                        button.classList.remove('selected');
                    };
                };
                //add delete button for each formation
                let deleteFormationBtn = document.createElement("button");
                deleteFormationBtn.classList.add("delete-btn");
                deleteFormationBtn.type = "button";
                deleteFormationBtn.innerText = "X";
                deleteFormationBtn.onclick=function(){
                    //remove stored tags list
                    let fIndex=availableFormations.indexOf(formation);
                    if (fIndex!==-1) availableFormations.splice(fIndex,1);
                    //remove from currently active selction
                    let selsIndex=formationsArray.indexOf(formation);
                    if (selsIndex!==-1) formationsArray.splice(selsIndex,1);
                    //update local storage
                    localStorage.setItem("savedFormations", JSON.stringify(availableFormations));
                    loadFormations();
                };
                //add the new button to conatiner
                wrapper.appendChild(button);
                wrapper.appendChild(deleteFormationBtn);
                container.appendChild(wrapper);
            });
        }
        //load avaiable tags
        loadFormations();
        //Store logged in-game plays

       
// kisten for updates from fireBase
        window.onPlaysUpdated = function(cloudPlays){
            gameLog = cloudPlays;
            updateDashboard();
        };
        function updateDashboard(){
            populateFilterDropdowns();
            const dataToDisplay = getFilteredPlays();
                let totalYards=0;
                //Calculate total yards
                dataToDisplay.forEach(play=>{
                    totalYards+= +play.yardsGained;
                });
                //Calulate AVG yards
                let totalPlays=dataToDisplay.length;
                //Avoid dividing by zero
                let avgYards=totalPlays>0?(totalYards/totalPlays).toFixed(1):0;
                //Update HTML Displays
                document.getElementById("totalPlays").innerText=totalPlays;
                document.getElementById("totalYards").innerText=totalYards;
                document.getElementById("avgYards").innerText=avgYards;
            // Scheme Breakdwon Stats
                let schemeStats={};
                dataToDisplay.forEach(play=>{
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
                let efficiencyData = labels.map(scheme => {
                    let stats = schemeStats[scheme];
                    return Math.round((stats.successful / stats.calls) * 100);
                });
                renderSchemeChartEff(labels, efficiencyData);
                // Update Scheme Breakdown Display
                let container=document.getElementById("playBreakDownContainer");
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
            incompleteBtn.classList.toggle('selected');
            document.getElementById('yardsGained').value = 0;
        });
        sackBtn.addEventListener('click',()=>{
            sackBtn.classList.toggle('selected');
            const yardsInput = document.getElementById('yardsGained');
            yardsInput.focus();
            yardsInput.select();
        });
        penaltyBtn.addEventListener('click',() =>{
            penaltyBtn.classList.toggle('selected');
        });

//render Pie Chart for Scheme Counts
        function renderSchemeChart(labels, dataCounts){
            const ctx = document.getElementById('schemeChart').getContext('2d');
            if (myChart) {
                myChart.destroy(); // Destroy the previous chart instance
            } 
            if(labels.length === 0 || dataCounts.length === 0){ 
                return;
            }
            myChart = new Chart(ctx, {
                type: 'pie',
                data:{
                    labels: labels,
                    datasets:[{
                        data: dataCounts,
                        backgroundColor:[
                            '#ff6b00',
                            '#38bdf8', 
                            '#10b981',
                            '#3b82f6', 
                            '#64748b',
                            '#e67e22', 
                            '#1abc9c', 
                            '#34495e'
                        ],
                        borderColor: '#1e2631',
                        borderWidth: 2
                    }]
                },
                options:{
                    responsive:true,
                    maintainAspectRatio: true,
                    plugins:{
                        legend:{
                            position:'bottom'
                        }
                    }
                }
            });
        }
//Bar Chart For Scheme Efficiency 
        function renderSchemeChartEff(labels, efficiencyData){
            const ctx = document.getElementById('schemeEfficiencyChart').getContext('2d');
            if (myChartEff) {
                myChartEff.destroy(); // Destroy the previous chart instance
            }
            if(labels.length === 0 || efficiencyData.length === 0){ 
                return;
            }
            myChartEff = new Chart(ctx, {
                type: 'bar',
                data:{
                    labels: labels,
                    datasets:[{
                        label: 'Efficiency (%)',
                        data: efficiencyData,
                        backgroundColor:[
                            '#ff6b00',
                            '#38bdf8', 
                            '#10b981',
                            '#3b82f6', 
                            '#64748b',
                            '#e67e22', 
                            '#1abc9c', 
                            '#34495e'
                        ]
                    }]
                },
                options:{
                    responsive:true,
                    maintainAspectRatio: false,
                    scales:{
                        x:{ticks:{color:'#f0f4f8'}, grid:{color:'#2e3846'}},
                        y: {ticks:{color:'#f0f4f8'}, grid:{color:'#2e3846'}}}
                    },
                    plugins: [{
                        id: 'barValues',
                        afterDatasetsDraw(chart){
                            const {ctx} = chart;
                            ctx.save();
                            ctx.font = 'bold 12px Arial';
                            ctx.fillStyle = '#f0f4f8';
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
        //Filter Plays Function for Charts
        function getFilteredPlays(){
            const selectedQuarter = document.getElementById("filter-quarter").value;
            const selectedDown = document.getElementById("filter-down").value;
            const selectedFormation = document.getElementById("filter-formation").value;
            const selectedFront = document.getElementById("filter-front").value;
            return gameLog.filter(play => {
                //rejects play if it does not fit the selected filters
                if (selectedQuarter !== "all" && String(play.quarter) !== selectedQuarter) return false;
                if (selectedDown !== "all" && String(play.down) !== selectedDown) return false;
                if (selectedFormation !== "all" && (!play.formations || !play.formations.includes(selectedFormation))) return false;
                if (selectedFront !== "all" && play.front !== selectedFront) return false;
                return true;
            });
        }
        //End of Filtered Plays Function

        //Function to Auto-Populate the formation and front dropdowns
        function populateFilterDropdowns(){
            const formationsSelect = document.getElementById("filter-formation");
            const frontsSelect = document.getElementById("filter-front");
            const uniqueFormations = [...new Set(gameLog.flatMap(p=>p.formations || []))].filter(f=>f && f !=="none");
            const uniqueFronts = [...new Set(gameLog.map(p=>p.front ? p.front.trim() :''))].filter(Boolean);
            const currentFormation = formationsSelect.value;
            const currentFront = frontsSelect.value;
            formationsSelect.innerHTML = '<option value = "all">All Formations</option>';
            uniqueFormations.forEach(formation => {
                formationsSelect.innerHTML += `<option value="${formation}">${formation}</option>`;
            });
            formationsSelect.value = currentFormation;

            frontsSelect.innerHTML = '<option value = "all">All Fronts</option>';
            uniqueFronts.forEach(front => {
                frontsSelect.innerHTML += `<option value="${front}">${front}</option>`;
            });
            frontsSelect.value = currentFront;
        }
        //end of Auto-Populate the formation and front dropdowns

        //Reset Game log to clear all entries
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