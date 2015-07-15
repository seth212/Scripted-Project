var mraa = require('mraa');  //C/C++ Library that requires Javascript and Python
var exec = require('child_process').exec;
var flowthings = require('flowthings');
var connection;

// Allows program to communicate with the attached hardware.
var i2cBus;

// Variable assigns the account and token credentials.
var creds = {
  account: "seth212",
  token: "8wE2bB7y4QqpxWGx9I02iVilRuza"
};

var api = flowthings.API(creds);


var initADC = function() {
  exec('i2cset -y 1 0x48 1 0x8344 w', function(err, stdout, stderr) {
    if (err !== null) {
      console.log('i2cset failed');
      console.log(stderr);
      process.exit(1);
    } else {
      i2cBus = new mraa.I2c(1);
      i2cBus.address(0x48);
      main_loop();
    };
  });
};

// Function that returns hexadecimals while the lengths are less than 4.
var fixHex = function(h) {
  while (h.length < 4) {
    h = 0 + h;
  };
  return h[1] + h[2] + h[3] + h[0];
}

// Function turns whatever the program reads from the hardware into a string
// Then logs that string into the console.
var main_loop = function() {
  console.log(JSON.stringify(i2cBus));

  var x = i2cBus.readWordReg(0x48);
  var currentLight = parseInt(fixHex(x.toString(16)), 16);
  console.log('x int: ', currentLight);

  // Uses FlowId to indicate the current level/power of the light.
  api.drop('f55a3cfac68056d07d51ccb2f').create({
    "elems": {
      "current_light": currentLight
    }
  }, function(err, res) {
    if (err) console.log("error: ", err);
    if (res) console.log("res: ", res);
    setTimeout(main_loop, 2000);
  });
}

initADC();
