module.exports = (function(){
    return {
        local : {
            host : 'localhost',
            port : '3306',
            user : 'test',
            password : '1234',
            database : 'testdb'
            
        },
        real : {
            host : '',
            port : '',
            user : '',
            password : '',
            database : ''
        },
        dev : {
            host : '',
            port : '',
            user : '',
            password : '',
            database : ''
        }
    }
})();