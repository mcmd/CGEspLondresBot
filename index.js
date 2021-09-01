const admin = require('firebase-admin');

admin.initializeApp();
const firestore = admin.firestore();

const project = 'projects/<your cloud project id>';

// Imports the Secret Manager library
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// Instantiates a client
const client = new SecretManagerServiceClient();

async function getState() {
    let collectionRef = firestore.collection('CGEspLondresBot');
    var docRef = collectionRef.doc("state");
    try {
        doc = await docRef.get();
        if (doc.exists) {
            return doc.data();
        } else {
            // doc.data() will be undefined in this case
            throw new Error("No such document!");
        }
    } catch (error) {
        console.log("Error getting document:", error);
        throw error;
    };
}

async function setState(state) {
    let collectionRef = firestore.collection('CGEspLondresBot');
    var docRef = collectionRef.doc("state");
    await docRef.set(state);
}

async function accessSecret(secretId, secretVersion = 'latest') {
    let name = project + '/secrets/' + secretId + '/versions/' + secretVersion;
    const [version] = await client.accessSecretVersion({
        name: name,
    });
    return version.payload.data.toString();
}

exports.checkSlots = async (req, res) => {
    try {
        var state = await getState();

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

        //Check for data loading error in Bookitit, they are surprisingly common 
        if((await page.evaluate(
                        '(document.querySelector("#idBktDefaultDatetimeErrorContainer").style["0"] === undefined)')) == true){
                            throw "Bookitit returned an error";
                        }
        
        /* Bookitit only includes a div with id idDivNotAvailableSlotsTextTop if 
        there are no slot available. This seems to be true both in the old and the 
        new UI of Bookitit. */
        let bSlotsAvailable = (await page.evaluate(
            'document.querySelector("#idDivNotAvailableSlotsTextTop")') === null);

        var tweet = null;

        if ((state.currentlyAvailable == true) && (bSlotsAvailable == false)) {
            tweet = 'Ha dejado de haber citas. Pondré un mensaje en cuanto se publiquen nuevas citas (normalmente, el día 1 y 15 cada mes, y a veces salen sueltas en días sueltos).\n\nMantente al tanto en:\n\nTwitter twitter.com/CGEspLondresBot\nTelegram: t.me/CGEspLondresBot\nFB: fb.me/CGEspLondresBot';
            state.currentlyAvailable = false;
        } else if ((state.currentlyAvailable == false) && (bSlotsAvailable == true)) {
            tweet = 'Se acaban de publicar citas para pasaportes.\n\nRecuerda que necesitarás tu matrícula consular y contraseña. Podrás acceder a bookitit desde el PDF de cada procedimiento: bit.ly/2NegQxN\n\nSi tienes alguna duda, consulta la guía de @JuntosporunCRE: bit.ly/2XZgYX1';
            state.currentlyAvailable = true;
        }
        console.log('Slot availability        |' + bSlotsAvailable);
        console.log('state.currentlyAvailable |' + state.currentlyAvailable);
        //console.log('tweet                    |' + tweet);
        if (tweet != null) {
            var ret = {
                'bSlotsAvailable': bSlotsAvailable,
                'screenshot': await page.screenshot({
                    //path: 'screenshot.png'
                    encoding: 'base64'
                })
            }

            var url = ret;

            var Twit = require('twit');
            var config = {
                consumer_key: await accessSecret('CGEspLondresBot_consumer_key'),
                consumer_secret: await accessSecret('CGEspLondresBot_consumer_secret'),
                access_token: await accessSecret('CGEspLondresBot_access_token'),
                access_token_secret: await accessSecret('CGEspLondresBot_access_token_secret')
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
                var altText = 'Captura de pantalla de bookitit mostrando que ' + (url.bSlotsAvailable ? 'SÍ' : 'NO') + ' quedan citas'
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
                            status: tweet,
                            media_ids: [mediaIdStr]
                        }

                        T.post('statuses/update', params, function (err, data, response) {
                            //console.log(data)
                        })
                    }
                })
            })
        }else{
            //console.log("No tweet will be printed");
        }
        await browser.close();
        await setState(state);
        res.set('Content-Type', 'text/html');
        res.status(200).send('OK!');
    } catch (err) {
        console.error(err);
        res.status(500).send('An Error occured' + err);
    }
};