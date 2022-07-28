export class User {

	public id: string
	public firstname: string
	public lastname: string
	public email: string
	public celular: string
	public password: string
	public confirmed: boolean
	public birthday: string
	public gender: string
	public about: string
	public active?: boolean
	public blocked?: boolean
	public confirmation_code?: string
	public avatar?: string
	public cpf: string

	constructor(id: string, firstname: string, lastname: string, email: string, celular: string, password: string, birthday: string,
		gender: string, about: string, confirmation_code: string, cpf: string) {
		this.id = id
		this.firstname = firstname
		this.lastname = lastname
		this.email = email
		this.celular = celular
		this.password = password
		this.birthday = birthday
		this.gender = gender
		this.about = about
		this.cpf = cpf
		this.confirmed = false
		this.confirmation_code = confirmation_code
	}

}
