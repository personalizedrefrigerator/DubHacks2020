"use strict";

import "./Lib/JSHelper.js";

const CameraFetch =
{
    // => Promise<OpenCV> when OpenCV becomes
    // available.
    openCVAvailable: async () =>
    {
        while (!window.cv)
        {
            await JSHelper.nextAnimationFrame();
        }

        let cv = window.cv;
        console.log("window.cv!!!!!!");

        // Ref: view-source:https://docs.opencv.org/4.5.0/utils.js
        if (cv.getBuildInformation)
        {
            return cv;
        }

        return await
        (() =>
        {
            let satisfied = false;
            let satisfy = null;

            console.log("Okay. Waiting...")

            if (typeof cv == "function")
            {
                cv = cv();
            }

            if (cv.getBuildInformation)
            {
                satisfied = true;
            }

            cv['onRuntimeInitialized'] = () =>
            {
                if (satisfy)
                {
                    satisfy(cv);
                }

                satisfied = true;
            }

            return new Promise((resolve, reject) =>
            {
                if (satisfied)
                {
                    resolve(cv);
                }

                satisfy = resolve;
            });
        })();
    },

    test: async () =>
    {
        console.log("Waiting for cv...");

        let cv = await CameraFetch.openCVAvailable();

        console.log("Got OpenCV!!!");
        
        SubWindowHelper.alert("Loaded!", "Loaded OpenCV!!!!");
    }
};

export default CameraFetch;
export { CameraFetch };