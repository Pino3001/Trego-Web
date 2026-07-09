# TREGO Web

> Aplicación web de **TREGO**, una plataforma de pedidos de comida en línea desarrollada como proyecto final de la carrera **Tecnólogo en Informática**.

TREGO Web permite la gestión de la plataforma desde distintos perfiles de usuario. A través de una interfaz moderna e intuitiva, los restaurantes pueden administrar su catálogo de productos y pedidos, mientras que los administradores supervisan el funcionamiento general del sistema y gestionan la incorporación de nuevos establecimientos.

---

## Características

### Restaurante

- 🍽️ Gestión de productos, platos, artículos y combos.
- 🏷️ Creación y administración de ofertas.
- 📦 Gestión de pedidos recibidos.
- 📍 Configuración de zonas y radios de entrega.
- 🖼️ Administración de imágenes mediante Cloudinary.
- ⭐ Consulta de comentarios y calificaciones recibidas.

### Administrador

- 🏪 Alta y validación de restaurantes.
- 👥 Gestión de usuarios.
- 🍴 Administración de categorías gastronómicas.
- 📊 Supervisión general del funcionamiento de la plataforma.

---

# Arquitectura

La aplicación fue desarrollada con React (con soporte de TypeScript via definiciones .d.ts), implementando una arquitectura modular basada en componentes reutilizables y separación de responsabilidades. 

La comunicación con el backend se realiza mediante servicios REST, mientras que Firebase proporciona los mecanismos de autenticación.

```
Browser → React (Client)
├─ Components / Pages
├─ Context / Hooks
├─ Services (src/api) — Axios + Firebase SDK
└─ Utils / Assets
Services → REST API OR Firebase (Auth / Firestore) → DB / Cloudinary (imágenes)
```

---

# Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| React 19 | Biblioteca para la interfaz de usuario |
| TypeScript | Lenguaje principal |
| Vite | Herramienta de desarrollo y compilación |
| React Router | Navegación |
| TailwindCSS | Estilos |
| Axios | Consumo de APIs |
| Firebase Authentication | Autenticación |
| Cloudinary | Gestión de imágenes |

---

## 📁 Organización del código

```text
src/
├── api/            # Comunicación con el backend
├── assets/         # Recursos gráficos
├── components/     # Componentes reutilizables
├── constants/      # Constantes de la aplicación
├── context/        # Context API
├── data/           # Modelos y datos auxiliares
├── hooks/          # Hooks personalizados
├── pages/          # Pantallas de la aplicación
├── utils/          # Funciones auxiliares
│
├── App.jsx
└── main.jsx
```

---

# Instalación

## Clonar el repositorio

```bash
git clone https://github.com/Pino3001/Trego-Web.git
```

Ingresar al proyecto

```bash
cd Trego-Web
```

Instalar dependencias

```bash
npm install
```

Crear el archivo de variables de entorno

```bash
cp .env.example .env
```

Completar las variables correspondientes.

---

# Variables de entorno

La aplicación utiliza variables con prefijo `VITE_`.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

VITE_API_URL=
```

> **Importante:** No incluir credenciales privadas dentro del repositorio.

---

# Ejecución

Modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en

```
http://localhost:5173
```

---

# Scripts

| Script | Descripción |
|---------|-------------|
| npm run dev | Inicia el servidor de desarrollo |
| npm run build | Genera la versión de producción |
| npm run preview | Previsualiza la build generada |
| npm run lint | Ejecuta ESLint |

---

# Capturas de pantalla

| Inicio de sesión | Panel Restaurante |
|------------------|-------------------|
| Imagen | Imagen |

| Gestión de Productos | Gestión de Pedidos |
|----------------------|--------------------|
| Imagen | Imagen |

| Gestión de Ofertas | Panel Administrador |
|--------------------|---------------------|
| Imagen | Imagen |

---

# Backend

Esta aplicación consume los servicios REST desarrollados para la plataforma TREGO.

Servicios utilizados:

- API REST
- Firebase Authentication
- Cloudinary
- Geoapify

---

# Buenas prácticas

- Mantener las credenciales fuera del repositorio.
- Utilizar variables de entorno para la configuración.
- Ejecutar `npm run lint` antes de publicar cambios.
- Generar siempre una build de producción antes del despliegue.

---

# Repositorios relacionados

- 📱 Aplicación Android
- 🌐 Aplicación Web (este repositorio)
- ⚙️ Backend REST

---

## 👨‍💻 Autores

**Grupo 6 - Proyecto Final**

- Alexis La Cruz
- Ezequiel Medina
- Maikol Brion
- Dámaso Tor
- Horacio Duarte
- Nicolas Fernandez
- Cristian Gonzalez
- Mateo Sparano
---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos como trabajo final de carrera.

No se autoriza su utilización comercial sin el consentimiento de sus autores.
