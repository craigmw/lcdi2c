//lcdi2c.js - Add I2C LCD character display using PCF8574 I2C port expander.
// https://github.com/wilberforce/lcd-pcf8574 but replaced calls to i2c library with
// calls to i2c-bus. Currently, only works in synchronous output mode. Asynch mode does not work.
// LCD i2c interface via PCF8574P
// http://dx.com/p/lcd1602-adapter-board-w-iic-i2c-interface-black-works-with-official-arduino-boards-216865

// https://gist.github.com/chrisnew/6725633
// http://www.espruino.com/HD44780
// http://www.espruino.com/LCD1602

var i2c = require('i2c-bus');
var sleep = require('sleep');

var displayPorts = {
	RS : 0x01,
	E : 0x04,
	D4 : 0x10,
	D5 : 0x20,
	D6 : 0x40,
	D7 : 0x80,

	CHR : 1,
	CMD : 0,

	backlight : 0x08,
	RW : 0x20 // not used
};

var buffer = new Buffer(3);  //Required for printlnBuffer.

//LCD() - Initialize LCD object. 
//  device: I2C bus number; 0 for rev. 1 boards, 1 for rev. 2+ boards.
//  address: Address of device (use i2cdetect to determine this)
//  cols: columns supported by display (e.g. 16 or 20)
//  rows: rows supported by display (e.g. 2 or 4 )
var LCD = function (device, address, cols, rows ) {
	//this.i2c = new i2c(address, {
	//		device : device
	//	});
	this.device = device;
	this.address = address;
	this.cols = cols;
	this.rows = rows;
	this.error = null;
	this.i2c = i2c.open( device, function( err ) {
		if ( err ) {
		    console.log( 'Unable to open I2C port on device ' + device + ' ERROR: ' + err );
		    console.log( this );
		    this.error = err;
		    return this	
		};
	});
	//console.log( 'Opened I2C port on bus ' + device + ' for LCD at address 0x' + address.toString( 16 ) + '.' );
	this._sleep(1000);

	this.write4( 0x33, displayPorts.CMD); //initialization
	this._sleep(200);
	this.write4(0x32, displayPorts.CMD); //initialization
	this._sleep(100);
	this.write4( 0x06, displayPorts.CMD); //initialization
	this._sleep(100);
	this.write4( 0x28, displayPorts.CMD); //initialization
	this._sleep(100);
	this.write4( 0x01, displayPorts.CMD); //initialization
	this._sleep(100);


	this.write4(LCD.FUNCTIONSET | LCD._4BITMODE | LCD._2LINE | LCD._5x10DOTS, displayPorts.CMD); //4 bit - 2 line 5x7 matrix
	
	this._sleep(10);
	this.write( LCD.DISPLAYCONTROL | LCD.DISPLAYON, displayPorts.CMD); //turn cursor off 0x0E to enable cursor
	this._sleep(10);
	this.write( LCD.ENTRYMODESET | LCD.ENTRYLEFT, displayPorts.CMD); //shift cursor right
	this._sleep(10);
	this.write( LCD.CLEARDISPLAY, displayPorts.CMD); // LCD clear
	this.write( displayPorts.backlight, displayPorts.CHR ); //Turn on backlight.
	
	return this;
};

// commands
LCD.CLEARDISPLAY = 0x01;
LCD.RETURNHOME = 0x02;
LCD.ENTRYMODESET = 0x04;
LCD.DISPLAYCONTROL = 0x08;
LCD.CURSORSHIFT = 0x10;
LCD.FUNCTIONSET = 0x20;
LCD.SETCGRAMADDR = 0x40;
LCD.SETDDRAMADDR = 0x80;

//# flags for display entry mode
LCD.ENTRYRIGHT = 0x00;
LCD.ENTRYLEFT = 0x02;
LCD.ENTRYSHIFTINCREMENT = 0x01;
LCD.ENTRYSHIFTDECREMENT = 0x00;

