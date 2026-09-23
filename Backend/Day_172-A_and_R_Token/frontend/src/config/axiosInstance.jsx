import axios from "axios";

export const axiosInstance = axios.create({
     baseURL: "http://localhost:5000",
     withCredentials: true,
})

// // Interceptor to handle 401 errors and refresh the access token
// axiosInstance.interceptors.response.use(
//   (response) => response, // Return the response if it's successful
//   async (error) => {
//     let originalReq = error.config; // Store the original request configuration

//     // Check if the error is a 401 and the request has not been retried yet
//     if (error.response.status === 401 && !originalReq.retry) {
//       originalReq.retry = true;

//       // Attempt to refresh the access token
//       try {
//         await axiosInstance.get("/api/auth/get-accessToken");
//         return axiosInstance(originalReq);
//       } catch (error) {
//         window.location.href = "/";
//         return Promise.reject(error);
//       }
//     }
//   }
// );

// // Interceptor to add the access token to the request headers
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");
//      if (token) {
//            config.headers["Authorization"] = `Bearer ${token}`;
//      }
//      return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );


// Interceptor to handle 401 errors and refresh the access token
axiosInstance.interceptors.response.use(  // Return the response if it's successful
     (response) => response, 

     // Interceptor to add the access token to the request headers
     async (error) => {
          const originalRequest = error.config; // Store the original request configuration
          if (error.response?.status === 401 && !originalRequest.retry && originalRequest.url !== "/api/auth/me") // Check if the error is a 401 and the request has not been retried yet
          {
               originalRequest.retry = true;  // Mark the request as retried

               try{ // Attempt to refresh the access token
                    await axiosInstance.get("/api/auth/get-accessToken"); // Call the endpoint to refresh the access token
                    return axiosInstance(originalRequest); // Retry the original request with the new access token
               } catch (refreshError) {
                    window.location.href = "/";
                    return Promise.reject(refreshError);
               }
          }
          return Promise.reject(error); // Reject the error if it's not a 401 or if the request has already been retried
     } 
)
