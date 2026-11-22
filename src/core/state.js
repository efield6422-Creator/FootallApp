// Shared app state. One place for defaults, saved lists, the game log,
// and the current in-progress play selection. Features import from here
// and never from each other.
export const DEFAULT_TAGS = ["Speed", "Orbit", "Hop", "Jet", "Motion", "Play Action", "Screen", "RPO"];
export const DEFAULT_SCHEMES = ["Inside Zone", "Counter", "Power", "Pin & Pull", "Outside Zone"];
export const DEFAULT_FORMATIONS = [];

function loadList(key, fallback) {
    try {
        const saved = JSON.parse(localStorage.getItem(key));
        return Array.isArray(saved) ? saved : [...fallback];
    } catch {
        return [...fallback];
    }
}

export let playbook = loadList("savedPlays", []);
export let availableTags = loadList("savedTags", DEFAULT_TAGS);
export let availableSchemes = loadList("savedSchemes", DEFAULT_SCHEMES);
export let availableFormations = loadList("savedFormations", DEFAULT_FORMATIONS);
export let gameLog = loadList("savedGame", []);

// Current in-progress play selection, shared by the logger and the
// playbook/analytics code. Mutate its properties, never reassign it,
// so every module always sees the same object.
export const selection = {
    selectedHash: "",
    selectedFront: "",
    tags: [],
    schemes: [],
    plays: [],
    formations: [],
};

export function setGameLog(newLog) {
    gameLog = newLog;
}
export function saveStateToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
