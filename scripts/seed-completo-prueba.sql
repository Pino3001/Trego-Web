-- =============================================================================
-- SEED COMPLETO — datos de prueba para desarrollo local (Trego)
-- Ejecutar: mysql -u root tregodb < scripts/seed-completo-prueba.sql
--
-- CREDENCIALES EXISTENTES (no se sobrescriben):
--   Admin default: admin@trego.com     / admin123   (creado por Spring al arrancar)
--   Admin 1:       admin1@trego.com    / Admin123!
--   Admin 2:       admin2@trego.com    / Admin456!
--   Rest. 1:       rest1@trego.com     / Rest1234!  (Parrilla Demo, habilitado)
--   Rest. 2:       rest2@trego.com     / Rest1234!  (Pizzería Demo, habilitado)
--
-- RESTAURANTES PENDIENTES (nuevos, habilitado=0):
--   pendiente1@trego.com / Rest1234!
--   pendiente2@trego.com / Rest1234!
--   pendiente3@trego.com / Rest1234!
-- =============================================================================

USE tregodb;

SET @pwd_rest = '$2a$10$FL2Bc5qdjSZJhyJp8hWwNuGJKkFHtkBwn9bG5PGVyEfhv3FBZMLIG'; -- Rest1234!

SET @r1 = (SELECT id_usuario FROM usuario WHERE email = 'rest1@trego.com' LIMIT 1);
SET @r2 = (SELECT id_usuario FROM usuario WHERE email = 'rest2@trego.com' LIMIT 1);

-- Abrir locales demo para poder pedir
UPDATE restaurante SET abierto = 1 WHERE id_usuario IN (@r1, @r2);

-- =============================================================================
-- SUBCATEGORÍAS
-- =============================================================================
INSERT INTO sub_categoria (nombre, categoria, url_imagen)
SELECT 'Platos principales', 'Principal', NULL
WHERE NOT EXISTS (SELECT 1 FROM sub_categoria WHERE categoria = 'Principal' LIMIT 1);

INSERT INTO sub_categoria (nombre, categoria, url_imagen)
SELECT 'Bebidas', 'Bebida', NULL
WHERE NOT EXISTS (SELECT 1 FROM sub_categoria WHERE categoria = 'Bebida' LIMIT 1);

INSERT INTO sub_categoria (nombre, categoria, url_imagen)
SELECT 'Postres', 'Postre', NULL
WHERE NOT EXISTS (SELECT 1 FROM sub_categoria WHERE categoria = 'Postre' LIMIT 1);

INSERT INTO sub_categoria (nombre, categoria, url_imagen)
SELECT 'Ensaladas', 'Ensalada', NULL
WHERE NOT EXISTS (SELECT 1 FROM sub_categoria WHERE categoria = 'Ensalada' LIMIT 1);

INSERT INTO sub_categoria (nombre, categoria, url_imagen)
SELECT 'Entradas', 'Entrada', NULL
WHERE NOT EXISTS (SELECT 1 FROM sub_categoria WHERE categoria = 'Entrada' LIMIT 1);

SET @sub_principal = (SELECT id_sub_categoria FROM sub_categoria WHERE categoria = 'Principal' ORDER BY id_sub_categoria LIMIT 1);
SET @sub_bebida    = (SELECT id_sub_categoria FROM sub_categoria WHERE categoria = 'Bebida' ORDER BY id_sub_categoria LIMIT 1);
SET @sub_postre    = (SELECT id_sub_categoria FROM sub_categoria WHERE categoria = 'Postre' ORDER BY id_sub_categoria LIMIT 1);
SET @sub_ensalada  = (SELECT id_sub_categoria FROM sub_categoria WHERE categoria = 'Ensalada' ORDER BY id_sub_categoria LIMIT 1);

-- =============================================================================
-- CLIENTES (5) — login vía Firebase/Google en dev
-- =============================================================================

INSERT INTO usuario (nombre, email, foto_perfil, rol)
SELECT 'Sofía Méndez', 'cliente01@trego.com', 'https://picsum.photos/seed/c01/200', 'Cliente'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'cliente01@trego.com');
SET @c1 = (SELECT id_usuario FROM usuario WHERE email = 'cliente01@trego.com');

INSERT INTO cliente (id_usuario, habilitado, telefono, uid_cliente)
SELECT @c1, 1, '099100001', 'seed-cliente-01'
WHERE @c1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cliente WHERE id_usuario = @c1);

INSERT INTO cliente_direcciones (cliente_id_usuario, calle, numero, apartamento, esquina, latitud, longitud, tag)
SELECT @c1, 'Av. Punta de Rieles', '1520', '0', 'Garibaldi', -34.8720, -56.0520, 'Casa'
WHERE @c1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cliente_direcciones WHERE cliente_id_usuario = @c1);

