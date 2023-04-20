const express = require('express')
const cors = require('cors')
const isReachable = require('is-reachable');
const http = require('http');
const mysql = require('mysql2')
const dotenv = require('dotenv')
const cron = require('node-cron');
const LineAPI = require('line-api');
const path = require('path');
const notify = new LineAPI.Notify({
    token: "HYBwjs2I2F5c2MKbzKifeMWtkaJuNBUuqJihpImXtnM"
})

dotenv.config();
// Database Connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const api_connection = mysql.createConnection({
    host: process.env.DB_HOST_API,
    user: process.env.DB_USER_API,
    password: process.env.DB_PASSWORD_API,
    database: process.env.DB_NAME_API,
    port: process.env.DB_PORT_API
})

const h_code = process.env.H_CODE;
const h_name = process.env.H_NAME;
const app = express()

app.use(cors())
app.use(express.json())

app.listen(8550, function () {
    console.log('<< WDHP - API :: WATCHAN DIGITAL HEALTH PLATFORM [HOSxP XE4] >>')
})

// Patient
cron.schedule('00 20 * * *', function () { 
    let d = new Date(Date.now()).toLocaleString(); //แสดงวันที่และเวลา
    console.log("------------------------------------------");
    console.log(`Running Cron Job ${d}`);;
    
    // Run Script
    var options = {
        host: process.env.DB_HOST_API,
        port: process.env.H_PORT,
        path: '/patient',
        method: 'GET'
    };
    
    http.request(options, function(res) {
        console.log('\nRunning API Script :: ' + options.path)
    }).end();
    // End 

    isReachable(process.env.DB_HOST_API +":"+ process.env.H_PORT).then(reachable => {
        if (!reachable) { // => false
            let msg = `ไม่สามารถเชื่อมต่อ API ได้ !!\n` + d + ` :: ` + h_code + ` => ` + h_name
            notify.send({
                message: msg
            })
        }else{
            let msg = `เชื่อมโยงข้อมูลผู้ป่วยสำเร็จ !!\n` + d + ` :: ` + h_code + ` => ` + h_name;
            notify.send({
                message: msg
            })
        }
    })
});

// Visit
cron.schedule('05 20 * * *', function () { 
    let d = new Date(Date.now()).toLocaleString(); //แสดงวันที่และเวลา
    console.log("------------------------------------------");
    console.log(`Running Cron Job ${d}`);;
    
    // Run Script
    var options = {
        host: process.env.DB_HOST_API,
        port: process.env.H_PORT,
        path: '/visit',
        method: 'GET'
    };
    
    http.request(options, function(res) {
        console.log('\nRunning API Script :: ' + options.path)
    }).end();
    // End 

    isReachable(process.env.DB_HOST_API +":"+ process.env.H_PORT).then(reachable => {
        if (!reachable) { // => false
            let msg = `ไม่สามารถเชื่อมต่อ API ได้ !!\n` + d + ` :: ` + h_code + ` => ` + h_name
            notify.send({
                message: msg
            })
        }else{
            let msg = `เชื่อมโยงข้อมูลการรับบริการสำเร็จ !!\n` + d + ` :: ` + h_code + ` => ` + h_name;
            notify.send({
                message: msg
            })
        }
    })
});

// Diag
cron.schedule('10 20 * * *', function () { 
    let d = new Date(Date.now()).toLocaleString(); //แสดงวันที่และเวลา
    console.log("------------------------------------------");
    console.log(`Running Cron Job ${d}`);;
    
    // Run Script
    var options = {
        host: process.env.DB_HOST_API,
        port: process.env.H_PORT,
        path: '/diag',
        method: 'GET'
    };
    
    http.request(options, function(res) {
        console.log('\nRunning API Script :: ' + options.path)
    }).end();
    // End 

    isReachable(process.env.DB_HOST_API +":"+ process.env.H_PORT).then(reachable => {
        if (!reachable) { // => false
            let msg = `ไม่สามารถเชื่อมต่อ API ได้ !!\n` + d + ` :: ` + h_code + ` => ` + h_name
            notify.send({
                message: msg
            })
        }else{
            let msg = `เชื่อมโยงข้อมูลการให้รหัสโรคสำเร็จ !!\n` + d + ` :: ` + h_code + ` => ` + h_name;
            notify.send({
                message: msg
            })
        }
    })
});

