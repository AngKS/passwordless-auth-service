

module.exports.generateCode = () => {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let code = ''
    let length = 14
    for (let i = 0; i < length; i++) {
        // at every 5 interval, add "-"
        if (i % 4 === 0 && i !== 0) {
            code += '-'
        }
        code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return code

}
