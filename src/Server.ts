import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import { Express } from "express"
import fs from "fs"

export default function newServer(): Express {

	const server = express()
	server.use(cors())
	server.use(express.json({ limit: '100mb' }))
	server.use(express.urlencoded({ extended: true, limit: '100mb' }))
	server.use(cookieParser())

	const dir = "./public"
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir)
	}

	server.use('/public', express.static('public'))

	return server

}
