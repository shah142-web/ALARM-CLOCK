let clock = document.getElementById("clock");
let date = document.getElementById("date");
let alarmTime = document.getElementById("alarmTime");
let message = document.getElementById("message");

let alarm = "";
let alarmActive = false;
let alarmRinging = false;
let audioContext = null;
let soundInterval = null;
let alarmPlayed = false;

// 12-hour AM/PM ko 24-hour me convert karne ke liye
function convertTo24Hour(time12h) {
    if (!time12h) return "";
    // Agar already 24h format hai jaise 21:53 to waisa hi rehne do
    if (time12h.includes(":") && !time12h.includes("AM") && !time12h.includes("PM")) {
        return time12h;
    }
    let [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = parseInt(hours, 10) + 12;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
}

// 1. Digital Clock - LIVE TIME
function updateClock() {
    let now = new Date();
    let hours = String(now.getHours()).padStart(2, "0");
    let minutes = String(now.getMinutes()).padStart(2, "0");
    let seconds = String(now.getSeconds()).padStart(2, "0");

    // Ye line live time dikhayegi - isiliye 00:00:00 khatam ho jayega
    if (clock) clock.innerText = `${hours}:${minutes}:${seconds}`;

    if (date) {
        date.innerText = now.toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
    }

    let currentTime = `${hours}:${minutes}`;

    if (alarmActive && currentTime === alarm && !alarmPlayed) {
        alarmPlayed = true;
        ringAlarm();
    }
    if (currentTime !== alarm) {
        alarmPlayed = false;
    }
}

setInterval(updateClock, 1000);
updateClock();

// 2. Set Alarm
async function setAlarm() {
    if (alarmRinging) stopAlarm();
    if (alarmTime.value === "") {
        message.innerText = "Please select an alarm time!";
        return;
    }

    alarm = convertTo24Hour(alarmTime.value); // <-- Yahan fix kiya
    alarmActive = true;
    alarmPlayed = false;

    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) throw new Error("Audio not supported");
        if (!audioContext) audioContext = new AudioContextClass();
        await audioContext.resume();
    } catch (error) {
        message.innerText = "Audio is not available in this browser.";
        return;
    }
    message.innerText = "Alarm set for " + alarmTime.value;
}

// 3. Sound
function playDigitalSound() {
    if (!audioContext || audioContext.state !== "running") return;
    let oscillator = audioContext.createOscillator();
    let gain = audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.25);
}

function ringAlarm() {
    alarmActive = false;
    alarmRinging = true;
    message.innerText = "⏰ WAKE UP! ALARM IS RINGING!";
    playDigitalSound();
    soundInterval = setInterval(() => { playDigitalSound(); }, 600);
}

function stopAlarm() {
    if (soundInterval !== null) {
        clearInterval(soundInterval);
        soundInterval = null;
    }
    alarmRinging = false;
    alarmActive = false;
    message.innerText = "Alarm Stopped";
}

function resetAlarm() {
    stopAlarm();
    alarm = "";
    alarmPlayed = false;
    alarmTime.value = "";
    message.innerText = "No Alarm Set";
}