const showErrorAlert = (error: any) => {
  console.error(error?.message);
  alert(error?.message);
};

export { showErrorAlert };
