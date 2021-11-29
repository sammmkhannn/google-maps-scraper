#google-maps-scraper




Note: you must have a stable internet connection.

Install dependencies
type yarn install on terminal and press Enter



Run the program
type node scraper.js or yarn start and press Enter 

Feed the search string
Enter any Plural noun to search (it must be plural otherwise the results will differ).

This program searchs data  sepcificly from italy (in the provided locations in json file).
Searchs the specific data, sometimes other things can be appeared but will not be scrapped.
This program scrapes the specific data from each specific search result.
Data items included: 
Banner, 
rating,
name,
address,
website,
phone.


If the search result contains the specific information it will be scraped and will be written to the json file.


