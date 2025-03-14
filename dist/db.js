"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.TagModel = exports.LinkModel = exports.ContentModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Use your MongoDB Atlas connection string here
const MONGO_URI = "mongodb+srv://05sharmaparth:wo169YrK6CdxJN33@cluster0.99okb.mongodb.net/";
// Connect to MongoDB
mongoose_1.default.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Stops long waiting times
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));
// Define User Schema
const UserSchema = new mongoose_1.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});
const TagSchema = new mongoose_1.Schema({
    title: { type: String, required: true, unique: true }
});
const LinkSchema = new mongoose_1.Schema({
    hash: { type: String, required: true },
    userId: { type: mongoose_1.default.Schema.ObjectId, ref: 'User', required: true, unique: true }
});
const ContentTypes = ['image', 'video', 'article', 'audio', 'Twitter', 'YouTube'];
const ContentSchema = new mongoose_1.Schema({
    link: { type: String, required: true },
    type: { type: String, enum: ContentTypes, required: true },
    title: { type: String, required: true },
    tags: [{ type: mongoose_1.Types.ObjectId, ref: 'Tag', required: false }],
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true }
});
exports.ContentModel = (0, mongoose_1.model)("Content", ContentSchema);
exports.LinkModel = (0, mongoose_1.model)("Link", LinkSchema);
exports.TagModel = (0, mongoose_1.model)("Tag", TagSchema);
exports.UserModel = (0, mongoose_1.model)("User", UserSchema);
