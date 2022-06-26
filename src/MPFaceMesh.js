import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import {
  FaceMesh,
  FACEMESH_FACE_OVAL
} from "@mediapipe/face_mesh/face_mesh";
import { drawConnectors } from "@mediapipe/drawing_utils/drawing_utils";
import { Camera } from "@mediapipe/camera_utils/camera_utils";

import Card from 'react-bootstrap/Card'
import ScreenSize from "./components/SceenSize";


const MPFaceMesh = () => {

  const [windowDimenion, detectHW] = useState({
    winWidth: window.innerWidth,
    winHeight: window.innerHeight,
  })

  const [left_coordx, setLeft_]

  const detectSize = () => {
    detectHW({
      winWidth: window.innerWidth,
      winHeight: window.innerHeight,
    })
  }

  useEffect(() => {
    window.addEventListener('resize', detectSize)

    return () => {
      window.removeEventListener('resize', detectSize)
    }
  }, [windowDimenion])



  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        console.log(`${file}`);
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`;
      },
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    faceMesh.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video });
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  }, []);

  const onResults = (results) => {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
    canvasCtx.translate(videoWidth, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    if (results.multiFaceLandmarks) {
      console.log('Found face');

      for (const landmarks of results.multiFaceLandmarks){
        //results.multiFaceLandmarks contains the landmarks for each face
        // Landmark 226 and 446 used as right and left respectively

        console.log(`left point: ${landmarks[226].x}`);
        console.log(`right point: ${landmarks[446].x}`);

        drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
          color: "#E0E0E0",
        });
      }

    }else{
      console.log("Face not found in frame")
    }
    canvasCtx.restore();
  };

  return (
    <div>
      <Card>
        <div>
          <Webcam
            audio={false}
            mirrored={true}
            ref={webcamRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: "0",
              right: "0",
              textAlign: "center",
              zindex: 9,
              // width: windowDimenion.winWidth,
              height: windowDimenion.winHeight *.7,
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: "0",
              right: "0",
              textAlign: "center",
              zindex: 9,
              // width: windowDimenion.winWidth,
              height: windowDimenion.winHeight *.7,
            }}
          ></canvas>
        </div>
      </Card>
      <div>
        <Card>
          <Card.Body>{}</Card.Body>
        </Card>
        <h1 id="left_coordy"> jet</h1>
        <h1 id="left_coordx">"hey</h1>
      </div>
    </div>
  );
};

export default MPFaceMesh;
