import React, { useState, useRef } from "react";
import { Container, VStack, Text, Button, IconButton, useToast } from "@chakra-ui/react";
import { FaVideo, FaStop, FaUpload } from "react-icons/fa";

const Index = () => {
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const toast = useToast();

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    mediaRecorderRef.current = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      setVideoBlob(blob);
      videoRef.current.srcObject = null;
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const uploadVideo = async () => {
    if (!videoBlob) {
      toast({
        title: "No video to upload",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", videoBlob, "recorded_video.mp4");

    try {
      const response = await fetch("https://example.com/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json().catch(() => {
        throw new Error("Invalid JSON response");
      });
      console.log("Upload successful:", data);
      toast({
        title: "Upload successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Process the response from the server
      // For example, display the analysis result
      console.log("Video analysis:", data.analysis);
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Upload failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4}>
        <Text fontSize="2xl">Video Recording and Analysis</Text>
        <video ref={videoRef} width="640" height="480" autoPlay muted />
        {!recording ? <IconButton aria-label="Start Recording" icon={<FaVideo />} size="lg" onClick={startRecording} /> : <IconButton aria-label="Stop Recording" icon={<FaStop />} size="lg" onClick={stopRecording} />}
        <Button leftIcon={<FaUpload />} colorScheme="blue" onClick={uploadVideo} isDisabled={!videoBlob}>
          Upload Video
        </Button>
      </VStack>
    </Container>
  );
};

export default Index;
