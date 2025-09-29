// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const clientesRoutes = require("./routes/clientesRoutes");
const tiposDocumentosRoutes = require("./routes/tiposDocumentosRoutes");


const app = express();
app.use(express.json());
app.use(cors());

// Rutas
app.use("/clientes", clientesRoutes);
app.use("/tiposdocumentos", tiposDocumentosRoutes);

// Test
app.get("/", (req, res) => {
    res.send("Backend funcionando 🚀");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
