import axios from 'axios'

const client = axios.create({ baseURL: '/api', withCredentials: true })

client.interceptors.response.use(
  res => res,
  err => Promise.reject(err)
)

export default client
