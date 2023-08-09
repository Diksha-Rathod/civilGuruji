var html_to_pdf = require('html-pdf-node');

const generatePdf = async (html) => {

    try{
        let options = { format: 'A4' };
        let file = { content: html };
    
    
        let result = await html_to_pdf.generatePdf(file, options)
        Promise.resolve(result)

    }catch(error){
        console.log(error)
        Promise.reject(error)
    }

}

module.exports = { generatePdf }