import face_recognition
import cv2
import numpy as np
import os
import pandas as pd
import time
from mongo import store_db
import sys
import beepy
import urllib.request


if(sys.argv[3] == "empty"):
    video_capture = cv2.VideoCapture(0)
else:
    # url = 'http://142.128.0.103:5000/shot.jpg'  # for eg.
    url = 'http://'+ sys.argv[3] +'/shot.jpg'

# Initialize some variables
known_face_encodings = []
known_face_roll_no = []
face_locations = []
face_encodings = []
face_names = []
process_this_frame = True
attendance_record = set([])
roll_record = {}

# Rows in log file
name_col = []
roll_no_col = []
time_col = []
classid_col=[]

df = pd.read_excel("students" + os.sep + "students_db.xlsx")

for key, row in df.iterrows():
    roll_no = row["roll_no"]
    name = row["name"]
    image_path = row["image"]
    classid=row["classid"]
    roll_record[roll_no] = name
    try:
        student_image = face_recognition.load_image_file("../public/assets/uploads" + os.sep + image_path)
        student_face_encoding = face_recognition.face_encodings(student_image)[0]
        known_face_encodings.append(student_face_encoding)
        known_face_roll_no.append(roll_no)
    except:
        print("../public/assets/uploads" + os.sep + image_path+" Student has not uploaded an image")
        continue

    

k=0
while True:
    try:
        if(sys.argv[3] == "empty"):
            # Grab a single frame of video
            ret, frame = video_capture.read()
        else:
            imgResp = urllib.request.urlopen(url)
            imgNp = np.array(bytearray(imgResp.read()), dtype=np.uint8)
            frame = cv2.imdecode(imgNp, -1)

        frame = cv2.flip(frame, 2)

        # Resize frame of video to 1/4 size for faster face recognition processing
        small_frame = cv2.resize(frame, (0, 0), fx=1, fy=1)

        # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
        rgb_small_frame = small_frame[:, :, ::-1]

        # Only process every other frame of video to save time
        if process_this_frame:
            # Find all the faces and face encodings in the current frame of video
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(
                rgb_small_frame, face_locations
            )

            face_names = []
            for face_encoding in face_encodings:
                # See if the face is a match for the known face(s)
                matches = face_recognition.compare_faces(
                    known_face_encodings, face_encoding, tolerance=0.5
                )
                name = "Unknown"

                # # If a match was found in known_face_encodings, just use the first one.
                # if True in matches:
                #     first_match_index = matches.index(True)
                #     name = known_face_roll_no[first_match_index]

                # Or instead, use the known face with the smallest distance to the new face
                face_distances = face_recognition.face_distance(
                    known_face_encodings, face_encoding
                )
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    roll_no = known_face_roll_no[best_match_index]
                    # add this to the log
                    name = roll_record[roll_no]
                    if roll_no not in attendance_record:
                        attendance_record.add(roll_no)
                        beepy.beep(sound=1)
                        print(name, roll_no)
                        name_col.append(name)
                        roll_no_col.append(roll_no)
                        #classid_col.append(classid)
                        curr_time = time.localtime()
                        curr_clock = time.strftime("%H:%M:%S", curr_time)
                        time_col.append(curr_clock)

                face_names.append(name)

        process_this_frame = not process_this_frame
        # Display the results
        for (top, right, bottom, left), name in zip(face_locations, face_names):
            # Scale back up face locations since the frame we detected in was scaled to 1/4 size
            # top *= 2
            # right *= 2
            # bottom *= 2
            # left *= 2

            # Draw a box around the face
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

            # Draw a label with a name below the face
            cv2.rectangle(
                frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED
            )
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)



        # Display the resulting image
        cv2.imshow("Video", frame)

    except Exception as e:
        print("Something is miss interpreted :" , e)

    # Hit 'q' on the keyboard to quit!
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# print(name_col)
# print(roll_no_col)
# print(time_col)

# Printing to log file
classid_col.append(classid)
data = {"Name": name_col, "RollNo": roll_no_col, "Time": time_col, "Class": classid_col}
print(data)

curr_time = time.localtime()
curr_clock = time.strftime("%c", curr_time)
#print(curr_clock)
file_name=""
space=0
for i in range(0,len(curr_clock)):
    s=curr_clock[i]
    if s==' ' and curr_clock[i+1]==' ':
        continue
    else:
        file_name+=s

log_file_name = file_name

# if(data["Name"]):
#     store_db(log_file_name, sys.argv[1], data)

#store record regardless of empty or full
store_db(log_file_name, sys.argv[1], data)
# print(sys.argv[2])


if(sys.argv[3] == "empty"):
    # Release handle to the webcam
    video_capture.release()
cv2.destroyAllWindows()
