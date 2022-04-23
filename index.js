const PORT =  8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

const stocks = []

app.get('/', (req, res) => {
    res.json('Welcome To NSE Exchange DATA API')
})

app.get('/preopen', (req, res) => {
    axios.get('https://www.nseindia.com/market-data/pre-open-market-cm-and-emerge-market')
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)
            console.log($('body').html())
            console.log($('#livePreTable').html())
            const spstocks = []
            $('#livePreTable > tbody > tr > td:nth-child(2) > a').each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                spstocks.push({
                    title,
                    url
                })
            })
            res.json(spstocks)
        }).catch(err => console.log(err))
})

app.get('/preopen',(req,res) =>{
    const puppeteer = require('puppeteer');

    (async function scrape() {
        const browser = await puppeteer.launch({ headless: false });

        const page = await browser.newPage();
        await page.goto('https://www.nseindia.com/market-data/pre-open-market-cm-and-emerge-market');

        await page.waitForSelector('#livePreTable');
        let quotes = await page.evaluate(() => {

            let quotesElement = document.body.querySelectorAll('#livePreTable > tbody > tr > td:nth-child(2) > a');
            let quotes = Object.values(quotesElement).map(x => {
                return {
                    Name: x.text,
                    url: x.attr('href')
                }
            });

            return quotes;
        });

        res.json(quotes)
        await browser.close();
    })();

})

app.listen(PORT, () => console.log(`server running on port ${PORT}`))
