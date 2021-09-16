import React from 'react';
import axios from 'axios';
import './scss/main-contain.scss'
import {
    Button,
    Dropdown,
    ButtonGroup,
    Accordion,
    Table,
    Spinner,
    InputGroup,
    FormControl,
    ToggleButton,
    Alert
} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { ResponsiveBar } from '@nivo/bar'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

library.add(fas)
var txtAlert = []
var refreshData = null

const api = axios.create({
    baseURL: `http://127.0.0.1:8080/`
})
const commonProps = {
    margin: { top: 30, right: 150, bottom: 60, left: 80 },
    indexBy: 'mcname',
    padding: 0.2,
    labelTextColor: 'inherit:opacity',
    labelSkipWidth: 16,
    labelSkipHeight: 16,
}
const customTick = (tick) => {
    //console.log(tick)
    const val = tick.value
    const len = val.length
    const line = Math.ceil(len / 15)
    var txts = []
    var txtInd = 0
    for (var i = 1; i <= line; i++) {
        if (i < line) {
            txts.push(val.substring(txtInd, txtInd + 15))
            txtInd += 15
        } else {
            txts.push(val.substring(txtInd, len))
        }
    }
    return (
        <g transform={`translate(${tick.x},${tick.y + 12})`} key={tick.id}>
            <line stroke="rgb(200, 200, 200)" strokeWidth={1.5} y1={-12} y2={-2} />
            <text
                alignmentBaseline={tick.textBaseLine}
                textAnchor={tick.textAnchor}
                style={{
                    fontSize: 10,
                }}
                transform={`translate(${tick.textX},${tick.textY})`}
            >
                {txts.map((txt, ind) => {
                    return (
                        <tspan x={0} dy={ind === 0 ? 0 : 18} key={ind}>{txt}</tspan>
                    )
                })}
            </text>
        </g>
    )
}

class Maincontain extends React.Component {
    state = {
        isLoading: false,
        isAlert: false,
        txtAlert: [],
        mc_names: [],
        detailSQL: {
            mc_name: [],
            st_date: moment(new Date()).format("yyyy-MM-DD"),
            shift: "Day",
            st_time: moment(new Date()).format("HH:mm"),
            en_time: moment(new Date()).format("HH:mm"),
            break_1: "11:00-12:00",
            break_2: "09:30-09:40",
            break_3: "14:30-14:40"
        },
        st_date: new Date(),
        st_time: new Date(),
        en_time: new Date(),
        diff_time: moment("00:00", "HH:mm").format("HH:mm"),
        getData_btn_disable: true,
        showSumData: false,
        chartKeys: ['MT', 'HT', 'WT', 'NG cycle', 'Loss', 'N/A'],
        chartData: [{
            mcname: "",
            p_mt: 0,
            p_ht: 0,
            p_wt: 0,
            p_ngct: 0,
            p_loss: 0,
            p_na: 0
        }],
        sumChartData: {
            p_mt: 0,
            p_ht: 0,
            p_wt: 0,
            p_ngct: 0,
            p_loss: 0,
            p_na: 0
        },
        mc_name_data: [],
        mc_name_data_selected: "",
        tableDatas: {},
        tableData: {
            total: 0,
            mt: 0,
            ht: 0,
            wt: 0,
            ngct: 0,
            loss: 0,
            na: 0
        },
        avgData: {
            mt: 0,
            ht: 0,
            wt: 0,
            ct: 0
        },
        cntData: {
            mt: 0,
            ht: 0,
            wt: 0
        },
        ct_target: 0,
        cnt_target: 0,
        per_cnt_target: 0,
        graphMode: "OA,Loss",
        refreshMode: "Manual",
    }

    constructor() {
        super()
    }

    componentDidMount() {
        console.log("did mount")
        this.getMCname()
    }

    getMCname = () => {
        api.get(`/mcnamedata`)
            .then(results => {
                console.log(results.data)
                this.setState({
                    mc_names: results.data
                }, () => {
                    console.log(this.state.mc_names)
                })
            })
            .catch(err => {
                console.log(err)
                this.setAlert(err)
            })
    }

