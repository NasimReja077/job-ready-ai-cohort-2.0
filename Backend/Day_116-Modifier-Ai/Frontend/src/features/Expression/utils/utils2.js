import {
    FaceLandmarker,
    FilesetResolver
} from "@mediapipe/tasks-vision";

// ✅ CHANGED
export const init = async ({ landmarkerRef, videoRef, streamRef }) => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    landmarkerRef.current = await FaceLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1
        }
    );

    streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    // ✅ FIX (wait for metadata)
    video.onloadedmetadata = async () => {
        try {
            await video.play();
        } catch (err) {
            console.warn("Video play blocked:", err);
        }
    };
};

export const detect = ({ landmarkerRef, videoRef, setExpression }) => {
    // always return value)
    if (!landmarkerRef.current || !videoRef.current) return "neutral";

    const results = landmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now()
    );

    // handle no face case)
    if (!results.faceBlendshapes?.length) return "neutral";

    const blendshapes = results.faceBlendshapes[0].categories;

    const getScore = (name) =>
        blendshapes.find((b) => b.categoryName === name)?.score || 0;

    const smileLeft = getScore("mouthSmileLeft");
    const smileRight = getScore("mouthSmileRight");
    const jawOpen = getScore("jawOpen");
    const browUp = getScore("browInnerUp");
    const frownLeft = getScore("mouthFrownLeft");
    const frownRight = getScore("mouthFrownRight");

    let currentExpression = "neutral"; 

    // ✅ CHANGED (better thresholds)
    if (smileLeft > 0.4 && smileRight > 0.4) {
        currentExpression = "happy";
    } else if (jawOpen > 0.3 && browUp > 0.2) {
        currentExpression = "surprised";
    } else if (frownLeft > 0.0001 && frownRight > 0.0001) {
        currentExpression = "sad";
    }

    setExpression(currentExpression);

    return currentExpression;
};