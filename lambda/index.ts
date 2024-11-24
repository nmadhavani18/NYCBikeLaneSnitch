import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// this lambda is nonsense its just for testing connectivity via api gateway pls dont put lambda code in your cdk ever
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Only log errors in production
  try {
    switch (event.httpMethod) {
      case 'GET':
        try {
          console.log('Attempting to fetch from httpbin.org...');
          const response = await fetch('https://httpbin.org/get', {
            signal: AbortSignal.timeout(5000)
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} statusText: ${response.statusText}`);
          }

          const data = await response.json();
          console.log('Successfully fetched data from httpbin.org');

          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              message: 'Data from httpbin',
              data: data,
              timestamp: new Date().toISOString(),
            }),
          };
        } catch (fetchError) {
          // Type guard for Error objects
          const error = fetchError as Error;

          // Enhanced error logging
          console.error('Detailed fetch error:', {
            name: error.name || 'Unknown',
            message: error.message || 'Unknown error',
            stack: error.stack,
            // Only include cause if it exists
            // ...(error.cause && { cause: error.cause }),
          });

          // Check for specific error types
          let errorMessage = 'Error fetching external data';
          let statusCode = 502;

          if (error instanceof TypeError) {
            errorMessage = 'Network error - possible VPC/connectivity issue';
            console.error('Network error details:', {
              vpc: process.env.AWS_LAMBDA_VPC_ID,
              subnet: process.env.AWS_LAMBDA_SUBNET_ID,
            });
          } else if (error.name === 'AbortError') {
            errorMessage = 'Request timed out';
            statusCode = 504;
          }

          return {
            statusCode: statusCode,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              message: errorMessage,
              error: {
                type: error.name || 'Unknown',
                details: error.message || 'No additional details',
              },
              timestamp: new Date().toISOString(),
            }),
          };
        }

      case 'POST':
        const body = JSON.parse(event.body || '{}');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            message: 'Data received',
            data: body,
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
          body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }
  } catch (error) {
    // Only log actual errors
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
