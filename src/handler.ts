import { Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import generateOtp from './helpers/generateOtp';
import AWS from 'aws-sdk';

// Instanciamos el servicio de simple queue
const sqs = new AWS.SQS({ region: process.env.REGION });
const QUEUE_URL = process.env.QUEUE_URL as string;

export const initializeRequest = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  context.callbackWaitsForEmptyEventLoop = false;

  // Mensaje para ver si llegamos al handler - initializeRequest
  console.log('Inicio desde initializeRequest');

  // Si existe una cabecera
  if (event.headers) {
    // Si existe el parámetro Authorization
    if (event.headers.Authorization) {
      try {
        // Obtenemos el número de serie del POS de la cabecera
        const serialNumber = event.headers.Authorization as string;

        // Mostramos el valor de SerialNumber
        console.log('Valor de serialNumber ', serialNumber);

        // Obtenemos el correo y número de teléfono
        const email = 'cs@Inkafarme.com';
        const phone = '987654321';

        // Generamos el OTP de 06 dígitos
        const otp = generateOtp(6);

        console.log('Valor del OTP ', { otp });

        const messageBody = {
          Status: true,
          Mensaje: 'Recepción de datos del lambda A exitosamente',
          Email: email,
          PhoneNumber: phone
        };

        // Definimos los parámetros que enviaremos a la cola
        const params: AWS.SQS.SendMessageRequest = {
          MessageBody: JSON.stringify(messageBody),
          QueueUrl: QUEUE_URL
        };

        const data = await sqs.sendMessage(params).promise();

        // Enviamos el mensaje a de temporal codes
        if (data && data.MessageId) {
          console.log('El id del mensaje SQS es =>', data.MessageId);
        }

        const mesResp = 'Se hizo la comunicación entre Lambdas correctamente';

        console.log(mesResp);

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            mensaje: mesResp
          })
        };
      } catch (error) {
        // Mostramos mensaje de error
        console.log('Mostramos mensaje de error: ', error);

        console.log(error);
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            message: error
          })
        };
      }
    } else {
      console.log('No se ha proporcionado el número de serie del terminal POS en la cabecera');

      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'No se ha proporcionado el número de serie del terminal POS en la cabecera'
        })
      };
    }
  } else {
    // Mensaje de que no se ha enviado parametro de serialNumber
    console.log('No se ha proporcionado una cabecera a la petición');

    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: 'No se ha proporcionado una cabecera a la petición'
      })
    };
  }
};
