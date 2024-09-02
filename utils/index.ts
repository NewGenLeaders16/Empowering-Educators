import axios from 'axios';

const showErrorAlert = (error: any) => {
  console.error(error?.message);
  alert(error?.message);
};

const axiosClient = axios.create({
  baseURL: 'https://empowering-educators-backend.vercel.app/api/',
});

export { showErrorAlert, axiosClient };
