import nodemailer from "nodemailer"
import TemplateMail from "./../utils/TemplateMail"
import { User } from "./../rules/user/models/User"
require("dotenv").config()

export async function sendResetPasswordEmail(user: User, code: string) {
	try {
		const message = new TemplateMail(code, user.firstname, user.gender)
		const send = await mail(user.email, message.resetPassword(), "ConectPets 🐾 - Redefinir Senha")
		console.log("Email sent: %s", send.messageId)
		return send
	} catch (error) {
		console.log("Error sending email:", error)
		return error
	}
}

export async function sendWelcomeEmail(user: User, code: string) {
	try {
		const message = new TemplateMail(code, user.firstname, user.gender)
		const send = await mail(user.email, message.register(), `ConetcPets 🐾 - Seja bem vind${user.gender === 'M' ? 'o' : 'a'}!`)
		console.log("Email sent: %s", send.messageId)
		return send
	} catch (error) {
		console.log("Error sending email:", error)
		return error
	}
}

async function mail(email: string, message: any, subject: string) {
	const transporter = nodemailer.createTransport(
		{
			service: "gmail",
			auth: {
				user: process.env.SMTP_EMAIL, // generated ethereal user
				pass: process.env.SMTP_EMAIL_PASSWORD, // generated ethereal password
			},
		})

	// send mail with defined transport object
	const info = await transporter.sendMail({
		from: '"ConectPets" <no-reply@conectpets.com.br>', // sender address
		to: email, // list of receivers
		subject: subject, // Subject line
		html: message
	})

	return info
}
