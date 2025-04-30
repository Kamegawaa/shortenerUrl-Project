import { readFile, writeFile, appendFile } from 'fs/promises'
import Fastify from 'fastify'
import 'dotenv/config'

interface RequestBody {
    originalUrl: string
    shortUrl?: string
}

interface ResponsePath {
    shortUrl: string
}

const readDataBase = async (): Promise<any[]> => {
    let arr = []
    try {
        const content = await readFile(pathToFile, 'utf8')
        arr = JSON.parse(content)
        if (!Array.isArray(arr)) arr = []
    } catch (err) {
        arr = []
    }
    return arr
}

const generateCode = (length = 5) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const pathToFile = require('path').resolve(__dirname, 'data.json')

const fastify = Fastify({
    logger: true
})

fastify.get('/:shortUrl', async (request, reply) => {
    const { shortUrl } = request.params as ResponsePath
    const path = `http://localhost:3000/${shortUrl}`
    const database = await readDataBase()
    const found = database.find((item) => item.shortUrl === path)
    if (found) {
        reply.status(308).redirect(found.originalUrl)
    } else {
        reply.status(404).send({ msg: 'Not found' })
    }
})

fastify.post('/', async (request, reply) => {
    const database = await readDataBase()
    const body = request.body as RequestBody
    body.shortUrl = `http://localhost:3000/${generateCode()}`
    database.push(request.body)
    await writeFile(pathToFile, JSON.stringify(database, null, 2), 'utf8')
    reply.send({ url: body.shortUrl })
})

fastify.listen({ port: Number(process.env.PORT) || 3000 }, (err) => {
    if (err) throw err
    fastify.log.info(`Server listening on ${fastify.server.address()}`)
})