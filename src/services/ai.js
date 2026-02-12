import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Función para generar descripciones de productos en el Admin
 */
export const generateProductDescription = async (name, category) => {
    if (!API_KEY) return "Error: Falta configurar la API Key.";

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Actúa como un experto vendedor de e-commerce argentino de la marca 'Home & Co'. 
    Escribe una descripción de venta corta, persuasiva y canchera (máximo 280 caracteres) para un producto llamado "${name}" que pertenece a la categoría "${category}".
    
    Requisitos:
    - Usá lenguaje natural argentino (pero profesional).
    - Resaltá la calidad y durabilidad (estilo Rugged/YETI).
    - Incluí 2 o 3 emojis relevantes.
    - NO uses comillas en la respuesta.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error IA Desc:", error);
        return "No pudimos generar la descripción.";
    }
};

/**
 * EL VENDEDOR 24/7 - Nueva lógica con conocimiento de productos
 */
export const askSommelier = async (userQuestion, products = []) => {
    if (!API_KEY) return "¡Hola! Estoy configurando mi stock. Consultame en unos minutos o escribinos al WhatsApp. 🧉";

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convertimos la lista de productos en texto para que la IA los conozca
        const contextProducts = products.length > 0
            ? `Tenemos estos productos disponibles: ${products.map(p => `${p.name} ($${p.price})`).join(", ")}.`
            : "Actualmente estamos renovando stock, pero consultame lo que necesites.";

        const prompt = `
        Sos el Asistente Comercial experto de "Home & Co", una tienda premium de Mates, Termos y Accesorios en Mendoza.
        Tu objetivo: Vender, asesorar y cerrar la venta.
        
        CONTEXTO DE PRODUCTOS:
        ${contextProducts}

        REGLAS DE ORO:
        1. Tono: Argentino canchero pero muy profesional y servicial (estilo premium).
        2. Conocimiento: Recomendá específicamente los productos de la lista anterior.
        3. Si el usuario pregunta por algo que NO tenemos: Ofrecé lo más parecido que tengamos y decile "te consigo algo mejor".
        4. Cierre: Siempre invitá a agregar al carrito o a contactar a Rodrigo/Vane por WhatsApp para envíos a todo el país.
        5. Respuestas cortas: Máximo 3 frases. Usa emojis 🧉🔥.

        PREGUNTA DEL CLIENTE: "${userQuestion}"`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error IA Chat:", error);
        return "¡Ufa! Se me cortó la conexión. ¿Me repetís la consulta? Si no, chateamos por WhatsApp. 🧉";
    }
};