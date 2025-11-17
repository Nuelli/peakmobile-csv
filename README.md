# PeakMobile CSV Data Cleaner & Uploader

A smart, lightweight web-based tool for cleaning, validating, and standardizing CSV data before upload to backend systems. Specifically designed for PeakMobile's customer data (phone numbers, airtime allocations, etc.).

## Features

### Core Features
- **CSV Upload & Preview** - Upload and instantly preview CSV file contents
- **Phone Number Validation & Formatting** - Automatically standardize phone numbers to 254XXXXXXXXX format
- **Error Highlighting** - Visually flag invalid entries with detailed error messages
- **Easy Editing** - Edit or delete problematic rows inline
- **Data Sorting** - Sort data by bundle sizes
- **Clean Data Export** - Download validated CSV ready for API submission

### Intermediate Features
- **Duplicate Detection** - Identify and optionally remove duplicate phone numbers
- **Summary Dashboard** - Real-time statistics showing:
  - Total records
  - Valid/Invalid counts with percentages
  - Duplicate statistics
  - Telco distribution breakdown
- **Smart Auto-Fix** - Automatically handles common phone number formats:
  - Local format: `0797693561` → `254797693561`
  - Missing country code: `797693561` → `254797693561`
  - Already formatted: `254797693561` (validated)

### Advanced Features
- **Telco Detection** - Identifies likely telco provider (Safaricom, Airtel, Telkom, Equitel) based on phone number prefixes
- **Visual Telco Indicators** - Color-coded badges showing detected telco

## Tech Stack

- **Frontend Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.3
- **CSV Parsing**: PapaParse 5.4
- **File Export**: file-saver 2.0
- **Icons**: Lucide React 0.263

## Installation

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

## Usage

### Step 1: Upload CSV
1. Click "Choose CSV File" button
2. Select your CSV file containing customer data
3. The file will be parsed and displayed in a preview table

### Step 2: Configure Columns
1. Select the **Phone Number Column** from the dropdown (required)
2. Optionally select a **Bundle Size Column** for sorting
3. Click **"Validate & Process"** button

### Step 3: Review & Edit
- The app will validate all phone numbers and display results
- **Green rows** = Valid phone numbers
- **Red rows** = Invalid phone numbers with error details
- Edit invalid numbers by clicking the edit icon
- Delete rows using the trash icon

### Step 4: Clean Data
- Review the **Data Summary** dashboard showing:
  - Total records processed
  - Valid/Invalid breakdown
  - Duplicate count
  - Telco distribution
- Click **"Remove Duplicates"** to eliminate duplicate phone numbers
- Click **"Sort by Bundle Size"** to organize by bundle amounts

### Step 5: Export
- Click **"Download Cleaned CSV"** to export the validated data
- The file will be saved as `cleaned_data.csv`

## Phone Number Validation Rules

The validator accepts phone numbers in these formats and converts them to `254XXXXXXXXX`:

| Input Format | Example | Output | Status |
|---|---|---|---|
| Local format | `0797693561` | `254797693561` | ✅ Valid |
| Without country code | `797693561` | `254797693561` | ✅ Valid |
| Already formatted | `254797693561` | `254797693561` | ✅ Valid |
| With spaces/dashes | `0797-693-561` | `254797693561` | ✅ Valid |
| Invalid length | `07976935` | - | ❌ Invalid |
| Wrong prefix | `0697693561` | - | ❌ Invalid |

## Telco Detection

The app identifies Kenyan telco providers based on phone number prefixes:

- **Safaricom**: 700-729, 739-759, 768-769
- **Airtel**: 730-738, 760-767
- **Telkom**: 770-779
- **Equitel**: 780-789

*Note: Results are approximate due to number portability in Kenya.*

## Error Messages

Common validation errors and their meanings:

- **"Phone number is empty"** - The cell is blank
- **"Invalid length"** - Phone number doesn't have 12 digits after formatting
- **"Invalid country code"** - Doesn't start with 254
- **"Invalid Kenyan mobile number"** - Third digit must be 7 or 1
- **"Phone number contains non-digit characters"** - Contains letters or special characters

## Project Structure

```
src/
├── App.jsx                 # Main app component with state management
├── index.jsx               # React entry point
├── index.css               # Global styles with Tailwind
├── components/
│   ├── CSVUploader.jsx     # File upload component
│   ├── DataPreview.jsx     # Data table and editing interface
│   └── SummaryDashboard.jsx # Statistics and action buttons
└── utils/
    └── phoneValidator.js   # Phone validation and telco detection logic
```

## Key Functions

### `validateAndFormatPhone(phoneNumber)`
Validates and formats a single phone number.

**Returns**:
```javascript
{
  isValid: boolean,
  formatted: string,      // 254XXXXXXXXX format
  errors: string[]        // Array of error messages
}
```

### `detectTelco(phoneNumber)`
Detects telco provider from formatted phone number.

**Returns**: `'Safaricom' | 'Airtel' | 'Telkom' | 'Equitel' | null`

### `batchValidatePhones(phoneNumbers)`
Validates multiple phone numbers at once.

**Returns**: Array of validation results with telco info

## Performance

- Handles CSV files with thousands of records
- Real-time validation and statistics updates
- Optimized table rendering with React
- Minimal bundle size

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### App won't start
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### CSV not parsing correctly
- Ensure CSV is UTF-8 encoded
- Check that headers don't contain special characters
- Verify data doesn't have extra blank rows

### Phone numbers not validating
- Check for leading/trailing spaces
- Ensure phone numbers are 9-12 digits
- Verify they start with 0, 254, or 7

## License

MIT
