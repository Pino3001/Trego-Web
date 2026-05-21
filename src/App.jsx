import { BrowserRouter, Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import RestauranteMenuPage from './pages/RestauranteMenuPage'
import LoginCliente from './pages/logins/LoginCliente.js'
import SeleccionarRol from './pages/SeleccionarRol.js'
import LoginRestaurante from './pages/logins/LoginRestaurante.js'
import LoginAdmin from './pages/logins/LoginAdmin.js'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SeleccionarRol />} />
        <Route path="/login/cliente" element={<LoginCliente />} />
        <Route path="/login/Restaurante" element={<LoginRestaurante />} />
        <Route path="/login/Administrador" element={<LoginAdmin />} />
        <Route path="/restaurante/:id" element={<RestauranteMenuPage />} />
        <Route path="/restaurantes" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
