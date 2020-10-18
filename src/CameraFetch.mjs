"use strict";

import { JSHelper} from "./Lib/JSHelper.mjs";

const WAIT_TIME = 100;

const CameraFetch =
{
    VIDEO_QUERY_OPTIONS:
    {
        video: true,
    },
    // => Promise<OpenCV> when OpenCV becomes
    // available.
    openCVAvailable: async () =>
    {
        while (!window.cv)
        {
            await JSHelper.waitFor(WAIT_TIME);
        }

        // Ref: view-source:https://docs.opencv.org/4.5.0/utils.js
        if (cv.getBuildInformation)
        {
            return;
        }

        return await
        (() =>
        {
            let satisfied = false;
            let satisfy = null;

            console.log("Okay. Waiting...")

            if (cv.getBuildInformation)
            {
                satisfied = true;
            }

            cv['onRuntimeInitialized'] = () =>
            {
                if (satisfy)
                {
                    console.log("Satisfying...");
                    console.log(satisfy);
                    satisfy();
                }

                satisfied = true;
            }

            return new Promise((resolve, reject) =>
            {
                if (satisfied)
                {
                    resolve();

                    return;
                }

                satisfy = resolve;
            });
        })();
    },

    openCameraPreview: () =>
    {
        const container = document.createElement("div");

        const buffer = document.createElement("canvas");
        const bufferCtx = buffer.getContext('2d');

        const display = document.createElement("canvas");
        const displayCtx = display.getContext("2d");
        const videoView = document.createElement("video");

        (async () =>
        {
            const stream = await navigator.mediaDevices.getUserMedia(CameraFetch.VIDEO_QUERY_OPTIONS);

            videoView.srcObject = stream;
            videoView.play();

            let src = new cv.Mat(display.height, display.width, cv.CV_8UC4);
            let dst = new cv.Mat(display.height, display.width, cv.CV_8UC1);

            while (true)
            {
                await JSHelper.nextAnimationFrame();

                if (videoView.videoWidth === 0 || videoView.videoHeight === 0)
                {
                    displayCtx.fillStyle = "green";
                    displayCtx.fillRect(0, 0, displayCtx.canvas.width, displayCtx.canvas.height);

                    continue;
                }

                if (videoView.videoWidth !== display.width
                    || videoView.videoHeight !== display.height)
                {
                    display.width = videoView.videoWidth;
                    display.height = videoView.videoHeight;

                    buffer.width = display.width;
                    buffer.height= display.height;

                    
                    src = new cv.Mat(display.height, display.width, cv.CV_8UC4);
                    dst = new cv.Mat(display.height, display.width, cv.CV_8UC1);

                    videoView.width = display.width;
                    videoView.height = display.height;
                }

                bufferCtx.drawImage(videoView, 0, 0, buffer.width, buffer.height);
                
                src.data.set(bufferCtx.getImageData(0, 0, buffer.width, buffer.height).data);
                cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
                cv.imshow(display, dst);
                bufferCtx.fillRect(0, 0, 4, 4);
            }
        })();

        container.appendChild(display);
        container.appendChild(videoView);

        return container;
    },

    test: async () =>
    {
        await CameraFetch.openCVAvailable();
        console.log("Successfully loaded OpenCV.");
        
        //SubWindowHelper.alert("Loaded!", "Loaded OpenCV!!!!");
        document.querySelector("main").appendChild(CameraFetch.openCameraPreview());
    }
};

export default CameraFetch;
export { CameraFetch };