INSERT INTO usuario (nombre, email, foto_perfil, rol)
SELECT 'Martín López', 'cliente02@trego.com', 'https://picsum.photos/seed/c02/200', 'Cliente'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'cliente02@trego.com');
SET @c2 = (SELECT id_usuario FROM usuario WHERE email = 'cliente02@trego.com');

INSERT INTO cliente (id_usuario, habilitado, telefono, uid_cliente)
SELECT @c2, 1, '099100002', 'seed-cliente-02'
WHERE @c2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cliente WHERE id_usuario = @c2);

INSERT INTO cliente_direcciones (cliente_id_usuario, calle, numero, apartamento, esquina, latitud, longitud, tag)
SELECT @c2, 'Av. Garibaldi', '2100', '3', 'Punta de Rieles', -34.8745, -56.0480, 'Depto'
WHERE @c2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cliente_direcciones WHERE cliente_id_usuario = @c2);

INSERT INTO usuario (nombre, email, foto_perfil, rol)
SELECT 'Valentina Ruiz', 'cliente03@trego.com', 'https://picsum.photos/seed/c03/200', 'Cliente'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'cliente03@trego.com');
SET @c3 = (SELECT id_usuario FROM usuario WHERE email = 'cliente03@trego.com');

INSERT INTO cliente (id_usuario, habilitado, telefono, uid_cliente)
SELECT @c3, 1, '099100003', 'seed-cliente-03'
WHERE @c3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cliente WHERE id_usuario = @c3);

INSERT INTO cliente_direcciones (cliente_id_usuario, calle, numero, apartamento, esquina, latitud, longitud, tag)
SELECT @c3, 'Luis Batlle Berres', '890', '0', '', -34.8705, -56.0550, 'Casa'
WHERE @c3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cliente_direcciones WHERE cliente_id_usuario = @c3);

INSERT INTO usuario (nombre, email, foto_perfil, rol)
SELECT 'Diego Fernández', 'cliente04@trego.com', 'https://picsum.photos/seed/c04/200', 'Cliente'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'cliente04@trego.com');
SET @c4 = (SELECT id_usuario FROM usuario WHERE email = 'cliente04@trego.com');

INSERT INTO cliente (id_usuario, habilitado, telefono, uid_cliente)
SELECT @c4, 1, '099100004', 'seed-cliente-04'
WHERE @c4 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cliente WHERE id_usuario = @c4);

INSERT INTO cliente_direcciones (cliente_id_usuario, calle, numero, apartamento, esquina, latitud, longitud, tag)
SELECT @c4, 'Bvar. España', '2500', '0', 'Pocitos', -34.9090, -56.1540, 'Trabajo'
WHERE @c4 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cliente_direcciones WHERE cliente_id_usuario = @c4);

INSERT INTO usuario (nombre, email, foto_perfil, rol)
SELECT 'Camila Acosta', 'cliente05@trego.com', 'https://picsum.photos/seed/c05/200', 'Cliente'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'cliente05@trego.com');
SET @c5 = (SELECT id_usuario FROM usuario WHERE email = 'cliente05@trego.com');

INSERT INTO cliente (id_usuario, habilitado, telefono, uid_cliente)
SELECT @c5, 0, '099100005', 'seed-cliente-05'
WHERE @c5 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cliente WHERE id_usuario = @c5);

INSERT INTO cliente_direcciones (cliente_id_usuario, calle, numero, apartamento, esquina, latitud, longitud, tag)
SELECT @c5, '18 de Julio', '1200', '0', 'Ejido', -34.9060, -56.1880, 'Casa'
WHERE @c5 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM cliente_direcciones WHERE cliente_id_usuario = @c5);

-- =============================================================================
-- RESTAURANTES PENDIENTES (3) — panel admin / solicitudes
-- =============================================================================

INSERT INTO usuario (nombre, email, foto_perfil, rol)
SELECT 'La Parrilla del Puerto', 'pendiente1@trego.com', 'https://picsum.photos/seed/pend1/200', 'Restaurante'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'pendiente1@trego.com');
SET @rp1 = (SELECT id_usuario FROM usuario WHERE email = 'pendiente1@trego.com');

INSERT INTO restaurante (id_usuario, password, rut, telefono, calle, numero, apartamento, esquina, latitud, longitud,
  descripcion, categoria, calificacion_prom, foto_portada, habilitado, abierto, hora_apertura, hora_cierre, radio_entrega)
SELECT @rp1, @pwd_rest, '21.345.678-9', '099111222', 'Av. Italia', '4200', '0', 'Bvar. Artigas', -34.8941, -56.1659,
  'Parrillada uruguaya con cortes premium.', 'Parrillada', 0, 'https://picsum.photos/seed/pend1port/800/400', 0, 0, '11:00:00', '23:00:00', 8
WHERE @rp1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM restaurante WHERE id_usuario = @rp1);

