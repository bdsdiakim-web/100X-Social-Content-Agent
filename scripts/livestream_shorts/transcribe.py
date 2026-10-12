"""Boc bang tieng Viet bang Whisper chay LOCAL (faster-whisper, CPU).

Dung:  py transcribe.py audio.wav transcript.json --model small --lang vi
Xuat JSON: {duration, language, segments:[{start,end,text,words:[{start,end,word}]}]}
"""
import argparse
import json
import sys

from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument("audio")
ap.add_argument("out")
ap.add_argument("--model", default="small")  # tiny/base/small/medium/large-v3-turbo
ap.add_argument("--lang", default="vi")
ap.add_argument("--threads", type=int, default=0)  # 0 = tu chon
args = ap.parse_args()

def load_wav_16k(path):
    # Doc thang WAV 16kHz mono (da duoc FFmpeg chuan hoa) -> tranh phu thuoc PyAV, hay loi khi lech phien ban
    import wave
    import numpy as np
    with wave.open(path, "rb") as w:
        assert w.getframerate() == 16000 and w.getnchannels() == 1 and w.getsampwidth() == 2, "WAV phai 16kHz mono 16-bit"
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0


model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=args.threads)
segments, info = model.transcribe(
    load_wav_16k(args.audio) if args.audio.lower().endswith(".wav") else args.audio,
    language=args.lang,
    word_timestamps=True,
    vad_filter=True,            # bo doan im lang / ten, giam chay lo
    beam_size=1,                # nhanh nhat tren CPU
    condition_on_previous_text=False,  # tranh lap chu khi livestream dai
)

out = []
for s in segments:
    out.append({
        "start": round(s.start, 2),
        "end": round(s.end, 2),
        "text": s.text.strip(),
        "words": [
            {"start": round(w.start, 2), "end": round(w.end, 2), "word": w.word.strip()}
            for w in (s.words or [])
        ],
    })
    print(f"\r  da boc {s.end:7.0f}s / {info.duration:.0f}s", end="", file=sys.stderr, flush=True)

print(file=sys.stderr)
with open(args.out, "w", encoding="utf-8") as f:
    json.dump({"duration": info.duration, "language": info.language, "segments": out}, f, ensure_ascii=False)
