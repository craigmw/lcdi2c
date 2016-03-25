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



var int1 = setInterval( function() {
    now = new Date();
    var time1 = now.toTimeString();
    var date1 = now.toDateString();

    //Print and check for errors. If errors found, shut down gently.
    lcd.println( date1, 1 );
    if ( lcd.error ) {
        lcdError( lcd.error ); 
    } else {
        lcd.println( time1, 2 );
        if ( lcd.error ) {
            lcdError( lcd.error ); 
        };
    }; 
}, 500 );
lcd.off;

function lcdError( err ) {
    clearInterval( int1 );
	console.log( 'Unable to print to LCD on bus 1 at address 0x27. Error: ' + JSON.stringify( err ) );

};