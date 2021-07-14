exports.checkSlots = (req, res) => {

function run() {
    return new Promise(async (resolve, reject) => {
        try {
            const puppeteer = require('puppeteer');
            const devices = puppeteer.devices;
            const iPhonex = devices['iPhone X'];

            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.emulate(iPhonex);

            await page.goto(
                'https://app.bookitit.com/es/hosteds/widgetdefault/2e683196f06adbdb38495c2b60c3db653', {
                    waitUntil: 'networkidle0',
                    /* referer is requerired because if not bookitit will return a blank 
                    page. This behavior changes from widget to widget, so if you are going 
                    to use this to monitor a different slot widget, you may need to change 
                    the referrer, or you may not need it at all */
                    referer: 'http://www.exteriores.gob.es/Consulados/LONDRES/es/ServiciosConsulares/Paginas/respingo.aspx/'
                });

            /* Bookitit only includes a div with id idDivNotAvailableSlotsTextTop if 
            there are no slot available. This seems to be true both in the old and the 
            new UI of Bookitit. */
            let bSlotsAvailable = (await page.evaluate(
                'document.querySelector("#idDivNotAvailableSlotsTextTop")') === null);
            console.log('Slot availability|'+bSlotsAvailable);

            var ret = {
                'bSlotsAvailable': bSlotsAvailable,
                'screenshot': await page.screenshot({
                    //path: 'screenshot.png'
                    encoding: 'base64'
                })
            }
            await browser.close();
            return resolve(ret);
        } catch (e) {
            return reject(e);
        }
    })
}

run()
    .then(url => {

        var Twit = require('twit');
        var config = {
            consumer_key: process.env.consumer_key,
            consumer_secret: process.env.consumer_secret,
            access_token: process.env.access_token,
            access_token_secret: process.env.access_token_secret
        }
        var T = new Twit(config);
        var b64content = url.screenshot;

        // first we must post the media to Twitter
        T.post('media/upload', {
            media_data: b64content
        }, function (err, data, response) {
            // now we can assign alt text to the media, for use by screen readers and
            // other text-based presentations and interpreters
            var mediaIdStr = data.media_id_string
            var altText = "Captura de pantalla de bookitit mostrando que no quedan citas"
            var meta_params = {
                media_id: mediaIdStr,
                alt_text: {
                    text: altText
                }
            }

            T.post('media/metadata/create', meta_params, function (err, data, response) {
                if (!err) {
                    // now we can reference the media and post a tweet (media will attach to the tweet)
                    var params = {
                        status: 'Ahora mismo '+(url.bSlotsAvailable?'SÍ':'NO')+' hay citas para renovar el pasaporte en el consulado de Londres',
                        media_ids: [mediaIdStr]
                    }

                    T.post('statuses/update', params, function (err, data, response) {
                        console.log(data)
                    })
                }
            })
        })
        res.set('Content-Type', 'text/html');
        res.status(200).send('OK!');
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('An Error occured' + err);  
    })
};
