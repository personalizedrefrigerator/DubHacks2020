import * as tf from "@tensorflow/tfjs";
import { loadGraphModel} from "@tensorflow/tfjs-converter";
import { CameraFetch } from "./CameraFetch.mjs";

// Credit to https://github.com/serengil/deepface :)
//  for the facial expression model!

const DATA_DIR = "./res/models/emotionsModel";
const TARGET_SIZE = { width: 48, height: 48 };

const buffer = document.createElement("canvas");

const EmotionDetector =
{
    preprocess(img, cv)
    {
        let dstB = new cv.Mat();

        // See https://github.com/serengil/deepface/blob/f36af9ffe74f4251e611d5f7bab692f43990ef92/deepface/commons/functions.py#L449
        cv.resize(img, dstB, TARGET_SIZE, 0, 0, cv.INTER_AREA);

        cv.imshow(buffer, dstB);

        let tensor = tf.browser.fromPixels(buffer, 1);
        tensor = tf.stack([tf.mul(tensor, tf.scalar(1/256.0))]);

        return tensor;
    },

    check(img, cv)
    {
        let tensor = EmotionDetector.preprocess(img, cv);
        return EmotionDetector.model.predict(tensor).data();
    },

    async init()
    {
        if (EmotionDetector.model)
        {
            console.log("Already loaded!");
            return;
        }

        EmotionDetector.model = await tf.loadLayersModel(DATA_DIR + "/model.json");
        console.log("Done!");
    },

    async test()
    {
        await EmotionDetector.init();

        await CameraFetch.openCVAvailable();
        console.log("Successfully loaded OpenCV.");
        
        //SubWindowHelper.alert("Loaded!", "Loaded OpenCV!!!!");
        document.querySelector("main").appendChild(CameraFetch.openCameraPreview(
            async (cv, src, dst) =>
            {
                let t = (new Date() * 1) / 1000;
                let x = Math.sin(t) * 100 + 100;
                let y = Math.cos(t) * 100 + 100;

                cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);

                let emotion = await EmotionDetector.check(dst, cv);
                cv.putText(dst, emotion + "", {x: x, y: y}, cv.FONT_HERSHEY_SIMPLEX, 1.0, [0, 255, 0, 255]);
            }
        ));
    }
};

export { EmotionDetector };