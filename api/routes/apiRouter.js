const express = require ('express') 

let apiRouter = express.Router()

const endpoint = '/'

const knex = require('knex')({
    client: 'pg',
    connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    }
   });

const lista_produtos = {
 produtos: [
 { id: 1, descricao: "Produto 1", valor: 5.00, marca: "marca " },
 { id: 2, descricao: "Produto 2", valor: 5.00, marca: "marca " },
 { id: 3, descricao: "Produto 3", valor: 5.00, marca: "marca " },
 { id: 4, descricao: "Produto 4", valor: 5.00, marca: "marca " },
 { id: 5, descricao: "Produto 5", valor: 5.00, marca: "marca " },
 ]
}

apiRouter.get (endpoint + 'produtos', function (req, res) {
 //res.status(200).json (lista_produtos)
 knex
     .select ('*')
     .from ('produto')
     .then (results => {
        res.status(200).json(results)
     })
     .catch(err => {
        res.status(500).json ({ message: `Erro ao obter produtos: ${err.message}` })
     })
})

apiRouter.get(endpoint + 'produtos/:id', (req, res) => {
    
    // let id = parseInt(req.params.id)
    // let idx = lista_produtos.produtos.findIndex (elem => elem.id === id)

    // if (idx == -1) {
    //     res.status(404).json ({message: `Produto nao encontrado. ID: ${id}`})
    // } else {
    //     res.status(200).json(lista_produtos.produtos[idx])
    // }

    knex
    .select ('*')
    .from ('produto')
    .then (results => {
       if (results.length) {
        let produto = results[0]
        res.status(200).json(produto)
       } else {
        res.status(404).json({message: `Produto nao encotnrado`})
       }
    })
    .catch(err => {
       res.status(500).json ({ message: `Erro ao obter produtos: ${err.message}`})
    })

})

apiRouter.post(endpoint + 'produtos', express.json(), (req, res) => {
    // if (req.body) {
    //     let newId = Math.max.apply(Math, lista_produtos.produtos.map(function(o) {return o.id; }))
    //     let produto = req.body
    //     produto.id = newId + 1
    //     lista_produtos.produtos.push (produto)

    //     res.status(201).json({
    //         message: ` Produto incluido com sucesso`,
    //         id: produto.id
    //     })

    // }

    if (req.body) {
        knex ('produto')
        .insert({
            descricao: req.body.descricao,
            valor: req.body.valor,
            marca: req.body.marca
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
    }

})

apiRouter.delete(endpoint + 'produtos/:id', (req, res) => {
    let id = parseInt(req.params.id)
    let idx = lista_produtos.produtos.findIndex (elem => elem.id === id)

    if (idx == -1) {
        res.status(404).json ({message: `Produto nao encontrado. ID: ${id}`})
    } else {
       lista_produtos.splice(idx, 1)

        res.status(201).json({
            message: ` Produto deletado com sucesso. ID: ${idx}`
        })
    }
})

apiRouter.put(endpoint + 'produtos/:id', (req, res) => {
    let id = parseInt(req.params.id)
    let idx = lista_produtos.produtos.findIndex (elem => elem.id === id)

    if (idx == -1) {
        res.status(404).json ({message: `Produto nao encontrado. ID: ${id}`})
    } else {
        let item = lista_produtos.produtos[idx]
        item.descricao = req.body.descricao
        item.valor = req.body.valor
        item.marca = req.body.marca

        res.status(201).json({message: `Produto alterado. ID: ${item.id}`})
    }
})

module.exports = apiRouter;