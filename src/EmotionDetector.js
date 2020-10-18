import * as tf from "@tensorflow/tfjs";
import { CameraFetch } from "./CameraFetch.mjs";
import * as path from "path";

// Credit to https://github.com/serengil/deepface :)
//  for the facial expression model!

const DATA_DIR = path.join("/models", "/emotionsModel" );
const HAARCASCADE_SRC = path.join("/models", "/haarcascade_frontalface_default.xml" );
const TARGET_SIZE = { width: 48, height: 48 };
const EMPTY_SIZE = { width: 0, height: 0 };

const LABELS =
[
    "angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"
];

const buffer = document.createElement("canvas");

const EmotionDetector =
{
    cropToFaces(img, cv)
    {
        // Find faces.
        let faces = new cv.RectVector();

        //https://docs.opencv.org/4.5.0/d2/d99/tutorial_js_face_detection.html
        EmotionDetector.faceCascade.detectMultiScale(img, faces, 1.1, 3, 0, EMPTY_SIZE, EMPTY_SIZE);

        console.log(faces.size());

        // Crop to the first face (if there is one).
        if (faces.size() > 0)
        {
            img = img.roi(faces.get(0));
        }

        faces.delete();

        return img;
    },

    preprocess(img, cv)
    {
        let dstB = new cv.Mat();

        img = EmotionDetector.cropToFaces(img, cv);

        // See https://github.com/serengil/deepface/blob/f36af9ffe74f4251e611d5f7bab692f43990ef92/deepface/commons/functions.py#L449
        cv.resize(img, dstB, TARGET_SIZE, 0, 0, cv.INTER_AREA);

        cv.imshow(buffer, dstB);

        let tensor = tf.browser.fromPixels(buffer, 1);
        tensor = tf.stack([tf.mul(tensor, tf.scalar(1/256.0))]);

        return tensor;
    },

    async check(img, cv)
    {
        let tensor = EmotionDetector.preprocess(img, cv);
        let data = await EmotionDetector.model.predict(tensor).data();

        let max = 0, maxAt = 0;
        for (var i = 0; i < data.length; i++)
        {
            if (data[i] >= max)
            {
                max = data[i];
                maxAt = i;
            }
        }

        return LABELS[maxAt];
    },

    async init(cwd)
    {
        if (EmotionDetector.model)
        {
            return;
        }

        EmotionDetector.model = await tf.loadLayersModel(path.join( cwd,  DATA_DIR, "/model.json"));
        console.log("Done loading model!");

        const haarCascadeReq = await fetch(path.join( cwd, HAARCASCADE_SRC ));
        const haarCascadeData = await haarCascadeReq.text();

        cv.FS_createDataFile('/', "haar.xml", haarCascadeData, true, false, false);
        
        let faceCascade = new cv.CascadeClassifier();
        faceCascade.load("haar.xml");

        EmotionDetector.faceCascade = faceCascade;
    },

    async test(cwd)
    {
        await EmotionDetector.init(cwd);

        await CameraFetch.openCVAvailable();
        console.log("Successfully loaded OpenCV.");
        
        //SubWindowHelper.alert("Loaded!", "Loaded OpenCV!!!!");
        document.querySelector("main").appendChild(CameraFetch.openCameraPreview(
            async (cv, src, dst) =>
            {
                let t = (new Date()).getTime() / 1000;
                let x = 100;
                let y = 100;

                cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);

                let emotion = await EmotionDetector.check(dst, cv);
                cv.putText(dst, emotion + "", {x: x, y: y}, cv.FONT_HERSHEY_SIMPLEX, 1.0, [255 * (1 + Math.sin(t)) / 2, 0, 0, 255]);
            }
        ));
    }
};

export { EmotionDetector };