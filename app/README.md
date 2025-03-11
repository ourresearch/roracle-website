# RORacle UI

A modern web interface for the RORacle API, which performs named entity recognition on scholarly affiliation strings to discover organizations and return their ROR IDs.

## Features

- Submit affiliation strings to identify organizations and their ROR IDs
- View test results with precision and recall metrics
- Filter test results by dataset and status (passing/failing)
- Visual indicators for matches, overmatches, and undermatches
- Download results as CSV

## Tech Stack

- **Framework**: React with TypeScript
- **Routing**: React Router
- **Styling**: Tailwind CSS with shadcn components
- **API Integration**: RORacle API (https://api.roracle.org/)
- **Deployment**: Vercel

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## API Endpoints

The application integrates with the following RORacle API endpoints:

- `/ror-records` - Submit affiliation strings to identify organizations
- `/tests/datasets` - List available test datasets
- `/tests/datasets/{dataset_id}` - Run tests for a specific dataset
- `/tests/{test_id}` - Get results for a specific test

## Pages

### Home

Allows users to submit affiliation strings for processing. Submissions can be made by clicking the Submit button or using Cmd + Enter.

### Results

Displays the results of processing affiliation strings, showing identified organizations with their ROR IDs. Includes statistics and a CSV download option.

### Tests

Displays test results with precision and recall metrics. Organizations are color-coded based on match status (match, overmatch, undermatch).

## Learn More

- [React Documentation](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ROR (Research Organization Registry)](https://ror.org/)