// Drug
cron.schedule('15 20 * * *', function () { 
    let d = new Date(Date.now()).toLocaleString(); //แสดงวันที่และเวลา
    console.log("------------------------------------------");
    console.log(`Running Cron Job ${d}`);;
    
    // Run Script
    var options = {
        host: process.env.DB_HOST_API,
        port: process.env.H_PORT,
        path: '/drug',
        method: 'GET'
    };
    
    http.request(options, function(res) {
        console.log('\nRunning API Script :: ' + options.path)
    }).end();
    // End 

    isReachable(process.env.DB_HOST_API +":"+ process.env.H_PORT).then(reachable => {
        if (!reachable) { // => false
            let msg = `ไม่สามารถเชื่อมต่อ API ได้ !!\n` + d + ` :: ` + h_code + ` => ` + h_name
            notify.send({
                message: msg
            })
        }else{
            let msg = `เชื่อมโยงข้อมูลรายการยาสำเร็จ !!\n` + d + ` :: ` + h_code + ` => ` + h_name;
            notify.send({
                message: msg
            })
        }
    })
});

// Send Patient From HOSxP XE4
app.get('/patient', async (req, res) => {
            
    try {
        connection.query('SELECT person.person_id AS pid,patient.hn,patient.pname,patient.fname,patient.lname,person.birthdate,person.sex,person.cid,'+
            'person.blood_group,CONCAT(opd_allergy.agent," ",opd_allergy.symptom) AS allergic ' +
            'FROM person ' +
            'LEFT JOIN patient ON patient.cid = person.cid ' +
            'LEFT JOIN opd_allergy ON opd_allergy.hn = patient.hn ' +
            'WHERE person.death = "N" AND patient.firstday = CURDATE()',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_patient (pcucodeperson,pid,hcode,prename,fname,lname,birth,sex,idcard,bloodgroup,allergic) VALUES (23736,?,?,?,?,?,?,?,?,?,?)",
                    [
                        jsdata.pid,
                        jsdata.hn,
                        jsdata.pname,
                        jsdata.fname,
                        jsdata.lname,
                        jsdata.birthdate,
                        jsdata.sex,
                        jsdata.cid,
                        jsdata.blood_group,
                        jsdata.allergic
                    ],
                     (err, results) => {
                        if (err) throw err
                    })
                );
                var ProgressBar = require('progress');
                var count = 80 / keyCount;
                var bar = new ProgressBar('Processing [ :percent ]', { total: keyCount });
                var timer = setInterval(function () {
                bar.tick();
                if (bar.complete) {
                    console.log("Patient Data Transfer Complete :: "+ keyCount + " Records\n------------------------------------------\n");
                    clearInterval(timer);
                }
            }, count);
            res.status(200).json("Total Data :: "+ keyCount + " Records")
            })
    } catch (err) {
        console.log(err)
        return res.status(500).send()
    }
})