    selectDetail = (key, value) => {
        var val = value
        if (key === "mc_name") {
            val = [...this.state.detailSQL.mc_name, value]
        }
        this.setState({
            detailSQL: { ...this.state.detailSQL, [key]: val },
            getData_btn_disable: false
        }, () => {
            console.log(this.state.detailSQL)
        })
    }

    DatePicker = () => {
        return (
            <DatePicker
                selected={this.state.st_date}
                onChange={(date) => {
                    console.log(date)
                    this.setState({
                        st_date: date,
                        detailSQL: { ...this.state.detailSQL, st_date: moment(date).format("yyyy-MM-DD") }
                    })
                }}
                dateFormat="yyyy-MM-dd "
            />
        )
    }

    TimePicker = (type, key) => {
        return (
            <DatePicker
                selected={type === "operate" ? this.state[key] : new Date(moment(this.state.detailSQL[key].split("-")[0], "HH:mm").toISOString(true))}
                onChange={(date) => {
                    console.log(date)
                    if (type === "operate") {
                        console.log(type)
                        this.setState({
                            [key]: date,
                            detailSQL: { ...this.state.detailSQL, [key]: moment(date).format("HH:mm") }
                        }, () => {
                            this.calculateCntPercentTarget()
                        })
                    } else if (type === "break") {
                        console.log(type)
                        var val = 10
                        if (key === "break_1") {
                            val = 60
                        }
                        this.setState({
                            detailSQL: {
                                ...this.state.detailSQL,
                                [key]: `${moment(date).format("HH:mm")}-${moment(date).add(val, 'm').format("HH:mm")}`
                            }
                        }, () => {
                            this.calculateCntPercentTarget()
                        })
                    }
                }}
                dateFormat="HH:mm"
                showTimeInput
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="time"
                timeFormat="HH:mm"
            />
        )
    }

    deleteSelectMC = (ind) => {
        var mcs = this.state.detailSQL.mc_name
        mcs.splice(ind, 1)
        console.log(mcs)
        var disable = false
        if (mcs.length === 0) {
            disable = true
        }
        this.setState({
            detailSQL: { ...this.state.detailSQL, mc_name: mcs },
            getData_btn_disable: disable
        })
    }

