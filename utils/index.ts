import axios from 'axios';

const showErrorAlert = (error: any) => {
  console.error(error?.message);
  alert(error?.message);
};

const axiosClient = axios.create({
  baseURL: 'https://website-new-gen-66db348f.vercel.app/api/',
  // baseURL: 'http://localhost:3001/api/',
});

export { showErrorAlert, axiosClient };
