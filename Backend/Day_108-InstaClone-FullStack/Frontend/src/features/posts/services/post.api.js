import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:5000/api/posts",
    withCredentials: true
})



export async function getFeed() {
    const response = await api.get('/')
    return response.data
}