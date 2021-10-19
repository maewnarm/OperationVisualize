import React, { useState } from 'react';
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
import { ResponsiveBullet } from '@nivo/bullet'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { BasicTooltip, useTooltip } from '@nivo/tooltip'
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

const BarChart = (chartData, chartKeys) => {
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
    return (
        <ResponsiveBar
            {...commonProps}
            data={chartData}
            keys={chartKeys}
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
    )
}

const BulletChart = (props) => {
    const [MaxValue, setMaxValue] = useState(10)
    const { visibleIndex } = props
    const commonProps = {
        width: 900,
        height: 360,
        margin: { top: 10, right: 30, bottom: 50, left: 110 },
        titleOffsetX: -50,
        spacing: 15,
        animate: false,
    }
    const data = [
        {
            "id": "temp.",
            "ranges": [
                96,
                10,
                104,
                0,
                120
            ],
            "measures": [
                32
            ],
            "markers": [
                113
            ]
        },
        {
            "id": "power",
            "ranges": [
                0.389616390278877,
                0.3529904192182939,
                1.363634672971878,
                0,
                2
            ],
            "measures": [
                0.08997297601559893,
                0.15675679465991488
            ],
            "markers": [
                1.217072154408654
            ]
        },
        {
            "id": "volume",
            "ranges": [
                25,
                8,
                7,
                0,
                3,
                36,
                0,
                40
            ],
            "measures": [
                15
            ],
            "markers": [
                37
            ]
        },
        {
            "id": "cost",
            "ranges": [
                5466,
                93864,
                260013,
                0,
                500000
            ],
            "measures": [
                77927,
                78955
            ],
            "markers": [
                456368
            ]
        },
        {
            "id": "revenue",
            "ranges": [
                3,
                2,
                9,
                0,
                13
            ],
            "measures": [
                8
            ],
            "markers": [
                9.917280347210818,
                8.12683789537778
            ]
        }
    ]
    const CustomRange = ({ x, y, width, height, color, data, onMouseEnter, onMouseMove, onMouseLeave }, visibleIndex) => {
        const { showTooltipFromEvent, hideTooltip } = useTooltip()
        //console.log(data)
        const v0 = data.v0
        const v1 = data.v1
        return (
            <rect
                x={x}
                y={y}
                rx={5}
                ry={5}
                width={width}
                height={height}
                fill={color}
                onMouseEnter={(event) =>
                    showTooltipFromEvent(<BasicTooltip
                        id={
                            v1 ? (
                                <span>
                                    <strong>{v0}</strong> to <strong>{v1}</strong>
                                </span>
                            ) : (
                                <strong>{v0}</strong>
                            )
                        }
                        enableChip={true}
                        color={color}
                    />, event)
                }
                onMouseMove={(event) =>
                    showTooltipFromEvent(<BasicTooltip
                        id={
                            v1 ? (
                                <span>
                                    <strong>{v0}</strong> to <strong>{v1}</strong>
                                </span>
                            ) : (
                                <strong>{v0}</strong>
                            )
                        }
                        enableChip={true}
                        color={color}
                    />, event)
                }
                onMouseLeave={() => hideTooltip()}
            />
        )
    }
    return (
        <div className="div-bullet-timechart">
            <input type="number" onChange={(e) => setMaxValue(e.currentTarget.value)} defaultValue={MaxValue} />
            <ResponsiveBullet
                {...commonProps}
                data={data}
                theme={{
                    fontSize: '14px',
                    labels: {
                        text: {
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }
                    }
                }}
                rangeComponent={(props) => CustomRange(props, visibleIndex)}
                maxValue={MaxValue}
            />
        </div>
    )
}

