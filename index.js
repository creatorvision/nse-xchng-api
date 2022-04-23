const PORT =  8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

const stocks = []
const base_quote_url = 'https://www.nseindia.com/get-quotes/equity?symbol='

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

app.get('/', (req, res) => {
    res.json('Welcome To NSE Exchange DATA API')
})

app.get('/preopen',(req,res) =>{
    const puppeteer = require('puppeteer');

    (async function scrape() {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto('https://www.nseindia.com/market-data/pre-open-market-cm-and-emerge-market');
        await page.setViewport({
            width: 1200,
            height: 800
        });
        await autoScroll(page);
        await page.waitForSelector('#livePreTable');
        
        let quotes = await page.evaluate(() => {
            
            let quotesElement =  document.body.querySelectorAll('#livePreTable > tbody > tr')
            let quotes =  Object.values(quotesElement).map(x => {
                return {
                    Name: x.children[1].textContent,
                    prevClose: x.children[2].textContent,
                    iepPrice: x.children[3].textContent,
                    chng: x.children[4].textContent,
                    finalPrice: x.children[6].textContent,
                    finalQuantity: x.children[7].textContent,
                    valueL: x.children[8].textContent,
                    ffmCAPL: x.children[9].textContent,
                    nm52WH: x.children[10].textContent,
                    nm52WL: x.children[11].textContent

                }
            });
            return quotes;
        });
        res.json(quotes)
        await browser.close();
    })
    ();

})

app.listen(PORT, () => console.log(`server running on port ${PORT}`))
