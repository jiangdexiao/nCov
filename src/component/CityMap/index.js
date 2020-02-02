import React from 'react'
import echarts from 'echarts' 

export default class CityMap extends React.Component {
  constructor(props){
    super(props)
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.city.cityName !== this.props.city.cityName){
      const {city,data} = nextProps
      this.initCharts(city,data)
    }
  }

  componentDidMount(){
    const {city,data} = this.props
    this.initCharts(city,data)
  }

  initCharts(city,data){
    if(!city.adcode) return
    const cityJson = require(`../../data/city/${city.adcode}_full.json`)
    echarts.registerMap('city', cityJson);
    const myChart = echarts.init(this.mapNode);
    myChart.setOption({
      visualMap: {
        show: true,
        type: 'piecewise',// 定义为分段型 visualMap
        min: 0,
        max: 2000,
        align: 'right',
        top: 0,
        right: 0,
        left: 0,
        inRange: {
          color: [
            '#ffc0b1',
            '#ff8c71',
            '#ef1717',
            '#9c0505'
          ]
        },
        pieces: [
          {min: 1000},
          {min: 500, max: 999},
          {min: 100, max: 499},
          {min: 10, max: 99},
          {min: 1, max: 9},
        ],
        padding: 5,
        // "inverse": false,
        // "splitNumber": 5,
        orient: 'horizontal',
        showLabel: false,
        text: ['高', '低'],
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: 12
        }
        // "borderWidth": 0
      },
      series: [{
        left: 'center',
        // top: '15%',
        // bottom: '10%',
        type: 'map',
        name: '确诊人数',
        // silent: province ? true : false,//是否响应鼠标事件 
        label: {
          show: true,
          position: 'inside',
          // margin: 8,
          fontSize: 10
        },
        mapType: 'city',
        data,
        zoom: 1.2,
        roam: false,
        showLegendSymbol: false,
        emphasis: {},
        rippleEffect: {
          show: true,
          brushType: 'stroke',
          scale: 2.5,
          period: 4
        }
      }]
    });
  }

  setMapElement = n => {
    this.mapNode = n;
  }

  render(){
    return (
      <div id="echartMap" ref={this.setMapElement} style={{width: '100%',height:'400px'}}></div>
    )
  }
}