//# flags for display on/off control
LCD.DISPLAYON = 0x04;
LCD.DISPLAYOFF = 0x00;
LCD.CURSORON = 0x02;
LCD.CURSOROFF = 0x00;
LCD.BLINKON = 0x01;
LCD.BLINKOFF = 0x00;

//# flags for display/cursor shift
LCD.DISPLAYMOVE = 0x08;
LCD.CURSORMOVE = 0x00;
LCD.MOVERIGHT = 0x04;
LCD.MOVELEFT = 0x00;

//# flags for function set
LCD._8BITMODE = 0x10;
LCD._4BITMODE = 0x00;
LCD._2LINE = 0x08;  
LCD._1LINE = 0x00; 
LCD._5x10DOTS = 0x04;
LCD._5x8DOTS = 0x00;

//Line addresses.
LCD.LINEADDRESS = [];
LCD.LINEADDRESS[1] = 0x80;
LCD.LINEADDRESS[2] = 0xC0;
LCD.LINEADDRESS[3] = 0x94;
LCD.LINEADDRESS[4] = 0xD4;

LCD.prototype._sleep = function (milli) {
	sleep.usleep(milli * 1000);
};

LCD.prototype.write4 = function( x, c) {
	try {
	    var a = (x & 0xF0); // Use upper 4 bit nibble
	    this.i2c.sendByteSync(this.address, a | displayPorts.backlight | c );
	    this.i2c.sendByteSync(this.address, a | displayPorts.E | displayPorts.backlight | c);
	    this.i2c.sendByteSync(this.address, a | displayPorts.backlight | c );
	} catch ( err ) {
        this.error = err;
	};
	
	this._sleep(2);
}

LCD.prototype.write4Async = function( x, c) {
	var a = (x & 0xF0); // Use upper 4 bit nibble
	this.i2c.sendByte(this.address, 1, a | displayPorts.backlight | c, function( err ) {
		if ( err ) {
			this.error = err;
		};

	    this.i2c.sendByte(this.address, 1, a | displayPorts.E | displayPorts.backlight | c, function( err ) {
	    	if ( err ) {
			    this.error = err;
		    };

	        this.i2c.sendByte(this.address, 1, a | displayPorts.backlight | c, function( err ) {
       			if ( err ) {
        			this.error = err;
		        };
	        });
	    });
	});
	//this._sleep(1);
};

LCD.prototype.write4Block = function( x, c ) {
	var a = (x & 0xF0 );
	//var buffer = new Buffer(3);
    buffer[0] = a | displayPorts.backlight | c;
    buffer[1] = a | displayPorts.E | displayPorts.backlight | c;
    buffer[2] = a | displayPorts.backlight | c;

    this.i2c.writeI2cBlockSync( this.address, 1, buffer.length, buffer );
    this._sleep(2);

};

LCD.prototype.write = function ( x, c) {
	this.write4(x, c);
	this.write4(x << 4, c);
	//this._sleep(2);
	return this;
}

LCD.prototype.writeBlock = function( x, c ) {
    this.write4Block( x, c );
    this.write4Block( x << 4, c );
    return this;
};

LCD.prototype.clear = function () {
	return this.write(LCD.CLEARDISPLAY, displayPorts.CMD);
}

LCD.prototype.print = function ( str ) {
	if (typeof str == 'string') {

		for (var i = 0; i < str.length; i++) {
			var c = str[i].charCodeAt(0);
			this.write( c, displayPorts.CHR );
			this._sleep(2);
		};
	};
	return this;
}

LCD.prototype.printBlock = function( str ) {
	if (typeof str == 'string' ) {
	    
	    for (var i = 0; i < str.length; i++) {
		    var c = str[i].charCodeAt(0);
			this.writeBlock( c, displayPorts.CHR );
			this._sleep(2);
		};
    };
};

LCD.prototype.println = function ( str, line ) {
	if (typeof str == 'string') {

		//Set cursor to correct line.
		if ( line > 0 && line <= this.rows ) {
            this.write( LCD.LINEADDRESS[line], displayPorts.CMD );
		};

		this.print( str.substring(0, this.cols ) );
	};
	return this;
};

