import express, { Router } from 'express'
import cors from 'cors'
import docket from './docket'

const app = express()
const router = Router()
export {app as default}

app.use(cors())

router.use('/docket', docket)

app.use(router)

