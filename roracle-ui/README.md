# RORacle UI

A web application that interfaces with the RORacle API to help identify scholarly organizations from affiliation strings.

## Features

- Paste affiliation strings and get matching ROR IDs
- Run test suites to evaluate RORacle's performance
- View detailed statistics about test results with filtering and sorting options
- Export results as CSV

## Technology Stack

- Vue 3 - Frontend framework
- Vite - Build tool
- Vue Router - Navigation
- Axios - API requests

## Requirements

- Node.js >= 18
- npm >= 10

## Setup

1. Clone the repository
2. Install dependencies

```bash
cd roracle-ui
npm install
```

## Development

To run the development server:

```bash
npm run dev
```

This will start the development server at http://localhost:3000.

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Information

The application uses the RORacle API to identify scholarly organizations in affiliation strings:

- API Documentation: https://api.roracle.org/docs
- Example API call: https://api.roracle.org/ror-records?affiliation=MIT,Cambridge%20MA,University%20of%20florida
- Test suite endpoint: https://api.roracle.org/tests

## License

ISC
