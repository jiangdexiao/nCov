import axios from 'axios'

export const fetcher = (url) => axios(url).then(data => {
  return data.data.data
})
