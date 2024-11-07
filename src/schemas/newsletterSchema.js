"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterSchema = void 0;
var zod_1 = require("zod");
exports.NewsletterSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, "Title is required"),
    content: zod_1.z.string().min(15, "Content is required"),
    author: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean(),
});
