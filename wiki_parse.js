const { writeFile } = require('node:fs/promises');
const { parse } = require('node-html-parser');
const { default: axios } = require('axios');

(async () => {
  const data = await axios('https://ru.wikipedia.org/wiki/%D0%93%D0%BE%D1%80%D0%BE%D0%B4%D0%B0_%D0%98%D0%BD%D0%B4%D0%B8%D0%B8');

  const html = parse(data.data);
  const list = html.querySelectorAll('.wikitable > tbody > tr');
  list.shift()
  const links_city = [];

  for (let line of list) {
    links_city.push([
      'https://ru.wikipedia.org' +
      line.querySelector('td:nth-child(2) a:nth-child(1)').getAttribute('href'),
      line.querySelector('td:nth-child(3)').innerText
    ])
  }

  let result = '';

  let num = 1;

  for (let link of links_city) {
    const res = { location: {} };
    try {
      const data = await axios(link[0]);
      const html = parse(data.data);
      const res = { location: {} };

      const loc = html.querySelector('#mw-indicator-0-coord > div:nth-child(1) > span:nth-child(1) > span:nth-child(1) > a:nth-child(1)');

      res.location.latitude = loc.getAttribute('data-lat');
      res.location.longitude = loc.getAttribute('data-lon');
      res.citi = link[1]
      result += JSON.stringify(res) + '\n';
      console.log(link[1], num++)
    } catch {
      res.location.latitude = null;
      res.location.longitude = null;
      res.citi = link[1]
      result += JSON.stringify(res) + '\n';
      console.log(link[1], num++, 'continue >>>>>>')
      continue;
    }
  }

  await writeFile('cities/city_saudi_arabia.txt', result)
})()
