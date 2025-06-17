const sgMail = require("@sendgrid/mail");
require("dotenv").config();
const { answerEmailTemplate } = require("./templates/answerEmailTemplate");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("email_failed");
  }
};

const sendAnswerEmail = async ({ to, question, answer, lang }) => {
  const subject =
    lang === "ar" ? "تم الإجابة على سؤالك" : "Your Question Has Been Answered";
  const { text, html } = answerEmailTemplate({ question, answer, lang });

  return await sendEmail({ to, subject, text, html });
};

module.exports = {
  sendEmail,
  sendAnswerEmail,
};
