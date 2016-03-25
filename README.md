# lcdi2c

## Overview
For use on a Raspberry Pi, lcdi2c is a node.js library for accessing LCD character displays using I2C via a PCF8574 port expander, typically found on inexpensive LCD I2C "backpacks." This work is based upon the following repository:

https://github.com/wilberforce/lcd-pcf8574

lcdi2c supports 16x2 and 20x4 LCD character displays based on the Hitachi HD44780 LCD controller ( https://en.wikipedia.org/wiki/Hitachi_HD44780_LCD_controller ). lcdi2c uses the i2c-bus library ( https://github.com/fivdi/i2c-bus ) instead of the i2c library since the former supports more recent versions of node (e.g. 4.2.1). 

lcdi2c also provides new functions to facilitate output on a multiline character display based on the Hitachi HD44780 LCD controller. These include:

println( string, line ): Sends output to a specified line. Automatically truncates output to number of columns specified on startup.

## Installation

```bash
npm install lcdi2c

```


## Usage 

First, set up I2C on your Raspberry Pi. More information about this can be found here:

https://learn.adafruit.com/adafruits-raspberry-pi-lesson-4-gpio-setup/configuring-i2c

Now, check for the address of the LCD on the I2C bus:

For a rev. 1 board, use the following:

```bash
sudo i2cdetect -y 0

```

For a rev. 2+ board, use the following:


```bash
sudo i2cdetect -y 1

```

This will print out the devices on the I2C bus, such as:


```bash
root@raspberrypi:/home/pi/lcdi2c# sudo i2cdetect -y 1
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:          -- -- -- -- -- -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- 27 -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- 68 -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --

```

Here, we see two devices, 0x27 (our LCD display) and 0x68 (a realtime clock board). So, the device address is 0x27.

To use lcdi2c, add the following code to your node.js application to set up the lcd object:

```bash
var LCD = require('lcdi2c');
var lcd = new LCD( 1, 0x27, 20, 4 );

```

Note that this will set up an I2C LCD panel on I2C bus 1, address 0x27, with 20 columns and 4 rows.

To print out strings to the LCD panel, see the following code:

```bash
lcd.clear();
lcd.print( 'This is line 1...   ' );
lcd.print( 'This is line 2...   ' );
lcd.print( 'This is line 3...   ' );
lcd.print( 'plThis is line 4... ' );
```


To print out a string to the LCD panel using specified line numbers, see the following example code:

```bash
lcd.clear();
lcd.println( 'plThis is line 1...', 1 );
lcd.println( 'plThis is line 2...', 2 );
lcd.println( 'plThis is line 3...', 3 );
lcd.println( 'plThis is line 4...', 4 );
```

To turn on the backlight:

```bash
lcd.on();
```

To turn off the backlight:

```bash
lcd.off();
```

To create custom characters:

```bash
lcd.createChar( 0,[ 0x1B,0x15,0x0E,0x1B,0x15,0x1B,0x15,0x0E] ).createChar( 1,[ 0x0C,0x12,0x12,0x0C,0x00,0x00,0x00,0x00] );
```

More information about creating such custom characters can be found here:

http://www.quinapalus.com/hd44780udg.html 

## Error Checking

i2clcd checks for errors and implements a simple try/catch method to catch errors sent by the I2C driver. Such errors will occur if the bus has not been set up properly, if the device ID is wrong, or if the device is not operational. To prevent crashes, it is recommended that error checking be implemented in the calling code.

If an error is encountered, this will be stored in the variable lcd.error. The calling code should test lcd.error is null/false before calling the i2clcd routine again. Failure to check for such errors will result in a crash of the node.js application.

Example code:

```bash
var LCD = require('lcdi2c');
var lcd = new LCD( 1, 0x27, 20, 4 );

lcd.println( 'This is line 1...', 1 );
if ( lcd.error ) { 
    lcdErrorHandler( lcd.error );
} else {
    lcd.println( 'This is line 2...', 2 );
    if ( lcd.error ) {
       lcdErrorHandler( lcd.error );
    } else {
        lcd.println( 'This is line 3...', 3 );
        if ( lcd.error ) {
            lcdErrorHandler( lcd.error );
        } else {
            lcd.println( 'This is line 4...', 4 );
            if ( lcd.error ) {
                lcdErrorHandler( lcd.error );
            };
        };
    };   
};   

function lcdErrorHandler( err ) {
    console.log( 'Unable to print to LCD display on bus 1 at address 0x27' );
    //Disable further processing if application calls this recursively.
};

```

This code is rather ugly, but it will prevent any calls to the underlying I2C driver from causing a program crash if the I2C bus or LCD display is not configured properly, or if the LCD is not plugged in. This recursive error checking will prevent the application from crashing even if the LCD device is unplugged during application processing. 

A sample application called i2c_clock is provided in this library (and can be found in ../node_modules/lcdi2c) that provides an example of such error checking.

