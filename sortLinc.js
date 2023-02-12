const { readFile, writeFile, appendFile } = require('node:fs/promises');

const notUrl = [
  'linkedin.com', 'facebook.',
  'wikipedia.', 'youtube.',
  'realtor.', 'google.',
  'findagrave.', 'beonstone.',
  'canpages.ca'
];

(async () => {
  let data = await readFile('extractedGoogleGBR_.txt');
  data = data.toString().split('\n');

  console.log('Raw data:', data.length)
  const urls = [];
  let res = '';
  let resY = '';
  for (let elem of data) {
    if (elem.length < 5) continue;
    elem = JSON.parse(elem);

    if (elem.url.includes('yellowpages.ca')) {
      resY += `${JSON.stringify(elem)}\n`;
      // await appendFile('extractedYellowpagesCAN.csv', `${JSON.stringify(elem)}\n`);
      continue;
    }

    // let conti = false;
    // for (let ll of notUrl) {
    //   if (elem.url.includes(ll)) {
    //     conti = true;
    //     break
    //   }
    // }
    // if (conti) { continue }

    if (!urls.includes(elem.url)) {
      urls.push(elem.url)
      delete elem.page;
      res += `${JSON.stringify(elem)}\n`;
      // await appendFile('extractedGoogleCAN.csv', `${JSON.stringify(elem)}\n`);
    }

  }

  await writeFile('extractedGoogleGBR.csv', res);
  await writeFile('extractedYellowpagesGBR.csv', resY);

})()

// {"url":"https://legacyheadstones.com/",
// "title":"$199 Grave Headstones &amp; Markers for Sale Online",
// "citi":"New York","req":"tombstone to buy",
// "page":1}
