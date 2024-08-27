import axios from 'axios';

const showErrorAlert = (error: any) => {
  console.error(error?.message);
  alert(error?.message);
};

const axiosClient = axios.create({
  baseURL: 'http://192.168.100.63:3000/api/',
});

export { showErrorAlert, axiosClient };
