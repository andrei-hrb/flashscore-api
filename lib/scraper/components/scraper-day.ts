import * as puppeteer from 'puppeteer'
import * as md5 from 'md5'

async function day(dayURL : number) {
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

    await page.waitForSelector('.h2')
    await (await (await page.$('.h2')).$('a')).click()
    await page.waitForSelector('ul#ifmenu-calendar-content')
    await (await (await (await (await (await page.$('ul#ifmenu-calendar-content'))).$$('li'))[dayURL + 7]).click())

    await page.waitForFunction(
        `document.querySelector('#preload').style.display === 'none'`
    )

    const response = await page.evaluate(() => {
        const info = {
           md5: '', /* to be filled */

            matches: [
                /* to be filled */
            ]
        }

        const expanders = Array.from(document.querySelectorAll('span.expand-league'))
        
        expanders.forEach(expander => {
            (expander as HTMLAnchorElement).click()
        })

        const matches = Array.from(document.querySelectorAll('tr.stage-finished, tr.stage-scheduled, tr.stage-live'))
        
        if (matches) {
            matches.forEach(async(match) => {
                const league = match.parentElement.parentElement as HTMLElement
                const classes = Array.from(match.classList)
                
                const thisMatch = {
                    link: match.id
                               .slice(4),

                    hour: match.childNodes[1]
                               .textContent,

                    time: match.childNodes[2]
                                 .textContent,
                    
                    participant1: match.childNodes[3]
                                       .textContent,

                    participant2: match.childNodes[5]
                                       .textContent,

                    score: match.childNodes[4]
                                .textContent,

                    status: classes.includes('stage-finished') 
                                ? 'finished'
                                : classes.includes('stage-live') 
                                    ? 'live'
                                    : 'scheduled',

                    competetion: {
                        name: league.querySelector('span.tournament_part')
                                    .textContent,

                        country: league.querySelector('span.country_part')
                                       .textContent
                                       .replace(':', '')
                                       .slice(0, -1),

                        link: `https://www.flashscore.ro/?r=2:${(league.querySelector('span.toggleMyLeague') as HTMLSpanElement)
                                                                       .getAttribute('data-label-key')
                                                                       .slice(-8)}`
                    },
                }

                info.matches.push(thisMatch)
            })
        }

        return info
    }).then(async(response) => {
        response.md5 = md5(response.matches)

        await browser.close()

        return response
    })

    return response
}

export { day }
