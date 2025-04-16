import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const suggestRecipe = async (productName) => {
    const prompt = `I added ${productName} to my cart. What recipes can I make? Suggest ingredients.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const response = await model.generateContent({
            contents : [{ role: "user", parts:[{ text : prompt}]}],
            generationConfig: {maxOutputTokens:500,
                temperature:0.7,
            },
        });
        const text = response.response.candidates[0]?.content.parts[0]?.text || "No suggestion available.";

        return text.trim();
    } catch (error) {
        console.error("AI Suggestion Error:", error);
        return "No suggestion available.";
    }
};

export default suggestRecipe;
