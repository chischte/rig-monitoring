// *****************************************************************************
// VIDEOSTREAM WEBSOCKET
// *****************************************************************************

var canvas = document.getElementById("video-canvas");
var url = "ws://" + document.location.hostname + ":8082/";
var player = new JSMpeg.Player(url, { canvas: canvas });

// *****************************************************************************
// GPIO WEBSOCKET:
// *****************************************************************************
const ws = new WebSocket("ws://machinelogger.synology.me:8083");
const button = document.querySelector("#send");

ws.onopen = (event) => {
  console.log("WebSocket is open now.");
};

ws.onclose = (event) => {
  console.log("WebSocket is closed now.");
};

ws.onerror = (event) => {
  console.error("WebSocket error observed:", event);
};

ws.onmessage = (event) => {
  // PROCESS INCOMING MESSAGES
  // SHOW MESSAGES FROM gpio_client.py ON ROBO INFOFIELD
  const roboinfo = document.querySelector("#roboinfo");
  var roboprefix = "ROBOT";
  var messageprefix = event.data.split(",")[0];
  var result = roboprefix.localeCompare(messageprefix);

  if (result === 0) {
    roboinfo.innerHTML = event.data.split(",")[3];
  }

  // SHOW MESSAGES FROM battery_guard.py ON LIPO INFOFIELD
  const lipoinfo = document.querySelector("#lipoinfo");
  var lipoprefix = "LIPO";
  var messageprefix = event.data.split(",")[0];
  var result = lipoprefix.localeCompare(messageprefix);

  if (result === 0) {
    lipoinfo.innerHTML = "BATTERY: " + event.data.split(",")[3] + "%";
  }
};

// *****************************************************************************
// FOCUS BOX "ROBOT CONTROL"
// *****************************************************************************
function focusChange(event) {
  var output = "ACTIVATE ROBOT CONTROL";

  if (event.type == "focus") {
    output = "ROBOT CONTROL ACTIVE";
  } else {
    input_txt.clear(); // clear keymap to stop the robot
  }

  focusbox.innerHTML = output;
}

focusbox.addEventListener("focus", focusChange);
focusbox.addEventListener("blur", focusChange);
focusbox.tabIndex = 0;

var input_txt = Input(document.getElementById("focusbox"));

// *****************************************************************************
// GET KEYBOARD INPUTS, MERGE AND SEND GPIO STRING:
// *****************************************************************************

var myVar = setInterval(getControlString, 50);
var prevGpioString;

function getControlString() {
  var directionString = "STOP";

  //FORWARD DIRECTIONS:
  if (input_txt.key_down("ArrowUp") & !input_txt.key_down("ArrowDown")) {
    if (input_txt.key_down("ArrowLeft") & !input_txt.key_down("ArrowRight")) {
      directionString = "FWD-L";
    } else if (input_txt.key_down("ArrowRight") & !input_txt.key_down("ArrowLeft")) {
      directionString = "FWD-R";
    } else {
      directionString = "FWD";
    }
  }

  // BACKWARD DIRECTIONS:
  else if (input_txt.key_down("ArrowDown") & !input_txt.key_down("ArrowUp")) {
    if (input_txt.key_down("ArrowLeft") & !input_txt.key_down("ArrowRight")) {
      directionString = k;
      ("BWD-L");
    } else if (input_txt.key_down("ArrowRight") & !input_txt.key_down("ArrowLeft")) {
      directionString = "BWD-R";
    } else {
      directionString = "BWD";
    }
  }

  // ROTATIONS
  else if (input_txt.key_down("ArrowLeft") & !input_txt.key_down("ArrowRight")) {
    directionString = "ROT-L";
  } else if (input_txt.key_down("ArrowRight") & !input_txt.key_down("ArrowLeft")) {
    directionString = "ROT-R";
  }

  // BOOST:
  var boostString = "";
  if (input_txt.key_down(" ")) {
    boostString = "BOOST";
  }

  // GADGETS:
  var gadgetString = "";

  if (input_txt.keys_down("Control", "1")) {
    gadgetString = "F1";
  } else if (input_txt.keys_down("Control", "2")) {
    gadgetString = "F2";
  }

  // MERGE AND PROCESS GPIO STRING:
  const controlPrefix = "GPIO";
  var gpioString = controlPrefix + "," + directionString + "," + boostString + "," + gadgetString;
  var controlScreenString = directionString + " " + boostString + " " + gadgetString;

  // update string only if it changed:
  var compareResult = gpioString.localeCompare(prevGpioString);

  if ((compareResult === 1) | (compareResult === -1)) {
    //send data to websocket:
    ws.send(gpioString);
    //show string on screen:
    document.getElementById("gpiobox").innerHTML = controlScreenString;
    prevGpioString = gpioString;
  }
}

// *****************************************************************************
// LIBRARY "input.js"
// CODE SOURCE: https://gist.github.com/bradenbest/7251ca42af2991f234346baeabbf435b
// code found by reading stackoverflow:
//"how-to-detect-if-multiple-keys-are-pressed-at-once-using-javascript"
// *****************************************************************************
function Input(el) {
  var parent = el,
    map = {},
    intervals = {};

  function ev_kdown(ev) {
    map[ev.key] = true;
    ev.preventDefault();
    return;
  }

  function ev_kup(ev) {
    map[ev.key] = false;
    ev.preventDefault();
    return;
  }

  function key_down(key) {
    return map[key];
  }

  function keys_down_array(array) {
    return typeof array.find((key) => !key_down(key)) === "undefined";
  }

  function keys_down_arguments(...args) {
    return keys_down_array(args);
  }

  function clear() {
    map = {};
  }

  function watch_loop(keylist, callback) {
    return function () {
      if (keys_down_array(keylist)) callback();
    };
  }

  function watch(name, callback, ...keylist) {
    intervals[name] = setInterval(watch_loop(keylist, callback), 1000 / 24);
  }

  function unwatch(name) {
    clearInterval(intervals[name]);
    delete intervals[name];
  }

  function detach() {
    parent.removeEventListener("keydown", ev_kdown);
    parent.removeEventListener("keyup", ev_kup);
  }

  function attach() {
    parent.addEventListener("keydown", ev_kdown);
    parent.addEventListener("keyup", ev_kup);
  }

  function Input() {
    attach();

    return {
      key_down: key_down,
      keys_down: keys_down_arguments,
      watch: watch,
      unwatch: unwatch,
      clear: clear,
      detach: detach,
    };
  }

  return Input();
}
