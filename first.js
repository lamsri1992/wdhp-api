const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
const dotenv = require('dotenv')

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
    console.log('<< WDHP - API :: WATCHAN DIGITAL HEALTH PLATFORM [HOSxP XE4 - First Sync] >>')
})

// Send Patient From HOSxP XE4
app.get('/patient', async (req, res) => {
            
    try {
        connection.query('SELECT person.person_id AS pid,patient.hn,patient.pname,patient.fname,patient.lname,person.birthdate,person.sex,person.cid,'+
            'person.blood_group ' +
            'FROM person ' +
            'LEFT JOIN patient ON patient.cid = person.cid ' +
            'WHERE person.death = "N" ' +
            'AND patient.firstday >= "1990-01-01" AND patient.firstday <= "2023-05-31" ORDER BY patient.firstday ASC',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_patient (pcucodeperson,pid,hcode,prename,fname,lname,birth,sex,idcard,bloodgroup) VALUES ("+h_code+",?,?,?,?,?,?,?,?,?)",
                    [
                        jsdata.pid,
                        jsdata.hn,
                        jsdata.pname,
                        jsdata.fname,
                        jsdata.lname,
                        jsdata.birthdate,
                        jsdata.sex,
                        jsdata.cid,
                        jsdata.blood_group
                    ],
                     (err, results) => {
                        if (err) throw err
                    })
                );
                var ProgressBar = require('progress');
                var count = 20 / keyCount;
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
            'WHERE opdscreen.vstdate >= "2023-01-01" AND opdscreen.vstdate <= "2023-05-31" ORDER BY opdscreen.vstdate ASC',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
            // res.status(200).json(result)
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_visit (visitdate,pcucode,visitno,pid,symptoms,weight,height,pressure,temperature,pulse,respri) VALUES (?,"+h_code+",?,?,?,?,?,?,?,?,?)",
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
                var count = 20 / keyCount;
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

// Send HPI From HOSxP XE4
app.get('/hpi', async (req, res) => {
            
    try {
        connection.query('SELECT entry_date,entry_time,vn,hpi_text ' +
            'FROM patient_history_hpi ' +
            'WHERE entry_date >= "2023-01-01" AND entry_date <= "2023-05-31" ORDER BY entry_date ASC',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
            // res.status(200).json(result)
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_visit_hpi (h_entry_date,h_entry_time,h_vn,h_hpi_text,pcucode) VALUES (?,?,?,?,"+h_code+")",
                    [
                        jsdata.entry_date,
                        jsdata.entry_time,
                        jsdata.vn,
                        jsdata.hpi_text
                    ],
                     (err, results) => {
                        if (err) throw err
                    })
                );
                var ProgressBar = require('progress');
                var count = 20 / keyCount;
                var bar = new ProgressBar('Processing [ :percent ]', { total: keyCount });
                var timer = setInterval(function () {
                bar.tick();
                if (bar.complete) {
                    console.log("HPI Data Transfer Complete :: "+ keyCount + " Records\n------------------------------------------\n");
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

// Send PE From HOSxP XE4
app.get('/pe', async (req, res) => {
            
    try {
        connection.query('SELECT vn,pe,update_datetime ' +
            'FROM opdscreen_doctor_pe ' +
            'WHERE update_datetime >= "2020-01-01" AND update_datetime <= "2023-05-31" ORDER BY update_datetime ASC',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
            // res.status(200).json(result)
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_visit_pe (pe_vn,pe_text,pe_date) VALUES (?,?,?)",
                    [
                        jsdata.vn,
                        jsdata.pe,
                        jsdata.update_datetime
                    ],
                     (err, results) => {
                        if (err) throw err
                    })
                );
                var ProgressBar = require('progress');
                var count = 20 / keyCount;
                var bar = new ProgressBar('Processing [ :percent ]', { total: keyCount });
                var timer = setInterval(function () {
                bar.tick();
                if (bar.complete) {
                    console.log("PE Data Transfer Complete :: "+ keyCount + " Records\n------------------------------------------\n");
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
            'WHERE ovst.vstdate >= "2023-01-01" AND ovst.vstdate <= "2023-05-31" ORDER BY ovst.vstdate ASC',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_visit_diag (visitdate,pcucode,visitno,diagcode,diseasenamethai) VALUES (?,"+h_code+",?,?,?)",
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
                var count = 20 / keyCount;
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
        connection.query('SELECT opitemrece.vstdate,opitemrece.vn,drugitems.`name` AS drugname,opitemrece.qty,drugusage.shortlist ' +
            'FROM opitemrece ' +
            'LEFT JOIN drugitems ON drugitems.icode = opitemrece.icode ' +
            'LEFT JOIN drugusage ON drugusage.drugusage = drugitems.drugusage ' +
            'WHERE opitemrece.an IS NULL AND drugitems.drugusage IS NOT NULL ' +
            'AND opitemrece.vstdate >= "2023-01-01" AND opitemrece.vstdate <= "2023-05-31" ORDER BY opitemrece.vstdate ASC',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_visit_drug (visitdate,pcucode,visitno,drugname,unit,dose) VALUES (?,"+h_code+",?,?,?,?)",
                    [
                        jsdata.vstdate,
                        jsdata.vn,
                        jsdata.drugname,
                        jsdata.qty,
                        jsdata.shortlist
                    ],
                     (err, results) => {
                        if (err) throw err
                    })
                );
                var ProgressBar = require('progress');
                var count = 20 / keyCount;
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

// Send LAB From HOSxP XE4
app.get('/lab', async (req, res) => {
            
    try {
        connection.query('SELECT lab_head.vn,lab_head.lab_order_number,lab_order.lab_items_name_ref,lab_order.lab_order_result,lab_head.order_date,lab_head.report_date ' +
            'FROM lab_head ' +
            'LEFT JOIN lab_order ON lab_order.lab_order_number = lab_head.lab_order_number ' +
            'WHERE lab_head.vn IS NOT NULL ' +
            'AND lab_head.order_date >= "2023-06-01" AND lab_head.order_date <= "2023-06-06" ORDER BY lab_head.order_date ASC',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_visit_lab (v_lab_vn,v_lab_no,v_lab_name,v_lab_result,lab_order_date,lab_report_date,pcucode) VALUES (?,?,?,?,?,?,"+h_code+")",
                    [
                        jsdata.vn,
                        jsdata.lab_order_number,
                        jsdata.lab_items_name_ref,
                        jsdata.lab_order_result,
                        jsdata.order_date,
                        jsdata.report_date
                    ],
                     (err, results) => {
                        if (err) throw err
                    })
                );
                var ProgressBar = require('progress');
                var count = 20 / keyCount;
                var bar = new ProgressBar('Processing [ :percent ]', { total: keyCount });
                var timer = setInterval(function () {
                bar.tick();
                if (bar.complete) {
                    console.log("LAB Data Transfer Complete :: "+ keyCount + " Records\n------------------------------------------\n");
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

// Send Clinic From HOSxP XE4
app.get('/clinic', async (req, res) => {
            
    try {
        connection.query('SELECT clinicmember.hn,clinicmember.clinic,clinic.`name` AS clinic_name,regdate,dx_hospcode ' +
            'FROM clinicmember ' +
            'LEFT JOIN clinic ON clinic.clinic = clinicmember.clinic ' +
            'WHERE hn != "777777777" ORDER BY regdate ASC',
            (err, result, field) => {
                if (err) {
                    console.log(err)
                    return res.status(400).send()
                }
            // res.status(200).json(result)
                var jsArray = result;
                var keyCount  = Object.keys(result).length;
                jsArray.forEach(jsdata =>
                    api_connection.query("INSERT INTO h_clinic_list (list_hn,clinic_id,clinic_name,regdate,pcucode) VALUES (?,?,?,?,"+h_code+")",
                    [
                        jsdata.hn,
                        jsdata.clinic,
                        jsdata.clinic_name,
                        jsdata.regdate,
                        jsdata.dx_hospcode
                    ],
                     (err, results) => {
                        if (err) throw err
                    })
                );
                var ProgressBar = require('progress');
                var count = 20 / keyCount;
                var bar = new ProgressBar('Processing [ :percent ]', { total: keyCount });
                var timer = setInterval(function () {
                bar.tick();
                if (bar.complete) {
                    console.log("NCD Data Transfer Complete :: "+ keyCount + " Records\n------------------------------------------\n");
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