# PeakMobile CSV Data Cleaner & Uploader

A smart, lightweight web-based tool for cleaning, validating and standardizing CSV data before upload to backend systems. Specifically designed for PeakMobile's customer data (phone numbers, airtime allocations, etc.)

## Features

### Core Features
- **CSV Upload & Preview** - Upload and instantly preview CSV file contents
- **Phone Number Validation & Formatting** - Automatically standardize phone numbers to +254XXXXXXXXX format
- **Error Highlighting** - Visually flag invalid entries with detailed error messages
- **Easy Editing** - Edit or delete problematic rows inline
- **Data Sorting** - Sort data by bundle sizes
- **Clean Data Export** - Download validated CSV ready for API submission
- **Duplicate Detection** - Identify and optionally remove duplicate phone numbers
- **Summary Dashboard** - Real-time statistics showing:
  - Total records
  - Valid/Invalid counts with percentages
  - Duplicate statistics
  - Telco distribution breakdown
- **Smart Auto-Fix** - Automatically handles common phone number formats:
- **Telco Detection** - Identifies likely telco provider (Safaricom, Airtel, Telkom, Equitel etc) based on phone number prefixes
- **Visual Telco Indicators** - Color-coded badges showing detected telco
- etc


### Tech stack
- **Frontend Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.3
- **CSV Parsing**: PapaParse 5.4
- **File Export**: file-saver 2.0
- **Icons**: Lucide React 0.263

### Prerequisites
- Node.js 16+ and npm

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000`

3. **Build for production**:
   ```bash
   npm run build
   ```

