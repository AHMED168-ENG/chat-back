const answerEmailTemplate = ({ question, answer, lang }) => {
  const text = `
      Your question:
      ${question}
      
      Answer:
      ${answer}
    `;

  const html = `
      <h2>${
        lang === "ar"
          ? "تم الإجابة على سؤالك"
          : "Your Question Has Been Answered"
      }</h2>
      <p><strong>${
        lang === "ar" ? "السؤال" : "Question"
      }:</strong> ${question}</p>
      <p><strong>${lang === "ar" ? "الإجابة" : "Answer"}:</strong> ${answer}</p>
    `;

  return { text, html };
};

module.exports = { answerEmailTemplate };
