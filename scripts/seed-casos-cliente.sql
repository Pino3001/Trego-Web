-- =============================================================================
-- SEED — Casos de uso Cliente (listar / ver menú / realizar pedidos)
-- Ejecutar después de seed-usuarios-prueba.sql y seed-completo-prueba.sql
--
--   mysql -u root tregodb < scripts/seed-casos-cliente.sql
--
-- Cubre:
--   1. Listar restaurantes registrados (habilitados, variedad de categorías)
--   2. Ver menú (productos, subcategorías, ofertas, ingredientes, combos)
--   3. Realizar pedidos (locales abiertos, dirección del cliente, carrito)
-- =============================================================================

USE tregodb;

SET @sub_principal = (SELECT id_sub_categoria FROM sub_categoria WHERE categoria = 'Principal' ORDER BY id_sub_categoria LIMIT 1);
SET @sub_bebida    = (SELECT id_sub_categoria FROM sub_categoria WHERE categoria = 'Bebida' ORDER BY id_sub_categoria LIMIT 1);
SET @sub_postre    = (SELECT id_sub_categoria FROM sub_categoria WHERE categoria = 'Postre' ORDER BY id_sub_categoria LIMIT 1);
SET @sub_ensalada  = (SELECT id_sub_categoria FROM sub_categoria WHERE categoria = 'Ensalada' ORDER BY id_sub_categoria LIMIT 1);

-- =============================================================================
-- DIRECCIÓN para el cliente real (Firebase) — necesaria para confirmar pedido
-- =============================================================================

SET @gonzalo = (SELECT id_usuario FROM cliente WHERE uid_cliente = 'w0QRqHyNZUVFcQhgTNxBmr0Ao4y1' LIMIT 1);
SET @gonzalo = IFNULL(@gonzalo, (SELECT id_usuario FROM usuario WHERE email = 'generico080113@gmail.com' LIMIT 1));

INSERT INTO cliente_direcciones (cliente_id_usuario, calle, numero, apartamento, esquina, latitud, longitud, tag)
SELECT @gonzalo, 'Av. Punta de Rieles', '1520', '0', 'Garibaldi', -34.8720, -56.0520, 'Casa'
WHERE @gonzalo IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM cliente_direcciones WHERE cliente_id_usuario = @gonzalo);

-- =============================================================================
-- RESTAURANTES Punta de Rieles — habilitados, abiertos y con menú
-- (complementa seed-restaurantes-punta-rieles.sql)
-- =============================================================================

-- Parrilla Punta Rieles (id 5)
UPDATE restaurante SET habilitado = 1, abierto = 1, hora_apertura = '11:00:00', hora_cierre = '23:30:00', radio_entrega = 15
WHERE id_usuario = 5;

SET @r5 = 5;

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Tira de asado', 780, 'Tira de asado a la parrilla 400g', NULL, 1, 0, @r5, @sub_principal
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r5 AND nombre = 'Tira de asado');
SET @p = (SELECT id_producto FROM producto WHERE restaurante_id = @r5 AND nombre = 'Tira de asado' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p, 30 FROM DUAL WHERE @p IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Morcilla parrillera', 280, 'Morcilla artesanal', NULL, 1, 0, @r5, @sub_principal
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r5 AND nombre = 'Morcilla parrillera');
SET @p = (SELECT id_producto FROM producto WHERE restaurante_id = @r5 AND nombre = 'Morcilla parrillera' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p, 15 FROM DUAL WHERE @p IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Ensalada criolla', 250, 'Lechuga, tomate, cebolla y huevo', NULL, 1, 0, @r5, @sub_ensalada
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r5 AND nombre = 'Ensalada criolla');
SET @p = (SELECT id_producto FROM producto WHERE restaurante_id = @r5 AND nombre = 'Ensalada criolla' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p, 8 FROM DUAL WHERE @p IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Agua mineral 500ml', 80, 'Agua sin gas', NULL, 1, 0, @r5, @sub_bebida
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r5 AND nombre = 'Agua mineral 500ml');
SET @p = (SELECT id_producto FROM producto WHERE restaurante_id = @r5 AND nombre = 'Agua mineral 500ml' LIMIT 1);
INSERT INTO articulo (id_producto) SELECT @p FROM DUAL WHERE @p IS NOT NULL AND NOT EXISTS (SELECT 1 FROM articulo WHERE id_producto = @p);

INSERT INTO ingrediente (nombre, restaurante_id) SELECT 'Chimichurri', @r5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM ingrediente WHERE restaurante_id = @r5 AND nombre = 'Chimichurri');
INSERT INTO ingrediente (nombre, restaurante_id) SELECT 'Cebolla', @r5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM ingrediente WHERE restaurante_id = @r5 AND nombre = 'Cebolla');

-- Pizza Bella Italia (id 6)
UPDATE restaurante SET habilitado = 1, abierto = 1, hora_apertura = '12:00:00', hora_cierre = '00:00:00', radio_entrega = 15
WHERE id_usuario = 6;

