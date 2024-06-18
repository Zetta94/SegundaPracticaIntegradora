import mongoose from 'mongoose'

const collection = 'users'

const schema = new mongoose.Schema({
    first_name: { type: String,  max: 10 },
    last_name: { type: String,  max: 10 },
    email: {
        type: String,
        unique: true,
        require:true,
        max:45
    },
    age: Number,
    password: { type: String, max: 30 },
    cart: [{type: mongoose.Schema.Types.ObjectId,ref: 'carts'}],
    role: { type: String, max: 10 }
})

const MODEL_USER = mongoose.model(collection, schema)

export default  MODEL_USER