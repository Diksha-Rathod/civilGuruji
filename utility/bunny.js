const { default: axios } = require("axios")

const getVideoDuration = async () => {

    try{

        let baseUrl = 'https://storage.bunnycdn.com/civilgurujipvtltd'

        let url = 'https://civilgurujipvtltd.b-cdn.net/sample.mp4'
        let path = url.split('/')
        path.splice(0, 3)
        path = path.join("/")

        let response = await axios.get(`${baseUrl}/${path}?info`, {
            headers: {
                "AccessKey": "af70265b-bc57-467b-92b94135204a-afa4-4240",
            }
        })

        const fileInfo = response?.data?.duration
        Promise.resolve(fileInfo)

    }catch(error){
         console.log(error)
         Promise.reject(error)   
    }

}

module.exports = {
    getVideoDuration
}