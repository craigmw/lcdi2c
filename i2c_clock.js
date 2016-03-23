//i2c_clock.js - Tests i2c lcd display clock function. Uses 20x4 LCD character display
//  over I2C bus 1 using PCF8574-based LCD "backpack" with device address 0x27.

var LCD = require('./lcdi2c.js');
var sleep = require('sleep');


var lcd = new LCD( 1, 0x27, 20, 4 );

var now = 0;
lcd.on();
//lcd.setBacklight(1);
lcd.clear();
lcd.home();


setInterval( function() {
    now = new Date();
    var time1 = now.toTimeString();
    var date1 = now.toDateString();
    
    //console.log( date1 + '\t' + time1 );
    //lcd.printlnBlock( date1, 1 );
    //lcd.printlnBlock( time1, 2 );
    lcd.println( date1, 1 );
    lcd.println( time1, 2 );

}, 500 );
lcd.off;