"use strict";

import "./Lib/JSHelper.mjs";

const WAIT_TIME = 100;

const CameraFetch =
{
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

    test: async () =>
    {
        await CameraFetch.openCVAvailable();
        console.log("Successfully loaded OpenCV.");
        
        //SubWindowHelper.alert("Loaded!", "Loaded OpenCV!!!!");
    }
};

export default CameraFetch;
export { CameraFetch };