# gemini-video-chat

VideoTrueAudioGeminiChat

Project Overview:
Develop a chat application leveraging Google GenAI APIs to record and upload video files. The application will record video with the spacebar, send these files to the model, and display verbose console output. It should exploit multimodal capabilities, focusing on qualities perceptible through video and audio that are not evident in text, such as tone, inflection, and non-verbal cues.

Implementation Steps:

1. Install necessary dependencies:

bash
Copy code
pip install google-generativeai python-dotenv opencv-python pyttsx3
2. Create a .env file in the project root:

plaintext
Copy code
GEMINI_API_KEY=AIzaSyCBRCcgTs3ynXMFUxoQY9izflwz8wqJ4KA
3. Create the main Python script:

python
Copy code
import os
import time
from dotenv import load_dotenv
import google.generativeai as genai
import cv2
import pyttsx3

# Load environment variables from .env file
load_dotenv()

# Configuration
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize TTS engine
tts_engine = pyttsx3.init()

# Upload function
def upload_to_gemini(path, mime_type=None):
    """Uploads the given file to Gemini."""
    file = genai.upload_file(path, mime_type=mime_type)
    print(f"Uploaded file '{file.display_name}' as: {file.uri}")
    return file

# Wait for files to be active
def wait_for_files_active(*files):
    """Waits for the given files to be active."""
    print("Waiting for file processing...")
    for name in (file.name for file in files):
        file = genai.get_file(name)
        while file.state.name == "PROCESSING":
            print(".", end="", flush=True)
            time.sleep(10)
            file = genai.get_file(name)
        if file.state.name != "ACTIVE":
            raise Exception(f"File {file.name} failed to process")
    print("...all files ready")
    print()

# Model configuration
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    safety_settings=safety_settings,
    generation_config=generation_config,
)

# Video recording function
def record_video(output_path):
    cap = cv2.VideoCapture(0)
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(output_path, fourcc, 20.0, (640, 480))

    print("Press spacebar to stop recording...")
    while cap.isOpened():
        ret, frame = cap.read()
        if ret:
            out.write(frame)
            cv2.imshow('Recording...', frame)
            if cv2.waitKey(1) & 0xFF == ord(' '):  # Press space to stop
                break
        else:
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()

def process_video(video_path):
    video_file = upload_to_gemini(video_path, mime_type="video/mp4")
    wait_for_files_active(video_file)
    return video_file

def get_video_analysis(video_file):
    chat_session = model.start_chat(
        history=[
            {
                "role": "user",
                "parts": [video_file],
            },
        ]
    )
    
    response = chat_session.send_message("Tell me about this video.")
    return response

def speak_text(text):
    tts_engine.say(text)
    tts_engine.runAndWait()

# Main function to run the process
def main():
    video_path = "recorded_video.mp4"
    print("Press spacebar to start recording...")
    while True:
        if cv2.waitKey(1) & 0xFF == ord(' '):  # Press space to start
            break

    record_video(video_path)
    print("Video recorded. Uploading to Gemini...")
    video_file = process_video(video_path)
    response = get_video_analysis(video_file)
    print(response.text)
    speak_text(response.text)

if __name__ == "__main__":
    main()
Important Notes:

Ensure OpenCV and pyttsx3 are installed for video recording and TTS:
bash
Copy code
pip install opencv-python pyttsx3
This script starts video recording when the spacebar is pressed and stops it when the spacebar is pressed again. The recorded video is then uploaded to Gemini, and the response is printed and spoken using TTS.
Handle permissions for video recording robustly.
Conduct thorough testing to ensure recording, uploading, and responses work seamlessly.
Implement robust error handling to diagnose and fix issues efficiently.

## Collaborate with GPT Engineer

This is a [gptengineer.app](https://gptengineer.app)-synced repository 🌟🤖

Changes made via gptengineer.app will be committed to this repo.

If you clone this repo and push changes, you will have them reflected in the GPT Engineer UI.

## Tech stack

This project is built with React and Chakra UI.

- Vite
- React
- Chakra UI

## Setup

```sh
git clone https://github.com/GPT-Engineer-App/gemini-video-chat.git
cd gemini-video-chat
npm i
```

```sh
npm run dev
```

This will run a dev server with auto reloading and an instant preview.

## Requirements

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
