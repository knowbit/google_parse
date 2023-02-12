const axios = require('axios');
const { parse } = require('node-html-parser');
const { writeFile, readFile, appendFile } = require('node:fs/promises');


(async () => {

  const res = await readFile('index.html')
  const root = parse(res)
  const list = root.querySelector('.wikitable > tbody').childNodes;

  let result = '';

  let fl = 'Вудбридж';

  let flag = true;

  for (let i = 622; i < list.length; i++) {
    let tt = {};
    const elem = list[i];
    const res = elem.childNodes;
    if (res.length === 10) {
      try {
        tt.enName = res[3].querySelector('i').innerText;
        tt.ruName = res[3].querySelector('a').innerText;
        tt.shtat = res[5].innerText.replace('\n', '');

        let url = 'https://ru.wikipedia.org';
        url += res[3].querySelector('a').getAttribute('href');
        let data = await axios(url);
        data = parse(data.data);

        const aa = data.querySelector('#mw-indicator-0-coord > div:nth-child(1) > span:nth-child(1) > span:nth-child(1) > a:nth-child(1)');
        tt.location = [aa.getAttribute('data-lat'), aa.getAttribute('data-lon')];

        console.log(tt, i)
        await appendFile('city_location.csv', JSON.stringify(tt) + '\n')
      } catch {
        await appendFile('city_err.csv', res[3].querySelector('a').innerText + '\n')
      }
    }
  }
  console.log(result)
  // console.log(res.status)
})()

// .wikitable > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(2) > i:nth-child(3)
//
//
//<tr>
//<td align="center">330
//</td>
//<td><a href="/wiki/%D0%A2%D0%B0%D1%81%D0%BA%D0%B0%D0%BB%D1%83%D1%81%D0%B0_(%D0%90%D0%BB%D0%B0%D0%B1%D0%B0%D0%BC%D0%B0)" title="Таскалуса (Алабама)">Таскалуса</a><br><i>Tuscaloosa</i>
//</td>
//<td><a href="/wiki/%D0%90%D0%BB%D0%B0%D0%B1%D0%B0%D0%BC%D0%B0" title="Алабама">Алабама</a>
//</td>
//<td align="right"><span style="display:none;" class="noprint">&amp;&amp;&amp;&amp;&amp;&amp;&amp;&amp;&amp;0100618.&amp;&amp;&amp;&amp;&amp;0</span>100&#160;618
//</td>
//<td align="right"><span style="display:none;" class="noprint">&amp;&amp;&amp;&amp;&amp;&amp;&amp;&amp;&amp;&amp;099600.&amp;&amp;&amp;&amp;&amp;0</span>99&#160;600
//</td></tr>

      // console.log(res[3].querySelector('i').innerText)
      // console.log(res[3].querySelector('a').innerText)
      // console.log(res[5].innerText)
