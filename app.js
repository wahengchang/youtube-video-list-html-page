(async ()=> {
    const express = require('express')
    const bodyParser = require('body-parser')
    const fs = require('fs')
    const htmlTemplate = fs.readFileSync('./htmlTemplate.template', 'utf8')
    
    const app = express()
    app.use(express.static('public'))
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    
    const axios = require('axios');
    let cheerio = require('cheerio');
    app.get('/', async function (req, res) {
        try {
            const page = req.query.page
            const keyword = req.query.keyword || 'ronaldo'
            
            // 1) scrape html from page
            const rawHtml = await axios.get(`https://www.youtube.com/results?search_query=${keyword}`)
            const html = rawHtml.data;

            // 2) parse it 
            const $ = cheerio.load(html); 
            fs.writeFileSync('html', html)


            const parsedVideoList = html.match(/"(videoRenderer|videoId)":("([^""]+)"|\[[^[]+])/g);
            const resultRepeat = parsedVideoList.map(item => {
                return item.replace(`"videoId":"`, '')
            }).map(item => {
                return item.replace(`"`, '')
            })
            const result = [...new Set(resultRepeat)]

            // fs.writeFileSync('devtoList.json', parsedVideoList, 'utf8')
        

            // 3) deliver video list to html , to generate the UI
            // const data = []
            const htmlWithVideoList = htmlTemplate.replace('{{VIDEO_LIST_DATA}}', JSON.stringify(result))
            return res.send(htmlWithVideoList)
        }
        catch(e) {
            console.error('[ERROR]', e)
            return res.send(JSON.stringify(e))
        }
    })
    
    const port = process.env.PORT || 3000
    
    app.listen(port, function () {
      console.log(`Example app listening on port ${port}! \n http://localhost:${port}`)
    })
})()