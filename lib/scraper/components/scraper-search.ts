import * as puppeteer from 'puppeteer'

async function search (query : string) {
    const browser = await puppeteer.launch({ args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
    ]})
    const page = await browser.newPage()
    const url = 'https://www.flashscore.ro/'

    const unwanted1 = [
        'stylesheet', 
        'font', 
        'image', 
        'media',
        'texttrack',
        'object',
        'beacon',
        'csp_report',
        'imageset',
    ]

    const unwanted2 = [
        'quantserve',
        'adzerk',
        'doubleclick',
        'adition',
        'exelator',
        'sharethrough',
        'cdn.api.twitter',
        'google-analytics',
        'googletagmanager',
        'google',
        'fontawesome',
        'facebook',
        'analytics',
        'optimizely',
        'clicktale',
        'mixpanel',
        'zedo',
        'clicksor',
        'tiqcdn',
    ]

    await page.setRequestInterception(true)
    page.on('request', req => {
        const reqUrl = req.url().split('?')[0].split('#')[0]
        if(unwanted1.includes(req.resourceType()) ||
           unwanted2.some(resource => reqUrl.indexOf(resource) !== -1)) {
            req.abort()
        } else {
            req.continue()
        }
    })
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36')
    await page.setExtraHTTPHeaders({
        'accept-language': 'en-US,en;q=0.8'
    })

    await page.goto(url)
    await page.evaluate(() => {

        (document.querySelector('.header__button--search') as HTMLButtonElement).click();
        (document.querySelector('#search-form-select') as HTMLInputElement).value = '1'
    })

    const response = await page.type('#search-form-query', query, {delay: 20})
              .then(async() => {
                    await page.waitForFunction(() => {
                        if (document.querySelector('div#search-results').textContent === 'Nici un rezultat.' || document.querySelector('div.sport-label')) {
                            return true
                        }
                        return false
                    })
              }).then(async() => {
                    const response = await page.evaluate(() => {
                        if(document.querySelector('div#search-results').textContent === 'Nici un rezultat.') {
                            return {
                                results: [

                                ]}
                        } else {
                            const results =  document.querySelector('div.search-result-wrapper')
                                                     .childNodes[1]
                                                     .childNodes[1]
                                                     .childNodes

                            const info = {
                                results: [
                                    /* to be filled */
                                ]
                            }

                            results.forEach(result => {
                                const thisResult = {
                                    name: result.textContent
                                                .replace(/   /g, ''),
                                    
                                    logo: (result as HTMLElement).querySelector('.team-logo') 
                                            ? `https://www.flashscore.ro${(result as HTMLElement).querySelector('.team-logo')
                                                                                                 .getAttribute('style')
                                                                                                 .slice(22)
                                                                                                 .replace(')', '')}`
                                            : undefined,
                                    
                                    link: (result as HTMLElement).querySelector('a')
                                            ? (result as HTMLElement).querySelector('a')
                                                                     .href
                                                                     .slice(31)
                                            : undefined
                                }

                                info.results.push(thisResult)
                            })

                            return info
                        }
                    })

                    return response
            }).then(async(response) => {
                await browser.close()

                return response
            })

    return response
}

export { search }
