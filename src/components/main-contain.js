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
    ToggleButton
} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { ResponsiveBar } from '@nivo/bar'
import { AxisTickProps } from '@nivo/axes'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

library.add(fas)

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
        <g transform={`translate(${tick.x},${tick.y + 22})`}>
            <line stroke="rgb(200, 200, 200)" strokeWidth={1.5} y1={-22} y2={-12} />
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
                        <tspan x={0} dy={18 * ind}>{txt}</tspan>
                    )
                })}
            </text>@
        </g>
    )
}

class Maincontain extends React.Component {
    state = {
        isLoading: false,
        mc_names: [],
        detailSQL: {
            mc_name: [],
            st_date: moment(new Date()).format("yyyy-MM-DD"),
            shift: "Day",
            st_time: moment(new Date()).format("HH:mm"),
            en_time: moment(new Date()).format("HH:mm"),
            break: "11:00-12:00"
        },
        st_date: new Date(),
        st_time: new Date(),
        en_time: new Date(),
        diff_time: moment("00:00","HH:mm").format("HH:mm"),
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
        graphMode: "Elements",
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
                alert("getMCname error")
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
                timeInputLabel="Time:"
                dateFormat="yyyy-MM-dd "
            />
        )
    }

    TimePicker = (key) => {
        return (
            <DatePicker
                selected={this.state[key]}
                onChange={(date) => {
                    console.log(date)
                    this.setState({
                        [key]: date,
                        detailSQL: { ...this.state.detailSQL, [key]: moment(date).format("HH:mm") }
                    }, () => {
                        this.calculateCntPercentTarget()
                    })
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
        this.setState({
            detailSQL: { ...this.state.detailSQL, mc_name: mcs }
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
        const st_break = sql.break.split("-")[0]
        const en_break = sql.break.split("-")[1]
        const mcs = sql.mc_name.join(";")
        console.log(`/sumdata/${mcs}&${sql.st_date}&${sql.shift}&${sql.st_time}&${sql.en_time}&${st_break}&${en_break}`)
        let spinner = document.querySelector('.get-data-spinner')
        spinner.style.setProperty('visibility', 'visible')
        api.get(`/sumdata/${mcs}&${sql.st_date}&${sql.shift}&${sql.st_time}&${sql.en_time}&${st_break}&${en_break}`)
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
                    spinner.style.setProperty('visibility', 'hidden')
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
        const st_break = moment(this.state.detailSQL.break.split("-")[0], "HH:mm")
        const en_break = moment(this.state.detailSQL.break.split("-")[1], "HH:mm")
        console.log(start_time)
        console.log(st_break)
        var diffTime_s = 0
        var timeType = "out break"
        if ((start_time < st_break && end_time < st_break) || (start_time > en_break && end_time > en_break)) {
            //out break
            console.log("out break")
            timeType = "out break"
            diffTime_s = end_time.diff(start_time) / 1000
        } else if (start_time < st_break && end_time > st_break && end_time < en_break) {
            //end in break
            console.log("end in break")
            timeType = "end in break"
            diffTime_s = (end_time.diff(start_time) - end_time.diff(st_break)) / 1000
        } else if (start_time < st_break && end_time > en_break) {
            //cover break
            console.log("cover break")
            timeType = "cover break"
            diffTime_s = (end_time.diff(start_time) - en_break.diff(st_break)) / 1000
        } else if (start_time > st_break && start_time < en_break && end_time > en_break) {
            //start in break
            console.log("start in break")
            timeType = "start in break"
            diffTime_s = (end_time.diff(start_time) - en_break.diff(start_time)) / 1000
        } else if (start_time > st_break && start_time < en_break && end_time > st_break && end_time < en_break) {
            //in break
            console.log("in break")
            timeType = "in break"
            diffTime_s = 0
        }
        if (timeType === "end in break") {
            diffTime_s = Math.ceil(diffTime_s)
        } else {
            diffTime_s = Math.floor(diffTime_s)
        }
        diffTime_s = diffTime_s / 60
        diffTime_s = Math.floor(diffTime_s) * 60
        if (diffTime_s < 0) {
            alert("Warning : Start time is after End time")
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
            per_cnt_target: percent
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

    test = () => {
        this.calculateCntPercentTarget()
    }

    render() {
        return (
            <div className="div-main-contain">
                {/*<button onClick={() => this.test()}>test1</button>*/}
                <h1>Initial Stage Visualize</h1>
                <Accordion defaultActiveKey="0" className="accordian-select-detail">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Operation Record details</Accordion.Header>
                        <Accordion.Body>
                            <div className="div-select-detail">
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
                                    {this.TimePicker("st_time")}
                                </div>
                                <div className="select-detail-datepicker">
                                    <h6>End date :</h6>
                                    {this.TimePicker("en_time")}
                                </div>
                                <div className="select-detail-compo">
                                    <h6>Break time :</h6>
                                    <Dropdown as={ButtonGroup}>
                                        <Button variant="secondary">{this.state.detailSQL.break}</Button>
                                        <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic" />
                                        <Dropdown.Menu align="end">
                                            <Dropdown.Item onClick={() => this.selectDetail("break", "11:00-12:00")}>11:00-12:00</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.selectDetail("break", "11:15-12:15")}>11:15-12:15</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.selectDetail("break", "11:30-12:30")}>11:30-12:30</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.selectDetail("break", "11:45-12:45")}>11:45-12:45</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.selectDetail("break", "12:00-13:00")}>12:00-13:00</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="select-detail-ct">
                                    <br />
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
                                <div className="select-detail-compo">
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
                            <div>
                                <ButtonGroup>
                                    <ToggleButton
                                        type="radio"
                                        checked={this.state.graphMode === "Elements"}
                                        variant={this.state.graphMode === "Elements" ? 'outline-success' : 'outline-danger'}
                                        onClick={() => this.setGraphMode("Elements")}
                                    >
                                        Elements
                                    </ToggleButton>
                                    <ToggleButton
                                        type="radio"
                                        checked={this.state.graphMode === "OA,Loss"}
                                        variant={this.state.graphMode === "OA,Loss" ? 'outline-success' : 'outline-danger'}
                                        onClick={() => this.setGraphMode("OA,Loss")}
                                    >
                                        OA,Loss
                                    </ToggleButton>
                                </ButtonGroup>
                            </div>
                            <div>
                                <span>Data in table :</span>
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