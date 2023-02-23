// Función para generar un código numérico de n digitos
const generateOtp = (digits: number) => {
  // Para nuestro caso OTP (One Time Password)
  const otp = Math.random().toFixed(digits).split('.')[1];
  return otp;
};

export default generateOtp;
