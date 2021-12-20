const mysql      = require('mysql2/promise');
const async = require("async");
const util = require("util") ; 



const config = {
  host     : 'localhost',
  user     : 'root',
  password : '1045',
  database : 'demo'
}
const fs = require('fs') ;    
  

exports.login = async (body) => {
    console.log("invoke service login") ;
    console.log(body) ;
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();
        const sql = "SELECT * FROM users WHERE name = ? AND passwd = ?" ;
        const [rows, fields] = await connection.execute(sql, [body.name, body.passwd]) ;
        connection.end();
        if (rows.length > 0 ) { 
            return {action : 'login', success : true, data: rows } ;
        } else {
            return {action : 'login', success : false, error : 'Wrong name or password' } ;
        }
    }
    catch(err) {
        throw(err) ;
    }    
}    


exports.register = async (body) => {
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();
        const sql = "INSERT INTO users (name, passwd, token) values ( ?, ?, ?)" ;
        const [rows, fields] = await connection.execute(sql, [body.name, body.passwd, body.token]) ;
        connection.end();
        return {action : 'registration', success : true, data: {id: rows.insertId}} ;
    } catch(err) {
        throw(err) ;
    }    
}

exports.unregister = async (body) => {
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();
        const sql = "DELETE FROM users where name = ?" ;
        await connection.execute(sql, [body.name]) ;
        connection.end();
        return true ;
    } catch(err) {    
        throw (err);
    };
}




exports.events = async (id) => {
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();

        const sql = 
        "select events.id, events.name, events.date, events.id_user, last_photo.url from events  left join (" +
        "select * from photos " + 
        "where id in (" +
        "    select max(id) from photos group by id_event " +
        ")) as last_photo on events.id = last_photo.id_event " +
        " where events.id_user = ? " +
        " order by events.id desc"; 
        const [rows, fields] = await connection.execute(sql, [id]) ;
        connection.end();
        return {success: true, data: rows} ; 
    } catch(err) {
        throw(err) ;
    }        
}

exports.pictures = async (id) => {
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();

        const sql = "SELECT * FROM photos WHERE id_event = ? ORDER BY date DESC " ;
        const [rows, fields] = await connection.execute(sql, [id]) ;
        connection.end();
        return {success: true, data: rows} ; 
    } catch(err) {    
        throw err ;
    }
}

exports.addPicture = async (id_event, url) => {
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();
        const sql = "INSERT INTO  photos (id_event, url) VALUES (?, ?) " ;
        const [results, field] = await connection.execute(sql, [id_event, url]) ;
        connection.end();
        return {success: true, data: {id: results.insertId, url: url, id_event: id_event}} ; 
    } catch(err) {    
        throw err ;
    }
}


exports.addEvent = async (id_user, name) => { 
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();
        const sql = "INSERT INTO  events (id_user, name) VALUES (?, ?) " ;
        await connection.execute(sql, [id_user, name]) ;
        connection.end();
        return {success: true} ; 
    } catch(err) {     
        throw (err) ;
    }
}

// rec is a row  from sql request
// no callback in async function see https://caolan.github.io/async/v3/
addUser = async (rec) => {
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();
        const sql = "SELECT * FROM users WHERE id = ? " ;
        const [results, fields] = await connection.execute(sql, [rec.id_friend]) ;
        rec.friend = results ;
        connection.end();    
        return rec ; // see https://caolan.github.io/async/v3/
    } catch(err) {    
        throw err ;
    }
}

exports.friend_events = async (id) => {
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();

        const sql = 
        "select DISTINCT events.id, events.name, events.date, last_photo.url, shares.id_friend from users, shares, events  left join (" +
        "select * from photos " + 
        "where id in (" +
        "    select max(id) from photos group by id_event " +
        ")) as last_photo on events.id = last_photo.id_event " +
        " where events.id_user = shares.id_friend and shares.id_user = ? " +
        " order by events.id desc"; 
    
        const [results, fields] = await connection.execute(sql, [id]) ;
        connection.end();
        
        let data = await async.map(results, addUser) ; 
        console.log(data) ;
        return {success: true, data: data} ;
    } catch(err) {
        throw err ;
    }
}

// rec is a row  from sql request
// no callback in async function see https://caolan.github.io/async/v3/
isFriend = async (rec) => {
    console.log(rec) ;
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();
        const sql = "SELECT * FROM shares WHERE id_user = ? and id_friend = ?" ;
        const [results, fields] = await connection.query(sql, [rec.reference_user, rec.id]) ; 
        rec.isFriend = results.length > 0 ? 1 : 0  ;
        connection.end();    
        return rec ; // see https://caolan.github.io/async/v3/
    } catch (err) {
        throw err ;  // see https://caolan.github.io/async/v3/
    }
}


// returns all users indicating which are friends of given id_user

exports.friends = async (id_user) => {
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();

        const sql = "SELECT ? as reference_user, id, name from users where id != ? ORDER BY name " ;
        const [results, fields] =  await connection.execute(sql, [id_user, id_user]) ;
         console.log('check point 69') ;
        console.log(results) ;
        connection.end();
        const final_results = await async.map(results, isFriend) ;
        return {success: true, data: final_results} ;
    } catch (err) {
        throw err ;
    }
}

exports.updateFriend = async (reference_user, id, isFriend) => { 
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();

        let sql ;
        if (isFriend == 0) {
            sql = "DELETE FROM shares WHERE id_user= ? and id_friend= ? ";
        } else {
            sql = "INSERT INTO shares (id_user, id_friend) VALUES ( ? , ? )" ;
        }
        await connection.execute(sql, [reference_user, id]) ; 
        connection.end();
        return {success: true} ;
    } catch(err) {    
        throw (err) ;
    }
} 

deleteSqlEvent = async (id_event) => {
    try {
        console.log('service deleteEvent check 5') ;
        const connection = await mysql.createConnection(config);
        connection.connect();
        const sql = "DELETE FROM  photos WHERE id_event = ?" ;
        await connection.execute(sql, [id_event]) ;
        
        const sql2 = "DELETE FROM  events WHERE id = ?" ;
        await connection.execute(sql2, [id_event]) ;
        connection.end();
        return ; 
    } catch (err) {    
        throw(err) ;
    }    
}

unlinkImages =  async (rec) => {
    try {
        await util.promisify(fs.unlink)('./public/images/' + rec.url) ;
        return ;
    } catch(err) {
        throw(err) ;
    }
}

exports.deleteEvent = async (id_event) => {
    try {
        const connection = await mysql.createConnection(config);
        connection.connect();
    
        const sql = "SELECT * FROM  photos WHERE id_event = ?" ;
        [results] = await connection.execute(sql, [id_event]) ;
    
        await async.map(results, unlinkImages) ;
        await deleteSqlEvent(id_event) ;
        return ;
    } catch(err) {
         throw(err) ;
    }
}