const HeatmapChart = () => {
    const keys = ["1", "2", "3"]
    const data = [
        {
            "type": "start",
            "1": 0,
            "1Color": "rgb(255,255,255)",
            "2": 1,
            "2Color": "rgb(0,255,0)",
            "3": 1,
            "3Color": "rgb(0,0,255)",
        }, {
            "type": "stop",
            "1": 1,
            "1Color": "rgb(255,0,0)",
            "2": 0,
            "2Color": "rgb(255,255,255)",
            "3": 0,
            "3Color": "rgb(255,255,255)",
        }, {
            "type": "auto",
            "1": 0,
            "1Color": "rgb(255,255,255)",
            "2": 0,
            "2Color": "rgb(255,255,255)",
            "3": 1,
            "3Color": "rgb(0,0,255)",
        },
    ]
    const colors = data
        .map((item) =>
            keys.map((key) => {
                console.log(item[`${key}Color`])
                return item[`${key}Color`]
            })
        )
        .flat()

    const customTooltip = ({ xKey, yKey, value, color }) => (
        <strong style={{ color: 'black' }}>
            {xKey} / {yKey}: {value}
        </strong>
    )

    return (
        <div className="div-heatmap-signalchart">
            <ResponsiveHeatMap
                width={900}
                height={400}
                data={data}
                keys={keys}
                indexBy="type"
                margin={{ top: 60, right: 40, bottom: 40, left: 60 }}
                theme={{
                    fontSize: 14,
                    axis: {
                        legend: {
                            text: {
                                fontSize: 18,
                                fontWeight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        container: {
                            background: 'lightgray'
                        }
                    }
                }}
                forceSquare={true}
                padding={5}
                axisTop={{ orient: 'top', tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'leg', legendPosition: 'middle', legendOffset: -40 }}
                axisRight={null}
                axisBottom={null}
                axisLeft={{
                    orient: 'left',
                    tickSize: 5,
                    tickPadding: 5,
                    legend: 'Type',
                    legendPosition: 'middle',
                    legendOffset: -60
                }}
                enableLabels={false}
                cellOpacity={0.5}
                animate={true}
                motionConfig="slow"
                motionDamping={5}
                hoverTarget="rowColumn"
                cellHoverOpacity={0.8}
                cellHoverOthersOpacity={0.25}
                colors={colors}
                tooltip={(props) => customTooltip(props)}
            />
        </div>
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
            break_3: "14:30-14:40",
            break_4: "16:30-16:50"
        },
        st_date: new Date(),
        st_time: new Date(),
        en_time: new Date(),
        diff_time: moment("00:00", "HH:mm").format("HH:mm"),
        getData_btn_disable: true,
        showSumData: false,
        chartKeys: ['OA', 'Loss time'],
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
        avgDatas: {},
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
        lastRefresh: new Date(),
        showSumTimechart: false,
        timechartData: [],
        timechartVisibleIndex: [],
        showSumSignalchart: false,
    }

    // constructor() {
    //     super()
    // }

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
                        } else if (key === "break_4") {
                            val = 20
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
        var arrAvgDatas = {}
        const st_break_1 = sql.break_1.split("-")[0]
        const en_break_1 = sql.break_1.split("-")[1]
        const st_break_2 = sql.break_2.split("-")[0]
        const en_break_2 = sql.break_2.split("-")[1]
        const st_break_3 = sql.break_3.split("-")[0]
        const en_break_3 = sql.break_3.split("-")[1]
        const st_break_4 = sql.break_4.split("-")[0]
        const en_break_4 = sql.break_4.split("-")[1]
        const mcs = sql.mc_name.join(";")
        const query = (`/sumdata/${mcs}&${sql.st_date}&${sql.shift}&${sql.st_time}&${sql.en_time}&${st_break_1}&${en_break_1}&${st_break_2}&${en_break_2}&${st_break_3}&${en_break_3}&${st_break_4}&${en_break_4}`)
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
                            OA: result.p_mt + result.p_ht + result.p_wt,
                            "Loss time": result.p_ngct + result.p_loss + result.p_na
                        }
                        arrSumChartData = {
                            MT: arrSumChartData.MT + result.p_mt,
                            HT: arrSumChartData.HT + result.p_ht,
                            WT: arrSumChartData.WT + result.p_wt,
                            "NG cycle": arrSumChartData["NG cycle"] + result.p_ngct,
                            Loss: arrSumChartData.Loss + result.p_loss,
                            "N/A": arrSumChartData["N/A"] + result.p_na,
                            OA: arrSumChartData.OA + result.p_mt + result.p_ht + result.p_wt,
                            "Loss time": arrSumChartData["Loss time"] + result.p_ngct + result.p_loss + result.p_na
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
                        arrAvgDatas = { ...arrAvgDatas, [result.mcname]: arrAvgData }
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
                arrChartDatas.push(arrSumChartData)
                arrChartDatas.forEach((chartData, ind) => {
                    Object.keys(chartData).forEach(key => {
                        if (key !== "mcname") {
                            chartData = { ...chartData, [key]: Number(chartData[key]).toFixed(2) }
                        }
                    })
                    arrChartDatas[ind] = chartData
                })
                this.setState({
                    chartData: arrChartDatas,
                    tableData: arrTableData,
                    tableDatas: arrTableDatas,
                    avgData: arrAvgData,
                    avgDatas: arrAvgDatas,
                    cntData: arrCntData,
                    mc_name_data: sql.mc_name,
                    mc_name_data_selected: last_mc,
                    lastRefresh: new Date()
                }, () => {
                    this.calculateCntPercentTarget()
                    this.toggleShowHide(true, 'summary')
                    spinners.forEach(spinner => {
                        spinner.style.setProperty('visibility', 'hidden')
                    })
                    if (this.state.refreshMode === "Auto") {
                        this.setRefreshMode("Auto")
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

    toggleShowHide = (flag, name) => {
        var tabName = {
            btn: '',
            chart: '',
            chev: '.svg-rotate',
            key: '',
            color: ''
        }
        if (name === "summary") {
            tabName = {
                btn: '.div-result-oa-btn',
                chart: '.div-result-main',
                chev: '.svg-rotate-data',
                key: 'showSumData',
                color: 'rgb(225, 255, 234)'
            }
        } else if (name === "timechart") {
            tabName = {
                btn: '.div-result-timechart-btn',
                chart: '.div-result-timechart',
                chev: '.svg-rotate-timechart',
                key: 'showSumTimechart',
                color: 'rgb(250, 255, 200)'
            }
        } else if (name === "signalchart") {
            tabName = {
                btn: '.div-result-signalchart-btn',
                chart: '.div-result-signalchart',
                chev: '.svg-rotate-signalchart',
                key: 'showSumSignalchart',
                color: 'rgb(240, 220, 255)'
            }
        }
        let tabBtn = document.querySelector(tabName.btn)
        let chart = document.querySelector(tabName.chart)
        let chev = document.querySelector(tabName.chev)
        let h = document.querySelector(tabName.chart).scrollHeight
        if (flag) {
            tabBtn.style.setProperty('--tab-color', tabName.color)
            chart.style.setProperty('visibility', 'visible')
            chart.style.setProperty('--max-height', h + 'px')
            chev.style.setProperty('--svg-rotate', 'rotate(0deg)')
        } else {
            tabBtn.style.setProperty('--tab-color', 'rgb(255, 255, 255)')
            chart.style.setProperty('visibility', 'hidden')
            chart.style.setProperty('--max-height', '1px')
            chev.style.setProperty('--svg-rotate', 'rotate(180deg)')
        }
        this.setState({
            [tabName.key]: flag,
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
            const date = new Date()
            this.setState({
                en_time: date,
                detailSQL: { ...this.state.detailSQL, en_time: moment(date).format("HH:mm") }
            }, () => {
                this.calculateCntPercentTarget()
                this.getSumdata()
            })
        }, 10000);
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
            tableData: this.state.tableDatas[mc],
            avgData: this.state.avgDatas[mc]
        })
    }

    setAlert = (txt) => {
        txtAlert.push(txt)
        this.setState({
            isAlert: true,
            txtAlert: txtAlert
        }, () => {
            setTimeout(() => {
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
                                    <div className="select-detail-datepicker break">
                                        <h6>OT. break [afternoon] (20 min.)</h6>
                                        <div className="break-time">
                                            {this.TimePicker("break", "break_4")}
                                            <span> - {this.state.detailSQL.break_4.split("-")[1]}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="select-detail-mc">
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
                    <div className="div-result-oa-btn" onClick={() => this.toggleShowHide(!this.state.showSumData, 'summary')}>
                        <p>Summary data</p>
                        <FontAwesomeIcon icon={['fas', 'chevron-up']} className="svg-rotate-data" />
                    </div>
                    <div className="div-result-main">
                        <div className="div-result-work">
                            <p>Time range :  <b>{this.state.diff_time}</b></p>
                            <p>Work amount :  <b>{this.state.cntData.mt} / {this.state.cnt_target} ({this.state.per_cnt_target}%)</b></p>
                        </div>
                        <div className="div-result-btn-mode">
                            <div className="div-btn-group">
                                <b>Refresh mode : </b>
                                <div className="refresh-btn">
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
                                <span>Last update : {moment(this.state.lastRefresh).format("HH:mm:ss")}</span>
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
                                {BarChart(this.state.chartData, this.state.chartKeys)}
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
                <div className="div-summary-timechart">
                    <div className="div-result-timechart-btn" onClick={() => this.toggleShowHide(!this.state.showSumTimechart, 'timechart')}>
                        <p>Timechart data</p>
                        <FontAwesomeIcon icon={['fas', 'chevron-up']} className="svg-rotate-timechart" />
                    </div>
                    <div className="div-result-timechart">
                        <BulletChart visibleIndex={this.state.timechartVisibleIndex} />
                    </div>
                </div>
                <div className="div-summary-signalchart">
                    <div className="div-result-signalchart-btn" onClick={() => this.toggleShowHide(!this.state.showSumSignalchart, 'signalchart')}>
                        <p>Signal chart</p>
                        <FontAwesomeIcon icon={['fas', 'chevron-up']} className="svg-rotate-signalchart" />
                    </div>
                    <div className="div-result-signalchart">
                        {HeatmapChart()}
                    </div>
                </div>
            </div >
        )
    }
}

export default Maincontain;