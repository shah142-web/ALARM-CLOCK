// Get HTML Elements

let clock = document.getElementById("clock");
let date = document.getElementById("date");
let alarmTime = document.getElementById("alarmTime");
let message = document.getElementById("message");

// Alarm Variables

let alarm = "";
let alarmActive = false;
let alarmRinging = false;
let audioContext = null;
let soundInterval = null;
let alarmPlayed = false;


// 1. Digital Clock

function updateClock() {

    let now = new Date();

    let hours = String(now.getHours()).padStart(2, "0");
    let minutes = String(now.getMinutes()).padStart(2, "0");
    let seconds = String(now.getSeconds()).padStart(2, "0");

    clock.innerText = `${hours}:${minutes}:${seconds}`;

    date.innerText = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    let currentTime = `${hours}:${minutes}`;

    // Check Alarm Time

    if (alarmActive && currentTime === alarm && !alarmPlayed) {

        alarmPlayed = true;
        ringAlarm();

    }

    // Allow the same alarm to ring again the next day

    if (currentTime !== alarm) {
        alarmPlayed = false;
    }
}


// Update Clock Every Second

setInterval(updateClock, 1000);

updateClock();


// 2. Set Alarm

async function setAlarm() {

    if (alarmRinging) {
        stopAlarm();
    }

    if (alarmTime.value === "") {
        message.innerText = "Please select an alarm time!";
        return;
    }

    alarm = alarmTime.value;
    alarmActive = true;
    alarmPlayed = false;

    // Prepare sound after user interaction

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            throw new Error("Audio is not supported");
        }

        if (!audioContext) {
            audioContext = new AudioContextClass();
        }

        await audioContext.resume();

    } catch (error) {
        message.innerText = "Audio is not available in this browser.";
        return;
    }

    message.innerText = "Alarm set for " + alarm;
}


// 3. Digital Alarm Sound

function playDigitalSound() {

    if (!audioContext || audioContext.state !== "running") {
        return;
    }

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


// 4. Ring Alarm

function ringAlarm() {

    alarmActive = false;
    alarmRinging = true;

    message.innerText = "⏰ WAKE UP! ALARM IS RINGING!";

    playDigitalSound();

    soundInterval = setInterval(() => {
        playDigitalSound();
    }, 600);

}


// 5. Stop Alarm

function stopAlarm() {

    if (soundInterval !== null) {
        clearInterval(soundInterval);
        soundInterval = null;
    }

    alarmRinging = false;
    alarmActive = false;

    message.innerText = "Alarm Stopped";

}


// 6. Reset Alarm

function resetAlarm() {

    stopAlarm();

    alarm = "";
    alarmPlayed = false;
    alarmTime.value = "";

    message.innerText = "No Alarm Set";

}
Displaying index.js.
