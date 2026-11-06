export let playbook=JSON.parse(localStorage.getItem("savedPlays")) || [];
export let  availableTags=JSON.parse(localStorage.getItem("savedTags")) || tag;
export let  availableSchemes=JSON.parse(localStorage.getItem("savedSchemes")) || scheme;
export let  availableFormations=JSON.parse(localStorage.getItem("savedFormations")) || tag;
export let gameLog = JSON.parse(localStorage.getItem("savedGame")) || [];
export function setGameLog(newLog){
    gameLog = newLog;
}
export function saveStateToStorage (key,value){
    localStorage.setItem(key, JSON.stringify(value));
}