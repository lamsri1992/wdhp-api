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

const app = express()

app.use(cors())
app.use(express.json())
app.listen(8550, function () {
    // console.log('CORS-enabled web server listening on port 8550')
})

app.get('/hn/:hn', async (req, res) => {
    const hn = req.params.hn

    try {
        connection.query('SELECT hn,pname,fname,lname,birthday,cid,religion,educate,family_status,occupation,addrpart,road,moopart,tmbpart,amppart,chwpart,sex FROM patient WHERE hn = ?',
            [hn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

// Methadone API
app.get('/methadone/:hn', async (req, res) => {
    const hn = req.params.hn

    try {
        connection.query('SELECT ovst.vn,ovst.hn,ovst.vstdate,ovstdiag.icd10 ' +
            'FROM ovst ' +
            'LEFT JOIN patient ON patient.hn = ovst.hn ' +
            'LEFT JOIN ovstdiag ON ovstdiag.vn = ovst.vn ' +
            'WHERE icd10 IN("F112","F1120","F1125") ' +
            'AND ovst.hn = ? ' +
            'ORDER BY ovstdiag.vstdate DESC',
            [hn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.get('/vst/:vn', async (req, res) => {
    const vn = req.params.vn

    try {
        connection.query('SELECT opdscreen.vn,opdscreen.bpd,opdscreen.bps,opdscreen.bw,opdscreen.cc,opdscreen.pulse,' +
            'opdscreen.temperature,opdscreen.note,opdscreen.rr,opdscreen.height,opdscreen.bmi,opdscreen.found_amphetamine ' +
            'FROM opdscreen ' +
            'WHERE opdscreen.vn = ? ',
            [vn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.get('/lab/:vn', async (req, res) => {
    const vn = req.params.vn

    try {
        connection.query('SELECT lab_head.lab_order_number,lab_order.lab_items_name_ref,lab_order.lab_order_result ' +
            'FROM lab_head ' +
            'LEFT JOIN lab_order ON lab_order.lab_order_number = lab_head.lab_order_number ' +
            'WHERE lab_head.vn = ? ',
            [vn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.get('/drug/:vn', async (req, res) => {
    const vn = req.params.vn

    try {
        connection.query('SELECT opitemrece.vn,drugitems.icode,drugitems.`name`,opitemrece.qty,drugitems.therapeutic,drugusage.name1,drugusage.name2 ' +
            'FROM opitemrece ' +
            'LEFT JOIN drugitems ON drugitems.icode = opitemrece.icode ' +
            'LEFT JOIN drugusage ON drugusage.drugusage = opitemrece.drugusage ' +
            'WHERE opitemrece.vn = ? AND drugitems.icode IS NOT NULL',
            [vn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

// Matrix API
app.get('/matrix/:hn', async (req, res) => {
    const hn = req.params.hn

    try {
        connection.query('SELECT ovst.vn,ovst.hn,ovst.vstdate,ovstdiag.icd10 ' +
            'FROM ovst ' +
            'LEFT JOIN patient ON patient.hn = ovst.hn ' +
            'LEFT JOIN ovstdiag ON ovstdiag.vn = ovst.vn ' +
            'WHERE icd10 IN("F195","Z503") ' +
            'AND ovst.hn = ? ' +
            'ORDER BY ovstdiag.vstdate DESC',
            [hn], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(result)
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

// ANC
app.get('/anc/:dstart/:dended', function (req, res) {
    const dstart = req.params.dstart;
    const dended = req.params.dended;
    try {
        connection.query('SELECT ovst.vn,ovst.hn,concat(fname," ",lname) as pname,ovstdiag.icd10,lab_order.lab_items_name_ref,lab_order.lab_order_result,ovst.vstdate ' +
            'FROM ovst ' +
            'LEFT JOIN patient ON patient.hn = ovst.hn ' +
            'LEFT JOIN ovstdiag ON ovstdiag.vn = ovst.vn ' +
            'LEFT JOIN lab_head ON lab_head.vn = ovst.vn ' +
            'LEFT JOIN lab_order ON lab_order.lab_order_number = lab_head.lab_order_number ' +
            'WHERE icd10 IN("Z33","Z340","Z348") ' +
            // 'AND lab_items_name_ref IN("Hb","HCT(30104)","HCT") ' +
            'AND lab_items_name_ref IN("Hb","HCT(30104)","HCT","Screen Down Syndrome","Hb typing (ANC)") ' +
            'AND ovst.vstdate BETWEEN ? AND ? ' +
            'ORDER BY ovstdiag.vstdate DESC',
            [dstart, dended], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).send({
                    data: result
                });
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

// ANC LIST
app.get('/anc/list', function (req, res) {
    try {
        connection.query('SELECT person_anc.person_anc_id,person.cid,patient.hn,CONCAT(person.pname,person.fname," ",person.lname) as patient,person_anc.anc_register_date as reg_date, ' +
            'person_anc.preg_no,person_anc.has_risk,person_anc.risk_list,person_anc.current_preg_age as preg_age, ' +
            'labor_status.labor_status_name as labor_status,person_anc.labor_date,person_anc.service_count,person_anc.anc_register_staff as reg_staff ' +
            'FROM person_anc ' +
            'LEFT JOIN person ON person.person_id = person_anc.person_id ' +
            'LEFT JOIN patient ON patient.cid = person.cid ' +
            'LEFT JOIN labor_status ON labor_status.labor_status_id = person_anc.labor_status_id ' +
            'ORDER BY person_anc.anc_register_date DESC',
            (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).send({
                    data: result
                });
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})


// ANC LIST SERVICE
app.get('/service/:pid', function (req, res) {
    const pid = req.params.pid;
    try {
        connection.query('SELECT anc_service_date,pa_week,anc_service_number,service_note_text ' +
            'FROM person_anc_service ' +
            'WHERE person_anc_id = ? ',
            [pid],(err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).send({
                    data: result
                });
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

// ANC LIST SHOW
app.get('/anc/:pid', function (req, res) {
    const pid = req.params.pid;
    try {
        connection.query('SELECT person_anc.person_anc_id,patient.hn,CONCAT(person.pname,person.fname," ",person.lname) as patient,CONCAT(patient.spsname," ",patient.spslname) AS husband,patient.couple_cid,' + 
            'patient.birthday,person.nationality,person_anc.preg_no,person_anc.risk_list,person_anc.has_risk,anc_register_date,person_anc.current_preg_age as preg_age,patient_image.image ' +
            'FROM person_anc ' +
            'LEFT JOIN person ON person.person_id = person_anc.person_id ' +
            'LEFT JOIN patient ON patient.cid = person.cid ' +
            'LEFT JOIN patient_image ON patient_image.hn = patient.hn ' +
            'WHERE person_anc.person_anc_id = ? ',
            [pid],(err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).send({
                    data: result
                });
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})


// ANC LAB 1
app.get('/ancLabs/:pid', function (req, res) {
    const pid = req.params.pid;
    try {
        connection.query('SELECT ovst.vn,ovst.hn,ovstdiag.icd10,lab_order.lab_items_name_ref,lab_order.lab_order_result,ovst.vstdate,person_anc.person_anc_id ' +
            'FROM ovst ' +
            'LEFT JOIN patient ON patient.hn = ovst.hn ' +
            'LEFT JOIN person ON person.patient_hn = patient.hn ' +
            'LEFT JOIN person_anc ON person_anc.person_id = person.person_id ' +
            'LEFT JOIN ovstdiag ON ovstdiag.vn = ovst.vn ' +
            'LEFT JOIN lab_head ON lab_head.vn = ovst.vn ' +
            'LEFT JOIN lab_order ON lab_order.lab_order_number = lab_head.lab_order_number ' +
            'WHERE icd10 IN("Z33","Z340","Z348") ' +
            'AND lab_items_name_ref IN("Hb","HCT(30104)","HCT") ' +
            'AND person_anc.person_anc_id = ? ' + 
            'ORDER BY ovstdiag.vstdate DESC',
            [pid], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).send({
                    data: result
                });
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})

// ANC LAB 2
app.get('/ancLabs2/:pid', function (req, res) {
    const pid = req.params.pid;
    try {
        connection.query('SELECT lab_head.vn,lab_head.hn,lab_order.lab_items_name_ref,lab_order.lab_order_result,lab_head.order_date,lab_head.report_date ' +
            'FROM lab_head ' +
            'LEFT JOIN lab_order ON lab_order.lab_order_number = lab_head.lab_order_number ' +
            'LEFT JOIN patient ON patient.hn = lab_head.hn ' +
            'LEFT JOIN person ON person.patient_hn = patient.hn ' +
            'LEFT JOIN person_anc ON person_anc.person_id = person.person_id ' +
            'WHERE lab_items_code IN ("321","329","377") ' +
            'AND person_anc.person_anc_id = ? ' + 
            'ORDER BY order_date DESC',
            [pid], (err, result, field) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).send({
                    data: result
                });
            })
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
})