"use strict";

import "./Lib/JSHelper.mjs";

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

        const display = document.createElement("canvas");
        const videoView = document.createElement("video");

        (async () =>
        {
            const stream = await navigator.mediaDevices.getUserMedia(CameraFetch.VIDEO_QUERY_OPTIONS);

            videoView.srcObject = stream;
            videoView.play();
        })();

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