//LCD.printlnBlock: println function, but uses writeI2CBlockSync method to speed up transfers.
LCD.prototype.printlnBlock = function( str, line ) {
	if (typeof str == 'string' ) {
        if (line > 0 ) {
        	this.write( LCD.LINEADDRESS[line], displayPorts.CMD );
        };

        //Now, write block to i2c.
        this.printBlock( str.substring( 0, this.cols ) );
	};
	return this;
}

/** flashing block for the current cursor */
LCD.prototype.cursorFull = function () {
	return this.write( LCD.DISPLAYCONTROL | LCD.DISPLAYON | LCD.CURSORON | LCD.BLINKON, displayPorts.CMD);
}
/** small line under the current cursor */
LCD.prototype.cursorUnder = function ( ) {
	return this.write( LCD.DISPLAYCONTROL |  LCD.DISPLAYON | LCD.CURSORON | LCD.BLINKOFF, displayPorts.CMD);
}
/** set cursor pos, top left = 0,0 */
LCD.prototype.setCursor = function ( x, y) {
	var l = [0x00, 0x40, 0x14, 0x54];
	return this.write(LCD.SETDDRAMADDR | (l[y] + x), displayPorts.CMD);
}
/** set cursor to 0,0 */
LCD.prototype.home = function () {
	var l = [0x00, 0x40, 0x14, 0x54];
	return this.write(LCD.SETDDRAMADDR | 0x00, displayPorts.CMD);
}
/** Turn underline cursor off */
LCD.prototype.blinkOff = function () {
	return this.write( LCD.DISPLAYCONTROL | LCD.DISPLAYON | LCD.CURSOROFF | LCD.BLINKOFF, displayPorts.CMD);
}
/** Turn underline cursor on */
LCD.prototype.blinkOn = function () {
	return this.write( LCD.DISPLAYCONTROL | LCD.DISPLAYON | LCD.CURSORON | LCD.BLINKOFF, displayPorts.CMD);
}
/** Turn block cursor off */
LCD.prototype.cursorOff = function () {
	return this.write( LCD.DISPLAYCONTROL | LCD.DISPLAYON | LCD.CURSOROFF | LCD.BLINKON, displayPorts.CMD);
}
/** Turn block cursor on */
LCD.prototype.cursorOn = function () {
	return this.write( LCD.DISPLAYCONTROL | LCD.DISPLAYON | LCD.CURSORON | LCD.BLINKON, displayPorts.CMD);
}
/** setBacklight */
LCD.prototype.setBacklight = function (val) {
	if (val > 0) {
		displayPorts.backlight = 0x08;
	} else {
		displayPorts.backlight = 0x00;
	}
	return this.write(LCD.DISPLAYCONTROL, displayPorts.CMD);
}
/** setContrast stub */
LCD.prototype.setContrast = function (val) {
	return this.write(LCD.DISPLAYCONTROL, displayPorts.CMD);
}
/** Turn display off */
LCD.prototype.off = function () {
	displayPorts.backlight = 0x00;
	return this.write(LCD.DISPLAYCONTROL | LCD.DISPLAYOFF, displayPorts.CMD);
}
/** Turn display on */
LCD.prototype.on = function () {
	displayPorts.backlight = 0x08;
	return this.write(LCD.DISPLAYCONTROL | LCD.DISPLAYON, displayPorts.CMD);
}
/** set special character 0..7, data is an array(8) of bytes, and then return to home addr */
LCD.prototype.createChar = function (ch, data) {
	this.write(LCD.SETCGRAMADDR | ((ch & 7) << 3), displayPorts.CMD);
	for (var i = 0; i < 8; i++)
		this.write(data[i], displayPorts.CHR);
	return this.write(LCD.SETDDRAMADDR, displayPorts.CMD);
}

module.exports = LCD;

