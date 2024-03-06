import nodemailer from "nodemailer";

export async function sendEmailService({
  to,
  subject,
  message,
  attachments = [],
} = {}) {
  //معلوماتي الي انا هبعت بيها الايميل بتاعي
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 587,
    secure: false,
    service:'gmail',

    auth: {
      user: "ibrahimazam933@gmail.com",
      pass: "mpfmirpqtfaqropn",
    },
  });

  //الحجات الي هتبقي جوا الايميل 
  const emailinfo =await transporter.sendMail({
    from: "ibrahimazam933@gmail.com",
    to: to ? to : "",
    subject: subject ? subject : "Hello",
    html: message ? message : " ",
    attachments,
  });
  console.log(emailinfo);
}

//===================================
