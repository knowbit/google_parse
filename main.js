const puppeteer = require('puppeteer');
const { readFile, appendFile } = require('node:fs/promises');
const { parse } = require('node-html-parser');

(async () => {
  const urlStart = 'https://www.google.com/search?q=rent+an+apartment';
  const Req = await getRequests('reaquests.txt');

  const cities = await getCiti('cities/city_united_arab_emirates.txt');
  // const browser = await puppeteer.launch({ devtools: true, userDataDir: 'session/pattern1' });
  const browser = await puppeteer.launch({ headless: false });
  // const context_ = await browser.createIncognitoBrowserContext();
  // const page = await context_.newPage();
  const page = await browser.newPage();

  for (let i = 0; i < cities.length; i++) {
    let res = '';
    const citi = cities[i]
    console.log(citi.location)

    await page.setGeolocation({
      latitude: Number(citi.location.latitude),
      longitude: Number(citi.location.longitude)
    });

    const context = browser.defaultBrowserContext()
    await context.overridePermissions(urlStart, ['geolocation'])

    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
    await page.goto(urlStart, { waitUntil: 'networkidle2' });

    for (let req of Req) {
      try {
        await page.waitForSelector('#L2AGLb > div', { timeout: 2000 })
        await page.click('#L2AGLb > div')
      } catch { }

      const input = '#tsf > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input';
      const search = '#tsf > div:nth-child(1) > div.A8SBwf > div.RNNXgb > button';

      await page.waitForSelector(input)
      await page.evaluate((input) => {
        document.querySelector(input).value = '';
      }, input);

      await page.click(input)
      await page.type(input, `${req} ${citi.citi}`, { delay: 100 })
      await page.click(search)
      await waitFor(1000)
      await page.waitForSelector('#rso > div')
      await waitFor(1000)

      const html = await page.evaluate(() => { return document.body.innerHTML; });
      res += await parseLinc(html, citi.citi, req)

      /* if you need to go through the following pages  */
      // for (let t = 0; t < 1; t++) {
      //   await page.waitForSelector('#pnnext')
      //   await page.click('#pnnext')
      //   await waitFor(1000)
      //   await page.waitForSelector('#rso > div')
      //   const html = await page.evaluate(() => { return document.body.innerHTML; });
      //   res += await parseLinc(html, citi, req)
      // }
    }
    console.log('Citi:', citi.citi, '=== ', i)
    console.log('Result len:', res.split('\n').length)
    await appendFile('result_united_arab_emirates.csv', res)
  }

  await browser.close();

})();

async function parseLinc(html, citi, req) {
  let result = '';
  const root = parse(html)
  const list = root.querySelectorAll('#rso > div');

  for (let elem of list) {
    const urlElem = elem.querySelector('a');
    const titleElem = elem.querySelector('h3');

    if (urlElem, titleElem) {
      const url = urlElem.getAttribute('href');
      if (!url.includes('http')) { continue }
      const title = titleElem.innerText;
      result += `"${url}","${title}","${citi}","${req}"\n`;
    }
  }
  return result;
}

async function getCiti(file) {
  let cities_ = await readFile(file);
  cities_ = cities_.toString().split('\n');
  const cities = [];
  for (let citi of cities_) {
    if (citi.length < 10) continue;
    citi = await JSON.parse(citi);
    cities.push(citi)
  }
  return cities
}

async function getRequests(file) {
  let req_ = await readFile(file);
  req_ = req_.toString().split('\n');
  const req = [];
  for (let r of req_) {
    if (r.length < 2) continue;
    req.push(r)
  }
  return req;
}

function waitFor(num) {
  return new Promise(resolve => {
    setTimeout(() => { resolve() }, num)
  })
}
