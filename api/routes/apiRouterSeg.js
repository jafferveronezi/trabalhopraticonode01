const express = require ('express') 
const bcryptjs = require('bcryptjs') 
const jwt = require('jsonwebtoken') 

let apiRouterSeg = express.Router()

const endpoint = '/'

const knex = require('knex')({
    client: 'pg',
    connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    }
   });

   apiRouterSeg.post('/login', (req, res) => {
        knex
            .select('*').from('usuario').where( { login: req.body.login })
            .then( usuarios => {
                if(usuarios.length) {
                    let usuario = usuarios[0]
                    let checkSenha = bcrypt.compareSync (req.body.senha, usuario.senha)

                if (checkSenha) {
                    var tokenJWT = jwt.sign({ 
                        id: usuario.id },
                        process.env.SECRET_KEY, {
                        expiresIn: 3600
                    })

                    res.status(200).json ({
                        id: usuario.id,
                        login: usuario.login,
                        nome: usuario.nome,
                        roles: usuario.roles,
                        token: tokenJWT
                    })

                    return
                }
                }
                res.status(200).json({ message: 'Login ou senha incorretos' })
            })

            .catch (err => {
                res.status(500).json({
                message: 'Erro ao verificar login - ' + err.message })
                })  
   })

   apiRouterSeg.post ('/register', (req, res) => {
    knex ('usuario')
        .insert({
            nome: req.body.nome,
            login: req.body.login,
            senha: bcrypt.hashSync(req.body.senha, 8),
            email: req.body.email
    }, ['id'])
        .then((result) => {
            let usuario = result[0]
            res.status(200).json({"id": usuario.id })
            return
    })
        .catch(err => {
            res.status(500).json({
            message: 'Erro ao registrar usuario - ' + err.message })
    })
   })


   let isAdmin = (req, res, next) => {
        knex
            .select ('*').from ('usuario').where({ id: req.usuarioId })
            .then ((usuarios) => {
                if (usuarios.length) {
                    let usuario = usuarios[0]
                    let roles = usuario.roles.split(';')
                    let adminRole = roles.find(i => i === 'ADMIN')

                if (adminRole === 'ADMIN') {
                    next()
                    return
                }
                else {
                    res.status(403).json({ message: 'Role de ADMIN requerida' })
                    return
                }
            }
            })
            .catch (err => {
            res.status(500).json({
            message: 'Erro ao verificar roles de usu??rio - ' + err.message })
            })
   }

   let checkToken = (req, res, next) => {
        let authToken = req.headers["authorization"]
        if (!authToken) {
            res.status(401).json({ message: 'Token de acesso requerida' })
        }
        else {
        let token = authToken.split(' ')[1]
        req.token = token
        }

        jwt.verify(req.token, process.env.SECRET_KEY, (err, decodeToken) => {
            if (err) {
                res.status(401).json({ message: 'Acesso negado'})
                return
            } 

            req.usuarioId = decodeToken.id
            next()
            })
} 

module.exports = apiRouterSeg;