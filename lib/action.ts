'use server';

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_KEY,
  },
});

const MAX_FILE_SIZE = 1024 * 1024 * 4; // 4MB

export const sendEmail = async (prevState: any, formData: FormData) => {
  try {
    const { name, file } = Object.fromEntries(formData);

    // 간단한 유효성 검사
    if (!name || !file) {
      return { message: '모든 필드를 입력해주세요' };
    }

    let dataUrl;

    if (file instanceof File) {
      // 파일 크기 제한
      if (file.size > MAX_FILE_SIZE) {
        return { message: '파일 크기는 4MB 이하로 제한됩니다.' };
      }

      if (!file.type.includes('image')) {
        return { message: '이미지 파일만 전송 가능합니다.' };
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64String = buffer.toString('base64');

      dataUrl = `data:${file.type};base64,${base64String}`;
    } else {
      console.error('파일이 파일의 인스턴스가 아닙니다.');
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `문의하기: ${name}`,
      html: `<p>${name}</p>`,
      attachments: [{ path: dataUrl }],
    });

    console.log(name, dataUrl);
    console.log(name, file);
    // console.log('이메일 전송 성공');
    return { message: '이메일 전송 성공' };
  } catch (error) {
    console.error(error);
  }
};
