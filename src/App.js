import React, { useState, Suspense, useEffect } from 'react'
import keyBy from 'lodash.keyby'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import all from './data/overall'
import provinces from './data/area'
import Tag from './Tag'
import './App.css'
import { Header,News,List,Summary } from './component/Layout'

dayjs.extend(relativeTime)
const CityMenu = React.lazy(()=> import('./component/CityMenu'))
const CityMap = React.lazy(()=> import('./component/CityMap'))
const Map = React.lazy(() => import('./component/ChinaMap'))

const provincesByName = keyBy(provinces, 'name')
const provincesByPinyin = keyBy(provinces, 'pinyin')


function Stat ({ modifyTime, confirmedCount, suspectedCount, deadCount, curedCount, name }) {
  return (
    <div className="card">
      <h2>
        统计 {name ? `· ${name}` : false}
        <span className="due">
          截止时间: {dayjs(modifyTime).format('YYYY-MM-DD HH:mm')}
        </span>
      </h2>
      <div className="row">
        <Tag number={confirmedCount}>
          确诊
        </Tag>
        <Tag number={suspectedCount || '-'}>
          疑似
        </Tag>
        <Tag number={deadCount}>
          死亡
        </Tag>
        <Tag number={curedCount}>
          治愈
        </Tag>
      </div>
    </div>
  )
}

function App () {
  const defaultProvince = provincesByPinyin['guangdong']
  const defaultCity = defaultProvince.cities.find(p=> p.adcode === 440300)
  const [province, _setProvince] = useState(defaultProvince)
  const [city, _setCity] = useState(defaultCity)
  const [show,_setShow] = useState(false)
  const setProvinceByUrl = () => {
    const p = window.location.pathname.slice(1)
    _setProvince(p ? provincesByPinyin[p] : null)
  }

  useEffect(() => {
    // setProvinceByUrl()
    window.addEventListener('popstate', setProvinceByUrl)
    return () => {
      window.removeEventListener('popstate', setProvinceByUrl)
    }
  }, [])

  useEffect(() => {
    if (province) {
      window.document.title = `肺炎疫情实时地图 | ${province.name}`
    }
  }, [province])

  useEffect(() => {
    if (city) {
      window.document.title = `肺炎疫情实时地图 | ${city.cityName}`
    }
  }, [city])

  const setProvince = (p) => {
    _setCity(null)
    _setProvince(p)
    window.history.pushState(null, null, p ? p.pinyin : '/')
  }
  const setCity = (p) => {
    _setCity(p)
  }

  const onChangeCity = (value) => {
    const pro = provinces.find(pro=> pro.adcode === value[0])
    const city = pro.cities.find(city=> city.adcode === value[1] || city.cityName === value[1])
    if(city){
      _setProvince(pro)
      _setCity(city)
    }
  }
  const showMenu = () => {
    _setShow(true)
  }
  const hideMenu = () => {
    _setShow(false)
  }
  let data = []
  let area = []
  let title = ''
  if( city){
    data = city.areas && city.areas.length>0 ? city.areas.map(p=> ({
      name: p.fullName,
      value: p.confirmedCount,
    })):[]
    area = city.areas || []
    title = city.fullCityName
  }
  else if( province ){
    data = provincesByName[province.name].cities.map(city => ({
      name: city.fullCityName,
      value: city.confirmedCount,
      adcode: city.adcode,
      parent: province.name
    }))
    area = provincesByName[province.name].cities
    title = province.provinceShortName
  }else{
    data = provinces.map(p => ({
      name: p.provinceShortName,
      value: p.confirmedCount,
      adcode: p.adcode
    }))
    area = provinces
    title = ''
  }
  const overall = city || province || all
  return (
    <div>
      <Header title={title} onChange={showMenu} />
      <Stat { ...overall } name={title} modifyTime={all.modifyTime} />
      <div className="card">
        <h2>疫情地图 { title }
        {
          province || city ? <small
            onClick={() => setProvince(null)}
          >返回全国</small> : null
        }
        </h2>
        <Suspense fallback={<div className="loading">地图正在加载中...</div>}>
          {city && city.areas? <CityMap city={city} data={data} />:<Map province={province} data={data} onClick={o => {
            const p = provincesByName[o.name]
            if (p) {
              setProvince(p)
            }else{
              if(!o.data)return
              const c = provincesByName[o.data.parent]
              if(c){
                const city = c.cities.find(k=> k.adcode === o.data.adcode)
                if(city && city.adcode && city.areas && city.areas.length > 0){
                  _setCity(city)
                }
              }
            }
          }} />}
          {
            province ? false :
              <div className="tip">
                在地图中点击区域可跳转到相应区域的疫情地图，并查看该区域相关的实时动态
              </div>
          }
        </Suspense>
        <List area={area} onChangeProvince={setProvince} onChangeCity={setCity} />
      </div>
      <News province={province} />
      <Summary />
      {show && <CityMenu 
        onHideMenu={hideMenu} 
        onChangeCity={onChangeCity}
        provinces={provinces} 
        province={province} 
        city={city} />}
    </div>
  );
}

export default App;
