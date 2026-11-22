import { gameLog, selection, saveStateToStorage } from '../../core/state.js';

// Callbacks supplied by script.js (which owns the playbook/analytics UI).
// Logger never imports script.js, so there is no circular import.
let loadTags = () => {};
let loadSchemes = () => {};
let updateDashboard = () => {};

export function initLogger(callbacks) {
    loadTags = callbacks.loadTags || loadTags;
    loadSchemes = callbacks.loadSchemes || loadSchemes;
    updateDashboard = callbacks.updateDashboard || updateDashboard;
    window.selectHash = selectHash;
    window.selectFront = selectFront;
    window.logPlay = logPlay;
    window.resetPlaySelection = resetPlaySelection;
}

export function selectHash(hashValue) {
    selection.selectedHash = hashValue;
    document.querySelectorAll("#hashContainer button").forEach(btn => {
        btn.classList.toggle('selected', btn.innerText === hashValue);
    });
}

export function selectFront(frontValue) {
    selection.selectedFront = selection.selectedFront === frontValue ? "" : frontValue;
    document.querySelectorAll("#frontContainer button").forEach(btn => {
        btn.classList.toggle('selected', btn.innerText === frontValue && selection.selectedFront !== "");
    });
}

export function resetPlaySelection() {
    document.querySelectorAll("#playbookContainer button").forEach(btn => btn.classList.remove('selected'));
    document.getElementById("selectedPlay").value = "";
    document.querySelectorAll("#hashContainer button").forEach(btn => btn.classList.remove('selected'));
    selection.selectedHash = "";
    document.querySelectorAll("#frontContainer button").forEach(btn => btn.classList.remove('selected'));
    selection.selectedFront = "";
    document.querySelectorAll("#tagsContainer button").forEach(btn => btn.classList.remove('selected'));
    selection.tags.length = 0;
    loadTags();
    document.querySelectorAll("#schemesContainer button").forEach(btn => btn.classList.remove('selected'));
    selection.schemes.length = 0;
    loadSchemes();
    document.getElementById("penalty-btn")?.classList.remove('selected');
}

export function logPlay() {
    const currentQuarter = +document.getElementById("quarter").value;
    const currentDown = +document.getElementById("down").value;
    const currentDistance = +document.getElementById("distance").value;
    const currentPlay = document.getElementById("selectedPlay").value;
    const currentYards = +document.getElementById("yardsGained").value;
    const isPenalty = document.getElementById("penalty-btn")?.classList.contains('selected') || false;
    if (currentPlay === "") {
        alert("Please Select a Play Call First");
        return;
    }
    const playData = {
        quarter: currentQuarter,
        down: currentDown,
        distance: currentDistance,
        formations: selection.formations.length > 0 ? [...selection.formations] : ["none"],
        schemes: selection.schemes.length > 0 ? [...selection.schemes] : ["None"],
        basePlay: currentPlay,
        tags: selection.tags.length > 0 ? [...selection.tags] : ["None"],
        front: selection.selectedFront,
        hash: selection.selectedHash,
        yardsGained: currentYards,
        isPenalty,
    };
    if (typeof window.savePlayToCloud === "function") {
        window.savePlayToCloud(playData);
    }
    const nextDown = currentYards >= currentDistance ? 1 : currentDown + 1;
    const nextDistance = currentYards >= currentDistance ? 10 : currentDistance - currentYards;
    gameLog.push(playData);
    saveStateToStorage("savedGame", gameLog);
    document.getElementById("down").value = nextDown;
    document.getElementById("distance").value = nextDistance;
    updateDashboard();
    resetPlaySelection();
}
