from pathlib import Path
import re
from rapidocr_onnxruntime import RapidOCR

CERT_DIR = Path("Certificate")

BAD_PATTERNS = [
    "certificate",
    "verify",
    "verify this",
    "credential",
    "issued",
    "instructor",
    "signature",
    "freecodecamp",
    "programming hero",
    "linkedin",
    "udemy",
    "coursera",
    "completion",
    "awarded",
    "presented",
]


def score_line(text: str, y: float, h: float, conf: float) -> float:
    t = text.strip()
    if len(t) < 6:
        return -10.0

    low = t.lower()
    if any(p in low for p in BAD_PATTERNS):
        return -5.0

    alpha_ratio = sum(ch.isalpha() for ch in t) / max(1, len(t))
    word_count = len(t.split())

    score = conf * 2.0
    score += min(h / 12.0, 2.5)
    score += min(word_count / 3.0, 2.0)
    score += alpha_ratio * 2.0

    # Prefer text appearing in upper-middle area where course titles usually are.
    if 40 <= y <= 260:
        score += 1.2
    elif y < 28 or y > 360:
        score -= 1.4

    # De-prioritize mostly numeric lines.
    digit_ratio = sum(ch.isdigit() for ch in t) / max(1, len(t))
    score -= digit_ratio * 2.5

    return score


def extract_title(results):
    candidates = []
    for row in results or []:
        points, text, conf = row
        y = sum(pt[1] for pt in points) / 4.0
        h = abs(points[3][1] - points[0][1])
        conf_f = float(conf)
        s = score_line(text, y, h, conf_f)
        if s > 0:
            candidates.append((s, text.strip()))

    if not candidates:
        return None

    candidates.sort(key=lambda x: x[0], reverse=True)
    return candidates[0][1]


def cert_num(path: Path) -> int:
    m = re.search(r"\d+", path.stem)
    return int(m.group()) if m else 9999


def main():
    ocr = RapidOCR()
    files = sorted([p for p in CERT_DIR.iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg"}], key=cert_num)

    out_path = Path("tools") / "cert_titles_extracted_map.txt"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with out_path.open("w", encoding="utf-8") as f:
        f.write("{\n")
        f.flush()
        for p in files:
            num = cert_num(p)
            result, _ = ocr(str(p))
            title = extract_title(result)
            if not title:
                continue
            safe = title.replace("\\", "\\\\").replace('"', '\\"')
            f.write(f'  {num}: {{ title: "{safe}" }},\n')
            f.flush()
        f.write("}\n")
        f.flush()

    print(out_path)


if __name__ == "__main__":
    main()
