import express, { type Application, type Request, type Response } from 'express'
import { userRoute } from './module/user/user.route'
import { profileRoute } from './module/profile/profile.route'
import { authRoute } from './module/auth/auth.route'

const app: Application = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Express server is running',
        author: 'Redoan'
    })
})

// connection from route
app.use('/api/users', userRoute);

app.use('/api/profiles', profileRoute)

app.use('/api/auth', authRoute)

export default app