    getSumdata = () => {
        const sql = this.state.detailSQL
        var arrChartDatas = []
        var arrSumChartData = {
            MT: 0,
            HT: 0,
            WT: 0,
            "NG cycle": 0,
            Loss: 0,
            "N/A": 0,
            OA: 0,
            "Loss time": 0
        }
        var arrTableDatas = {}
        const st_break_1 = sql.break_1.split("-")[0]
        const en_break_1 = sql.break_1.split("-")[1]
        const st_break_2 = sql.break_2.split("-")[0]
        const en_break_2 = sql.break_2.split("-")[1]
        const st_break_3 = sql.break_3.split("-")[0]
        const en_break_3 = sql.break_3.split("-")[1]
        const mcs = sql.mc_name.join(";")
        const query = (`/sumdata/${mcs}&${sql.st_date}&${sql.shift}&${sql.st_time}&${sql.en_time}&${st_break_1}&${en_break_1}&${st_break_2}&${en_break_2}&${st_break_3}&${en_break_3}`)
        let spin = document.querySelector('.get-data-spinner')
        let spinners = document.querySelectorAll('.get-data-spinner')
        console.log(spin)
        console.log(spinners)
        spinners.forEach(spinner => {
            console.log(spinner)
            spinner.style.setProperty('visibility', 'visible')
        })
        api.get(query)
            .then(results => {
                console.log(results.data)
                var arrChartData = {}
                var arrTableData = {}
                var arrAvgData = {}
                var arrCntData = {}
                var last_mc = ""
                if (results.data.length > 0) {
                    results.data.forEach(result => {
                        arrChartData = {
                            ...arrChartData,
                            mcname: result.mcname,
                            MT: result.p_mt,
                            HT: result.p_ht,
                            WT: result.p_wt,
                            "NG cycle": result.p_ngct,
                            Loss: result.p_loss,
                            "N/A": result.p_na,
                            OA: result.p_mt + result.p_ht,
                            "Loss time": result.p_wt + result.p_ngct + result.p_loss + result.p_na
                        }
                        arrSumChartData = {
                            MT: arrSumChartData.MT + result.p_mt,
                            HT: arrSumChartData.HT + result.p_ht,
                            WT: arrSumChartData.WT + result.p_wt,
                            "NG cycle": arrSumChartData["NG cycle"] + result.p_ngct,
                            Loss: arrSumChartData.Loss + result.p_loss,
                            "N/A": arrSumChartData["N/A"] + result.p_na,
                            OA: arrSumChartData.OA + result.p_mt + result.p_ht,
                            "Loss time": arrSumChartData["Loss time"] + result.p_wt + result.p_ngct + result.p_loss + result.p_na
                        }
                        arrTableData = {
                            total: [
                                moment.utc(result.s_total * 1000).format("HH:mm:ss")
                            ],
                            mt: [
                                moment.utc(result.s_mt * 1000).format("HH:mm:ss"),
                                result.p_mt
                            ],
                            ht: [
                                moment.utc(result.s_ht * 1000).format("HH:mm:ss"),
                                result.p_ht
                            ],
                            wt: [
                                moment.utc(result.s_wt * 1000).format("HH:mm:ss"),
                                result.p_wt
                            ],
                            ngct: [
                                moment.utc(result.s_ngct * 1000).format("HH:mm:ss"),
                                result.p_ngct
                            ],
                            loss: [
                                moment.utc(result.s_loss * 1000).format("HH:mm:ss"),
                                result.p_loss
                            ],
                            na: [
                                moment.utc(result.s_na * 1000).format("HH:mm:ss"),
                                result.p_na
                            ]
                        }
                        arrAvgData = {
                            mt: result.avg_mt,
                            ht: result.avg_ht,
                            wt: result.avg_wt,
                            ct: Number(result.avg_mt + result.avg_ht + result.avg_wt).toFixed(2)
                        }
                        arrCntData = {
                            mt: result.cnt_mt,
                            ht: result.cnt_ht,
                            wt: result.cnt_wt
                        }
                        console.log(arrChartData)
                        arrTableDatas = { ...arrTableDatas, [result.mcname]: arrTableData }
                        arrChartDatas.push(arrChartData)
                        last_mc = result.mcname
                    })
                    arrSumChartData = {
                        mcname: "Average",
                        MT: Number(arrSumChartData.MT / results.data.length).toFixed(2),
                        HT: Number(arrSumChartData.HT / results.data.length).toFixed(2),
                        WT: Number(arrSumChartData.WT / results.data.length).toFixed(2),
                        "NG cycle": Number(arrSumChartData["NG cycle"] / results.data.length).toFixed(2),
                        Loss: Number(arrSumChartData.Loss / results.data.length).toFixed(2),
                        "N/A": Number(arrSumChartData["N/A"] / results.data.length).toFixed(2),
                        OA: Number(arrSumChartData.OA / results.data.length).toFixed(2),
                        "Loss time": Number(arrSumChartData["Loss time"] / results.data.length).toFixed(2)
                    }
                }
                console.log(arrSumChartData)
                arrChartDatas.push(arrSumChartData)
                this.setState({
                    chartData: arrChartDatas,
                    tableData: arrTableData,
                    tableDatas: arrTableDatas,
                    avgData: arrAvgData,
                    cntData: arrCntData,
                    mc_name_data: sql.mc_name,
                    mc_name_data_selected: last_mc
                }, () => {
                    this.calculateCntPercentTarget()
                    this.toggleShowHideSummary(true)
                    spinners.forEach(spinner => {
                        spinner.style.setProperty('visibility', 'hidden')
                    })
                    if (this.state.refreshMode === "Auto") {
                        this.setRefresh()
                    }
                })
            })
            .catch(err => {
                console.log(err)
                alert("getSumdata error")
            })
    }