INSERT INTO usuario (nombre, email, foto_perfil, rol)
SELECT 'Pizza Nova', 'pendiente2@trego.com', 'https://picsum.photos/seed/pend2/200', 'Restaurante'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'pendiente2@trego.com');
SET @rp2 = (SELECT id_usuario FROM usuario WHERE email = 'pendiente2@trego.com');

INSERT INTO restaurante (id_usuario, password, rut, telefono, calle, numero, apartamento, esquina, latitud, longitud,
  descripcion, categoria, calificacion_prom, foto_portada, habilitado, abierto, hora_apertura, hora_cierre, radio_entrega)
SELECT @rp2, @pwd_rest, '21.456.789-0', '099333444', '18 de Julio', '1234', '0', 'Ejido', -34.9050, -56.1910,
  'Pizzas a la piedra y empanadas.', 'Pizza', 0, 'https://picsum.photos/seed/pend2port/800/400', 0, 0, '12:00:00', '00:00:00', 5
WHERE @rp2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM restaurante WHERE id_usuario = @rp2);

INSERT INTO usuario (nombre, email, foto_perfil, rol)
SELECT 'Verde Vida', 'pendiente3@trego.com', 'https://picsum.photos/seed/pend3/200', 'Restaurante'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'pendiente3@trego.com');
SET @rp3 = (SELECT id_usuario FROM usuario WHERE email = 'pendiente3@trego.com');

INSERT INTO restaurante (id_usuario, password, rut, telefono, calle, numero, apartamento, esquina, latitud, longitud,
  descripcion, categoria, calificacion_prom, foto_portada, habilitado, abierto, hora_apertura, hora_cierre, radio_entrega)
SELECT @rp3, @pwd_rest, '21.567.890-1', '099555666', 'Rambla República', '3500', '0', 'Pocitos', -34.9095, -56.1548,
  'Comida vegana y vegetariana.', 'Vegano', 0, 'https://picsum.photos/seed/pend3port/800/400', 0, 0, '10:00:00', '22:00:00', 6
WHERE @rp3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM restaurante WHERE id_usuario = @rp3);

-- =============================================================================
-- OFERTAS
-- =============================================================================
INSERT INTO oferta (descripcion, descuento, fecha_inicio, fecha_fin, url_imagen)
SELECT 'Promo parrilla 15% off', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), NULL
WHERE NOT EXISTS (SELECT 1 FROM oferta WHERE descripcion = 'Promo parrilla 15% off');
SET @oferta_parrilla = (SELECT id_oferta FROM oferta WHERE descripcion = 'Promo parrilla 15% off' LIMIT 1);

INSERT INTO oferta (descripcion, descuento, fecha_inicio, fecha_fin, url_imagen)
SELECT '2x1 pizzas martes', 50, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), NULL
WHERE NOT EXISTS (SELECT 1 FROM oferta WHERE descripcion = '2x1 pizzas martes');
SET @oferta_pizza = (SELECT id_oferta FROM oferta WHERE descripcion = '2x1 pizzas martes' LIMIT 1);

-- =============================================================================
-- PRODUCTOS — Parrilla Demo (rest1)
-- =============================================================================

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id, oferta_id)
SELECT 'Bife de chorizo', 890, 'Corte premium 300g con guarnición', NULL, 1, 1, @r1, @sub_principal, @oferta_parrilla
WHERE @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r1 AND nombre = 'Bife de chorizo');
SET @p_bife = (SELECT id_producto FROM producto WHERE restaurante_id = @r1 AND nombre = 'Bife de chorizo' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p_bife, 25 FROM DUAL WHERE @p_bife IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p_bife);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Choripán', 320, 'Chorizo artesanal en pan casero', NULL, 1, 0, @r1, @sub_principal
WHERE @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r1 AND nombre = 'Choripán');
SET @p_chori = (SELECT id_producto FROM producto WHERE restaurante_id = @r1 AND nombre = 'Choripán' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p_chori, 12 FROM DUAL WHERE @p_chori IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p_chori);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Ensalada mixta', 280, 'Lechuga, tomate, zanahoria y huevo', NULL, 1, 0, @r1, @sub_ensalada
WHERE @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r1 AND nombre = 'Ensalada mixta');
SET @p_ensalada_r1 = (SELECT id_producto FROM producto WHERE restaurante_id = @r1 AND nombre = 'Ensalada mixta' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p_ensalada_r1, 8 FROM DUAL WHERE @p_ensalada_r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p_ensalada_r1);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Coca-Cola 500ml', 120, 'Bebida fría', NULL, 1, 0, @r1, @sub_bebida
WHERE @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r1 AND nombre = 'Coca-Cola 500ml');
SET @p_coca_r1 = (SELECT id_producto FROM producto WHERE restaurante_id = @r1 AND nombre = 'Coca-Cola 500ml' LIMIT 1);
INSERT INTO articulo (id_producto) SELECT @p_coca_r1 FROM DUAL WHERE @p_coca_r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM articulo WHERE id_producto = @p_coca_r1);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Flan casero', 180, 'Flan de vainilla con dulce de leche', NULL, 1, 0, @r1, @sub_postre
WHERE @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r1 AND nombre = 'Flan casero');
SET @p_flan = (SELECT id_producto FROM producto WHERE restaurante_id = @r1 AND nombre = 'Flan casero' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p_flan, 5 FROM DUAL WHERE @p_flan IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p_flan);

