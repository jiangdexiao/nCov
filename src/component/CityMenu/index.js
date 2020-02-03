import React from 'react'
import { Menu } from 'antd-mobile';
import './index.css'

export default class CityMenu extends React.Component {

  constructor(props){
    super(props)
    const currentProvince = props.province
    const currentCity = props.city
    const data = props.provinces.map(pro=> {
      return {
        label:pro.provinceName,
        value:pro.adcode,
        children:pro.cities.map(city=> {
          return {
            label: city.cityName,
            value: city.adcode||city.cityName
          }
        })
      }
    })
    const currentValue = [
      currentProvince&&currentProvince.adcode?currentProvince.adcode:440000,
      currentCity&&currentCity.adcode?currentCity.adcode:440300
    ]
    this.state = {
      currentValue,
      initData:data
    }
  }

  onChange(value){
    const { onChangeCity } = this.props
    this.onMaskClick()
    onChangeCity && onChangeCity(value)
  }

  onMaskClick(){
    const { onHideMenu } = this.props
    onHideMenu && onHideMenu()
  }
  render(){
    return (
      <div className='menu'>
        <Menu
          className="foo-menu"
          data={this.state.initData}
          value={this.state.currentValue}
          onChange={this.onChange.bind(this)}
          height={document.documentElement.clientHeight * 0.6}
        />
        <div className="menu-mask" onClick={this.onMaskClick.bind(this)} />
      </div>
    )
  }
}