    calculateCntPercentTarget = () => {
        var percent = 0
        const start_time = moment(this.state.st_time)
        const end_time = moment(this.state.en_time)
        var diffTime_s = end_time.diff(start_time) / 1000
        for (var i = 1; i <= 3; i++) {
            const st_break = moment(this.state.detailSQL[`break_${i}`].split("-")[0], "HH:mm")
            const en_break = moment(this.state.detailSQL[`break_${i}`].split("-")[1], "HH:mm")
            diffTime_s *= 1000
            var timeType = "out break"
            if ((start_time < st_break && end_time < st_break) || (start_time > en_break && end_time > en_break)) {
                //out break
                console.log("out break")
                timeType = "out break"
                diffTime_s = diffTime_s
            } else if (start_time < st_break && end_time > st_break && end_time < en_break) {
                //end in break
                console.log("end in break")
                timeType = "end in break"
                diffTime_s -= end_time.diff(st_break)
            } else if (start_time < st_break && end_time > en_break) {
                //cover break
                console.log("cover break")
                timeType = "cover break"
                diffTime_s -= en_break.diff(st_break)
            } else if (start_time > st_break && start_time < en_break && end_time > en_break) {
                //start in break
                console.log("start in break")
                timeType = "start in break"
                diffTime_s -= en_break.diff(start_time)
            } else if (start_time > st_break && start_time < en_break && end_time > st_break && end_time < en_break) {
                //in break
                console.log("in break")
                timeType = "in break"
                diffTime_s -= 0
            }
            diffTime_s /= 1000
            if (timeType === "end in break") {
                diffTime_s = Math.ceil(diffTime_s)
            } else {
                diffTime_s = Math.floor(diffTime_s)
            }
        }
        diffTime_s = diffTime_s / 60
        diffTime_s = Math.floor(diffTime_s) * 60
        if (diffTime_s < 0) {
            this.setAlert("Warning : Start time is after End time")
        }
        const diffTime = moment.utc(diffTime_s * 1000).format("HH:mm")
        const ctTarget = Number(this.state.ct_target)
        const cntActual = this.state.cntData.mt
        var cntTarget = 0
        if (ctTarget > 0) {
            cntTarget = Math.floor(diffTime_s / ctTarget)
        }
        if (cntTarget > 0) {
            percent = (cntActual / cntTarget * 100).toFixed(2)
        }
        this.setState({
            diff_time: diffTime,
            cnt_target: cntTarget,
            per_cnt_target: percent,
        })
    }

    toggleShowHideSummary = (flag) => {
        let chart = document.querySelector('.div-result-main')
        let chev = document.querySelector('.svg-rotate')
        let h = document.querySelector('.div-result-main').scrollHeight
        if (flag) {
            chart.style.setProperty('visibility', 'visible')
            chart.style.setProperty('--max-height', h + 'px')
            chev.style.setProperty('--svg-rotate', 'rotate(0deg)')
        } else {
            chart.style.setProperty('visibility', 'hidden')
            chart.style.setProperty('--max-height', '0')
            chev.style.setProperty('--svg-rotate', 'rotate(180deg)')
        }
        this.setState({
            showSumData: flag,
        })
    }

    setRefreshMode = (mode) => {
        if (refreshData !== null) {
            clearTimeout(refreshData)
        }
        if (mode === "Auto") {
            this.setRefresh()
        }
        this.setState({
            refreshMode: mode
        })
    }

    setRefresh = () => {
        refreshData = setTimeout(() => {
            console.log("refresh")
            this.getSumdata()
        }, 3000);
    }

    setGraphMode = (mode) => {
        console.log(mode)
        var keys = []
        if (mode === "Elements") {
            keys = ['MT', 'HT', 'WT', 'NG cycle', 'Loss', 'N/A']
        } else {
            keys = ['OA', 'Loss time']
        }
        this.setState({
            graphMode: mode,
            chartKeys: keys
        })
    }

    setMCTableData = (mc) => {
        this.setState({
            mc_name_data_selected: mc,
            tableData: this.state.tableDatas[mc]
        })
    }

