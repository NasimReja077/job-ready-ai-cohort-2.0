import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export const FaceExpression = () => {

  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  const [expression, setExpression] = useState("Click to Detect...");

  const init = async () => {

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
      },
      runningMode: "VIDEO",
      outputFaceBlendshapes: true,
      numFaces: 1,
    });

    streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });

    videoRef.current.srcObject = streamRef.current;
    await videoRef.current.play();
  };

  const detect = () => {

    if (!landmarkerRef.current || !videoRef.current) return;

    const results = landmarkerRef.current.detectForVideo(
      videoRef.current,
      performance.now()
    );

    if (results.faceBlendshapes?.length > 0) {

      const blendshapes = results.faceBlendshapes[0].categories;

      const getScore = (name) =>
        blendshapes.find((b) => b.categoryName === name)?.score || 0;

      const smileLeft = getScore("mouthSmileLeft");
      const smileRight = getScore("mouthSmileRight");
      const jawOpen = getScore("jawOpen");
      const browUp = getScore("browInnerUp");
      const frownLeft = getScore("mouthFrownLeft");
      const frownRight = getScore("mouthFrownRight");

      let currentExpression = "Neutral 😐";

      if (smileLeft > 0.5 && smileRight > 0.5) {
        currentExpression = "Happy 😄";
      }
      else if (jawOpen > 0.6 && browUp > 0.5) {
        currentExpression = "Surprised 😲";
      }
      else if (frownLeft > 0.2 && frownRight > 0.2) {
        currentExpression = "Sad 😢";
      }

      setExpression(currentExpression);
    }

    animationRef.current = requestAnimationFrame(detect);
  };

  const startDetect = () => {
    detect();
  };

  const stopDetect = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  useEffect(() => {

    init();

    return () => {

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };

  }, []);

  return (
    <div style={{ textAlign: "center" }}>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "400px", borderRadius: "12px" }}
      />

      <h2>{expression}</h2>

      <button onClick={startDetect}>Detect Expression</button>

      <button onClick={stopDetect}>Stop</button>

    </div>
  );
};