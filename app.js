// --- FELADATOK ADATBÁZISA ---
const tasks = [
    { 
        title: "Kezdés: A lakásod", 
        desc: "Készíts egy fotót a bejárati ajtóról!", 
        lat: 47.8168, lng: 19.0770, 
        type: "photo",
        answer: "KULCS" 
    },
    { 
        title: "Város-Kvíz", 
        type: "quiz",
        lat: 47.8168, lng: 19.0770, 
        questions: [
            { img: "Isztambul.jpg", answer: "Isztambul" },
            { img: "Marseille.jpg", answer: "Marseille" },
            { img: "Barcelona.jpg", answer: "Barcelona" },
            { img: "Szlovénia.jpg", answer: "Szlovénia" },
            { img: "Porec.jpg", answer: "Porec" }
        ],
        finalAnswer: "EURÓPA"
    }
];

let currentIdx = 0;
let currentQuizStep = 0;
let solvedWords = [];
let isTaskInitialized = false; // EZZEL AKADÁLYOZZUK MEG A HURKOT

// GPS Követés
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(pos => {
        const dist = getDistance(pos.coords.latitude, pos.coords.longitude, tasks[currentIdx].lat, tasks[currentIdx].lng);
        
        if (dist < 20) {
            document.getElementById('status').innerText = "📍 Megérkeztél!";
            if (!isTaskInitialized) { // Csak akkor fut le, ha még nem indult el a feladat
                initTask();
                isTaskInitialized = true;
            }
        } else {
            document.getElementById('status').innerText = `📍 Menj közelebb! (${Math.round(dist)}m)`;
            document.getElementById('game-ui').classList.add('hidden');
            isTaskInitialized = false; // Ha eltávolodik, újra engedjük az inicializálást
        }
    }, null, { enableHighAccuracy: true });
}

function initTask() {
    const task = tasks[currentIdx];
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('task-title').innerText = task.title;
    
    if (task.type === "photo") {
        document.getElementById('task-desc').innerText = task.desc;
        document.getElementById('photo-area').classList.remove('hidden');
        document.getElementById('quiz-area').classList.add('hidden');
        document.getElementById('answer-area').classList.add('hidden');
    } else if (task.type === "quiz") {
        document.getElementById('photo-area').classList.add('hidden');
        document.getElementById('answer-area').classList.add('hidden');
        showQuizStep();
    }
}

function showQuizStep() {
    const task = tasks[currentIdx];
    const step = task.questions[currentQuizStep];
    document.getElementById('quiz-area').classList.remove('hidden');
    document.getElementById('quiz-progress').innerText = `Kép: ${currentQuizStep + 1}/5`;
    document.getElementById('quiz-image').src = step.img;
    document.getElementById('quiz-image').classList.add('blur');
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
        document.getElementById('quiz-image').classList.remove('blur');
        document.getElementById('quiz-input-group').classList.add('hidden');
        document.getElementById('next-quiz-btn').classList.remove('hidden');
    } else {
        alert("Sajnos nem ez a város!");
    }
}

function nextQuizStep() {
    currentQuizStep++;
    if (currentQuizStep < 5) {
        showQuizStep();
    } else {
        alert("Ügyes vagy! A kódod: " + tasks[currentIdx].finalAnswer);
        solvedWords.push(tasks[currentIdx].finalAnswer);
        finishTask();
    }
}

// Fotó kezelés
document.getElementById('cameraInput').addEventListener('change', function() {
    if (this.files.length > 0) {
        document.getElementById('answer-area').classList.remove('hidden');
    }
});

function checkWord() {
    const val = document.getElementById('wordInput').value.toUpperCase().trim();
    if (val === tasks[currentIdx].answer) {
        solvedWords.push(val);
        finishTask();
    } else { alert("Rossz szó!"); }
}

function finishTask() {
    currentIdx++;
    isTaskInitialized = false; // Következő feladatnál újra engedjük az indulást
    currentQuizStep = 0; // Kvíz számláló visszaállítása
    
    if (currentIdx < tasks.length) {
        alert("Jöhet a következő pont!");
        resetUI();
    } else {
        showFinalScreen();
    }
}

function resetUI() {
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('answer-area').classList.add('hidden');
    document.getElementById('photo-area').classList.add('hidden');
    document.getElementById('quiz-area').classList.add('hidden');
    document.getElementById('wordInput').value = "";
    document.getElementById('cameraInput').value = "";
}

function showFinalScreen() {
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('finish-screen').classList.remove('hidden');
    document.getElementById('final-results').innerHTML = solvedWords.join("<br>");
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
