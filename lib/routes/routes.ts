import { Request, Response } from 'express'
import * as scraper from '../scraper/scraper'

export class Routes {
    public routes(app : any) : void{
        app.route('/').get((req: Request, res: Response) => {
            res.sendStatus(res.statusCode)
        })

        app.route('/all/:day').get((req: Request, res: Response) => {
            scraper.day(parseInt(req.params.day)).then(output => {
                res.json(output)
            })
        })

        app.route('/search/:query').get((req: Request, res: Response) => {
            scraper.search(req.params.query).then(output => {
                res.json(output)
            })
        })

        app.route('/team/:url').get((req: Request, res: Response) => {
            scraper.team(req.params.url).then(output => {
                res.json(output)
            })
        })
        
        app.route('/match/:url').get((req: Request, res: Response) => {
            scraper.match(req.params.url).then(output => {
                res.json(output)
            })
        })
    }
}
