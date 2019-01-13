import * as puppeteer from 'puppeteer'

async function team(url : string) {
    const browser = await puppeteer.launch({ args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
    ]})
    const page = await browser.newPage()

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

    await page.goto(`https://www.flashscore.ro/?r=3:${url}`)

    await page.waitForSelector('tr.stage-finished')

    const response = await page.evaluate(() => {
        const info = {
            name: document.querySelector('div.team-name')
                    ? document.querySelector('div.team-name')
                              .textContent
                              .replace(/\n/g, '')
                              .replace(/\t/g, '')
                    : undefined,

            logo: document.querySelector('div.team-logo') 
                    ? `https://www.flashscore.ro${(document.querySelector('div.team-logo') as HTMLElement)
                                                            .style
                                                            .backgroundImage
                                                            .slice(4, -1)
                                                            .replace(/"/g, "")}`
                    : undefined,

            matches: [
                /* to be filled */
            ]
        }

        function matchParser(match : any) {
            match = match as HTMLElement
            const classes = Array.from(match.classList)
            const thisMatch =  {
                link: match.id
                           .slice(4),

                status: classes.includes('stage-finished') 
                            ? 'finished'
                            : classes.includes('stage-live') 
                                ? 'live'
                                : 'scheduled',

                date: match.childNodes[1]
                           .textContent
                           .split(' ')[0],

                hour: match.childNodes[1]
                           .textContent
                           .split(' ')[1],

                participant1: match.querySelector('.team-home')
                                   .textContent,

                participant2: match.querySelector('.team-away')
                                   .textContent,

                winStatus: match.querySelector('span.win_lose_icon')
                            ? match.querySelector('span.win_lose_icon')
                                   .title
                            : undefined,
            
                league: {
                    name: match.querySelector('a')
                            ? match.querySelector('a')
                                   .childNodes[0]
                                   .title
                            : undefined,

                    link: match.querySelector('a')
                            ? match.querySelector('a')
                                   .href
                            : undefined
                }
            }

            info.matches.push(thisMatch)
        }

        const matches = document.querySelectorAll('tr.stage-scheduled, tr.stage-live, tr.stage-finished')

        matches.forEach(match => {
            matchParser(match)
        })

        return info
    }).then(async(output) => {
        await browser.close()

        return output
    })


    return response
}

export { team }
