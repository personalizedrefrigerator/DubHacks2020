import * as tf from "@tensorflow/tfjs";
import { loadGraphModel} from "@tensorflow/tfjs-converter";
import { CameraFetch } from "./CameraFetch.mjs";

// Credit to https://github.com/serengil/deepface :)
//  for the facial expression model!

const DATA_DIR = "./res/models/emotionsModel";
const TARGET_SIZE = { x: 224, y: 224 };

const buffer = document.createElement("canvas");

const EmotionDetector =
{
    preprocess(img, cv)
    {
        // See https://github.com/serengil/deepface/blob/f36af9ffe74f4251e611d5f7bab692f43990ef92/deepface/commons/functions.py#L449
        cv.cvtColor(img, img, cv.COLOR_BGR2GRAY);
        cv.resize(img, img, TARGET_SIZE);

        cv.imshow(buffer, img);

        let tensor = tf.browser.fromPixels(buffer, 1);
        tensor = tf.multiply(tensor, 1/256.0)

        return tensor;
    },

    check(img)
    {
        let tensor = EmotionDetector.preprocess(img);
        return EmotionDetector.model.exec(tensor);
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
            (cv, src, dst) =>
            {
                let t = (new Date() * 1) / 1000;
                let x = Math.sin(t) * 100 + 100;
                let y = Math.cos(t) * 100 + 100;

                cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
                cv.putText(dst, "Text", {x: x, y: y}, cv.FONT_HERSHEY_SIMPLEX, 1.0, [0, 255, 0, 255]);
            }
        ));
    }
};

export { EmotionDetector };