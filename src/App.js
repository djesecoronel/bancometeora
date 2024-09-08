import React from 'react';
import CajeroAutomatico from './CajeroAutomatico';
import './App.css';

function App() {
  // Estilo inline para la imagen de fondo
  const appStyle = {
    backgroundImage: 'url(/fondobillete.png)', // La imagen debe estar en la carpeta public
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <div style={appStyle}>
      <CajeroAutomatico />
    </div>
  );
}


export default App;