-- Combo parrilla
INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Combo parrillero', 1100, 'Bife + ensalada + bebida', NULL, 1, 0, @r1, @sub_principal
WHERE @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r1 AND nombre = 'Combo parrillero');
SET @p_combo_r1 = (SELECT id_producto FROM producto WHERE restaurante_id = @r1 AND nombre = 'Combo parrillero' LIMIT 1);
INSERT INTO combo (id_producto) SELECT @p_combo_r1 FROM DUAL WHERE @p_combo_r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM combo WHERE id_producto = @p_combo_r1);
INSERT IGNORE INTO combo_productos_incluidos (combo_id_producto, productos_incluidos_id_producto)
SELECT @p_combo_r1, @p_bife FROM DUAL WHERE @p_combo_r1 IS NOT NULL AND @p_bife IS NOT NULL;
INSERT IGNORE INTO combo_productos_incluidos (combo_id_producto, productos_incluidos_id_producto)
SELECT @p_combo_r1, @p_ensalada_r1 FROM DUAL WHERE @p_combo_r1 IS NOT NULL AND @p_ensalada_r1 IS NOT NULL;
INSERT IGNORE INTO combo_productos_incluidos (combo_id_producto, productos_incluidos_id_producto)
SELECT @p_combo_r1, @p_coca_r1 FROM DUAL WHERE @p_combo_r1 IS NOT NULL AND @p_coca_r1 IS NOT NULL;

-- Ingredientes parrilla
INSERT INTO ingrediente (nombre, restaurante_id) SELECT 'Cebolla', @r1 FROM DUAL WHERE @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ingrediente WHERE restaurante_id = @r1 AND nombre = 'Cebolla');
INSERT INTO ingrediente (nombre, restaurante_id) SELECT 'Tomate', @r1 FROM DUAL WHERE @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ingrediente WHERE restaurante_id = @r1 AND nombre = 'Tomate');
INSERT INTO ingrediente (nombre, restaurante_id) SELECT 'Huevo', @r1 FROM DUAL WHERE @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ingrediente WHERE restaurante_id = @r1 AND nombre = 'Huevo');
INSERT INTO ingrediente (nombre, restaurante_id) SELECT 'Chimichurri', @r1 FROM DUAL WHERE @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ingrediente WHERE restaurante_id = @r1 AND nombre = 'Chimichurri');

INSERT IGNORE INTO plato_ingredientes (plato_id_producto, ingredientes_id_ingrediente)
SELECT @p_bife, i.id_ingrediente FROM ingrediente i WHERE i.restaurante_id = @r1 AND i.nombre IN ('Cebolla', 'Chimichurri');
INSERT IGNORE INTO plato_ingredientes (plato_id_producto, ingredientes_id_ingrediente)
SELECT @p_ensalada_r1, i.id_ingrediente FROM ingrediente i WHERE i.restaurante_id = @r1 AND i.nombre IN ('Tomate', 'Huevo', 'Cebolla');

-- =============================================================================
-- PRODUCTOS — Pizzería Demo (rest2)
-- =============================================================================

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id, oferta_id)
SELECT 'Pizza muzzarella', 550, 'Masa a la piedra con muzzarella', NULL, 1, 1, @r2, @sub_principal, @oferta_pizza
WHERE @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r2 AND nombre = 'Pizza muzzarella');
SET @p_muzza = (SELECT id_producto FROM producto WHERE restaurante_id = @r2 AND nombre = 'Pizza muzzarella' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p_muzza, 25 FROM DUAL WHERE @p_muzza IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p_muzza);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Pizza napolitana', 620, 'Tomate, ajo, albahaca y queso', NULL, 1, 0, @r2, @sub_principal
WHERE @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r2 AND nombre = 'Pizza napolitana');
SET @p_napo = (SELECT id_producto FROM producto WHERE restaurante_id = @r2 AND nombre = 'Pizza napolitana' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p_napo, 28 FROM DUAL WHERE @p_napo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p_napo);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Fainá', 180, 'Porción de fainá casero', NULL, 1, 0, @r2, @sub_principal
WHERE @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r2 AND nombre = 'Fainá');
SET @p_faina = (SELECT id_producto FROM producto WHERE restaurante_id = @r2 AND nombre = 'Fainá' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p_faina, 12 FROM DUAL WHERE @p_faina IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p_faina);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Coca-Cola 1.5L', 200, 'Bebida para compartir', NULL, 1, 0, @r2, @sub_bebida
WHERE @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r2 AND nombre = 'Coca-Cola 1.5L');
SET @p_coca_r2 = (SELECT id_producto FROM producto WHERE restaurante_id = @r2 AND nombre = 'Coca-Cola 1.5L' LIMIT 1);
INSERT INTO articulo (id_producto) SELECT @p_coca_r2 FROM DUAL WHERE @p_coca_r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM articulo WHERE id_producto = @p_coca_r2);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Brownie con helado', 220, 'Brownie tibio con bocha de vainilla', NULL, 1, 0, @r2, @sub_postre
WHERE @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r2 AND nombre = 'Brownie con helado');
SET @p_brownie = (SELECT id_producto FROM producto WHERE restaurante_id = @r2 AND nombre = 'Brownie con helado' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p_brownie, 8 FROM DUAL WHERE @p_brownie IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p_brownie);

