# Soccer API

This is an API, designed as a micro-service written in [TypeScript](https://www.typescriptlang.org/), for tracking soccer matches results with a certain degree of 'real-timeness' to it. It uses [Puppeteer](https://github.com/GoogleChrome/puppeteer), a headless Chrome API for Node.JS, for scraping [Flashscore](https://www.flashscore.ro/), and wraps it into an API. They (Flashscore) deliver their information thru JavaScript, so I couldn't simply fetch the HTML of the page, so I needed it parsed.

## How to install

 1. clone the projects somewhere on your computer using `git clone https://github.com/andrei-hrb/soccer-api.git`
 2. install the dependencies using `npm install`
 3. compile the TypeScript code and run the project using `npm run start` 

## Routes
| Symbol | Meaning  
| ------ |:--------
| *      | might or might not be present
| !      | can be used in other parts of the API     
| url    | it's literally a url not a code (the opposite of the '!' - check the outputs)


 * `/` check if the API is running

 * `/all/:query` returns information about all the matches of the selected day
    * query must best me a number in range of [-7, 7] (only integers) - 0 for the current day
    * return and Object containing:
        * md5 : string
        * Array of Objects containing the following information about the matches of the selected day:
            * link ! : string
            * hour : string
            * minute : string
            * participant1 : string
            * participant2 : string
            * score : string
            * Object containing the following information about the league:
                * name
                * country
                * link (url)

 * `/search/:query` returns the search results of that query
    * query must be a string
    * query must be longer than 3 characters
    * returns an Array of Objects containing the following information about the results:
        * name : string
        * logo * : string (url)
        * link ! : string

 * `/team/:query` return information about that team
    * query must be a link ! (from the search results)
    * returns an Object containing:
        * name : string
        * logo * : string (url)
        * Array of Objects containing the following information about the matches:
            * link ! : string
            * status : string
            * score : string
            * date : string
            * hour : string
            * participant 1 : string
            * participant 2 : string
            * Object containing the following information about the league:
                * name : string
                * link : string

* `/match/:query` return information about that match
    * query must be a link ! (from the team/all section)
    * returns an Object containing:
        * md5 : string
        * Object containing the following information about the match:
            * date : string
            * hour : string
            * general stuff : string
            * Object containing the following information about the league:
                * name : string
                * link : string
            * Object containing the following information about the status of the match:
                * time : string
                * ongoing : boolean
            * winner : string
            * Object containing the following information about the firstHalf/secondHalf/overtime/penalties * :
                * Array of Objects containing the following information about the events of the period:
                    * time : string
                    * type : string
                    * participant evolved : string
                    * Object containing the following information about the player (might contain 'in' and 'out' if substitution):  
                        * name : string
                        * link : string (url)
                * Object containing the following information about the score of the period:
                    * participant1 : string
                    * participant2 : string
        *  Object containing the following information about the participant1/participant2:
              *  name : string
              *  logo * : string (logo)
              *  link ! : string
              *  score : string
  