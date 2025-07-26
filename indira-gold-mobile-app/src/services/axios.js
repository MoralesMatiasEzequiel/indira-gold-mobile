import axios from 'axios';
import { API_URL } from '@env';
// import { toast } from 'react-toastify';

// let toastId = null; // Para evitar múltiples notificaciones

// Crear instancia de Axios
const api = axios.create({
  // baseURL: 'http://localhost:3001', //este no funciona para los teléfonos
  // baseURL: 'http://192.168.100.5:3001/', 
  baseURL: API_URL, 
});

// Interceptor de respuestas
// api.interceptors.response.use(
//   (response) => response, // Si la respuesta es correcta, la dejamos pasar
//   (error) => {
//     // Verificar si es un error de conexión (sin respuesta del servidor)
//     if (!error.response) {
//       if (!toastId) {
//         toastId = toast.error('No hay conexión con el servidor. Reiniciar Docker.', {
//           autoClose: false, // Mantener el toast visible
//           closeOnClick: false, // No cerrar al hacer clic
//           onClose: () => (toastId = null), // Resetear el ID del toast cuando se cierra
//         });
//       }
//     } else {
//       // Puedes manejar otros tipos de errores aquí si es necesario
//       // toast.error(`Error: ${error.response.data.message}`);
//       console.error(`Error: ${error.response.data.message}`);  
//     }

//     return Promise.reject(error); // Rechazar el error para manejarlo en otras partes si es necesario
//   }
// );

export default api;
