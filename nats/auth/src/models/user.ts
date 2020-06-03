import mongoose from 'mongoose';

import { Password } from '../services/password';

// an interface that describes the properties 
// that are required to create new User
interface UserAttributes{
    email: string;
    password: string;
}

// an interface that describes the propeties
// that a User model has
interface UseModel extends mongoose.Model<UserDoc>{
    build(attrs: UserAttributes): UserDoc;
}

// an interface that describes the properties
// that a User Document has

interface UserDoc extends mongoose.Document{
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
},{
    toJSON: {
        transform(doc, ret){
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
}
)
// hashes password, only if password has been changed or newly created
userSchema.pre('save', async function(done){
    if(this.isModified('password')){
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed); 
        done();
    }
})

userSchema.statics.build = (attrs: UserAttributes) => {
    return new User(attrs);
}

const User = mongoose.model<UserDoc, UseModel>('User', userSchema);

export { User };