-- Ingredientes pizza
INSERT INTO ingrediente (nombre, restaurante_id) SELECT 'Muzzarella', @r2 FROM DUAL WHERE @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ingrediente WHERE restaurante_id = @r2 AND nombre = 'Muzzarella');
INSERT INTO ingrediente (nombre, restaurante_id) SELECT 'Salsa de tomate', @r2 FROM DUAL WHERE @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ingrediente WHERE restaurante_id = @r2 AND nombre = 'Salsa de tomate');
INSERT INTO ingrediente (nombre, restaurante_id) SELECT 'Orégano', @r2 FROM DUAL WHERE @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ingrediente WHERE restaurante_id = @r2 AND nombre = 'Orégano');
INSERT INTO ingrediente (nombre, restaurante_id) SELECT 'Albahaca', @r2 FROM DUAL WHERE @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ingrediente WHERE restaurante_id = @r2 AND nombre = 'Albahaca');
INSERT INTO ingrediente (nombre, restaurante_id) SELECT 'Ajo', @r2 FROM DUAL WHERE @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ingrediente WHERE restaurante_id = @r2 AND nombre = 'Ajo');

INSERT IGNORE INTO plato_ingredientes (plato_id_producto, ingredientes_id_ingrediente)
SELECT @p_muzza, i.id_ingrediente FROM ingrediente i WHERE i.restaurante_id = @r2 AND i.nombre IN ('Muzzarella', 'Salsa de tomate', 'Orégano');
INSERT IGNORE INTO plato_ingredientes (plato_id_producto, ingredientes_id_ingrediente)
SELECT @p_napo, i.id_ingrediente FROM ingrediente i WHERE i.restaurante_id = @r2 AND i.nombre IN ('Muzzarella', 'Salsa de tomate', 'Albahaca', 'Ajo');

-- =============================================================================
-- PEDIDOS — distintos estados para panel restaurante + historial cliente
-- Solo se insertan si aún no hay pedidos de prueba
-- =============================================================================

INSERT INTO pago (fecha_pago, id_transaccion, metodo_de_pago, moneda, monto, nro_ultim_dig_tarjeta)
SELECT NOW(), 'MP-SEED-001', 'MercadoPago', 'UYU', 1210, '4532'
WHERE NOT EXISTS (SELECT 1 FROM pedido WHERE total = 1210 AND restaurante_id = @r1);
SET @pago1 = (SELECT id_pago FROM pago WHERE id_transaccion = 'MP-SEED-001' LIMIT 1);

INSERT INTO comentario (calificacion, texto, cliente_id)
SELECT 5, 'Excelente bife, muy jugoso', @c1
WHERE NOT EXISTS (SELECT 1 FROM comentario WHERE texto = 'Excelente bife, muy jugoso');
SET @com1 = (SELECT id_comentario FROM comentario WHERE texto = 'Excelente bife, muy jugoso' LIMIT 1);

INSERT INTO pedido (estado, fecha_creacion, fecha_expiracion, total, cliente_id, restaurante_id,
  calle, numero, latitud, longitud, horario_entrega, tiempo_preparacion, pago_id, comentario_id)
SELECT 'Entregado', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 10 DAY), INTERVAL 24 HOUR),
  1210, @c1, @r1, 'Av. Punta de Rieles', '1520', -34.8720, -56.0520, DATE_SUB(NOW(), INTERVAL 10 DAY), 30, @pago1, @com1
WHERE @c1 IS NOT NULL AND @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pedido WHERE total = 1210 AND restaurante_id = @r1 AND estado = 'Entregado');
SET @ped1 = (SELECT id_pedido FROM pedido WHERE pago_id = @pago1 LIMIT 1);

INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, 'Sin cebolla', 890, @ped1, @p_bife FROM DUAL
WHERE @ped1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto_pedido WHERE pedido_id = @ped1);
SET @pp1 = (SELECT id_producto_pedido FROM producto_pedido WHERE pedido_id = @ped1 LIMIT 1);
INSERT IGNORE INTO producto_pedido_ingredientesaquitar (producto_pedido_id_producto_pedido, ingredientesaquitar_id_ingrediente)
SELECT @pp1, i.id_ingrediente FROM ingrediente i WHERE i.restaurante_id = @r1 AND i.nombre = 'Cebolla' AND @pp1 IS NOT NULL;

INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, NULL, 120, @ped1, @p_coca_r1 FROM DUAL
WHERE @ped1 IS NOT NULL AND (SELECT COUNT(*) FROM producto_pedido WHERE pedido_id = @ped1) < 2;

INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, NULL, 200, @ped1, @p_flan FROM DUAL
WHERE @ped1 IS NOT NULL AND (SELECT COUNT(*) FROM producto_pedido WHERE pedido_id = @ped1) < 3;

-- Pedido EnPreparacion (rest1)
INSERT INTO pago (fecha_pago, id_transaccion, metodo_de_pago, moneda, monto, nro_ultim_dig_tarjeta)
SELECT NOW(), 'MP-SEED-002', 'MercadoPago', 'UYU', 640, '7890'
WHERE NOT EXISTS (SELECT 1 FROM pedido WHERE total = 640 AND restaurante_id = @r1 AND estado = 'EnPreparacion');
SET @pago2 = (SELECT id_pago FROM pago WHERE id_transaccion = 'MP-SEED-002' LIMIT 1);

INSERT INTO pedido (estado, fecha_creacion, fecha_expiracion, total, cliente_id, restaurante_id,
  calle, numero, latitud, longitud, tiempo_preparacion, pago_id)
SELECT 'EnPreparacion', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 23 HOUR),
  640, @c2, @r1, 'Av. Garibaldi', '2100', -34.8745, -56.0480, 20, @pago2
WHERE @c2 IS NOT NULL AND @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pedido WHERE total = 640 AND restaurante_id = @r1 AND estado = 'EnPreparacion');
SET @ped2 = (SELECT id_pedido FROM pedido WHERE pago_id = @pago2 LIMIT 1);

INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 2, NULL, 640, @ped2, @p_chori FROM DUAL
WHERE @ped2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto_pedido WHERE pedido_id = @ped2);

-- Pedido Solicitado (rest1) — en espera de confirmación
INSERT INTO pedido (estado, fecha_creacion, fecha_expiracion, total, cliente_id, restaurante_id,
  calle, numero, latitud, longitud, tiempo_preparacion)
SELECT 'Solicitado', DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_ADD(NOW(), INTERVAL 24 HOUR),
  1100, @c3, @r1, 'Luis Batlle Berres', '890', -34.8705, -56.0550, 35
WHERE @c3 IS NOT NULL AND @r1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pedido WHERE total = 1100 AND restaurante_id = @r1 AND estado = 'Solicitado');
SET @ped3 = (SELECT id_pedido FROM pedido WHERE total = 1100 AND restaurante_id = @r1 AND estado = 'Solicitado' LIMIT 1);

INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, 'Combo para 2', 1100, @ped3, @p_combo_r1 FROM DUAL
WHERE @ped3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto_pedido WHERE pedido_id = @ped3);

-- Pedido EnCamino (rest2)
INSERT INTO pago (fecha_pago, id_transaccion, metodo_de_pago, moneda, monto, nro_ultim_dig_tarjeta)
SELECT NOW(), 'MP-SEED-003', 'MercadoPago', 'UYU', 770, '1234'
WHERE NOT EXISTS (SELECT 1 FROM pedido WHERE total = 770 AND restaurante_id = @r2 AND estado = 'EnCamino');
SET @pago3 = (SELECT id_pago FROM pago WHERE id_transaccion = 'MP-SEED-003' LIMIT 1);

INSERT INTO pedido (estado, fecha_creacion, fecha_expiracion, total, cliente_id, restaurante_id,
  calle, numero, latitud, longitud, tiempo_preparacion, pago_id)
SELECT 'EnCamino', DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_ADD(NOW(), INTERVAL 23 HOUR),
  770, @c1, @r2, 'Av. Punta de Rieles', '1520', -34.8720, -56.0520, 28, @pago3
WHERE @c1 IS NOT NULL AND @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pedido WHERE total = 770 AND restaurante_id = @r2 AND estado = 'EnCamino');
SET @ped4 = (SELECT id_pedido FROM pedido WHERE pago_id = @pago3 LIMIT 1);

INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, NULL, 550, @ped4, @p_muzza FROM DUAL WHERE @ped4 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto_pedido WHERE pedido_id = @ped4 AND producto_id = @p_muzza);
INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, NULL, 220, @ped4, @p_brownie FROM DUAL WHERE @ped4 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto_pedido WHERE pedido_id = @ped4 AND producto_id = @p_brownie);

