//test2.js - Test lcdi2c.js using a 20x4 LCD display over i2c bus 1 (device 0x27).

var LCD = require('./lcdi2c.js');
var sleep = require('sleep');


var lcd = new LCD( 1, 0x27, 20, 4 );

lcd.createChar( 0,[ 0x1B,0x15,0x0E,0x1B,0x15,0x1B,0x15,0x0E] ).createChar( 1,[ 0x0C,0x12,0x12,0x0C,0x00,0x00,0x00,0x00] );

//Turning on LCD.
//lcd.on();
//_sleep(200);

var toggle = false;
var count = 0;
var intV = setInterval( function() {
    if (count > 10 ) {
    	clearInterval( intV );
    };
    if (toggle ) {
    	toggle = false;
    	lcd.on();
    } else {
    	toggle = true;
    	lcd.off();
    };
    //lcd.print('1');
    count++;
}, 500 );

_sleep(1000);

//Printing
console.log( 'Printing on LCD...');
lcd.home();
_sleep( 200 );
lcd.print( 'This is line 1');
//lcd.print('Raspberry Pi ').setCursor(0,1).cursorUnder();

function _sleep( milli ) {
	sleep.usleep(milli * 1000);
};

for (i=0; i < 80; i++ ) {
    lcd.print('X');
    //console.log( i );
};

//Try print function.
for (var i = 0; i < 10; i++ ) {
    lcd.clear();
    lcd.print( '01234567890123456789' );
    lcd.print( 'p This is line 2....' );
    lcd.print( 'p This is line 3....' );
    lcd.print( 'p This is line 4....' );
};

//Now, try println function.
for (var i = 0; i < 10; i++ ) {
    lcd.clear();
    lcd.println( '01234567890123456789', 1 );
    lcd.println( 'plThis is line 2...', 2 );
    lcd.println( 'plThis is line 3...', 3 );
    lcd.println( 'plThis is line 4...', 4 );
};

//Now, try printlnBlock function.
for (var i = 0; i < 10; i++ ) {
    lcd.clear();
    lcd.printlnBlock( '01234567890123456789', 1 );
    lcd.printlnBlock( 'plbThis is line 2...', 2 );
    lcd.printlnBlock( 'plbThis is line 3...', 3 );
    lcd.printlnBlock( 'plbThis is line 4...', 4 );
};


_sleep( 2000 );
lcd.off();