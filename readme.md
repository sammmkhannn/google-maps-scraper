Sure, here's an enhanced version of your README file:

---

# Google Maps Scraper

This tool is designed to scrape specific data from Google Maps search results in Italy based on provided locations in a JSON file. It extracts various details such as the business name, address, website, phone number, rating, and banner.

## Prerequisites

- Node.js installed on your machine.
- Stable internet connection.
- Yarn package manager (recommended) or npm.

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Run `yarn install` to install dependencies.

## Usage

1. Run the program by typing `node scraper.js` or `yarn start` in your terminal.
2. Enter any plural noun as the search query when prompted. Make sure it's plural to get accurate results.
3. The program will search for data specifically in the provided locations in Italy (defined in the JSON file).
4. If the search result contains the specific information (banner, rating, name, address, website, phone), it will be scraped and written to a JSON file.

## Notes

- Ensure you have a stable internet connection during the scraping process.
- The program is tailored to search for data in Italy. Results may vary for other locations.
- Only the specific data items mentioned above will be scraped. Other information may appear in the search results but will not be captured.

## Contributing

Contributions are welcome! If you have any ideas for improvements or find any issues, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to adjust any details or add more sections if needed!
