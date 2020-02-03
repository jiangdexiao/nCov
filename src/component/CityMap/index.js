import React from 'react'
import echarts from 'echarts' 
import { loopHandle } from '../../lib/geoJson'

export default class CityMap extends React.Component {

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

  getMarkData(geo){
    return geo.map(o=> {
      const coord = o.properties.center
      const value = this.props.city.areas.find(p=> p.fullName === o.properties.name).confirmedCount
      return {
        value: `${value}人`,
        coord
      }
    })
  }

  async initCharts(city,data){
    if(!city.adcode) return
    const cityJson = await loopHandle(city.adcode)
    echarts.registerMap('city', cityJson);
    const myChart = echarts.init(this.mapNode);
    myChart.setOption({
      tooltip: { 
        show:true
      },
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
        },
        // markPoint: {
        //   symbol: 'pin', // 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', path://m 0,0 h 48 v 20 h -30 l -6,10 l -6,-10 h -6 z,  path://m 0,0 h 48 v 20 h -34 l -6,10 l -6,-10 h -2 z
        //   symbolSize: 40,
        //   // symbolOffset: ['34%', '-50%'],
        //   symbolKeepAspect: true,// 如果 symbol 是 path:// 的形式，是否在缩放时保持该图形的长宽比。
        //   label:{
        //     show:true,
        //     color:'blue',
        //     fontWeight:'bold',
        //     fontSize:14,
        //     position: "insideTop",
        //     // distance: 7,
        //   },
        //   itemStyle:{
        //     color: 'white'
        //   },
        //   data:this.getMarkData(cityJson.features)
        // },
        // markLine: {
        //   symbolSize: 20,
        //   data: [
        //     [
        //         {
        //             x: 100,
        //             y: 100
        //         },
        //         {
        //             x: 100,
        //             y: 200
        //         }
        //     ]
        //   ]
        // }
      }]
    });

    // myChart.dispatchAction({
    //   type: "showTip", // 根据 tooltip 的配置项显示提示框。
    //   seriesIndex: 0,
    // });
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