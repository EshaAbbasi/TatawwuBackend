const path = require("path");
const PDFDocument = require("pdfkit");
const bidi = require("bidi-js")();

const red = "#CE1126";
const arabic = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/;
const letter = /[\p{Letter}\p{Mark}]/u;
const features = { rtla: false, rtlm: false };

// Order mixed Arabic/English runs, then let PDFKit join the Arabic letters.
const textRuns = (text, direction) => {
  const levels = bidi.getEmbeddingLevels(text, direction);
  const indices = bidi.getReorderedIndices(text, levels);
  const mirrored = bidi.getMirroredCharactersMap(text, levels);
  const runs = [];

  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    const character = mirrored.get(index) || text[index];
    if (arabic.test(character) && letter.test(character)) {
      let start = index;
      while (
        i + 1 < indices.length && indices[i + 1] === start - 1 &&
        arabic.test(text[start - 1]) && letter.test(text[start - 1])
      ) {
        start--;
        i++;
      }
      runs.push({ text: text.slice(start, index + 1), font: "Arabic" });
    } else {
      const font = arabic.test(character) ? "Arabic" : "Latin";
      const previous = runs[runs.length - 1];
      if (font === "Latin" && previous && previous.font === font) {
        previous.text += character;
      } else {
        runs.push({ text: character, font });
      }
    }
  }
  return runs;
};

const textWidth = (document, text) => textRuns(text).reduce((width, run) => {
  document.font(run.font);
  return width + document.widthOfString(run.text, { features });
}, 0);

const wrapText = (document, text, width) => {
  const lines = [];
  let line = "";
  for (const word of text.trim().split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && textWidth(document, candidate) > width) {
      lines.push(line);
      line = "";
    }
    if (textWidth(document, word) > width) {
      for (const character of word) {
        if (line && textWidth(document, line + character) > width) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const centeredField = (document, text, top, height, size, width = 670) => {
  text = String(text || "").trim();
  if (!text) return;
  document.fontSize(size);
  let lines = wrapText(document, text, width);
  while (lines.length * size * 1.4 > height) {
    size *= 0.9;
    document.fontSize(size);
    lines = wrapText(document, text, width);
  }

  const lineHeight = size * 1.4;
  const direction = bidi.getEmbeddingLevels(text).paragraphs[0].level % 2 ? "rtl" : "ltr";
  let baseline = top + (height - lines.length * lineHeight) / 2 + size;
  for (const line of lines) {
    let x = (document.page.width - textWidth(document, line)) / 2;
    for (const run of textRuns(line, direction)) {
      document.font(run.font).text(run.text, x, baseline, {
        lineBreak: false,
        baseline: "alphabetic",
        features,
      });
      x += document.widthOfString(run.text, { features });
    }
    baseline += lineHeight;
  }
};

const createCertificate = ({ recipientName, campaignTitle, organizationName, endsAt }) => {
  const document = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
  document.registerFont("Arabic", path.join(__dirname, "../assets/fonts/NotoSansArabic-Regular.ttf"));
  document.registerFont("Latin", path.join(__dirname, "../assets/fonts/NotoSans-Regular.ttf"));
  document.registerFont("LatinBold", path.join(__dirname, "../assets/fonts/NotoSans-Bold.ttf"));
  const width = document.page.width;
  const height = document.page.height;

  document.rect(0, 0, width, height).fill("white");
  document.lineWidth(2).strokeColor(red).rect(24, 24, width - 48, height - 48).stroke();
  document.lineWidth(0.5).rect(31, 31, width - 62, height - 62).stroke();
  for (const side of [-1, 1]) {
    const edge = side === -1 ? 45 : width - 45;
    const inward = -side;
    document.moveTo(edge, 45).lineTo(edge + inward * 64, 45);
    for (let point = 1; point <= 10; point++) {
      document.lineTo(edge + inward * (point % 2 ? 54 : 64), 45 + point * 3.4);
    }
    document.lineTo(edge, 79).closePath().fill(red);
  }
  document.image(path.join(__dirname, "../assets/certificates/bahrain-coat-of-arms.png"),
    (width - 70) / 2, 51, { fit: [70, 75], align: "center" });

  document.font("LatinBold").fontSize(26).fillColor(red)
    .text("CERTIFICATE OF PARTICIPATION", 55, 149, { width: width - 110, align: "center" });
  document.font("Latin").fontSize(11).fillColor("#555555")
    .text("Presented to", 55, 204, { width: width - 110, align: "center" });
  document.fillColor("#222222");
  centeredField(document, recipientName, 224, 74, 27);

  document.font("Latin").fontSize(11).fillColor("#555555")
    .text("For participating in", 55, 311, { width: width - 110, align: "center" });
  document.fillColor("#222222");
  centeredField(document, campaignTitle, 330, 61, 19);

  if (organizationName) {
    document.font("Latin").fontSize(11).fillColor("#555555")
      .text("Organized by", 55, 406, { width: width - 110, align: "center" });
    document.fillColor("#222222");
    centeredField(document, organizationName, 422, 44, 16);
  }

  const date = new Date(endsAt).toLocaleDateString("en-GB", {
    timeZone: "Asia/Bahrain", day: "numeric", month: "long", year: "numeric",
  });
  document.font("Latin").fontSize(11).fillColor("#555555")
    .text(`Completed on ${date} (Bahrain time)`, 55, 485, { width: width - 110, align: "center" });
  document.strokeColor(red).lineWidth(0.5).moveTo(270, 520).lineTo(width - 270, 520).stroke();
  document.font("Latin").fontSize(11).fillColor(red)
    .text("Tatawwu' - Volunteering in Bahrain", 55, 539, { width: width - 110, align: "center" });

  return document;
};

module.exports = createCertificate;
