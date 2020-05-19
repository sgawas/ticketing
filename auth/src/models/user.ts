import mongoose from 'mongoose';

// an interface that describes the properties 
// that are required to create new User
interface UserAttributes{
    email: string,
    password: string
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
})

userSchema.statics.build = (attrs: UserAttributes) => {
    return new User(attrs);
}

const User = mongoose.model<UserDoc, UseModel>('User', userSchema);

export { User };