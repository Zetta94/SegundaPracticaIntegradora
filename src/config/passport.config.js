import passport from "passport"
import GitHubStrategy from "passport-github2"
import local from "passport-local"
import MODEL_USER from "../models/user.model.js"
import utils from "../utils.js"
import CartManager from "../controllers/cart.controller.js"
import SessionManager from "../controllers/session.controller.js"

const cartManager = new CartManager()
const sessionManager = new SessionManager()


const { createHash, isValidPassword } = utils

const LocalStrategy = local.Strategy

const initializePassport = () => {

    // Estrategia de registro
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body
            try {
                let user = await MODEL_USER.findOne({ email: username })
                if (user) {
                    console.log("User exists")
                    return done(null, false)
                }

                const isAdmin = email.startsWith('admin')
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password),
                    role: isAdmin ? 'admin' : 'usuario',
                    cart: []
                }
                let result = await MODEL_USER.create(newUser)
                const existsCart = await cartManager.addCart(result._id)
                const newCartUser = await sessionManager.addCartUser(result._id,existsCart._id)
                return done(null, result)
            } catch (error) {
                return done(error)
            }
        }
    ))

    // Estrategia de login
    passport.use('login', new LocalStrategy(
        { usernameField: 'email' },
        async (username, password, done) => {
            try {
                const user = await MODEL_USER.findOne({ email: username })
    
                if (!user) {
                    console.log("User not exists")
                    return done(null, false)
                }
    
                if (!isValidPassword(user, password)) {
                    console.log("Password is not ok")
                    return done(null, false)
                }

                // // Asignar un carrito al usuario
                // let existsCart = await cartManager.getCartByUser(user._id)
                // if (existsCart.length === 0) {
                //     console.log("Entre a la primera")
                //     existsCart = await cartManager.addCart(user._id)
                //     const newCartUser = await sessionManager.addCartUser(user._id,existsCart._id)
                // }

                return done(null, user)
            } catch (error) {
                return done(error)
            }
        }
    ))
    


    // Serialización del usuario
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    // Deserialización del usuario
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await MODEL_USER.findById(id)
            done(null, user)
        } catch (error) {
            done(error)
        }
    })
}

export default  initializePassport
