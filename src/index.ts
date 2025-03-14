import express, { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { ContentModel, LinkModel, UserModel } from "./db";
import { userMiddleware} from "./middleware/user";
import { random } from "./utils";
import cors from "cors"

// Initialize express app
const app = express();
app.use(express.json());
app.use(cors());

// JWT Secret
const JWT_SECRET = "userparthsharma";

// Validation Schemas
const usernameSchema = z.string().min(3, "Username should be between 3 and 10 characters").max(10);
const passwordSchema = z.string()
  .min(8, "Password must be between 8 and 20 characters")
  .max(20)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const signupSchema = z.object({
  username: usernameSchema,
  password: passwordSchema
});

const signinSchema = z.object({
  username: usernameSchema,
  password: z.string().min(8, "Password is required")
});


// Utility Function to Hash Password
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Route Handlers
// Define the handler types properly
const signupHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const validData = signupSchema.parse(req.body);
  
      const existingUser = await UserModel.findOne({ username: validData.username });
      if (existingUser) {
        res.status(403).json({ message: "User already exists" });
        return;
      }
  
      const hashedPassword = await hashPassword(validData.password);
      await UserModel.create({ username: validData.username, password: hashedPassword });
  
      res.status(201).json({ message: "Signed up successfully" });
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid input", 
        errors: error instanceof z.ZodError ? error.errors : error 
      });
    }
  };
  
  const signinHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const validData = signinSchema.parse(req.body);
  
      const user = await UserModel.findOne({ username: validData.username });
      if (!user || !(await bcrypt.compare(validData.password, user.password))) {
        res.status(403).json({ message: "Invalid username or password" });
        return;
      }
  
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
  
      res.status(200).json({ message: "Logged in successfully", token });
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid input", 
        errors: error instanceof z.ZodError ? error.errors : error 
      });
    }
  };
  
  const createContentHandler = async (req: Request, res: Response): Promise<void> => {
    console.log("userId from request:", req.userId);
   const userId=req.userId;
    const {link,tag,title,type}=req.body;
   const content= await ContentModel.create({
    link:link,
    tag:tag,
    title:title,
    type:type,
    userId:userId
   })
   res.json({
    message:"content added  successfully",
    content:content
   })
};

const getContentHandler = async (req:Request,res:Response):Promise<void> =>{
 
  const userId=req.userId;
  const usercontent=await ContentModel.find({userId:userId}).populate("userId","username");
   res.json({
    message:"here is your content",
    content:usercontent
   })


};

  
  const deleteContentHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const {contentId} =req.body;
      const deletedContent= await ContentModel.findOneAndDelete({ 
        _id:contentId,
        userId: req.userId });

        
      res.status(200).json({ message: "your content has been deleted successfully",
              deletedContent:deletedContent
       });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };

   const shareContentHandler=  async (req:Request,res:Response): Promise<void> =>{
      const {share}=req.body;
      if(share){
        const existingLink=await LinkModel.findOne({
          userId:req.userId
        })
        if(existingLink){
          res.json({
            hash:existingLink.hash
          })
          return;
        }

        const hash=random(10);

        await LinkModel.create({
          userId:req.userId,
          hash:hash
        })

        res.json({
           message:"here is your hash",
          hash:hash
        })

      }

     
   }
   const shareLinkHandler = async (req: Request, res: Response): Promise<void> => {
    const hash = req.params.shareLink;


    if (!hash) {
        res.status(400).json({ message: "No hash provided" });
        return;
    }

    const link = await LinkModel.findOne({ hash: hash });

    if (!link) {
        console.log("Hash not found in database:", hash);
        res.status(411).json({ message: "Sorry, incorrect input" });
        return;
    }


    const content = await ContentModel.find({ userId: link.userId });

    const user = await UserModel.findOne({ _id: link.userId });


    // if (!user) {
    //     res.status(404).json({ message: "User not found" });
    //     return;
    // }

    res.json({
        username: user?.username,
        content: content
    });
};

  


// Routes
app.post("/api/v1/signup", signupHandler);
app.post("/api/v1/signin", signinHandler);
app.post("/api/v1/content", userMiddleware, createContentHandler);
app.get("/api/v1/content", userMiddleware, getContentHandler);
app.delete("/api/v1/content", userMiddleware, deleteContentHandler);
app.post("/api/v1/brain/share",userMiddleware, shareContentHandler);
app.get("/api/v1/brain/:shareLink",shareLinkHandler);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;