import puppeteer from "puppeteer";
import rl from "./ask.js";
import fs, { promises } from "fs";

rl.question(`What are you Looking for (Write in plural)?\n`, (srchStr) => {
    return (async() => {
        try {
            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();

            let searchs = {};
            let allData = [{}];
            //read the locations from the file
            let italy = await fs.promises.readFile("region.json");
            italy = JSON.parse(italy);
            for (let i = 0; i < italy.length; i++) {
                let regions = Object.keys(italy[i]);
                for (let region = 0; region < regions.length; region++) {
                    let provinces = Object.keys(italy[i][regions[region]]);
                    for (let province = 0; province < provinces.length; province++) {
                        //all the code will sit inside the body of this loop
                        let towns = italy[i][regions[region]][provinces[province]];
                        for (let town = 0; town < towns.length; town++) {
                            let urlStr = `${srchStr}+in+${towns[town]},${provinces[province]} ${regions[region]}+ italy`;

                            /*start of the scaper code */
                            let url = `https://www.google.com/maps/search/${urlStr}/`;

                            await page.goto(url, { waitUntil: "load", timeout: 0 });
                            page.setDefaultNavigationTimeout(0);
                            await page.waitForTimeout(5000);
                            await page.waitForTimeout(10000);

                            //agree to the terms and conditions
                            if (i == 0) {
                                let agreeBtn = await page.evaluate(() => {
                                    const distance = 100;
                                    const delay = 100;
                                    const timer = setInterval(() => {
                                        document.scrollingElement.scrollBy(0, distance);
                                        if (
                                            document.scrollingElement.scrollTop +
                                            window.innerHeight >=
                                            document.scrollingElement.scrollHeight
                                        ) {
                                            clearInterval(timer);
                                        }
                                    }, delay);

                                    return document.querySelector("div.VfPpkd-RLmnJb");
                                });

                                if (agreeBtn) {
                                    await page.waitForSelector("div.VfPpkd-RLmnJb");
                                    await page.waitForTimeout("2000");
                                    await page.click("div.VfPpkd-RLmnJb");
                                    await page.waitForNavigation();

                                    //skipping the customization page
                                    let selector = await page.evaluate(() => {
                                        return document.querySelector("div.VfPpkd-RLmnJb");
                                    });
                                    if (selector) {
                                        await page.waitForSelector("div.VfPpkd-RLmnJb");
                                        await page.evaluate(() => {
                                            const distance = 100;
                                            const delay = 100;
                                            const timer = setInterval(() => {
                                                document.scrollingElement.scrollBy(0, distance);
                                                if (
                                                    document.scrollingElement.scrollTop +
                                                    window.innerHeight >=
                                                    document.scrollingElement.scrollHeight
                                                ) {
                                                    clearInterval(timer);
                                                }
                                            }, delay);
                                            let buttons = Array.from(
                                                document.querySelectorAll("div.VfPpkd-RLmnJb")
                                            );
                                            buttons[0].click();
                                            buttons[2].click();
                                            buttons[5].click();
                                            buttons[buttons.length - 1].click();
                                        });
                                    }
                                }
                            }

                            //get all the aria labels from all the pages
                            let elementNames = [];
                            let end = false;
                            while (!end) {
                                await page.waitForSelector(
                                    ".section-layout > .section-scrollbox > .section-layout"
                                );
                                let notFound = await page.evaluate(() => {
                                    return document.querySelector(
                                        "div.V79n2d-di8rgd-aVTXAb-title"
                                    );
                                });
                                if (notFound) {
                                    break;
                                }
                                for (let i = 0; i < 5; i++) {
                                    //scroll till the end
                                    await page.evaluate(() => {
                                        document
                                            .querySelector(
                                                ".section-layout > .section-scrollbox > .section-layout"
                                            )
                                            .scrollBy(0, 5000 * 5);
                                    });
                                    await page.waitForTimeout(3000);
                                }
                                await page.waitForTimeout(3000);
                                let list = await page.evaluate(() => {
                                    return Array.from(
                                        document.querySelectorAll(
                                            ".V0h1Ob-haAclf .a4gq8e-aVTXAb-haAclf-jRmmHf-hSRGPd"
                                        )
                                    ).map((element) => element.ariaLabel);
                                });
                                if (list.length == 0) {
                                    break;
                                }
                                elementNames.push(...list);
                                await page.waitForTimeout(3000);

                                let endClass = await page.evaluate(() => {
                                    return document.querySelector(
                                        "button#ppdPk-Ej1Yeb-LgbsSe-tJiF1e.hV1iCc.noprint"
                                    ).classList;
                                });
                                for (let i in endClass) {
                                    if (endClass[i] == "hV1iCc-disabled") {
                                        end = true;
                                        break;
                                    }
                                }
                                if (end) {
                                    break;
                                } else {
                                    await page.evaluate(() => {
                                        document
                                            .querySelector(
                                                "button#ppdPk-Ej1Yeb-LgbsSe-tJiF1e.hV1iCc.noprint"
                                            )
                                            .click();
                                    });
                                }
                            } //end of the while loop

                            let results = [];
                            for (let i = 0; i < elementNames.length; i++) {
                                //iterate over the list of elements of above the list to scrape more data
                                //by visiting each page
                                //just skip the city of Apice because it generate results about City of Spice (a hotel) and no more.
                                if (elementNames[i] == "City of Apice") {
                                    continue;
                                }
                                let newUrl = `https://www.google.com/maps/search/${elementNames[i]} in ${towns[town]},${provinces[province]} ${regions[region]} italy/`;

                                //memoize the urls so that:they will not repeat
                                if (searchs[elementNames[i]]) {
                                    continue;
                                } else {
                                    searchs[elementNames[i]] = newUrl;
                                }
                                await page.goto(newUrl, {
                                    waitUntil: "networkidle2",
                                    timeout: 0,
                                });
                                await page.waitForTimeout(5000);
                                let newStr =
                                    srchStr[0].toUpperCase() +
                                    srchStr.slice(1, srchStr.length - 1);
                                let titles = await page.evaluate(() => {
                                    return Array.from(
                                        document.querySelectorAll("button.widget-pane-link")
                                    ).map((ele) => ele.textContent);
                                });
                                let res = titles.find((title) => title == `${newStr}`);
                                if (!res) {
                                    continue;
                                }

                                let banner = await page.evaluate(() => {
                                    return document.querySelector(
                                        ".F8J9Nb-LfntMc-header-HiaYvf-LfntMc-d6wfac > img"
                                    );
                                });

                                if (banner === null) {
                                    continue;
                                }

                                let dataItem = await page.evaluate(() => {
                                    let banner = document.querySelector(
                                        ".F8J9Nb-LfntMc-header-HiaYvf-LfntMc-d6wfac > img"
                                    );
                                    let name = document.querySelector(".gm2-headline-5");
                                    let rating = document.querySelector(
                                        ".OAO0-ZEhYpd-vJ7A6b-qnnXGd"
                                    );

                                    let details = document.querySelectorAll(".AeaXub");
                                    if (details) {
                                        let website = "";
                                        let phone = "";
                                        let address = "";
                                        let info = Array.from(
                                            document.querySelectorAll("div.QSFF4-text.gm2-body-2")
                                        ).map((el) => el.textContent.trim());

                                        let phoneRegex =
                                            /^[+]\d+\s\d+\s\d+|^[0-9]\d+\s\d+\s\d+|^[0-9]\d+/;
                                        let urlRegex2 = /^[a-zA-Z0-9](\w+\.\w+)+/g;

                                        for (let i = 0; i < info.length; i++) {
                                            if (urlRegex2.test(info[i])) {
                                                website = info[i];
                                            }
                                            if (phoneRegex.test(info[i])) {
                                                phone = info[i];
                                            }
                                        }
                                        if (!phoneRegex.test(info[0])) {
                                            address = info[0];
                                        }

                                        if (banner && name && rating) {
                                            if (banner) {
                                                banner = banner.src.trim();
                                            } else {
                                                banner = null;
                                            }

                                            if (name) {
                                                name = name.textContent.trim();
                                            } else {
                                                banner = null;
                                            }

                                            if (rating) {
                                                rating = rating.textContent.trim();
                                            } else {
                                                rating = null;
                                            }
                                            //changed the object to keys to array like notation
                                            return {
                                                ["banner"]: banner,
                                                ["name"]: name,
                                                ["rating"]: rating,
                                                ["address"]: address,
                                                ["website"]: website,
                                                ["phone"]: phone,
                                            };
                                        } //end of if
                                    }
                                    return null;
                                }); /*end of the evaluate method */

                                /*check whether the banner, name rating, address, website and phone has been scraped or not
                                                                                                                                                                                                                                                                                                and the button is a reviews button*/

                                if (dataItem) {
                                    let reviewButton = await page.$("button.widget-pane-link");
                                    if (reviewButton) {
                                        let reviewBtn = page.waitForSelector(
                                            "button.widget-pane-link", { visible: true }
                                        );
                                        await (await reviewBtn).click();
                                        //await page.click("button.widget-pane-link");
                                        await page.waitForNavigation();
                                        page.waitForTimeout(1000);
                                        //list of all the reviews
                                        let allReviews = await page.evaluate(() => {
                                            let reviews = Array.from(
                                                document.querySelectorAll(".ODSEW-ShBeI")
                                            ).map((element) => element.textContent.trim());
                                            return reviews;
                                        });
                                        dataItem.allReviews = allReviews;
                                        results.push({...dataItem });
                                        //allData[0][towns[town]] = dataItem;
                                    }
                                }
                            } /*end of for loop */
                            allData[0][towns[town]] = [...results];
                            /*end of the scraper*/
                        } //end of the inner most  for loop
                    }
                }
            }

            //creatig the json file name using the searchString (srchStr)
            let fileName = `${srchStr}.json`;
            allData = JSON.stringify(allData);

            //writing data to the file in json format
            fs.writeFile(fileName, allData, (error) => {
                if (!error) {
                    console.log(`Wrote to the file ${fileName} successfully!`);
                } else {
                    console.log("Could not write to the file");
                }
            });
            //closing the browser
            await browser.close();
        } catch (error) {
            console.log(error);
        }
    })();
    //closing the readline method
    rl.close();
});