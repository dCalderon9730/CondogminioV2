const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-key.json")),
});

const db = admin.firestore();

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
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener todos los usuarios
app.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