-- Pedido Pagado (rest2)
INSERT INTO pago (fecha_pago, id_transaccion, metodo_de_pago, moneda, monto, nro_ultim_dig_tarjeta)
SELECT NOW(), 'MP-SEED-004', 'MercadoPago', 'UYU', 800, '5678'
WHERE NOT EXISTS (SELECT 1 FROM pedido WHERE total = 800 AND restaurante_id = @r2 AND estado = 'Pagado');
SET @pago4 = (SELECT id_pago FROM pago WHERE id_transaccion = 'MP-SEED-004' LIMIT 1);

INSERT INTO pedido (estado, fecha_creacion, fecha_expiracion, total, cliente_id, restaurante_id,
  calle, numero, latitud, longitud, tiempo_preparacion, pago_id)
SELECT 'Pagado', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 22 HOUR),
  800, @c4, @r2, 'Bvar. España', '2500', -34.9090, -56.1540, 30, @pago4
WHERE @c4 IS NOT NULL AND @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pedido WHERE total = 800 AND restaurante_id = @r2 AND estado = 'Pagado');
SET @ped5 = (SELECT id_pedido FROM pedido WHERE pago_id = @pago4 LIMIT 1);

INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, 'Extra muzza', 620, @ped5, @p_napo FROM DUAL WHERE @ped5 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto_pedido WHERE pedido_id = @ped5 AND producto_id = @p_napo);
INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, NULL, 180, @ped5, @p_faina FROM DUAL WHERE @ped5 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto_pedido WHERE pedido_id = @ped5 AND producto_id = @p_faina);

-- Pedido Cancelado (rest2)
INSERT INTO pedido (estado, fecha_creacion, fecha_expiracion, total, cliente_id, restaurante_id,
  calle, numero, latitud, longitud, razon_cancelacion, tiempo_preparacion)
SELECT 'Cancelado', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 DAY), INTERVAL 24 HOUR),
  550, @c2, @r2, 'Av. Garibaldi', '2100', -34.8745, -56.0480, 'Cliente no estaba en la dirección', 25
WHERE @c2 IS NOT NULL AND @r2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pedido WHERE total = 550 AND restaurante_id = @r2 AND estado = 'Cancelado');
SET @ped6 = (SELECT id_pedido FROM pedido WHERE total = 550 AND restaurante_id = @r2 AND estado = 'Cancelado' LIMIT 1);

INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, NULL, 550, @ped6, @p_muzza FROM DUAL WHERE @ped6 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto_pedido WHERE pedido_id = @ped6);

-- =============================================================================
-- RECLAMOS — vinculados a pedidos
-- =============================================================================

INSERT INTO reclamo (texto, estado, fecha_reclamo, motivo_rechazo)
SELECT 'El pedido llegó frío y con demora', 'Pendiente', DATE_SUB(NOW(), INTERVAL 2 DAY), NULL
WHERE NOT EXISTS (SELECT 1 FROM reclamo WHERE texto = 'El pedido llegó frío y con demora');
SET @rec1 = (SELECT id_reclamo FROM reclamo WHERE texto = 'El pedido llegó frío y con demora' LIMIT 1);

UPDATE pedido SET reclamo_id = @rec1 WHERE id_pedido = @ped4 AND reclamo_id IS NULL AND @rec1 IS NOT NULL;

INSERT INTO reclamo (texto, estado, fecha_reclamo, motivo_rechazo)
SELECT 'Faltó un producto del combo', 'Resuelto', DATE_SUB(NOW(), INTERVAL 8 DAY), NULL
WHERE NOT EXISTS (SELECT 1 FROM reclamo WHERE texto = 'Faltó un producto del combo');
SET @rec2 = (SELECT id_reclamo FROM reclamo WHERE texto = 'Faltó un producto del combo' LIMIT 1);

UPDATE pedido SET reclamo_id = @rec2 WHERE id_pedido = @ped1 AND reclamo_id IS NULL AND @rec2 IS NOT NULL;

INSERT INTO reclamo (texto, estado, fecha_reclamo, motivo_rechazo)
SELECT 'Reclamo infundado según evidencia', 'Rechazado', DATE_SUB(NOW(), INTERVAL 5 DAY), 'El pedido fue entregado completo según foto del repartidor'
WHERE NOT EXISTS (SELECT 1 FROM reclamo WHERE texto = 'Reclamo infundado según evidencia');
SET @rec3 = (SELECT id_reclamo FROM reclamo WHERE texto = 'Reclamo infundado según evidencia' LIMIT 1);

-- Pedido extra solo para reclamo rechazado
INSERT INTO pedido (estado, fecha_creacion, fecha_expiracion, total, cliente_id, restaurante_id,
  calle, numero, latitud, longitud, reclamo_id, tiempo_preparacion)
