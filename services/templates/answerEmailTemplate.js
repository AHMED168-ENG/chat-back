const answerEmailTemplate = ({ question, answer, lang }) => {
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const fontFamily = isArabic
    ? "'Noto Sans Arabic', sans-serif"
    : "'Roboto', sans-serif";
  const textAlign = isArabic ? "right" : "left";

  const text = `
${isArabic ? "تم الإجابة على سؤالك" : "Your Question Has Been Answered"}

${isArabic ? "السؤال" : "Question"}:
${question}

${isArabic ? "الإجابة" : "Answer"}:
${answer}

${
  isArabic
    ? "إذا كان لديك المزيد من الأسئلة، يرجى التواصل معنا."
    : "If you have more questions, please reach out to us."
}
${isArabic ? "فريق الدعم" : "Support Team"}
`;

  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${
    isArabic ? "تم الإجابة على سؤالك" : "Your Question Has Been Answered"
  }</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: ${fontFamily};
      background-color: #f4f4f9;
      color: #333;
      direction: ${dir};
      text-align: ${textAlign};
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #007bff;
      padding: 20px;
      text-align: center;
    }
    .header img {
      max-width: 150px;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      margin-top: 10px;
    }
    .content {
      padding: 30px;
    }
    .content h2 {
      font-size: 20px;
      color: #007bff;
      margin-bottom: 15px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 15px;
    }
    .content .question, .content .answer {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .content strong {
      color: #333;
    }
    .cta {
      text-align: center;
      margin: 20px 0;
    }
    .cta a {
      display: inline-block;
      padding: 12px 24px;
      background-color: #007bff;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 700;
    }
    .cta a:hover {
      background-color: #0056b3;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .footer a {
      color: #007bff;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 10px;
      }
      .content {
        padding: 20px;
      }
      .header h1 {
        font-size: 20px;
      }
      .content h2 {
        font-size: 18px;
      }
      .content p {
        font-size: 14px;
      }
      .cta a {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${
        isArabic ? "تم الإجابة على سؤالك" : "Your Question Has Been Answered"
      }</h1>
    </div>
    <div class="content">
      <h2>${isArabic ? "تفاصيل السؤال" : "Question Details"}</h2>
      <div class="question">
        <p><strong>${isArabic ? "السؤال" : "Question"}:</strong> ${question}</p>
      </div>
      <div class="answer">
        <p><strong>${isArabic ? "الإجابة" : "Answer"}:</strong> ${answer}</p>
      </div>
  
    </div>

  </div>
</body>
</html>
`;

  return { text, html };
};

module.exports = { answerEmailTemplate };