SET @r6 = 6;

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Pizza cuatro quesos', 680, 'Muzzarella, roquefort, parmesano y provolone', NULL, 1, 0, @r6, @sub_principal
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r6 AND nombre = 'Pizza cuatro quesos');
SET @p = (SELECT id_producto FROM producto WHERE restaurante_id = @r6 AND nombre = 'Pizza cuatro quesos' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p, 28 FROM DUAL WHERE @p IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Empanada de carne', 120, 'Empanada criolla al horno', NULL, 1, 0, @r6, @sub_principal
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r6 AND nombre = 'Empanada de carne');
SET @p = (SELECT id_producto FROM producto WHERE restaurante_id = @r6 AND nombre = 'Empanada de carne' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p, 10 FROM DUAL WHERE @p IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Coca-Cola 500ml', 120, 'Bebida fría', NULL, 1, 0, @r6, @sub_bebida
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r6 AND nombre = 'Coca-Cola 500ml');
SET @p = (SELECT id_producto FROM producto WHERE restaurante_id = @r6 AND nombre = 'Coca-Cola 500ml' LIMIT 1);
INSERT INTO articulo (id_producto) SELECT @p FROM DUAL WHERE @p IS NOT NULL AND NOT EXISTS (SELECT 1 FROM articulo WHERE id_producto = @p);

-- Rotisería El Tranvía (id 7) — ya habilitada y abierta
SET @r7 = 7;

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Milanesa con papas', 420, 'Milanesa de nalga con papas fritas', NULL, 1, 0, @r7, @sub_principal
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r7 AND nombre = 'Milanesa con papas');
SET @p = (SELECT id_producto FROM producto WHERE restaurante_id = @r7 AND nombre = 'Milanesa con papas' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p, 20 FROM DUAL WHERE @p IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Chivito al pan', 490, 'Chivito completo con papas', NULL, 1, 0, @r7, @sub_principal
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r7 AND nombre = 'Chivito al pan');
SET @p = (SELECT id_producto FROM producto WHERE restaurante_id = @r7 AND nombre = 'Chivito al pan' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p, 18 FROM DUAL WHERE @p IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Menú del día', 350, 'Plato del día con guarnición y postre', NULL, 1, 0, @r7, @sub_principal
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r7 AND nombre = 'Menú del día');
SET @p = (SELECT id_producto FROM producto WHERE restaurante_id = @r7 AND nombre = 'Menú del día' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p, 15 FROM DUAL WHERE @p IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p);

INSERT INTO producto (nombre, precio, descripcion, url_imagen, disponible, oferta_activa, restaurante_id, subcategoria_id)
SELECT 'Arroz con leche', 150, 'Postre casero', NULL, 1, 0, @r7, @sub_postre
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE restaurante_id = @r7 AND nombre = 'Arroz con leche');
SET @p = (SELECT id_producto FROM producto WHERE restaurante_id = @r7 AND nombre = 'Arroz con leche' LIMIT 1);
INSERT INTO plato (id_producto, tiempo_preparacion_minutos)
SELECT @p, 5 FROM DUAL WHERE @p IS NOT NULL AND NOT EXISTS (SELECT 1 FROM plato WHERE id_producto = @p);

-- =============================================================================
-- CARRITO de prueba para Gonzalo (uid Firebase real)
-- =============================================================================

SET @r1 = (SELECT id_usuario FROM usuario WHERE email = 'rest1@trego.com' LIMIT 1);
SET @p_bife = (SELECT id_producto FROM producto WHERE restaurante_id = @r1 AND nombre = 'Bife de chorizo' LIMIT 1);

INSERT INTO carrito (id_restaurante, total, uid_cliente)
SELECT @r1, 890, 'w0QRqHyNZUVFcQhgTNxBmr0Ao4y1'
WHERE @r1 IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM carrito WHERE uid_cliente = 'w0QRqHyNZUVFcQhgTNxBmr0Ao4y1');
SET @carrito_g = (SELECT id_carrito FROM carrito WHERE uid_cliente = 'w0QRqHyNZUVFcQhgTNxBmr0Ao4y1' LIMIT 1);

INSERT INTO linea_carrito (cantidad, observaciones, carrito_id, producto_id, precio_unitario)
SELECT 1, 'Sin cebolla', @carrito_g, @p_bife, 890
WHERE @carrito_g IS NOT NULL AND @p_bife IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM linea_carrito WHERE carrito_id = @carrito_g);

-- =============================================================================
-- RESUMEN
-- =============================================================================

SELECT 'RESTAURANTES HABILITADOS' AS seccion, COUNT(*) AS total FROM restaurante WHERE habilitado = 1
UNION ALL SELECT 'RESTAURANTES ABIERTOS', COUNT(*) FROM restaurante WHERE abierto = 1
UNION ALL SELECT 'CON PRODUCTOS', COUNT(DISTINCT restaurante_id) FROM producto
UNION ALL SELECT 'CLIENTES CON DIRECCION', COUNT(DISTINCT cliente_id_usuario) FROM cliente_direcciones
UNION ALL SELECT 'PEDIDOS', COUNT(*) FROM pedido;

SELECT u.id_usuario, u.nombre,
       r.habilitado+0 AS hab, r.abierto+0 AS abierto,
       r.categoria,
       (SELECT COUNT(*) FROM producto p WHERE p.restaurante_id = u.id_usuario) AS productos
FROM usuario u
JOIN restaurante r ON r.id_usuario = u.id_usuario
WHERE r.habilitado = 1
ORDER BY u.id_usuario;

SELECT p.id_producto, p.nombre, p.precio, u.nombre AS restaurante, sc.categoria AS tipo_menu
FROM producto p
JOIN usuario u ON u.id_usuario = p.restaurante_id
LEFT JOIN sub_categoria sc ON sc.id_sub_categoria = p.subcategoria_id
WHERE p.disponible = 1
ORDER BY p.restaurante_id, sc.categoria, p.nombre;
