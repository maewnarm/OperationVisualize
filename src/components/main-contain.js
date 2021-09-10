import React from 'react';
import axios from 'axios';
import './scss/main-contain.scss'
import {
    Button,
    Dropdown,
    ButtonGroup,
    Accordion,
    Table,
    Spinner
} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { ResponsiveBar } from '@nivo/bar'
import moment from 'moment'

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

class Maincontain extends React.Component {
    state = {
        isLoading: false,
        mc_names: [],
        detailSQL: {
            mc_name: "-",
            st_date: moment(new Date()).format("yyyy-MM-DD"),
            shift: "Day",
            st_time: moment(new Date()).format("HH:mm"),
            en_time: moment(new Date()).format("HH:mm")
        },
        st_date: new Date(),
        st_time: new Date(),
        en_time: new Date(),
        getData_btn_disable: true,
        showSumData: false,
        chartData: [{
            mcname: "",
            p_ct: 0,
            p_wt: 0,
            p_ngct: 0,
            p_loss: 0,
            p_na: 0
        }],
        tableData: {
            total: 0,
            ct: 0,
            wt: 0,
            ngct: 0,
            loss: 0,
            na: 0
        },
        avgData: {
            ct: 0,
            wt: 0
        }
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
        this.setState({
            detailSQL: { ...this.state.detailSQL, [key]: value },
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

    getSumdata = () => {
        const sql = this.state.detailSQL
        console.log(`/sumdata/${sql.mc_name}&${sql.st_date}&${sql.shift}&${sql.st_time}&${sql.en_time}`)
        api.get(`/sumdata/${sql.mc_name}&${sql.st_date}&${sql.shift}&${sql.st_time}&${sql.en_time}`)
            .then(results => {
                console.log(results.data)
                var arrChartData = {
                    mcname: sql.mc_name,
                    p_ct: 0,
                    p_wt: 0,
                    p_ngct: 0,
                    p_loss: 0,
                    p_na: 0
                }
                var arrTableData = {}
                var arrAvgData = {}
                if (results.data.length > 0) {
                    results.data.forEach(result => {
                        arrChartData = {
                            ...arrChartData,
                            CT: result.p_ct,
                            WT: result.p_wt,
                            "NG cycle": result.p_ngct,
                            Loss: result.p_loss,
                            "N/A": result.p_na
                        }
                        arrTableData = {
                            total: [
                                moment.utc(result.s_total * 1000).format("HH:mm:ss")
                            ],
                            ct: [
                                moment.utc(result.s_ct * 1000).format("HH:mm:ss"),
                                result.p_ct
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
                            ct: result.avg_ct,
                            wt: result.avg_wt
                        }
                    })
                    console.log(arrChartData)
                }
                this.setState({
                    showSumData: true,
                    chartData: [arrChartData],
                    tableData: arrTableData,
                    avgData: arrAvgData
                })
            })
            .catch(err => {
                console.log(err)
                alert("getSumdata error")
            })
    }

    toggleShowHideSummary = () => {
        
    }

    test = () => {
        let show = document.querySelector('.div-result-oa')
        let h = document.querySelector('.div-result-oa').scrollHeight
        console.log(document.querySelector('.div-result-oa'))
        show.style.setProperty('--max-height', h + 'px')
        this.setState({
            showSumData: !this.state.showSumData,
        })
    }

    render() {
        return (
            <div className="div-main-contain">
                <button onClick={() => this.test()}>test1</button>
                <h1>Summary Operation Ratio</h1>
                <Accordion defaultActiveKey="0" className="accordian-select-detail">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Operation Record details</Accordion.Header>
                        <Accordion.Body>
                            <div className="div-select-detail">
                                <div className="select-detail-compo">
                                    <Dropdown as={ButtonGroup}>
                                        <Button variant="primary">Machine name</Button>
                                        <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" />
                                        <Dropdown.Menu align="end">
                                            {this.state.mc_names.map((mc, ind) => {
                                                return (
                                                    <Dropdown.Item onClick={() => this.selectDetail("mc_name", mc)} key={ind}>{mc}</Dropdown.Item>
                                                )
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <p className="selected-value">{this.state.detailSQL.mc_name}</p>
                                </div>
                                <div className="select-detail-compo">
                                    <Dropdown as={ButtonGroup}>
                                        <Button variant="primary">Shift</Button>
                                        <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" />
                                        <Dropdown.Menu align="end">
                                            <Dropdown.Item onClick={() => this.selectDetail("shift", "Day")}>Day</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.selectDetail("shift", "Night")}>Night</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <p className="selected-value">{this.state.detailSQL.shift}</p>
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
                            </div>
                            <Button onClick={() => this.getSumdata()} disabled={this.state.getData_btn_disable}>Get data</Button>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                <div className="div-summary-data">
                    <div className="div-result-oa-btn">
                        <p>Summary data</p>
                    </div>
                    <div className={this.state.showSumData ? "div-result-oa div-show" : "div-result-oa"}>
                        <div className="div-chart">
                            <ResponsiveBar
                                {...commonProps}
                                data={this.state.chartData}
                                keys={['CT', 'WT', 'NG cycle', 'Loss', 'N/A']}
                                maxValue={100}
                                padding={0.2}
                                layout="vertical"
                                enableGridY={true}
                                enableGridX={false}
                                axisLeft={{
                                    format: value =>
                                        `${value}%`
                                }}
                                valueFormat={value =>
                                    `${value}%`
                                }
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
                            <Table responsive className="table-sumdata">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Time</th>
                                        <th>Ratio(%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td >CT</td>
                                        <td >{this.state.tableData.ct[0]}</td>
                                        <td >{this.state.tableData.ct[1]}%</td>
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
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}

export default Maincontain;