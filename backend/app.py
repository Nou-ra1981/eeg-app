from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from scipy.signal import butter, filtfilt

app = Flask(__name__)
CORS(app)

def bandpass_filter(data, lowcut=1.0, highcut=30.0, fs=100.0, order=5):
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = butter(order, [low, high], btype='band')
    return filtfilt(b, a, data)

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    df = pd.read_csv(file)

    timestamps = pd.to_datetime(df["UTC Timestamp"]).astype(str).tolist()
    original_a3 = df["EEG Signal A3 (uV)"].tolist()
    original_a4 = df["EEG Signal A4 (uV)"].tolist()
    filtered_a3 = bandpass_filter(df["EEG Signal A3 (uV)"])
    filtered_a4 = bandpass_filter(df["EEG Signal A4 (uV)"])

    return jsonify({
        "original": {
            "timestamps": timestamps,
            "A3": original_a3,
            "A4": original_a4
        },
        "filtered": {
            "timestamps": timestamps,
            "A3": filtered_a3.tolist(),
            "A4": filtered_a4.tolist()
        }
    })

if __name__ == '__main__':
    app.run(port=8000)