// Send Visit From HOSxP XE4
app.get('/visit', async (req, res) => {
            
    try {
        connection.query('SELECT opdscreen.vstdate,opdscreen.vn,person.person_id AS pid,opdscreen.cc,opdscreen.bw,opdscreen.height,CONCAT(opdscreen.bps,"/",opdscreen.bpd) AS pressure,'+
            'opdscreen.temperature,opdscreen.pulse,opdscreen.rr ' +
            'FROM opdscreen ' +
            'LEFT JOIN patient on patient.hn = opdscreen.hn ' +
            'LEFT JOIN person on person.cid = patient.cid ' + 
            'WHERE opdscreen.vstdate = CURDATE()',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
            // res.status(200).json(result)
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_visit (visitdate,pcucode,visitno,pid,symptoms,weight,height,pressure,temperature,pulse,respri) VALUES (?,23736,?,?,?,?,?,?,?,?,?)",
                    [
                        jsdata.vstdate,
                        jsdata.vn,
                        jsdata.pid,
                        jsdata.cc,
                        jsdata.bw,
                        jsdata.height,
                        jsdata.pressure,
                        jsdata.temperature,
                        jsdata.pulse,
                        jsdata.rr
                    ],
                     (err, results) => {
                        if (err) throw err
                    })
                );
                var ProgressBar = require('progress');
                var count = 80 / keyCount;
                var bar = new ProgressBar('Processing [ :percent ]', { total: keyCount });
                var timer = setInterval(function () {
                bar.tick();
                if (bar.complete) {
                    console.log("Visit Data Transfer Complete :: "+ keyCount + " Records\n------------------------------------------\n");
                    clearInterval(timer);
                }
            }, count);
            res.status(200).json("Total Data :: "+ keyCount + " Records")
            })
    } catch (err) {
        console.log(err)
        return res.status(500).send()
    }
})

// Send Diag From HOSxP XE4
app.get('/diag', async (req, res) => {
            
    try {
        connection.query('SELECT ovst.vstdate,ovst.vn,ovstdiag.icd10,icd101.tname ' +
            'FROM ovst ' +
            'LEFT JOIN patient ON patient.hn = ovst.hn ' +
            'LEFT JOIN ovstdiag ON ovstdiag.vn = ovst.vn ' +
            'LEFT JOIN icd101 ON icd101.`code` = ovstdiag.icd10 ' +
            'WHERE ovst.vstdate = CURDATE()',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_visit_diag (visitdate,pcucode,visitno,diagcode,diseasenamethai) VALUES (?,23736,?,?,?)",
                    [
                        jsdata.vstdate,
                        jsdata.vn,
                        jsdata.icd10,
                        jsdata.tname
                    ],
                     (err, results) => {
                        if (err) throw err
                    })
                );
                var ProgressBar = require('progress');
                var count = 80 / keyCount;
                var bar = new ProgressBar('Processing [ :percent ]', { total: keyCount });
                var timer = setInterval(function () {
                bar.tick();
                if (bar.complete) {
                    console.log("Diag Data Transfer Complete :: "+ keyCount + " Records\n------------------------------------------\n");
                    clearInterval(timer);
                }
            }, count);
            res.status(200).json("Total Data :: "+ keyCount + " Records")
            })
    } catch (err) {
        console.log(err)
        return res.status(500).send()
    }
})

// Send Drug From HOSxP XE4
app.get('/drug', async (req, res) => {
            
    try {
        connection.query('SELECT opitemrece.vstdate,opitemrece.vn,drugitems.`name` AS drugname,opitemrece.qty,drugitems.therapeutic ' +
            'FROM opitemrece ' +
            'LEFT JOIN drugitems ON drugitems.icode = opitemrece.icode ' +
            'WHERE opitemrece.vstdate = CURDATE()',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_visit_drug (visitdate,pcucode,visitno,drugname,unit,dose) VALUES (?,23736,?,?,?,?)",
                    [
                        jsdata.vstdate,
                        jsdata.vn,
                        jsdata.drugname,
                        jsdata.qty,
                        jsdata.therapeutic
                    ],
                     (err, results) => {
                        if (err) throw err
                    })
                );
                var ProgressBar = require('progress');
                var count = 80 / keyCount;
                var bar = new ProgressBar('Processing [ :percent ]', { total: keyCount });
                var timer = setInterval(function () {
                bar.tick();
                if (bar.complete) {
                    console.log("Drug Data Transfer Complete :: "+ keyCount + " Records\n------------------------------------------\n");
                    clearInterval(timer);
                }
            }, count);
            res.status(200).json("Total Data :: "+ keyCount + " Records")
            })
    } catch (err) {
        console.log(err)
        return res.status(500).send()
    }
})