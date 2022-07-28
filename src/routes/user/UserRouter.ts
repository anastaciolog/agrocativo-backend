import bcrypt from "bcrypt"
import fs from "fs"
import { Express, NextFunction, Request, Response, Router } from "express"
import UserDatabase from "../../rules/user/database/UserDatabase"
import { UserDatabaseInterface } from "../../rules/user/database/UserDatabaseInterface"
import { User } from "../../rules/user/models/User"
import { RouterInterface } from "../RouterInterface"
import UserRouterInterface from "./UserRouterInterface"
import { ValidatorRequest } from "../../utils/ValidatorRequest"
import ErrorResponse from "../../utils/ErrorResponse"
import { uploadAvatarOptions } from "../../services/AvatarUploader"

require('dotenv').config()

export class UserRouter implements RouterInterface, UserRouterInterface {

	private router: Router
	private userDatabase: UserDatabaseInterface
	private validator: ValidatorRequest

	constructor(
		router: Router = Router(),
		userDatabase: UserDatabaseInterface = new UserDatabase(),
		validator: ValidatorRequest = new ValidatorRequest()) {

		this.router = router
		this.userDatabase = userDatabase
		this.validator = validator
	}

	public setupRoutes(server: Express): void {

		this.router.get("/user/:id", (request: Request, response: Response, next: NextFunction) => {
			this.getUser(request, response, next)
		})
		this.router.get("/user/search/:search", (request: Request, response: Response, next: NextFunction) => {
			this.searchUser(request, response, next)
		})
		this.router.get("/user", (request: Request, response: Response, next: NextFunction) => {
			this.getCurrentUser(request, response, next)
		})
		this.router.put("/user", (request: Request, response: Response, next: NextFunction) => {
			this.putUser(request, response, next)
		})
		this.router.post("/user/avatar", uploadAvatarOptions, (request: Request, response: Response, next: NextFunction) => {
			this.postUserAvatar(request, response, next)
		})
		this.router.post("/user/changePassword", (request: Request, response: Response, next: NextFunction) => {
			this.changePassword(request, response, next)
		})
		this.router.post("/user/block", (request: Request, response: Response, next: NextFunction) => {
			this.postBlock(request, response, next)
		})
		server.use("/api", this.router)
	}

	public async getUser(request: Request, response: Response, next: NextFunction): Promise<void> {
		const userId = request.params.id
		try {

			const user = await this.userDatabase.readUser(userId)

			if (user instanceof Error) {
				next(new ErrorResponse(9111, user.message, 500))
				return
			}

			// Success
			response.json(user)

		} catch (error: any) {
			next(new ErrorResponse(9113, error.message, 500))
		}
	}

	public async searchUser(request: Request, response: Response, next: NextFunction): Promise<void> {
		const search = request.params.search
		try {

			const user = await this.userDatabase.searchUser(search)

			if (user instanceof Error) {
				next(new ErrorResponse(9111, user.message, 500))
				return
			}

			// Success
			response.json(user)

		} catch (error: any) {
			next(new ErrorResponse(9113, error.message, 500))
		}
	}

	public async getCurrentUser(request: Request, response: Response, next: NextFunction): Promise<void> {
		const authenticatedUser = response.locals.userId
		try {

			const user = await this.userDatabase.readUser(authenticatedUser)

			if (user instanceof Error) {
				next(new ErrorResponse(9114, user.message, 500))
				return
			}

			// Success
			response.json(user)

		} catch (error: any) {
			next(new ErrorResponse(9115, error.message, 500))
		}
	}

	public async changePassword(request: Request, response: Response, next: NextFunction): Promise<void> {

		const userId = response.locals.userId

		const currentPassword = request.body.currentPassword
		const newPassword = request.body.newPassword

		if (!this.validator.validatePassword(newPassword)) {
			next(new ErrorResponse(9118, "Invalid new password", 400))
			return
		}

		try {
			const user = await this.userDatabase.readUser(userId)

			if (user instanceof Error) {
				next(new ErrorResponse(9119, user.message, 500))
				return
			}

			const match = await bcrypt.compare(currentPassword, user.password)

			if (!match) {
				next(new ErrorResponse(9120, "Wrong current password", 401))
				return
			}

			user.password = await bcrypt.hash(newPassword, 10)

			const updatedUser = await this.userDatabase.updateUser(user)

			if (updatedUser instanceof Error) {
				next(new ErrorResponse(9121, updatedUser.message, 500))
				return
			}
			// @ts-expect-error
			delete updatedUser.password

			// Success
			response.json(updatedUser)

		} catch (error: any) {
			next(new ErrorResponse(9122, error.message, 500))
		}
	}

