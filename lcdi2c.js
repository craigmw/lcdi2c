/**
 * lcdi2c.js - Add I2C LCD character display using PCF8574 I2C port expander.
 * https://github.com/wilberforce/lcd-pcf8574 but replaced calls to i2c library with
 * calls to i2c-bus. Currently, only works in synchronous output mode. Asynch mode does not work.
 * LCD i2c interface via PCF8574P
 * http://dx.com/p/lcd1602-adapter-board-w-iic-i2c-interface-black-works-with-official-arduino-boards-216865

 * https://gist.github.com/chrisnew/6725633
 * http://www.espruino.com/HD44780
 * http://www.espruino.com/LCD1602
 */
const i2c = require('i2c-bus');
const sleep = require('sleep');

let LCD = class LCD {
    constructor(device, address, cols, rows) {
        this.displayPorts = {
            RS: 0x01,
            E: 0x04,
            D4: 0x10,
            D5: 0x20,
            D6: 0x40,
            D7: 0x80,

            CHR: 1,
            CMD: 0,

            backlight: 0x08,
            RW: 0x20 // not used
        };

// <<<<<<< alexfederlin-patch-1
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

	this.init();
	
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

LCD.prototype.init = function (){
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
}

LCD.prototype._sleep = function (milli) {
	sleep.usleep(milli * 1000);
};
// =======
        this.buffer = new Buffer(3);  //Required for printlnBuffer.

        // commands
        this.CLEARDISPLAY = 0x01;
        this.RETURNHOME = 0x02;
        this.ENTRYMODESET = 0x04;
        this.DISPLAYCONTROL = 0x08;
        this.CURSORSHIFT = 0x10;
        this.FUNCTIONSET = 0x20;
        this.SETCGRAMADDR = 0x40;
        this.SETDDRAMADDR = 0x80;

        //# flags for display entry mode
        this.ENTRYRIGHT = 0x00;
        this.ENTRYLEFT = 0x02;
        this.ENTRYSHIFTINCREMENT = 0x01;
        this.ENTRYSHIFTDECREMENT = 0x00;

        //# flags for display on/off control
        this.DISPLAYON = 0x04;
        this.DISPLAYOFF = 0x00;
        this.CURSORON = 0x02;
        this.CURSOROFF = 0x00;
        this.BLINKON = 0x01;
        this.BLINKOFF = 0x00;

        //# flags for display/cursor shift
        this.DISPLAYMOVE = 0x08;
        this.CURSORMOVE = 0x00;
        this.MOVERIGHT = 0x04;
        this.MOVELEFT = 0x00;

        //# flags for function set
        this._8BITMODE = 0x10;
        this._4BITMODE = 0x00;
        this._2LINE = 0x08;
        this._1LINE = 0x00;
        this._5x10DOTS = 0x04;
        this._5x8DOTS = 0x00;

        //Line addresses.
        this.LINEADDRESS = [0x80, 0xC0, 0x94, 0xD4];

        this.device = device;
        this.address = address;
        this.cols = cols;
        this.rows = rows;
        this.error = null;
        this.i2c = null;

        this._init();
    };

    _init() {
        this.i2c = i2c.open(this.device, function (err) {
            if (err) {
                console.log('Unable to open I2C port on device ' + device + ' ERROR: ' + err);
                console.log(this);
                this.error = err;
                return this
            }
        });

        this._sleep(1000);

        this.write4(0x33, this.displayPorts.CMD); //initialization
        this._sleep(200);
        this.write4(0x32, this.displayPorts.CMD); //initialization
        this._sleep(100);
        this.write4(0x06, this.displayPorts.CMD); //initialization
        this._sleep(100);
        this.write4(0x28, this.displayPorts.CMD); //initialization
        this._sleep(100);
        this.write4(0x01, this.displayPorts.CMD); //initialization
        this._sleep(100);

        this.write4(this.FUNCTIONSET | this._4BITMODE | this._2LINE | this._5x10DOTS, this.displayPorts.CMD); //4 bit - 2 line 5x7 matrix

        this._sleep(10);
        this.write(this.DISPLAYCONTROL | this.DISPLAYON, this.displayPorts.CMD); //turn cursor off 0x0E to enable cursor
        this._sleep(10);
        this.write(this.ENTRYMODESET | this.ENTRYLEFT, this.displayPorts.CMD); //shift cursor right
        this._sleep(10);
        this.write(this.CLEARDISPLAY, this.displayPorts.CMD); // LCD clear
        this.write(this.displayPorts.backlight, this.displayPorts.CHR); //Turn on backlight.

        return this;
    };
// >>>>>>> master

    _sleep(milli) {
        sleep.usleep(milli * 1000);
    };

    write4(x, c) {
        try {
            let a = (x & 0xF0); // Use upper 4 bit nibble
            this.i2c.sendByteSync(this.address, a | this.displayPorts.backlight | c);
            this.i2c.sendByteSync(this.address, a | this.displayPorts.E | this.displayPorts.backlight | c);
            this.i2c.sendByteSync(this.address, a | this.displayPorts.backlight | c);
        } catch (err) {
            this.error = err;
        }
        this._sleep(2);
    };

    write4Async(x, c) {
        let a = (x & 0xF0); // Use upper 4 bit nibble
        this.i2c.sendByte(this.address, a | this.displayPorts.backlight | c, (err) => {
            if (err) {
                this.error = err;
            }
        });
        this.i2c.sendByte(this.address, a | this.displayPorts.E | this.displayPorts.backlight | c, (err) => {
            if (err) {
                this.error = err;
            }
        });
        this.i2c.sendByte(this.address, a | this.displayPorts.backlight | c, (err) => {
            if (err) {
                this.error = err;
            }
        });

        //Had to add this as it fixes a weird bug where the display was showing garbled text after a few minutes
        //Found this solution by accident though...
        this.i2c.sendByte(this.address, a | this.displayPorts.backlight | c, (err) => {
            if (err) {
                this.error = err;
            }
        });
    };

    write4Block(x, c) {
        let a = (x & 0xF0 );
        this.buffer[0] = a | this.displayPorts.backlight | c;
        this.buffer[1] = a | this.displayPorts.E | this.displayPorts.backlight | c;
        this.buffer[2] = a | this.displayPorts.backlight | c;

        this.i2c.writeI2cBlockSync(this.address, 1, this.buffer.length, this.buffer);
        this._sleep(2);
    };

    write(x, c) {
        this.write4(x, c);
        this.write4(x << 4, c);
        return this;
    };

    writeAsync(x, c) {
        this.write4Async(x, c);
        this.write4Async(x << 4, c);
        return this;
    };

// <<<<<<< alexfederlin-patch-1
		//Set cursor to correct line.
		if ( line > 0 && line <= this.rows ) {
			this.write( LCD.LINEADDRESS[line], displayPorts.CMD );
			this._sleep(2);
		};
// =======
    writeBlock(x, c) {
        this.write4Block(x, c);
        this.write4Block(x << 4, c);
        return this;
    };
//>>>>>>> master

    clear() {
        return this.write(this.CLEARDISPLAY, this.displayPorts.CMD);
    };

    print(str) {
        if (typeof str === 'string') {
            for (let i = 0; i < str.length; i++) {
                let c = str[i].charCodeAt(0);
                this.write(c, this.displayPorts.CHR);
                this._sleep(2);
            }
        }
        return this;
    };

    printAsync(str) {
        if (typeof str === 'string') {
            for (let i = 0; i < str.length; i++) {
                let c = str[i].charCodeAt(0);
                this.writeAsync(c, this.displayPorts.CHR);
                //this._sleep(2);
            }
        }
        return this;
    };

    printBlock(str) {
        if (typeof str === 'string') {
            for (let i = 0; i < str.length; i++) {
                let c = str[i].charCodeAt(0);
                this.writeBlock(c, this.displayPorts.CHR);
                this._sleep(2);
            }
        }
    };

    println(str, line) {
        if (typeof str === 'string') {
            //Set cursor to correct line.
            if (line > 0 && line <= this.rows) {
                this.write(this.LINEADDRESS[line - 1], this.displayPorts.CMD);
            }
            this.print(str.substring(0, this.cols));
        }
        return this;
    };

    printlnAsync(str, line) {
        if (typeof str === 'string') {
            //Set cursor to correct line.
            if (line > 0 && line <= this.rows) {
                this.writeAsync(this.LINEADDRESS[line - 1], this.displayPorts.CMD);
            }
            this.printAsync(str.substring(0, this.cols));
        }
        return this;

    };

    printlnBlock(str, line) {
        if (typeof str === 'string') {
            if (line > 0) {
                this.write(this.LINEADDRESS[line - 1], this.displayPorts.CMD);
            }

            //Now, write block to i2c.
            this.printBlock(str.substring(0, this.cols));
        }
        return this;
    };

    /** flashing block for the current cursor */
    cursorFull() {
        return this.write(this.DISPLAYCONTROL | this.DISPLAYON | this.CURSORON | this.BLINKON, this.displayPorts.CMD);
    };

    /** small line under the current cursor */
    cursorUnder() {
        return this.write(this.DISPLAYCONTROL | this.DISPLAYON | this.CURSORON | this.BLINKOFF, this.displayPorts.CMD);
    }

    /** set cursor pos, top left = 0,0 */
    setCursor(x, y) {
        let l = [0x00, 0x40, 0x14, 0x54];
        return this.write(this.SETDDRAMADDR | (l[y] + x), this.displayPorts.CMD);
    }

    /** set cursor to 0,0 */
    home() {
        return this.write(this.SETDDRAMADDR | 0x00, this.displayPorts.CMD);
    }

    /** Turn underline cursor off */
    blinkOff() {
        return this.write(this.DISPLAYCONTROL | this.DISPLAYON | this.CURSOROFF | this.BLINKOFF, this.displayPorts.CMD);
    }

    /** Turn underline cursor on */
    blinkOn() {
        return this.write(this.DISPLAYCONTROL | this.DISPLAYON | this.CURSORON | this.BLINKOFF, this.displayPorts.CMD);
    }

    /** Turn block cursor off */
    cursorOff() {
        return this.write(this.DISPLAYCONTROL | this.DISPLAYON | this.CURSOROFF | this.BLINKON, this.displayPorts.CMD);
    }

    /** Turn block cursor on */
    cursorOn() {
        return this.write(this.DISPLAYCONTROL | this.DISPLAYON | this.CURSORON | this.BLINKON, this.displayPorts.CMD);
    }

    /** setBacklight */
    setBacklight(val) {
        if (val > 0) {
            this.displayPorts.backlight = 0x08;
        } else {
            this.displayPorts.backlight = 0x00;
        }
        return this.write(this.DISPLAYCONTROL, this.displayPorts.CMD);
    }

    /** setContrast stub */
    // setContrast(val) {
    //     return this.write(this.DISPLAYCONTROL, this.displayPorts.CMD);
    // }
    /** Turn display off */
    off() {
        this.displayPorts.backlight = 0x00;
        return this.write(this.DISPLAYCONTROL | this.DISPLAYOFF, this.displayPorts.CMD);
    }

    /** Turn display on */
    on() {
        this.displayPorts.backlight = 0x08;
        return this.write(this.DISPLAYCONTROL | this.DISPLAYON, this.displayPorts.CMD);
    }

    /** set special character 0..7, data is an array(8) of bytes, and then return to home addr */
    createChar(ch, data) {
        this.write(this.SETCGRAMADDR | ((ch & 7) << 3), this.displayPorts.CMD);
        for (let i = 0; i < 8; i++)
            this.write(data[i], this.displayPorts.CHR);
        return this.write(this.SETDDRAMADDR, this.displayPorts.CMD);
    }
};

module.exports = LCD;
