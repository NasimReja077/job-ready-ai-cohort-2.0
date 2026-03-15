import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
export const FaceExpression = () => {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  let stream;
  const [expression, setExpression] = useState("Detecting...");

  const init = async () => {

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
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

      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      detect();
    };

    const detect = () => {

      if (!landmarkerRef.current || !videoRef.current) return;
      const results = landmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now(),
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

        console.log(getScore("jawOpen"), getScore("browInnerUp"))
        
        let currentExpression = "Neutral";
        if (smileLeft > 0.5 && smileRight > 0.5) {
          currentExpression = "Happy 😄";
        } else if (jawOpen > 0.6 && browUp > 0.5) {
          currentExpression = "Surprised 😲";
        } else if (frownLeft > 0.5 && frownRight > 0.5) {
          currentExpression = "Sad 😢";
        }
        setExpression(currentExpression);
      }
      animationRef.current = requestAnimationFrame(detect);
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
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
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
      <button onClick={detect}>Detect expression</button>
    </div>
  );
};
