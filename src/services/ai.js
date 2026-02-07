import { GoogleGenerativeAI } from "@google/generative-ai";

// Leemos la clave desde el archivo .env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateProductDescription = async (name, category) => {
    if (!API_KEY) {
        console.error("❌ Falta la API Key de Gemini en el archivo .env");
        return "Error: Falta configurar la API Key.";
    }

    try {
        // Iniciamos el modelo (usamos Flash por ser rápido y eficiente)
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // La instrucción mágica para el "Vendedor Virtual"
        const prompt = `Actúa como un experto vendedor de e-commerce argentino de la marca 'Home & Co'. 
    Escribe una descripción de venta corta, persuasiva y canchera (máximo 280 caracteres) para un producto llamado "${name}" que pertenece a la categoría "${category}".
    
    Requisitos:
    - Usá lenguaje natural argentino (pero profesional).
    - Resaltá la calidad.
    - Incluí 2 o 3 emojis relevantes (mates, fuego, argentina, etc.).
    - NO uses comillas en la respuesta.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generando descripción con IA:", error);
        return "No pudimos generar la descripción en este momento. ¡Probá de nuevo!";
    }
};

export const askSommelier = async (userQuestion) => {
    if (!API_KEY) {
        console.error("❌ Falta la API Key de Gemini en el archivo .env");
        return "¡Hola! Estoy teniendo unos problemitas técnicos. Por favor volvé a intentar más tarde. 🧉";
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Actúa como un asistente virtual experto en mates llamado "El Sommelier" de la tienda Home & Co. 
        Tu tono es amigable, argentino y servicial. 
        Tu objetivo es recomendar productos (Mates, Termos, Bombillas) según lo que pregunte el usuario: "${userQuestion}".
        
        Reglas:
        - Respuestas cortas (máximo 2 frases).
        - Si preguntan precios exactos, deciles amablemente que revisen el catálogo.
        - Usá emojis 🧉.
        - Si la pregunta no tiene nada que ver con mates/termos, respondé con una broma suave y volvé al tema.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error consultando al Sommelier:", error);
        return "¡Ufa! Se me volcó el agua. ¿Me repetís la pregunta? 🧉";
    }
};