	public async postUserAvatar(request: Request, response: Response, next: NextFunction): Promise<void> {

		const authenticatedUser = response.locals.userId
		const avatar = request.file
		let errors: any = []

		console.log(avatar)

		try {

			const user = await this.userDatabase.readUser(authenticatedUser)

			if (user instanceof Error) {
				errors.push(new ErrorResponse(9123, user.message, 500))
			}

			if (!avatar || !this.validator.validateFile(avatar)) {
				errors.push(new ErrorResponse(9124, "Invalid avatar", 400))
			}

			if (errors.length > 0) {

				fs.unlink(avatar?.path as string, (err) => {
					errors.push(err)
				})

				next(new ErrorResponse(9141, errors[0].message, 400))
				return
			}

			if (user.avatar && user.avatar !== "") {
				let path = user.avatar
				fs.unlink(path, () => { })
			}

			user.avatar = process.env.BASE_URL + (avatar as any).path

			await this.updateUser(user, response, next)


		} catch (error: any) {
			fs.unlink(avatar?.path as string, () => { })
			next(new ErrorResponse(9122, error.message, 500))
		}
	}

	public async putUser(request: Request, response: Response, next: NextFunction): Promise<void> {

		const userId = response.locals.userId
		const firstname = request.body.firstname
		const lastname = request.body.lastname
		const cpf = request.body.cpf
		const gender = request.body.gender
		const avatar = request.body.avatar
		const birthday = request.body.birthday
		const about = request.body.about
		const celular = request.body.celular
		

		if (about && !this.validator.validateAbout(firstname)) {
			next(new ErrorResponse(9128, "Invalid firstname", 400))
			return
		}
		if (about && !this.validator.validateAbout(lastname)) {
			next(new ErrorResponse(9128, "Invalid lastname", 400))
			return
		}
		
		if (cpf && !this.validator.validateCPF(cpf)) {
			next(new ErrorResponse(9128, "Invalid cpf", 400))
			return
		}
		if (gender && !this.validator.validateGender(gender)) {
			next(new ErrorResponse(9128, "Invalid gender", 400))
			return
		}

		if (birthday && !this.validator.validateDataNasc(birthday)) {
			next(new ErrorResponse(9128, "Invalid birthday", 400))
			return
		}

		if (celular && !this.validator.validateCelular(celular)) {
			next(new ErrorResponse(9127, "Invalid mobile/phone", 400))
			return
		}

		if (about && !this.validator.validateAbout(about)) {
			next(new ErrorResponse(9128, "Invalid about", 400))
			return
		}

		const user = await this.userDatabase.readUser(userId)

		if (user instanceof Error) {
			next(new ErrorResponse(9129, user.message, 500))
			return
		}

		console.log(user)

		if (firstname || lastname || avatar || celular || about) {
			user.firstname = firstname || user.firstname
			user.lastname = lastname || user.lastname
			user.cpf = cpf || user.cpf
			user.avatar = avatar || user.avatar
			user.gender = gender || user.gender
			user.birthday = birthday || user.birthday
			user.about = about || user.about
			user.celular = celular || user.celular

			await this.updateUser(user, response, next)
			return
		}

		// Fails if no parameter is present
		next(new ErrorResponse(9132, "Invalid parameters", 400))

	}

	private async updateUser(updatedUser: User, response: Response, next: NextFunction): Promise<void> {

		const session = response.locals.session

		try {
			const user = await this.userDatabase.updateUser(updatedUser)

			if (user instanceof Error) {
				next(new ErrorResponse(9131, user.message, 500))
				return
			}

			// @ts-expect-error
			delete user.password

			// Success
			response.json({
				token: session.token,
				user
			})

		} catch (error: any) {
			next(new ErrorResponse(9122, error.message, 500))
		}
	}

	private getUrl(request: Request): string {
		return request.protocol + "://" + request.get("host") + "/"
	}

	public async postBlock(request: Request, response: Response, next: NextFunction): Promise<void> {

		const userId = request.body.userId
		const blocked = request.body.blocked

		try {

			const user = await this.userDatabase.readUser(userId)

			if (user instanceof Error) {
				next(new ErrorResponse(1301, user.message, 500))
				return
			}

			const blockedUser = await this.userDatabase.toggleBlockedUser(userId, blocked)

			if (blockedUser instanceof Error) {
				next(new ErrorResponse(1301, blockedUser.message, 500))
				return
			}

			// @ts-expect-error
			delete blockedUser.password

			// Success
			response.status(201).json(blockedUser)

		} catch (error: any) {
			next(new ErrorResponse(1201, error.message, 500))
		}
	}

}
