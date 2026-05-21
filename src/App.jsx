import { BrowserRouter, Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import RestauranteMenuPage from './pages/RestauranteMenuPage'
import IniciarSesion from './pages/LoginCliente.js'
import SeleccionarRol from './pages/SeleccionarRol.js'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SeleccionarRol />} />
        <Route path="/login/cliente" element={<IniciarSesion />} />
        <Route path="/restaurante/:id" element={<RestauranteMenuPage />} />
        <Route path="/restaurantes" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
