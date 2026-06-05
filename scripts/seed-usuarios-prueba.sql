-- Usuarios de prueba: 2 administradores + 2 restaurantes
-- Ejecutar: mysql -u root tregodb < scripts/seed-usuarios-prueba.sql
--
-- CREDENCIALES:
--   Admin 1:  admin1@trego.com  / Admin123!
--   Admin 2:  admin2@trego.com  / Admin456!
--   Rest. 1:  rest1@trego.com  / Rest1234!
--   Rest. 2:  rest2@trego.com  / Rest1234!
--
-- Nota: admin@trego.com / admin123 lo crea Spring al arrancar (DefaultAdminConf).

-- Hashes BCrypt $2a$ generados con Spring BCryptPasswordEncoder (no usar $2b$ de bcryptjs)
SET @pwd_admin1 = '$2a$10$uMCwezEz9Kv3CIy4hku7MOPzUU/TtWejdlCxaCGjS3lyCVU6CUXC6'; -- Admin123!
SET @pwd_admin2 = '$2a$10$gJMRBkbFuOkJupMkzYe4buBvzrqIBTUBQNG8KMm626KlP8rKmbvWG'; -- Admin456!
SET @pwd_rest   = '$2a$10$SbnQodjNSrvyQwr6x/Zw3uelT/WrXQUmTZGdFbENHM4mZ5utvd6wS'; -- Rest1234!

-- ========== ADMINISTRADORES ==========

INSERT INTO usuario (nombre, email, foto_perfil, rol) VALUES
('Admin Uno', 'admin1@trego.com', NULL, 'Administrador');
SET @a1 = LAST_INSERT_ID();
INSERT INTO administrador (id_usuario, password) VALUES (@a1, @pwd_admin1);

INSERT INTO usuario (nombre, email, foto_perfil, rol) VALUES
('Admin Dos', 'admin2@trego.com', NULL, 'Administrador');
SET @a2 = LAST_INSERT_ID();
INSERT INTO administrador (id_usuario, password) VALUES (@a2, @pwd_admin2);

-- ========== RESTAURANTES (habilitados) ==========

INSERT INTO usuario (nombre, email, foto_perfil, rol) VALUES
('Parrilla Demo', 'rest1@trego.com', 'https://picsum.photos/seed/rest1/200', 'Restaurante');
SET @r1 = LAST_INSERT_ID();
INSERT INTO restaurante (
  id_usuario, password, rut, telefono,
  calle, numero, apartamento, esquina, latitud, longitud,
  descripcion, categoria, calificacion_prom, foto_portada,
  habilitado, abierto, hora_apertura, hora_cierre, radio_entrega
) VALUES (
  @r1, @pwd_rest, '21.100.001-1', '099300001',
  'Av. Punta de Rieles', 1520, '0', 'Garibaldi', -34.8720, -56.0520,
  'Parrillada de prueba para desarrollo local.', 'Parrillada', 4.5,
  'https://picsum.photos/seed/rest1portada/800/400',
  1, 0, '11:00:00', '23:00:00', 10
);

INSERT INTO usuario (nombre, email, foto_perfil, rol) VALUES
('Pizzería Demo', 'rest2@trego.com', 'https://picsum.photos/seed/rest2/200', 'Restaurante');
SET @r2 = LAST_INSERT_ID();
INSERT INTO restaurante (
  id_usuario, password, rut, telefono,
  calle, numero, apartamento, esquina, latitud, longitud,
  descripcion, categoria, calificacion_prom, foto_portada,
  habilitado, abierto, hora_apertura, hora_cierre, radio_entrega
) VALUES (
  @r2, @pwd_rest, '21.200.002-2', '099300002',
  'Av. Garibaldi', 2100, '0', 'Punta de Rieles', -34.8745, -56.0480,
  'Pizzería de prueba para desarrollo local.', 'Pizza', 4.3,
  'https://picsum.photos/seed/rest2portada/800/400',
  1, 0, '12:00:00', '00:00:00', 9
);

-- ========== Verificación ==========
SELECT u.id_usuario, u.nombre, u.email, u.rol
FROM usuario u
WHERE u.email IN ('admin1@trego.com', 'admin2@trego.com', 'rest1@trego.com', 'rest2@trego.com')
ORDER BY u.rol, u.id_usuario;
