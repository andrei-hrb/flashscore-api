import * as puppeteer from 'puppeteer'
import * as md5 from 'md5'

async function match(url : string) {
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

    await page.goto(`https://www.flashscore.ro/meci/${url}`)
    const response = await page.evaluate(() => {
        const info = {
            md5: '', /* to be filled */


            match: {
                date: document.querySelector('#utime') 
                        ? document.querySelector('#utime')
                                  .textContent
                                  .split(' ')[0] 
                        : undefined,
                
                hour: document.querySelector('#utime') 
                        ? document.querySelector('#utime')
                                  .textContent
                                  .split(' ')[1] 
                        : undefined,
                
                generalInfo: document.querySelector('.match-information-data') 
                        ? document.querySelector('.match-information-data')
                                  .textContent
                                  .replace(/\n/g, '')
                                  .replace(/\t/g, '')
                        : undefined,

                competiton: {
                    name: document.querySelectorAll('div.fleft *')[1] 
                            ? document.querySelectorAll('div.fleft *')[1]
                                      .textContent 
                            : undefined,

                    link: document.querySelectorAll('div.fleft *')[2]
                            ? `https://www.flashscore.ro${document.querySelectorAll('div.fleft *')[2]
                                                                  .getAttribute('onclick')
                                                                  .slice(13, -1)
                                                                  .replace(`'); return false`, '')}`
                            : undefined
                },
                
                status: {
                    time: document.querySelector('.info-status')
                            ? document.querySelector('.info-status')
                                      .textContent
                            : undefined
                       || document.querySelector('.r')
                            ? document.querySelector('.r')
                                      .textContent
                            : undefined,

                    ongoing: false
                },
                
                winner: '', /* to be filled */
                
                firstHalf: {
                    events: [
                        /* to be filled */
                    ],

                    score: {
                        participant1: document.querySelector('.p1_home') 
                                        ? document.querySelector('.p1_home')
                                                  .textContent
                                                  .replace(/\n/g, '')
                                        : undefined,

                        participant2: document.querySelector('.p1_away') 
                                        ? document.querySelector('.p1_away')
                                                  .textContent
                                                  .replace(/\n/g, '')
                                        : undefined
                    }
                },
                
                secondHalf: {
                    events: [
                        /* to be filled */
                    ],

                    score: {
                        participant1: document.querySelector('.p2_home')
                                        ? document.querySelector('.p2_home')
                                                  .textContent
                                                  .replace(/\n/g, '')
                                        : undefined,

                        participant2: document.querySelector('.p2_away') 
                                        ? document.querySelector('.p2_away')
                                                  .textContent
                                                  .replace(/\n/g, '')
                                        : undefined
                    }
                },
                
                overtime: {
                    events: [
                        /* to be filled */
                    ],

                    score: {
                        participant1: document.querySelector('.p3_home') 
                                        ? document.querySelector('.p3_home')
                                                  .textContent 
                                                  .replace(/\n/g, '')
                                        : undefined,
                        participant2: document.querySelector('.p3_away') 
                                        ? document.querySelector('.p3_away')
                                                  .textContent
                                                  .replace(/\n/g, '') 
                                        : undefined
                    }
                },
                
                penalties: {
                    events: [
                        /* to be filled */
                    ],

                    score: {
                        participant1: document.querySelector('.p4_home') 
                                        ? document.querySelector('.p4_home')
                                                  .textContent 
                                                  .replace(/\n/g, '')
                                        : undefined,
                        participant2: document.querySelector('.p4_away') 
                                        ? document.querySelector('.p4_away')
                                                  .textContent 
                                                  .replace(/\n/g, '')
                                        : undefined
                    }
                },
            },


            participant1: {
                name: document.querySelectorAll('.participant-imglink')[1] 
                        ? document.querySelectorAll('.participant-imglink')[1]
                                  .textContent 
                        : undefined,
                
                logo: document.querySelectorAll('img')[0] 
                        ? document.querySelectorAll('img')[0]
                                  .src 
                        : undefined,
                
                link: document.querySelectorAll('.participant-imglink')[0]
                        ? document.querySelectorAll('.participant-imglink')[0]
                                  .getAttribute('onclick')
                                  .slice(13, -1)
                                  .replace(`'); return false`, '')
                                  .slice(-8)
                        : undefined,
                
                score: document.querySelectorAll('.scoreboard')[0] 
                        ? document.querySelectorAll('.scoreboard')[0]
                                  .textContent
                                  .replace(/\n/g, '')
                        : undefined    
            },


            participant2: {
                name: document.querySelectorAll('.participant-imglink')[3] 
                        ? document.querySelectorAll('.participant-imglink')[3]
                                  .textContent
                        : undefined,
                
                logo: document.querySelectorAll('img')[1]
                        ? (document.querySelectorAll('img')[1] as HTMLImageElement)
                                   .src
                        : undefined,
                
                link: document.querySelectorAll('.participant-imglink')[2]
                        ? document.querySelectorAll('.participant-imglink')[0]
                                  .getAttribute('onclick')
                                  .slice(13, -1)
                                  .replace(`'); return false`, '')
                                  .slice(-8)
                        : undefined,
                
                score: document.querySelectorAll('.scoreboard')[1] 
                        ? document.querySelectorAll('.scoreboard')[1]
                                  .textContent
                                  .replace(/\n/g, '')
                        : undefined
            },
        }

        if (document.querySelector('.detailMS')) {
            let textCouter = 0
            let textBoxCouter = 0
            let currentHalf = 0

            while(document.querySelector('.detailMS').childNodes[textCouter]) {
                const content = document.querySelector('.detailMS').childNodes[textCouter] as HTMLElement
                
                if(content.classList[1] !== '--empty') {
                    if (content.classList[0] === 'detailMS__incidentsHeader') {
                        ++currentHalf
                    }
                    
                    else {
                        const temp = {
                            time: content.firstElementChild 
                                    ? content.firstElementChild
                                             .textContent
                                             .replace(`'`, '')
                                    : undefined,

                            type: document.querySelectorAll('.icon-box')[textBoxCouter].classList[1]
                                    ? document.querySelectorAll('.icon-box')[textBoxCouter]
                                              .classList[1]
                                              .replace('-in', '')
                                              .replace('soccer-ball', 'goal')
                                              .replace('goal-own', 'autogoal')
                                    : undefined,

                            participant: content.classList[1] === 'incidentRow--home' ? 'participant1' : 'participant2',
                            
                            player: {
                                /* to be filled */
                            }
                        }

                        switch(currentHalf) {

                            case 1: {
                                info.match.firstHalf.events.push(temp)
                                
                                break
                            }

                            case 2: {
                                info.match.secondHalf.events.push(temp)
                                
                                break
                            }

                            case 3: {
                                info.match.overtime.events.push(temp)
                                
                                break
                            }

                            case 4: {
                                info.match.penalties.events.push(temp)

                                break
                            }

                            default: break
                        }

                        ++textBoxCouter
                    }
                }

                ++textCouter
            }
        }

        let goalOrCard = 0, substitution = 0
        function eventsParser(e : any) : void {
            if (e.events.length === 0) {
                e.events = undefined
                e.score = undefined
            } else {
                e.events.forEach(ev => {
                    
                    switch (ev.type) {
                        case 'goal':
                        case 'autogoal':
                        case 'y-card':
                        case 'r-card': {
                            ev.player = {
                                name: document.querySelectorAll('.participant-name')[goalOrCard] 
                                        ? document.querySelectorAll('.participant-name')[goalOrCard]
                                                  .textContent
                                        : undefined,
                                link: document.querySelectorAll('.participant-name')[goalOrCard].firstElementChild
                                        ? `https://www.flashscore.ro${document.querySelectorAll('.participant-name')[goalOrCard]
                                                                              .firstElementChild
                                                                              .getAttribute('onclick')
                                                                              .slice(13, -1)
                                                                              .replace(`'); return false`, '')}`
                                        : undefined
                            }
        
                            ++goalOrCard  
        
                            break
                        }
        
                        case 'substitution': {
                            ev.player = {
                                in: {
                                    name: document.querySelectorAll('.substitution-in-name')[substitution] 
                                            ? document.querySelectorAll('.substitution-in-name')[substitution]
                                                      .textContent 
                                            : undefined,
                                            
                                    link: document.querySelectorAll('.substitution-in-name')[substitution].firstElementChild 
                                            ? `https://www.flashscore.ro${document.querySelectorAll('.substitution-in-name')[substitution].firstElementChild
                                                                                  .getAttribute('onclick')
                                                                                  .slice(13, -1)
                                                                                  .replace(`'); return false`, '')}` 
                                            : undefined
                                },

                                out: {
                                    name: document.querySelectorAll('.substitution-out-name')[substitution] 
                                            ? document.querySelectorAll('.substitution-out-name')[substitution]
                                                      .textContent
                                            : undefined,

                                    link: document.querySelectorAll('.substitution-out-name')[substitution]
                                            ? `https://www.flashscore.ro${document.querySelectorAll('.substitution-out-name')[substitution].querySelector('a')
                                                                                  .getAttribute('onclick')
                                                                                  .slice(13, -1)
                                                                                  .replace(`'); return false`, '')}` 
                                            : undefined
                                }
                            }
        
                            ++substitution
        
                            break
                        }

                        default: break
                    }
                })
            }
        }

        eventsParser(info.match.firstHalf)
        eventsParser(info.match.secondHalf)
        eventsParser(info.match.overtime)

        if (info.match.penalties.events.length === 0) {
            info.match.penalties.events = undefined
            info.match.penalties.score = undefined
        } else {
            let goals = 0, misses = 0

            info.match.penalties.events.forEach(ev => {
                
                switch (ev.type) {
                    case 'goal': {
                        ev.player = {
                            name: document.querySelectorAll('.participant-name')[goals] 
                                    ? document.querySelectorAll('.participant-name')[goals]
                                              .textContent
                                    : undefined,

                            link: document.querySelectorAll('.participant-name')[goals].firstElementChild
                                    ? `https://www.flashscore.ro${document.querySelectorAll('.participant-name')[goals].firstElementChild
                                                                          .getAttribute('onclick')
                                                                          .slice(13)
                                                                          .replace(`'); return false`, '')}` 
                                    : undefined
                        }
    
                        ++goals
    
                        break
                    }
    
                    case 'penalty-missed': {
                        ev.player = {
                            name: document.querySelectorAll('.participant-name')[misses] 
                                    ? document.querySelectorAll('.participant-name')[misses]
                                              .textContent
                                    : undefined,
                                    
                            link: document.querySelectorAll('.participant-name')[misses].firstElementChild
                                    ? `https://www.flashscore.ro${document.querySelectorAll('.participant-name')[misses].firstElementChild
                                                                          .getAttribute('onclick')
                                                                          .slice(13)
                                                                          .replace(`'); return false`, '')}`
                                    : undefined
                        }
    
                        ++misses
    
                        break
                    }

                    default: break
                }
            })
        }

        info.match.status.time = (['După prelungiri', 'După penalty-uri', ''].includes(info.match.status.time) ? 'Final' : info.match.status.time)
        info.match.status.ongoing = (['Final', 'Amânat'].includes(info.match.status.time) ? false : true)
        info.match.winner = ! info.match.status.ongoing 
                                ? info.participant1.score > info.participant2.score 
                                    ? info.participant1.name 
                                    : info.participant2.score > info.participant1.score 
                                        ? info.participant2.name 
                                        : 'draw'
                                : undefined
        
                                
        return info
    }).then(async(response) => {
        response.md5 = md5(response)

        await browser.close()
    
        return response
    })

    return response
}

export { match }
