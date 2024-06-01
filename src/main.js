const play_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>';
const pause_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>';

const HEIGHT = 600;
const WIDTH = 600;
const N_ARCS = 12;

const N_OCTAVES = 7;



const BG_COLOR = '#212529';


let noteEnv, droneEnv, noteOsc, droneOsc;
var play_state;
var drone_play_state;
var drone_note;

let volume_slider;
let drone_slider;
let drone_button;
let drone_select;

const colors = [
    'rgb(51, 85, 160)',
    'rgb(178, 121, 186)',
    'rgb(226, 132, 154)',
    'rgb(225, 81, 169)',
    'rgb(220, 105, 149)',
    'rgb(192, 131, 122)',
    'rgb(179, 183, 101)',
    'rgb(139, 192, 109)',
    'rgb(106, 218, 145)',
    'rgb(110, 236, 184)',
    'rgb(122, 239, 188)',
    'rgb(120, 180, 198)',
]; 
const labels = [
    '1', '5', '2', '6', '3', '7', '4#', '♭2', '♭6', '♭3', '♭7', '4'
];
const drone_names = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B"
];
const key_codes = [ 65, 87, 83, 69, 68, 70, 84, 71, 89, 72, 85, 74, 75 ];

var pressedKeys = [ false, false, false, false, false, false, false, false, false, false, false, false ];


function setup() {
    angleMode(DEGREES);
    play_state = false;
    drone_play_state = false;

    getAudioContext().suspend();
    

    noteEnv = new p5.Envelope();
    noteEnv.setADSR(0.01, 0.1, 1, 0.2);
    droneEnv = new p5.Envelope();
    droneEnv.setADSR(0.01, 0.1, 1, 0.2);

    noteOsc = new p5.Oscillator('triangle');
    noteOsc.start();
    noteOsc.amp(noteEnv);
    droneOsc = new p5.Oscillator('triangle');
    droneOsc.start();
    droneOsc.amp(droneEnv);
    
    // HTML insert
	var canvas = createCanvas(WIDTH, HEIGHT);
	canvas.parent("canvas_container");

    // Get agents
    volume_slider = document.getElementById('volume-slider');
    drone_slider = document.getElementById('drone-slider');
    drone_button = document.getElementById('drone-button');
    drone_select = document.getElementById('drone-select');

    if (drone_button != null) {
        drone_button.innerHTML = play_svg;

        drone_button.addEventListener('click', (e) => {
            if (drone_play_state === false) {
                drone_play_state = true;
                drone_button.innerHTML = pause_svg;
            } else {
                drone_play_state = false;
                drone_button.innerHTML = play_svg;
            }
        });
    }

    if (volume_slider != null) {
        // Set starting value
        noteEnv.mult(volume_slider.value / 100);
        volume_slider.addEventListener('change', (e) => {
            noteEnv.mult(volume_slider.value / 100);
        });
    }

    if (drone_slider != null) {
        // Set starting value
        droneEnv.mult(drone_slider.value / 100);
        drone_slider.addEventListener('change', (e) => {
            droneEnv.mult(drone_slider.value / 100);
        });
    }

    setupDrones();

    drone_note = 0;

    if (drone_select != null) {

        drone_select.addEventListener('click', (e) => {
            drone_note = drone_select.value;
        });
    }

    play_state = true;
}

function setupDrones() {
    for (var i = 0; i < N_OCTAVES; i++) {
        for (var j = 0; j < 12; j++) {
            drone_select.innerHTML += '<option value="' + ((i * 12) + j) + '">' + drone_names[j] + (i+1).toString() + '</option>';
        }
    }
    loadNewSelect();
}

function draw() {
    background(BG_COLOR);
    strokeWeight(0);

    if (drone_play_state === true) {
        playDrone();
    }
    
    if (play_state === true) {
        let arc_length = 360 / N_ARCS;
        let w_center = WIDTH / 2;
        let h_cetner = HEIGHT / 2;
        let padding = 1;

        let arc_min = WIDTH;
        const offset = 90;

        for (var k = 0; k < pressedKeys.length; k++) {
            pressedKeys[k] = false;
        }

        handleKeys();

        for (var i = 0; i < N_ARCS; i++) {
            var angle  = (i * arc_length) - offset;
            let arc_start = angle - (arc_length / 2) + padding;
            let arc_end = arc_start + arc_length - (2 * padding);

            fill(colors[i]);
            if (pressedKeys[i] === true) {
                arc(w_center, h_cetner, arc_min, arc_min, arc_start, arc_end);
            } else {
                arc(w_center, h_cetner, arc_min - 90, arc_min - 90, arc_start, arc_end);
            }

            var text_radius = ((1/2) * WIDTH) - 30;
            var text_x = (text_radius * Math.cos(Math.PI * 2 * angle / 360)) + w_center - 10;
            var text_y = (text_radius * Math.sin(Math.PI * 2 * angle / 360)) + h_cetner + 10;   
            fill(255);
            textFont('Courier New');
            textSize(20);
            text(
                labels[i],
                text_x,
                text_y
            );
        }
        
        fill(BG_COLOR);
        arc(w_center, h_cetner, arc_min - 120, arc_min - 120, 0, 360, OPEN);
    }
}

function handleKeys() {
    let octave = 0;
    if (keyIsDown(16) === true) {
        octave = 12;
    }
    if (keyIsDown(18) === true) {
        octave = -12;
    }

    if (keyIsDown(key_codes[0]) === true) {
        pressedKeys[0] = true; // 1
        playNote(0 + octave);
    } if (keyIsDown(key_codes[12]) === true) {
        pressedKeys[0] = true; // 1 upper
        playNote(0 + octave + 12);
    } if (keyIsDown(key_codes[1]) === true) {
        pressedKeys[7] = true; // b2
        playNote(1 + octave);
    } if (keyIsDown(key_codes[2]) === true) {
        pressedKeys[2] = true; // 2
        playNote(2 + octave);
    } if (keyIsDown(key_codes[3]) === true) {
        pressedKeys[9] = true; // b3
        playNote(3 + octave);
    } if (keyIsDown(key_codes[4]) === true) {
        pressedKeys[4] = true; // 3
        playNote(4 + octave);
    } if (keyIsDown(key_codes[5]) === true) {
        pressedKeys[11] = true; // 4
        playNote(5 + octave);
    } if (keyIsDown(key_codes[6]) === true) {
        pressedKeys[6] = true; // 4#
        playNote(6 + octave);
    } if (keyIsDown(key_codes[7]) === true) {
        pressedKeys[1] = true; // 5
        playNote(7 + octave);
    } if (keyIsDown(key_codes[8]) === true) {
        pressedKeys[8] = true; // b6
        playNote(8 + octave);
    } if (keyIsDown(key_codes[9]) === true) {
        pressedKeys[3] = true; // 6
        playNote(9 + octave);
    } if (keyIsDown(key_codes[10]) === true) {
        pressedKeys[10] = true; // b7
        playNote(10 + octave);
    } if (keyIsDown(key_codes[11]) === true) {
        pressedKeys[5] = true; // 7
        playNote(11 + octave);
    }
}

function playNote(interval = 0) {
    var note = Number(drone_note) + Number(interval);
    if (note > 127) { 
        note = 127;
    } else if (note < 0) {
        note = 0;
    }
    noteOsc.freq(midiToFreq(note));
    noteEnv.play();
}

function playDrone() {
    droneOsc.freq(midiToFreq(drone_note));
    droneEnv.play();
}

function mousePressed() {
    userStartAudio();
  }