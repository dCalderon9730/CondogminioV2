const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Construir las credenciales de Firebase desde las variables de entorno
const firebaseConfig = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key.replace(/\\n/g, "\n"), // Arreglar saltos de línea
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url,
  universe_domain: process.env.universe_domain,
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

const db = admin.firestore();

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.send("¡Bienvenido a Condogminio API! 🚀");
});

// Ruta para recibir nombre y edad y guardarlos en Firebase
app.post("/users", async (req, res) => {
  try {
    const { nombre, edad } = req.body;
    if (!nombre || !edad) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const docRef = await db.collection("users").add({ nombre, edad });
    res.status(201).json({ id: docRef.id, nombre, edad });
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para obtener todos los usuarios
app.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    if (snapshot.empty) {
      return res.status(404).json({ error: "No hay usuarios registrados" });
    }
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor en puerto ${PORT}`));
