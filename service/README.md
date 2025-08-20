# Service Layer

This directory contains all the service code for the NYC Bike Lane Snitch application.

## Structure

```
service/
├── handlers/          # Lambda function handlers
│   └── hello-world.ts # Hello World API handler (TypeScript)
├── package.json       # Service dependencies
├── tsconfig.json      # TypeScript configuration
└── README.md         # This file
```

## Handlers

### hello-world.js
A simple Lambda handler that responds with "Hello World" for GET and POST requests.

**Endpoints:**
- `GET /api` - Returns "Hello World" message
- `POST /api` - Returns "Hello World" with received data

## Development

To add new handlers:
1. Create a new `.ts` file in the `handlers/` directory
2. Export a `handler` function with proper TypeScript types (`APIGatewayProxyEvent`, `APIGatewayProxyResult`)
3. Update the Lambda stack to reference the new handler
4. Deploy the changes

## Dependencies

If you need to add dependencies, install them in this directory:
```bash
cd service
npm install <package-name>
```
