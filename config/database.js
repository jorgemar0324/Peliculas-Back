const mongoose = require('mongoose');

const getConnection = async () => {

    try{
        
    const url = 'mongodb+srv://jorgerivas_db_user:x3ZJokKf7RbIOHk6@jorgemario.3axpa2x.mongodb.net/peliculas?retryWrites=true&w=majority&appName=JorgeMario'

    await mongoose.connect(url)
    console.log('Database connected');

    } catch (error) {
        console.log(error);
        
    }
    
}

module.exports = {
    getConnection ,  
}