SELECT 'Entregado', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 5 DAY), INTERVAL 24 HOUR),
  320, @c3, @r1, 'Luis Batlle Berres', '890', -34.8705, -56.0550, @rec3, 15
WHERE @c3 IS NOT NULL AND @r1 IS NOT NULL AND @rec3 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pedido WHERE reclamo_id = @rec3);
SET @ped7 = (SELECT id_pedido FROM pedido WHERE reclamo_id = @rec3 LIMIT 1);

INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, NULL, 320, @ped7, @p_chori FROM DUAL WHERE @ped7 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM producto_pedido WHERE pedido_id = @ped7);

-- =============================================================================
-- CARRITO DE PRUEBA (cliente 1, rest1)
-- =============================================================================

INSERT INTO carrito (id_restaurante, total, uid_cliente)
SELECT @r1, 890, 'seed-cliente-01'
WHERE NOT EXISTS (SELECT 1 FROM carrito WHERE uid_cliente = 'seed-cliente-01');
SET @carrito1 = (SELECT id_carrito FROM carrito WHERE uid_cliente = 'seed-cliente-01' LIMIT 1);

INSERT INTO linea_carrito (cantidad, observaciones, carrito_id, producto_id)
SELECT 1, 'Punto medio', @carrito1, @p_bife
WHERE @carrito1 IS NOT NULL AND @p_bife IS NOT NULL AND NOT EXISTS (SELECT 1 FROM linea_carrito WHERE carrito_id = @carrito1);

SET @linea1 = (SELECT id_linea FROM linea_carrito WHERE carrito_id = @carrito1 LIMIT 1);
INSERT IGNORE INTO linea_carrito_ingredientes_a_quitar (linea_carrito_id, ingrediente_id)
SELECT @linea1, i.id_ingrediente FROM ingrediente i WHERE i.restaurante_id = @r1 AND i.nombre = 'Cebolla' AND @linea1 IS NOT NULL;

-- =============================================================================
-- RESUMEN FINAL
-- =============================================================================

SELECT 'TABLA' AS seccion, 'registros' AS metrica, COUNT(*) AS valor FROM usuario
UNION ALL SELECT 'administrador', '', COUNT(*) FROM administrador
UNION ALL SELECT 'restaurante (habilitados)', '', COUNT(*) FROM restaurante WHERE habilitado = 1
UNION ALL SELECT 'restaurante (pendientes)', '', COUNT(*) FROM restaurante WHERE habilitado = 0
UNION ALL SELECT 'cliente', '', COUNT(*) FROM cliente
UNION ALL SELECT 'cliente_direcciones', '', COUNT(*) FROM cliente_direcciones
UNION ALL SELECT 'sub_categoria', '', COUNT(*) FROM sub_categoria
UNION ALL SELECT 'producto', '', COUNT(*) FROM producto
UNION ALL SELECT 'plato', '', COUNT(*) FROM plato
UNION ALL SELECT 'articulo', '', COUNT(*) FROM articulo
UNION ALL SELECT 'combo', '', COUNT(*) FROM combo
UNION ALL SELECT 'ingrediente', '', COUNT(*) FROM ingrediente
UNION ALL SELECT 'oferta', '', COUNT(*) FROM oferta
UNION ALL SELECT 'pedido', '', COUNT(*) FROM pedido
UNION ALL SELECT 'producto_pedido', '', COUNT(*) FROM producto_pedido
UNION ALL SELECT 'pago', '', COUNT(*) FROM pago
UNION ALL SELECT 'comentario', '', COUNT(*) FROM comentario
UNION ALL SELECT 'reclamo', '', COUNT(*) FROM reclamo
UNION ALL SELECT 'carrito', '', COUNT(*) FROM carrito
UNION ALL SELECT 'linea_carrito', '', COUNT(*) FROM linea_carrito;

SELECT u.id_usuario, u.nombre, u.email, u.rol,
  CASE u.rol
    WHEN 'Administrador' THEN '(ver credenciales arriba)'
    WHEN 'Restaurante' THEN CONCAT('hab=', r.habilitado+0, ' abierto=', r.abierto+0)
    WHEN 'Cliente' THEN CONCAT('hab=', c.habilitado+0)
  END AS detalle
FROM usuario u
LEFT JOIN restaurante r ON r.id_usuario = u.id_usuario
LEFT JOIN cliente c ON c.id_usuario = u.id_usuario
ORDER BY u.rol, u.id_usuario;

SELECT p.id_pedido, p.estado, p.total, ur.nombre AS restaurante, uc.nombre AS cliente
FROM pedido p
JOIN restaurante r ON r.id_usuario = p.restaurante_id
JOIN usuario ur ON ur.id_usuario = r.id_usuario
JOIN cliente cl ON cl.id_usuario = p.cliente_id
JOIN usuario uc ON uc.id_usuario = cl.id_usuario
ORDER BY p.fecha_creacion DESC;
