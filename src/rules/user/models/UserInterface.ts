export interface UserInterface {

	id: string
	firstname: string
	lastname: string
	email: string
	cpf: string
	celular: string
	password: string
	birthday: string
	gender: string
	about?: string
	active?: boolean
	blocked?: boolean
	confirmation_code?: string
	confirmed?: boolean
	avatar?: string
	role: string
}
