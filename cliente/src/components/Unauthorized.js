import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Acceso denegado</h2>
      <p>No tienes permisos para ver esta página.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
};

export default Unauthorized;
