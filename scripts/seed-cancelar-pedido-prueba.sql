-- =============================================================================
-- SEED — pedido cancelable (estado Pagado + pago) para probar "Cancelar pedido"
-- Requiere haber ejecutado antes: scripts/seed-completo-prueba.sql
--
-- Ejecutar:
--   mysql -u root -p1234 tregodb < scripts/seed-cancelar-pedido-prueba.sql
--
-- CASO A — Cliente demo del seed (cliente04@trego.com / Diego Fernández)
--   El pedido Pagado $800 en Pizzería Demo ya viene en seed-completo-prueba.sql.
--   Para verlo en /Historial debés vincular tu cuenta Firebase:
--     1. Iniciá sesión en el front con Google (una sola vez).
--     2. En consola del navegador: localStorage.getItem('jwtToken') no da el uid;
--        mirá en Firebase o ejecutá el UPDATE de abajo con tu uid de Firebase.
--     3. UPDATE cliente c
--        JOIN usuario u ON u.id_usuario = c.id_usuario
--        SET c.uid_cliente = 'TU_FIREBASE_UID'
--        WHERE u.email = 'cliente04@trego.com';
--
-- CASO B — Tu cliente recién creado al loguearte con Google
--   Este script inserta un pedido Pagado para el cliente con email indicado
--   (por defecto: el último cliente registrado en la BD).
-- =============================================================================

USE tregodb;

-- Cambiá el email si querés otro cliente del seed
SET @email_cliente = 'cliente04@trego.com';
SET @c = (SELECT u.id_usuario FROM usuario u JOIN cliente cl ON cl.id_usuario = u.id_usuario WHERE u.email = @email_cliente LIMIT 1);

-- Si no existe cliente04, usa el último cliente creado (típico tras login Google)
SET @c = IFNULL(@c, (SELECT id_usuario FROM cliente ORDER BY id_usuario DESC LIMIT 1));

SET @r2 = (SELECT id_usuario FROM usuario WHERE email = 'rest2@trego.com' LIMIT 1);
SET @p_napo = (SELECT id_producto FROM producto WHERE restaurante_id = @r2 AND nombre = 'Pizza napolitana' LIMIT 1);
SET @p_faina = (SELECT id_producto FROM producto WHERE restaurante_id = @r2 AND nombre = 'Fainá' LIMIT 1);

-- Pago ficticio (el backend exige id_transaccion para reembolsar/cancelar)
INSERT INTO pago (fecha_pago, id_transaccion, metodo_de_pago, moneda, monto, nro_ultim_dig_tarjeta)
SELECT NOW(), CONCAT('MP-CANCEL-TEST-', UNIX_TIMESTAMP()), 'MercadoPago', 'UYU', 950, '4242'
WHERE @c IS NOT NULL AND @r2 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM pedido
    WHERE cliente_id = @c AND restaurante_id = @r2 AND estado = 'Pagado' AND total = 950
  );

SET @pago = (
  SELECT id_pago FROM pago
  WHERE id_transaccion LIKE 'MP-CANCEL-TEST-%'
  ORDER BY id_pago DESC LIMIT 1
);

INSERT INTO pedido (estado, fecha_creacion, fecha_expiracion, total, cliente_id, restaurante_id,
  calle, numero, latitud, longitud, tiempo_preparacion, pago_id)
SELECT 'Pagado', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_ADD(NOW(), INTERVAL 23 HOUR),
  950, @c, @r2, 'Bvar. España', '2500', -34.9090, -56.1540, 25, @pago
WHERE @c IS NOT NULL AND @r2 IS NOT NULL AND @pago IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM pedido
    WHERE cliente_id = @c AND restaurante_id = @r2 AND estado = 'Pagado' AND total = 950
  );

SET @ped = (
  SELECT id_pedido FROM pedido
  WHERE cliente_id = @c AND restaurante_id = @r2 AND estado = 'Pagado' AND total = 950
  ORDER BY id_pedido DESC LIMIT 1
);

INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, 'Prueba cancelar pedido', IFNULL((SELECT precio FROM producto WHERE id_producto = @p_napo), 620), @ped, @p_napo
WHERE @ped IS NOT NULL AND @p_napo IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM producto_pedido WHERE pedido_id = @ped AND producto_id = @p_napo);

INSERT INTO producto_pedido (cantidad, comentario_cliente, precio_suma, pedido_id, producto_id)
SELECT 1, NULL, IFNULL((SELECT precio FROM producto WHERE id_producto = @p_faina), 180), @ped, @p_faina
WHERE @ped IS NOT NULL AND @p_faina IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM producto_pedido WHERE pedido_id = @ped AND producto_id = @p_faina);

SELECT 'Pedido listo para cancelar' AS resultado,
  @ped AS id_pedido,
  @c AS cliente_id,
  (SELECT email FROM usuario WHERE id_usuario = @c) AS cliente_email,
  'Pagado' AS estado,
  950 AS total;

SELECT p.id_pedido, p.estado, p.total, uc.nombre AS cliente, ur.nombre AS restaurante, pg.id_transaccion
FROM pedido p
JOIN cliente cl ON cl.id_usuario = p.cliente_id
JOIN usuario uc ON uc.id_usuario = cl.id_usuario
JOIN restaurante r ON r.id_usuario = p.restaurante_id
JOIN usuario ur ON ur.id_usuario = r.id_usuario
LEFT JOIN pago pg ON pg.id_pago = p.pago_id
WHERE p.id_pedido = @ped;
