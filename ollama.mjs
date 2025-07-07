import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // Asegurate de instalarlo: npm i node-fetch

const app = express();
const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5503",
  "https://ecoxion.netlify.app",
  "https://gentle-druid-9e09de.netlify.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});


app.use(cors());
app.use(bodyParser.json());

const MODEL = "gemma3:1b"; // Usa el modelo correcto instalado en tu Ollama
const PORT = process.env.PORT || 3012;

app.get("/api", (req, res) => {
  res.json({ status: "ok", message: "Ecoxion IA API activa" });
});

const OLLAMA_URL = process.env.OLLAMA_URL;

app.post("/api/generate", async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) return res.status(400).json({ error: "Prompt faltante" });

  try {
const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "EcoxionProxy/1.0",
    "Bypass-Tunnel-Reminder": "true"
  },
  body: JSON.stringify({
    model: MODEL,
    prompt: prompt,
    stream: false
  })
});



if (!ollamaResponse.ok) {
  const errText = await ollamaResponse.text();
  console.error("💣 Respuesta NO válida de Ollama:", errText);
  return res.status(500).json({
    error: "Fallo interno al generar IA",
    detalle: errText // ¡AQUÍ te muestra el verdadero motivo!
  });
}


    const data = await ollamaResponse.json();
    if (!data.response) {
      return res.status(500).json({ error: "Respuesta vacía del modelo" });
    }

    console.log("🧠 Respuesta de Ollama:", data);
res.json({ result: data.response.trim() });

} catch (err) {
  console.error("Error conectando con Ollama:", err);
  res.status(500).json({
    error: "Error al conectar con Ollama",
    message: err.message,
    stack: err.stack
  });
}

});

app.get("/api/generate", (req, res) => {
  res.status(405).send("Este endpoint solo acepta POST, campeón 😎");
});



app.listen(PORT, () => {
  console.log(`🚀 Servidor IA corriendo en http://localhost:${PORT}`);
});
