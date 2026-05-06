// --- FELADATOK ADATBÁZISA ---
const tasks = [
    { 
        title: "Kezdés: A lakásod", 
        desc: "Készíts egy fotót a bejárati ajtóról!", 
        lat: 47.8168, lng: 19.0770, // <-- Írd át a saját koordinátáidra teszthez!
        type: "photo",
        answer: "KULCS" 
    },
    { 
        title: "Város-Kvíz", 
        type: "quiz",
        lat: 47.8168, lng: 19.0770, // A kvíz helyszíne
        questions: [
            { imgQ: "Isztambul.jpg", imgA: "IsztambulM.jpg", answer: "Isztambul" },
            { imgQ: "Marseille.jpg", imgA: "MarseilleM.jpg", answer: "Marseille" },
            { imgQ: "Barcelona.jpg", imgA: "BarcelonaM.jpg", answer: "Barcelona" },
            { imgQ: "Szlovénia.jpg", imgA: "SzlovéniaM.jpg", answer: "Szlovénia" },
            { imgQ: "Porec.jpg", imgA: "PorecM.jpg", answer: "Porec" }
        ],
        finalAnswer: "EURÓPA"
    }
];

let currentIdx = 0;
let currentQuizStep = 0;
let solvedWords = [];
let isTaskActive = false; // EZZEL AKADÁLYOZZUK MEG A GPS LOOP-OT

// GPS Követés
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(pos => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, tasks[currentIdx].lat, tasks[currentIdx].lng);
        
        if (dist < 20) { // 20 méteres körzet
            document.getElementById('status').innerText = "📍 Megérkeztél a helyszínre!";
            if (!isTaskActive) {
                initTask();
                isTaskActive = true;
            }
        } else {
            document.getElementById('status').innerText = `📍 Menj közelebb! Távolság: ${Math.round(dist)}m`;
            if (isTaskActive) {
                document.getElementById('game-ui').classList.add('hidden');
                isTaskActive = false;
            }
        }
    }, null, { enableHighAccuracy: true });
}

function initTask() {
    const task = tasks[currentIdx];
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('task-title').innerText = task.title;
    
    // UI takarítás
    document.getElementById('photo-area').classList.add('hidden');
    document.getElementById('quiz-area').classList.add('hidden');
    document.getElementById('answer-area').classList.add('hidden');
    
    if (task.type === "photo") {
        document.getElementById('task-desc').innerText = task.desc;
        document.getElementById('photo-area').classList.remove('hidden');
    } else if (task.type === "quiz") {
        showQuizStep();
    }
}

// Város Kvíz Logika
function showQuizStep() {
    const task = tasks[currentIdx];
    const step = task.questions[currentQuizStep];
    
    document.getElementById('quiz-area').classList.remove('hidden');
    document.getElementById('quiz-progress').innerText = `Kép: ${currentQuizStep + 1}/5`;
    
    // A sima kérdés képet töltjük be
    document.getElementById('quiz-image').src = step.imgQ;
    
    // UI beállítása a kérdéshez
    document.getElementById('quiz-input-group').classList.remove('hidden');
    document.getElementById('next-quiz-btn').classList.add('hidden');
    document.getElementById('quizInput').value = "";
}

function checkQuizAnswer() {
    const step = tasks[currentIdx].questions[currentQuizStep];
    const val = document.getElementById('quizInput').value.trim().toLowerCase();
    
    // Ékezetmentesítés és kisbetű a biztosabb találatért
    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    if (normalize(val) === normalize(step.answer)) {
        // HELYES VÁLASZ: Betöltjük a megoldás (M-es) képet
        document.getElementById('quiz-image').src = step.imgA;
        
        // UI frissítése: input elrejt, "Következő" gomb mutat
        document.getElementById('quiz-input-group').classList.add('hidden');
        document.getElementById('next-quiz-btn').classList.remove('hidden');
    } else {
        alert("Sajnos nem ez a város! Próbáld újra.");
    }
}

function nextQuizStep() {
    currentQuizStep++;
    if (currentQuizStep < 5) {
        showQuizStep();
    } else {
        // Kvíz vége
        alert("Gratulálok, végigvitted a kvízt! A kódod: " + tasks[currentIdx].finalAnswer);
        solvedWords.push(tasks[currentIdx].finalAnswer);
        finishTask();
    }
}

// Fotó feltöltés kezelés
document.getElementById('cameraInput').addEventListener('change', function() {
    if (this.files.length > 0) {
        // Ha van kép, mutatjuk a szóbeviteli mezőt
        document.getElementById('answer-area').classList.remove('hidden');
    }
});

function checkWord() {
    const val = document.getElementById('wordInput').value.toUpperCase().trim();
    if (val === tasks[currentIdx].answer) {
        solvedWords.push(val);
        finishTask();
    } else { alert("Rossz szó! Próbáld újra."); }
}

function finishTask() {
    currentIdx++;
    currentQuizStep = 0; // Kvíz számláló visszaállítása
    isTaskActive = false; // Új feladatot engedünk inicializálni
    
    if (currentIdx < tasks.length) {
        alert("Szuper! Mehetünk a következő helyszínre.");
        resetUI();
    } else {
        showFinalScreen();
    }
}

function resetUI() {
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('wordInput').value = "";
    document.getElementById('cameraInput').value = "";
}

function showFinalScreen() {
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('finish-screen').classList.remove('hidden');
    
    // Itt jelenítjük meg a keresztrejtvény szavait
    document.getElementById('final-results').innerHTML = solvedWords.join("<br>");
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Föld sugara méterben
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