    setAlert = (txt) => {
        txtAlert.push(txt)
        this.setState({
            isAlert: true,
            txtAlert: txtAlert
        }, () => {
            var alert = setTimeout(() => {
                var newTxtAlert = this.state.txtAlert
                var show = false
                for (var i = 0; i < newTxtAlert.length; i++) {
                    console.log(newTxtAlert[i])
                    if (newTxtAlert[i] === txt) {
                        newTxtAlert.splice(i, 1)
                    }
                    if (newTxtAlert.length === 0) {
                        show = false
                    } else {
                        show = true
                    }
                }
                this.setState({
                    isAlert: show,
                    txtAlert: newTxtAlert
                })
            }, 5000);
        })
    }

    test = () => {
        console.log(this.state.detailSQL)
    }

    render() {
        return (
            <div className="div-main-contain">
                {<button onClick={() => this.test()}>test1</button>}
                <h1>Initial Stage Visualize</h1>
                {this.state.isAlert && <Alert variant={"danger"}>{this.state.txtAlert.join("\n")}</Alert>}
                <Accordion defaultActiveKey="0" className="accordian-select-detail">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Operation Record details</Accordion.Header>
                        <Accordion.Body>
                            <div className="div-select-detail">
                                <div className="div-select-data-1">
                                    <div className="select-detail-compo">
                                        <h6>Shift :</h6>
                                        <Dropdown as={ButtonGroup}>
                                            <Button variant="secondary">{this.state.detailSQL.shift}</Button>
                                            <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic" />
                                            <Dropdown.Menu align="end">
                                                <Dropdown.Item onClick={() => this.selectDetail("shift", "Day")}>Day</Dropdown.Item>
                                                <Dropdown.Item onClick={() => this.selectDetail("shift", "Night")}>Night</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                    <div className="select-detail-datepicker">
                                        <h6>Date :</h6>
                                        {this.DatePicker()}
                                    </div>
                                    <div className="select-detail-datepicker">
                                        <h6>Start time :</h6>
                                        {this.TimePicker("operate", "st_time")}
                                    </div>
                                    <div className="select-detail-datepicker">
                                        <h6>End time :</h6>
                                        {this.TimePicker("operate", "en_time")}
                                    </div>
                                </div>
                                <div className="div-select-data-1">
                                    <div className="select-detail-datepicker break">
                                        <h6>Small break [morning] (10 min.)</h6>
                                        <div className="break-time">
                                            {this.TimePicker("break", "break_2")}
                                            <span> - {this.state.detailSQL.break_2.split("-")[1]}</span>
                                        </div>
                                    </div>
                                    <div className="select-detail-datepicker break">
                                        <h6>Lunch break (1 hr.):</h6>
                                        <div className="break-time">
                                            {this.TimePicker("break", "break_1")}
                                            <span> - {this.state.detailSQL.break_1.split("-")[1]}</span>
                                        </div>
                                    </div>
                                    <div className="select-detail-datepicker break">
                                        <h6>Small break [afternoon] (10 min.)</h6>
                                        <div className="break-time">
                                            {this.TimePicker("break", "break_3")}
                                            <span> - {this.state.detailSQL.break_3.split("-")[1]}</span>
                                        </div>
                                    </div>
                                    <div className="select-detail-ct">
                                        <InputGroup>
                                            <InputGroup.Text id="input-ct-target">CT target (s.)</InputGroup.Text>
                                            <FormControl
                                                aria-label="Default"
                                                aria-describedby="inputGroup-sizing-default"
                                                value={this.state.ct_target}
                                                onChange={e => this.setState({ ct_target: e.target.value })}
                                            />
                                        </InputGroup>
                                    </div>
                                </div>
                                <div className="select-detail-mc">
                                    <Dropdown as={ButtonGroup}>
                                        <Button variant="secondary">Machine name</Button>
                                        <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic" />
                                        <Dropdown.Menu align="end">
                                            {this.state.mc_names.map((mc, ind) => {
                                                return (
                                                    <Dropdown.Item onClick={() => this.selectDetail("mc_name", mc)} key={ind}>{mc}</Dropdown.Item>
                                                )
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    {this.state.detailSQL.mc_name.map((mc, ind) => {
                                        return (
                                            <div className="div-selected-value">
                                                <p className="selected-value">{mc}</p>
                                                <FontAwesomeIcon icon={['fas', 'times']} onClick={() => this.deleteSelectMC(ind)} />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="div-select-btn">
                                <Spinner className="get-data-spinner" animation="border" role="status" variant="secondary">
                                    <span className="visually-hidden"></span>
                                </Spinner>
                                <Button onClick={() => this.getSumdata()} disabled={this.state.getData_btn_disable}>Get data</Button>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                <div className="div-summary-data">
                    <div className="div-result-oa-btn" onClick={() => this.toggleShowHideSummary(!this.state.showSumData)}>
                        <p>Summary data</p>
                        <FontAwesomeIcon icon={['fas', 'chevron-up']} className="svg-rotate" />
                    </div>
                    <div className="div-result-main">
                        <div className="div-result-work">
                            <p>Time range :  <b>{this.state.diff_time}</b></p>
                            <p>Work amount :  <b>{this.state.cntData.mt} / {this.state.cnt_target} ({this.state.per_cnt_target}%)</b></p>
                        </div>
                        <div className="div-result-btn-mode">
                            <div className="div-btn-group">
                                <b>Refresh mode : </b>
                                <div>
                                    <ButtonGroup>
                                        <ToggleButton
                                            type="radio"
                                            checked={this.state.refreshMode === "Manual"}
                                            variant={this.state.refreshMode === "Manual" ? 'outline-info' : 'outline-secondary'}
                                            onClick={() => this.setRefreshMode("Manual")}
                                        >
                                            Manual
                                        </ToggleButton>
                                        <ToggleButton
                                            type="radio"
                                            checked={this.state.refreshMode === "Auto"}
                                            variant={this.state.refreshMode === "Auto" ? 'outline-info' : 'outline-secondary'}
                                            onClick={() => this.setRefreshMode("Auto")}
                                        >
                                            Auto
                                        </ToggleButton>
                                    </ButtonGroup>
                                    <Spinner className="get-data-spinner" animation="border" role="status" variant="secondary">
                                        <span className="visually-hidden"></span>
                                    </Spinner>
                                </div>
                            </div>
                            <div className="div-btn-group">
                                <b>Chart mode : </b>
                                <ButtonGroup>
                                    <ToggleButton
                                        type="radio"
                                        checked={this.state.graphMode === "OA,Loss"}
                                        variant={this.state.graphMode === "OA,Loss" ? 'outline-info' : 'outline-secondary'}
                                        onClick={() => this.setGraphMode("OA,Loss")}
                                    >
                                        OA,Loss
                                    </ToggleButton>
                                    <ToggleButton
                                        type="radio"
                                        checked={this.state.graphMode === "Elements"}
                                        variant={this.state.graphMode === "Elements" ? 'outline-info' : 'outline-secondary'}
                                        onClick={() => this.setGraphMode("Elements")}
                                    >
                                        Elements
                                    </ToggleButton>
                                </ButtonGroup>
                            </div>
                            <div className="div-btn-group">
                                <b>Data in table :</b>
                                <Dropdown as={ButtonGroup}>
                                    <Button variant="secondary">{this.state.mc_name_data_selected}</Button>
                                    <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic" />
                                    <Dropdown.Menu align="end">
                                        {this.state.mc_name_data.map((mc, ind) => {
                                            return (
                                                <Dropdown.Item onClick={() => this.setMCTableData(mc)} key={ind}>{mc}</Dropdown.Item>
                                            )
                                        })}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="div-result-oa">
                            <div className="div-chart">
                                <ResponsiveBar
                                    {...commonProps}
                                    data={this.state.chartData}
                                    keys={this.state.chartKeys}
                                    maxValue={100}
                                    padding={0.2}
                                    layout="vertical"
                                    enableGridY={true}
                                    enableGridX={false}
                                    axisBottom={{
                                        renderTick: customTick
                                    }}
                                    axisLeft={{
                                        format: value =>
                                            `${value}%`
                                    }}
                                    colors={(id, value) => {
                                        var colorCode
                                        const Id = id.id
                                        if (Id === "MT")
                                            colorCode = "#79D4FF"
                                        else if (Id === "HT")
                                            colorCode = "#FFE579"
                                        else if (Id === "WT")
                                            colorCode = "#79FFBC"
                                        else if (Id === "NG cycle")
                                            colorCode = "#FFBC79"
                                        else if (Id === "Loss")
                                            colorCode = "#FF799E"
                                        else if (Id === "N/A")
                                            colorCode = "#D679FF"
                                        else if (Id === "OA")
                                            colorCode = "#79D4FF"
                                        else if (Id === "Loss time")
                                            colorCode = "#FF799E"
                                        else
                                            colorCode = "red"
                                        return colorCode
                                    }}
                                    borderWidth="3px"
                                    borderColor={id => {
                                        const Id = id.data.id
                                        switch (Id) {
                                            case "MT":
                                            case "HT":
                                            case "WT":
                                            case "OA":
                                                return "#4B6EBC"
                                            default:
                                                return "#BC4B4B"
                                        }
                                    }}
                                    valueFormat={value =>
                                        `${value}%`
                                    }
                                    tooltip={({ id, value, color }) => (
                                        <div
                                            style={{
                                                padding: 12,
                                                color,
                                                background: '#222222',
                                            }}
                                        >
                                            <strong>
                                                {id} : {value}%
                                            </strong>
                                        </div>
                                    )}
                                    legends={[
                                        {
                                            dataFrom: 'keys',
                                            anchor: 'bottom-right',
                                            direction: 'column',
                                            justify: false,
                                            translateX: 120,
                                            translateY: 0,
                                            itemsSpacing: 2,
                                            itemWidth: 100,
                                            itemHeight: 20,
                                            itemDirection: 'left-to-right',
                                            itemOpacity: 0.85,
                                            symbolSize: 20,
                                            effects: [
                                                {
                                                    on: 'hover',
                                                    style: {
                                                        itemOpacity: 1
                                                    }
                                                }
                                            ]
                                        }
                                    ]}
                                />
                            </div>
                            <div className="div-data">
                                <Table className="table-sumdata">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Time</th>
                                            <th>Ratio (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td >MT</td>
                                            <td >{this.state.tableData.mt[0]}</td>
                                            <td >{this.state.tableData.mt[1]}%</td>
                                        </tr>
                                        <tr>
                                            <td >HT</td>
                                            <td >{this.state.tableData.ht[0]}</td>
                                            <td >{this.state.tableData.ht[1]}%</td>
                                        </tr>
                                        <tr>
                                            <td >WT</td>
                                            <td >{this.state.tableData.wt[0]}</td>
                                            <td >{this.state.tableData.wt[1]}%</td>
                                        </tr>
                                        <tr>
                                            <td >NG cycle</td>
                                            <td >{this.state.tableData.ngct[0]}</td>
                                            <td >{this.state.tableData.ngct[1]}%</td>
                                        </tr>
                                        <tr>
                                            <td >Loss</td>
                                            <td >{this.state.tableData.loss[0]}</td>
                                            <td >{this.state.tableData.loss[1]}%</td>
                                        </tr>
                                        <tr>
                                            <td >N/A</td>
                                            <td >{this.state.tableData.na[0]}</td>
                                            <td >{this.state.tableData.na[1]}%</td>
                                        </tr>
                                        <tr>
                                            <td>Total</td>
                                            <td>{this.state.tableData.total[0]}</td>
                                            <td></td>
                                        </tr>
                                        <tr className="avg-row">
                                            <td>Avg. MT</td>
                                            <td>{this.state.avgData.mt} s.</td>
                                            <td></td>
                                        </tr>
                                        <tr className="avg-row">
                                            <td>Avg. HT</td>
                                            <td>{this.state.avgData.ht} s.</td>
                                            <td></td>
                                        </tr>
                                        <tr className="avg-row">
                                            <td>Avg. WT</td>
                                            <td>{this.state.avgData.wt} s.</td>
                                            <td></td>
                                        </tr>
                                        <tr className="avg-row">
                                            <td>Avg. CT</td>
                                            <td>{this.state.avgData.ct} s.</td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}

export default Maincontain;