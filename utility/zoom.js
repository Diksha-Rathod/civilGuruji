const { default: axios } = require("axios")

let token = {}

const getZoomAccessToken = async () => {
    try{
        const response = await axios.post('?grant_type=account_credentials&account_id=JhkHyK5LR3iw0Xcef2zgsw', {

        }, { headers: {
            Authorization: 'Basic TER0YWI2VmFRQ2VZYW5aTU0xZk1Kdzp6UTMxa2pLQWw0U0pkaUlyMkJ5SjFIQkNBNFppNmxneg=='
        }, baseURL: 'https://zoom.us/oauth/token' })
        token = response?.data
        return response?.data?.access_token
    }catch(error){
        console.log(error)
        return ''
    }
}

module.exports = {
    getZoomAccessToken
}