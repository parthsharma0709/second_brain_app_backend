"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const db_1 = require("./db");
const user_1 = require("./middleware/user");
const utils_1 = require("./utils");
const cors_1 = __importDefault(require("cors"));
// Initialize express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// JWT Secret
const JWT_SECRET = "userparthsharma";
// Validation Schemas
const usernameSchema = zod_1.z.string().min(3, "Username should be between 3 and 10 characters").max(10);
const passwordSchema = zod_1.z.string()
    .min(8, "Password must be between 8 and 20 characters")
    .max(20)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");
const signupSchema = zod_1.z.object({
    username: usernameSchema,
    password: passwordSchema
});
const signinSchema = zod_1.z.object({
    username: usernameSchema,
    password: zod_1.z.string().min(8, "Password is required")
});
// Utility Function to Hash Password
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const saltRounds = 10;
    return yield bcryptjs_1.default.hash(password, saltRounds);
});
// Route Handlers
// Define the handler types properly
const signupHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validData = signupSchema.parse(req.body);
        const existingUser = yield db_1.UserModel.findOne({ username: validData.username });
        if (existingUser) {
            res.status(403).json({ message: "User already exists" });
            return;
        }
        const hashedPassword = yield hashPassword(validData.password);
        yield db_1.UserModel.create({ username: validData.username, password: hashedPassword });
        res.status(201).json({ message: "Signed up successfully" });
    }
    catch (error) {
        res.status(400).json({
            message: "Invalid input",
            errors: error instanceof zod_1.z.ZodError ? error.errors : error
        });
    }
});
const signinHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validData = signinSchema.parse(req.body);
        const user = yield db_1.UserModel.findOne({ username: validData.username });
        if (!user || !(yield bcryptjs_1.default.compare(validData.password, user.password))) {
            res.status(403).json({ message: "Invalid username or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Logged in successfully", token });
    }
    catch (error) {
        res.status(400).json({
            message: "Invalid input",
            errors: error instanceof zod_1.z.ZodError ? error.errors : error
        });
    }
});
const createContentHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("userId from request:", req.userId);
    const userId = req.userId;
    const { link, tag, title, type } = req.body;
    const content = yield db_1.ContentModel.create({
        link: link,
        tag: tag,
        title: title,
        type: type,
        userId: userId
    });
    res.json({
        message: "content added  successfully",
        content: content
    });
});
const getContentHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const usercontent = yield db_1.ContentModel.find({ userId: userId }).populate("userId", "username");
    res.json({
        message: "here is your content",
        content: usercontent
    });
});
const deleteContentHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contentId } = req.body;
        const deletedContent = yield db_1.ContentModel.findOneAndDelete({
            _id: contentId,
            userId: req.userId
        });
        res.status(200).json({ message: "your content has been deleted successfully",
            deletedContent: deletedContent
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const shareContentHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    if (share) {
        const existingLink = yield db_1.LinkModel.findOne({
            userId: req.userId
        });
        if (existingLink) {
            res.json({
                hash: existingLink.hash
            });
            return;
        }
        const hash = (0, utils_1.random)(10);
        yield db_1.LinkModel.create({
            userId: req.userId,
            hash: hash
        });
        res.json({
            message: "here is your hash",
            hash: hash
        });
    }
});
const shareLinkHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    if (!hash) {
        res.status(400).json({ message: "No hash provided" });
        return;
    }
    const link = yield db_1.LinkModel.findOne({ hash: hash });
    if (!link) {
        console.log("Hash not found in database:", hash);
        res.status(411).json({ message: "Sorry, incorrect input" });
        return;
    }
    const content = yield db_1.ContentModel.find({ userId: link.userId });
    const user = yield db_1.UserModel.findOne({ _id: link.userId });
    // if (!user) {
    //     res.status(404).json({ message: "User not found" });
    //     return;
    // }
    res.json({
        username: user === null || user === void 0 ? void 0 : user.username,
        content: content
    });
});
// Routes
app.post("/api/v1/signup", signupHandler);
app.post("/api/v1/signin", signinHandler);
app.post("/api/v1/content", user_1.userMiddleware, createContentHandler);
app.get("/api/v1/content", user_1.userMiddleware, getContentHandler);
app.delete("/api/v1/content", user_1.userMiddleware, deleteContentHandler);
app.post("/api/v1/brain/share", user_1.userMiddleware, shareContentHandler);
app.get("/api/v1/brain/:shareLink", shareLinkHandler);
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
exports.default = app;
