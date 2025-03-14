import mongoose, { Schema, model, ObjectId, Types } from "mongoose";

// Use your MongoDB Atlas connection string here
const MONGO_URI = "mongodb+srv://05sharmaparth:wo169YrK6CdxJN33@cluster0.99okb.mongodb.net/";

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Stops long waiting times
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err: Error) => console.error("❌ MongoDB Connection Error:", err));

// Define User Schema
const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});
const TagSchema=new Schema({
    title:{type:String,required:true,unique:true}
});


const LinkSchema=new Schema({
    hash:{type:String,required:true},
    userId:{type:mongoose.Schema.ObjectId, ref:'User',required:true,unique:true}
})

const ContentTypes=['image','video','article','audio','Twitter','YouTube'];
const ContentSchema=new Schema({
    link:{type:String,required:true},
    type:{type:String,enum:ContentTypes,required:true},
    title:{type:String,required:true},
    tags:[{type:Types.ObjectId,ref:'Tag',required:false}],
    userId:{type:Types.ObjectId,ref:'User', required:true}

});
export const ContentModel=model("Content",ContentSchema);
export const LinkModel=model("Link",LinkSchema) 
export const TagModel=model("Tag",TagSchema);

export const UserModel = model("User", UserSchema);
