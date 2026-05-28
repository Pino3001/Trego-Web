export const ENDPOINTS = {
  // Restaurantes (cliente)
  RESTAURANTES: '/api/restaurantes',
  RESTAURANTES_ZONA: '/api/restaurantes/zona', // falta endpoint backend
  RESTAURANTE_POR_ID: '/api/restaurantes/:id',

  // Menú y pedidos
  MENU_RESTAURANTE: '/api/pedido/restaurante/:id/verMenu',
  PEDIDO_CONFIRMAR: '/api/pedido/confirmar',

  // Carrito
  CARRITO: '/api/carrito',
  CARRITO_PRODUCTOS: '/api/carrito/productos',
  CARRITO_TOTAL: '/api/carrito/total',
  CARRITO_ITEMS: '/api/carrito/items',

  // Pagos
  PAGO_ESTADO: '/api/pagos/estado/:idPedido',

  // Usuarios
  USUARIO_DIRECCIONES: '/api/usuarios/obtenerDirecciones',
  USUARIO_GUARDAR_DIRECCION: '/api/usuarios/guardarDireccion', // falta endpoint backend

  // Auth
  AUTH_GOOGLE: '/api/auth/google',
  AUTH_SMS: '/api/auth/sms',
  AUTH_LOGIN_ADMIN: '/api/auth/login/admin',
  AUTH_ADMIN_VERIFICAR_OTP: '/api/auth/admin/verificar-otp', // falta endpoint backend
  AUTH_CERRAR_SESION: '/api/auth/cerrarSesion',
  AUTH_REGISTRO: '/api/auth/registro',

  // Restaurante — alta de local (formulario completo)
  SOLICITUD_ALTA_RESTAURANTE: '/api/restaurantes/actualizar', // falta endpoint backend
  FIRMA_IMAGEN: `/api/restaurantes/imagenF/firma`,

  //Registro
  REGISTRAR_RESTAURANTE: `/api/usuarios/registrar-restaurante/solicitar`,
  CONFIRMAR_REGISTRO: `/api/usuarios/registrar-restaurante/confirmar`,
  REENVIAR_CODIGO: `/api/usuarios/registrar-restaurante/reenviar-codigo`,
}
