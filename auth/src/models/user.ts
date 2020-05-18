import mongoose from 'mongoose';

// an interface that describes the properties 
// that are required to create new User
interface UserAttributes{
    email: string,
    password: string
}

// an interface that describes the propeties
// that a User model has
interface UseModel extends mongoose.Model<any>{
    build(attrs: UserAttributes): any;
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
})

userSchema.statics.build = (attrs: UserAttributes) => {
    return new User(attrs);
}

const User = mongoose.model<any, UseModel>('User', userSchema);

export { User };