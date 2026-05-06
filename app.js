// IDE ÍRD BE A FELADATAIDAT (Koordináták, Leírás, Megoldás)
    const tasks = [
        { title: "A Hősök Tere", desc: "Keresd meg az oroszlánt!", lat: 47.8168, lng: 19.0770, answer: "OROSZLÁN" },
        { title: "A Titkos Kút", desc: "Milyen állat van a kúton?", lat: 47.8168, lng: 19.0770, answer: "HAL" }
    ];

    let currentIdx = 0;
    let solvedWords = [];

    // GPS Figyelés
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const target = tasks[currentIdx];

            const dist = getDistance(userLat, userLng, target.lat, target.lng);

            if (dist < 20) { // 20 méteres körzet
                document.getElementById('status').innerText = "📍 Megérkeztél a helyszínre!";
                showTask();
            } else {
                document.getElementById('status').innerText = `📍 Menj közelebb! Távolság: ${Math.round(dist)}m`;
                document.getElementById('game-ui').classList.add('hidden');
            }
        }, err => {
            document.getElementById('status').innerText = "Hiba: Engedélyezd a GPS-t!";
        }, { enableHighAccuracy: true });
    }

    function showTask() {
        document.getElementById('game-ui').classList.remove('hidden');
        document.getElementById('task-title').innerText = tasks[currentIdx].title;
        document.getElementById('task-desc').innerText = tasks[currentIdx].desc;
    }

    // Fotó érzékelése
    document.getElementById('cameraInput').addEventListener('change', function() {
        if (this.files.length > 0) {
            document.getElementById('answer-area').classList.remove('hidden');
        }
    });

    function checkWord() {
        const val = document.getElementById('wordInput').value.toUpperCase().trim();
        if (val === tasks[currentIdx].answer) {
            solvedWords.push(val);
            currentIdx++;
            if (currentIdx < tasks.length) {
                alert("Helyes! Irány a következő pont.");
                resetUI();
            } else {
                showFinish();
            }
        } else {
            alert("Sajnos nem ez a jó szó!");
        }
    }

    function resetUI() {
        document.getElementById('game-ui').classList.add('hidden');
        document.getElementById('answer-area').classList.add('hidden');
        document.getElementById('wordInput').value = "";
        document.getElementById('cameraInput').value = "";
    }

    function showFinish() {
        document.querySelector('.card').innerHTML = `
            <h2>Keresztrejtvény kész!</h2>
            <div style="font-family: monospace; font-size: 20px;">
                ${solvedWords.join('<br>')}
            </div>
            <p><strong>Végső megoldás: VALENCIA</strong></p>
        `;
    }

    // Távolság kalkulátor (Haversine formula)
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
