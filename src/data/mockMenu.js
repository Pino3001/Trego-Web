const IMG = (id, w = 400) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${w}&fit=crop`

const menuLaTuaPasta = {
  restaurante: {
    idUsuario: 1,
    nombre: 'La Tua Pasta',
    razonSocial: 'La Tua Pasta',
    calificacionProm: 4.7,
    cantidadResenas: 100,
    habilitado: true,
    abierto: true,
    direccion: { nombre: 'Pocitos', ciudad: 'Montevideo' },
    horarioServicio: ['20:30', '23:45'],
    fotoPortada: IMG('1621996346565-e3dbc646d11a', 800),
  },
  productos: [
    {
      idProducto: 101,
      nombre: 'Tallarines con calamares y tomates',
      descripcion:
        'Porcion de tallarines con calamares frescos y tomates confitados.',
      precio: 480,
      categoria: 'Principal',
      fotoPlato: IMG('1563379926898-05f4579a88d6'),
      ofertaActiva: true,
      oferta: { descuentoPorcentaje: 20, descripcion: 'Oferta del día' },
    },
    {
      idProducto: 102,
      nombre: 'Ravioles de ricota y espinaca',
      descripcion: 'Ravioles caseros con salsa fileto o crema.',
      precio: 420,
      categoria: 'Principal',
      fotoPlato: IMG('1551183053-bf5934b7374b'),
      ofertaActiva: true,
      oferta: { descuentoPorcentaje: 15, descripcion: '15% off' },
    },
    {
      idProducto: 201,
      nombre: 'Albondigas con arroz',
      descripcion: 'Albondigas de carne con salsa y arroz.',
      precio: 460,
      categoria: 'Principal',
      fotoPlato: IMG('1546833999-b9f581a1996d'),
      ofertaActiva: false,
    },
    {
      idProducto: 202,
      nombre: 'Pollo al limón con papas',
      descripcion: 'Pechuga grillada con guarnición de papas rústicas.',
      precio: 440,
      categoria: 'Principal',
      fotoPlato: IMG('1608038522941-6c5f6b2e1a1a'),
      ofertaActiva: false,
    },
    {
      idProducto: 301,
      nombre: 'Ensalada César',
      descripcion: 'Lechuga, croutons, parmesano y aderezo César.',
      precio: 320,
      categoria: 'Ensalada',
      fotoPlato: IMG('1546069909-ba8a602ac960'),
      ofertaActiva: false,
    },
    {
      idProducto: 302,
      nombre: 'Capresse',
      descripcion: 'Tomate, mozzarella y albahaca fresca.',
      precio: 290,
      categoria: 'Ensalada',
      fotoPlato: IMG('1512621776951-a41d2add8303'),
      ofertaActiva: false,
    },
    {
      idProducto: 401,
      nombre: 'Bruschetta',
      descripcion: 'Pan tostado con tomate, ajo y aceite de oliva.',
      precio: 220,
      categoria: 'Entrada',
      fotoPlato: IMG('1572441719332-32b5ecc8e0d2'),
      ofertaActiva: false,
    },
    {
      idProducto: 402,
      nombre: 'Focaccia con olivas',
      descripcion: 'Pan italiano con romero y aceitunas.',
      precio: 250,
      categoria: 'Entrada',
      fotoPlato: IMG('1509440159596-24d22bbf4b8b'),
      ofertaActiva: false,
    },
    {
      idProducto: 501,
      nombre: 'Tiramisú',
      descripcion: 'Postre clásico con café y mascarpone.',
      precio: 280,
      categoria: 'Postre',
      fotoPlato: IMG('1571877227200-a0d98ea607e9'),
      ofertaActiva: false,
    },
    {
      idProducto: 502,
      nombre: 'Brownie con helado',
      descripcion: 'Brownie tibio con helado de vainilla.',
      precio: 300,
      categoria: 'Postre',
      fotoPlato: IMG('1606313564200-e75d603ec3b2'),
      ofertaActiva: false,
    },
    {
      idProducto: 601,
      nombre: 'Agua mineral 500ml',
      descripcion: 'Agua sin gas.',
      precio: 80,
      categoria: 'Bebida',
      fotoPlato: IMG('1548839140-29a7493991a5'),
      ofertaActiva: false,
    },
    {
      idProducto: 602,
      nombre: 'Gaseosa 500ml',
      descripcion: 'Coca-Cola, Sprite o Fanta.',
      precio: 120,
      categoria: 'Bebida',
      fotoPlato: IMG('1629203851121-3726a4c4b654'),
      ofertaActiva: false,
    },
  ],
}

const menuGenerico = (id, nombre) => ({
  restaurante: {
    idUsuario: Number(id),
    nombre: nombre ?? `Restaurante ${id}`,
    razonSocial: nombre ?? `Restaurante ${id}`,
    calificacionProm: 4.5,
    cantidadResenas: 50,
    habilitado: true,
    abierto: true,
    direccion: { nombre: 'Montevideo', ciudad: 'Montevideo' },
    horarioServicio: ['12:00', '23:00'],
    fotoPortada: IMG('1555939594-58d7cb561ad1', 800),
  },
  productos: [
    {
      idProducto: 9001,
      nombre: 'Combo del día',
      descripcion: 'Plato principal + bebida.',
      precio: 550,
      categoria: 'Principal',
      fotoPlato: IMG('1565299624946-b28f40a0ae38'),
      ofertaActiva: true,
      oferta: { descuentoPorcentaje: 10, descripcion: 'Combo' },
    },
    {
      idProducto: 9002,
      nombre: 'Hamburguesa clásica',
      descripcion: 'Carne, lechuga, tomate y papas.',
      precio: 390,
      categoria: 'Principal',
      fotoPlato: IMG('1568901854579-dc25eac6d0b0'),
      ofertaActiva: false,
    },
    {
      idProducto: 9003,
      nombre: 'Limonada',
      descripcion: 'Limonada natural 400ml.',
      precio: 110,
      categoria: 'Bebida',
      fotoPlato: IMG('1629203851121-3726a4c4b654'),
      ofertaActiva: false,
    },
  ],
})

export const menuVacio = {
  restaurante: {
    idUsuario: 99,
    nombre: 'Restaurante sin menú',
    razonSocial: 'Restaurante sin menú',
    calificacionProm: 4.0,
    cantidadResenas: 10,
    habilitado: true,
    abierto: true,
    direccion: { nombre: 'Centro', ciudad: 'Montevideo' },
    horarioServicio: ['10:00', '22:00'],
    fotoPortada: IMG('1517248135467-4c7edcad34c4', 800),
  },
  productos: [],
}

export function obtenerMockMenu(idRestaurante) {
  const id = Number(idRestaurante)
  if (id === 99) return menuVacio
  if (id === 1) return menuLaTuaPasta
  return menuGenerico(id)
}
