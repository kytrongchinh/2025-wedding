/** Guide
 *  var captcha = helpers.captcha.create(req);
 *  var check_captcha = helpers.captcha.check(req);
 */
const { registerFont, createCanvas } = require('canvas');
const { randomInt } = require('crypto');
class Captcha{
    /* Generate captcha
     *
     * @param req
     * @param options
     * @returns {{text: (number|BigNumber|*), canvas: *}}
     */
    static create (req,options) {
        options = Object.assign({
            width: 120,
            height: 60,
            font: '',
            fontSize: 20,
            fontFamily: 'Arial',
            textLength: 5,
            backgroundColor: 'rgba(255,255,255, 1)',
            pool: 'ABCDEFGHJKLMNPQRSTUWXYZ',
            decoy : false,
            line : true,
            noise : true
        }, options);
        //console.log('captcha_options',options);
        var randomArray = function(arr_color){
            return arr_color[randomInt(0, arr_color.length - 1)];
        };

        var writeText = function(canvas,coordinates){
            /*Add captcha text*/
            var text_color = ['green','blue','black','teal','purple','indigo','crimson','orange','persian blue'];
            var ctx = canvas.getContext('2d');
            ctx.globalAlpha = '1';
            for(let n = 0; n < coordinates.length; n++) {
                let font_R = randomInt(15,20);
                ctx.font = `${font_R}px ${options.fontFamily}`;
                ctx.fillStyle = randomArray(text_color);
                ctx.fillText(text[n], coordinates[n][0], coordinates[n][1]);
            }
        };

        var writeLine = function(canvas,coordinates){
            /*Add trace line*/
            var line_color = ['green','blue','red','olive','teal','purple','jade','indigo'];
            var ctx = canvas.getContext('2d');
            ctx.strokeStyle = randomArray(line_color);
            ctx.globalAlpha = '0.6';
            ctx.beginPath();
            ctx.moveTo(coordinates[0][0], coordinates[0][1]);
            ctx.lineWidth = 0.8;
            for(let i = 1; i < coordinates.length; i++) {
                ctx.lineTo(coordinates[i][0], coordinates[i][1]);
            }
            ctx.stroke();
        };

        var writeNoise = function(canvas){
            var ctx = canvas.getContext('2d');
            var j = 20;
            while (j--) {
                var loop = 10;
                var x = randomInt(0, canvas.width);
                var y = randomInt(0, canvas.height);
                ctx.beginPath();
                ctx.moveTo(x, y);
                while (loop--) {
                    ctx.lineTo(x + randomInt(-30, 30), y + randomInt(-30, 30))
                }
                //red,green,blue,grey,yellow,cerise
                ctx.strokeStyle = randomArray(['rgba(255,0,0,0.1)','rgba(0,255,0,0.1)','rgba(0,0,255,0.1)','rgba(192,192,192,0.1)','rgba(255,255,0,0.1)','rgba(255,0,255,0.1)']);
                ctx.stroke()
            }
        };

        var writeDecoy = function(canvas){
            var ctx = canvas.getContext('2d');
            var decoy_color = ['pink','yellow','aqua'];
            var decoyLength = options.textLength + 2;
            var decoyText = helpers.base.random(decoyLength,options.pool);
            ctx.font = '10px '+options.fontFamily;
            ctx.globalAlpha = '0.5';

            for(let n = 0; n < decoyLength; n++) {
                //let textMetrics = ctx.measureText(decoyText[n]);
                var x = randomInt(0,canvas.width-10);
                var y = randomInt(10,options.height-10);
                var colo = randomArray(decoy_color);
                ctx.fillStyle = colo;
                ctx.fillText(decoyText[n],x,y);
                //console.log(x,y,decoyText[n],colo);
            }
        };

        registerFont(_basepath+'public/frontend/fonts/PTMono-Regular.ttf', { family: 'PT Mono' });

        var canvas = createCanvas(options.width, options.height);
        var ctx = canvas.getContext('2d');
        ctx.lineJoin = "miter";
        ctx.textBaseline = "middle";

        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, options.width, options.height);
        
        var text = helpers.base.random(options.textLength,options.pool);
        /*get coordinates for captcha characters and trace line*/
        let coordinates = [];
        for (let i = 0; i < text.length; i++) {
            let widthGap = Math.floor(options.width/(text.length));
            let randomWidth = widthGap*(i + 0.2);
            let randomHeight = randomInt(options.fontSize,options.height-options.fontSize);
            let coordinate = [randomWidth,randomHeight];
            coordinates.push(coordinate);
        }
        coordinates = coordinates.sort((a, b) => a[0] - b[0]);

        /*Add captcha text*/
        writeText(canvas,coordinates);

        /*Add decoy*/
        if(options.decoy){
            writeDecoy(canvas);
        }

        /*Add trace line*/
        if(options.line){
            writeLine(canvas,coordinates);
        }

        /*Add noise*/
        if(options.noise){
            writeNoise(canvas);
        }

        /*Add background*/
        //ctx.fillStyle = options.backgroundColor;
        //ctx.fillRect(0, 0, options.width, options.height);

        req.session.captcha_code = text;

        return {
            canvas:canvas
        };
    };

    /* Check captcha valid
     *
     * @param req
     * @param code
     * @returns {boolean}
     */
    static check(req,code){
        try{
            var captcha_input = code || req.body.captcha;
            return (req.session.captcha_code === captcha_input.toUpperCase());
        }catch(e){
            return false;
        }
    };
}

module.exports = Captcha;