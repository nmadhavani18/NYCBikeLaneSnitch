import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Request received:', {
      method: event.httpMethod,
      path: event.path,
      resource: event.resource
    });

    switch (event.httpMethod) {
      case 'GET':
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            message: 'Hello World from getHelloWorld()!',
            endpoint: '/api',
            method: 'GET',
            timestamp: new Date().toISOString(),
          }),
        };

      case 'POST':
        const body = JSON.parse(event.body || '{}');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            message: 'Hello World from postHelloWorld()!',
            endpoint: '/api',
            method: 'POST',
            receivedData: body,
            timestamp: new Date().toISOString(),
          }),
        };

      default:
        return {
          statusCode: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ 
            message: 'Method not allowed',
            allowedMethods: ['GET', 'POST']
          }),
        };
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
};
