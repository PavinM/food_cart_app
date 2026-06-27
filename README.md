# Food Cart App

A premium, interactive single-page React application for browsing restaurants, managing a food shopping cart, and checking out with Razorpay integration.

## Key Features

- **Restaurant Browser**: Dynamic homepage showing curated restaurants, search bars, banners, and categories.
- **Search System**: Live search component to query matching dishes or restaurants.
- **Interactive Cart**: Global React Context (`CartContext`) managing the shopping cart state (adding, removing, quantity adjustment, and clearing).
- **Interactive FAQ (Help Center)**: Collapsible accordion panels showing frequently asked questions with smooth state management.
- **Razorpay Checkout**: Seamless integration with Razorpay Checkout SDK to trigger payment modal on checkout.
- **Custom SPA Routing**: High-performance client-side router (`AppLink` and `useLocationState`) leveraging the HTML5 History API to transition screens smoothly without page reloads.

## Tech Stack

- **Framework**: React 18 (using standard React Hooks & Context API)
- **Styling**: Premium CSS (`src/styles.css`) utilizing the Inter Google Font for clean modern typography, custom components, and responsive grid layouts.
- **Build System**: React Scripts (`react-scripts`) for compiling, bundling, and hot reloading.
- **Integrations**: Razorpay Checkout SDK.

## Project Structure

```text
foodApp/
├── public/
│   └── index.html         # Application container with external Razorpay SDK scripts
├── src/
│   ├── data.js            # Mock data (restaurant details, categories, menus, FAQs)
│   ├── index.js           # Main React entry point containing pages, components, & router
│   └── styles.css         # UI design style definitions
├── package.json           # Build scripts & npm package dependency definitions
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v16 or higher recommended) along with npm.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make edits.\
You will also see any lint errors in the console.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
