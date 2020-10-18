import * as firebase from "firebase/app";

import "firebase/database";

import { EmotionDetector } from "./EmotionDetector.js";
import { CameraFetch } from "./CameraFetch.mjs";

// Your web app's Firebase configuration
var firebaseConfig = 
{
    apiKey: "AIzaSyCAPmblyyrMcu5ulWhZREMxiYoSFJVD4RQ",
    authDomain: "emoji-react-12bdf.firebaseapp.com",
    databaseURL: "https://emoji-react-12bdf.firebaseio.com",
    projectId: "emoji-react-12bdf",
    storageBucket: "emoji-react-12bdf.appspot.com",
    messagingSenderId: "1015952549958",
    appId: "1:1015952549958:web:8e08dc1826852df8d1c247"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let globalSession = null, sessionStats;
let ID = btoa(Math.random() * 1000);

async function clientMain(sessionId, cwd)
{
    if (globalSession)
    {
        return;
    }

    globalSession = sessionId;
    sessionStats = database.ref(globalSession + "/" + ID);

    await EmotionDetector.init(cwd);
    await CameraFetch.openCVAvailable();

    let avgEmotion = 0;
    let avgCount = 0;
    let lastTime = 0;
    
    document.querySelector("main").appendChild(CameraFetch.openCameraPreview(
        async (cv, src, dst) =>
        {
            let t = (new Date()).getTime() / 1000;
            let x = 100;
            let y = 100;

            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);

            let emotionData = await EmotionDetector.checkNumericOutput(dst, cv);
            let emotion = EmotionDetector.LABELS[emotionData[0]];

            cv.putText(dst, emotion + "", {x: x, y: y}, cv.FONT_HERSHEY_SIMPLEX, 1.0, [255 * (1 + Math.sin(t)) / 2, 0, 0, 255]);

            if (t - lastTime > 0.2)
            {
                avgEmotion += emotionData[0];
                avgCount++;

                if (avgCount >= 5)
                {
                    avgEmotion /= avgCount;
                    sessionStats.set(Math.round(avgEmotion));

                    avgCount = 0;
                    avgEmotion = 0;
                }

                lastTime = t;
            }
        }
    ));
}

function unload()
{
    if (sessionStats)
    {
        sessionStats.set(null);
    }

    console.log("Unloaded!");
}

window.onbeforeunload = unload;

export { clientMain, unload };