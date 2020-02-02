import React, { useState, Suspense, useEffect } from 'react'
import keyBy from 'lodash.keyby'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

import all from './data/overall'
import provinces from './data/area'

import Tag from './Tag'

import './App.css'
import axios from 'axios'

import {CityMap,CityMenu} from './component'

dayjs.extend(relativeTime)

const Map = React.lazy(() => import('./component/ChinaMap'))

const provincesByName = keyBy(provinces, 'name')
const provincesByPinyin = keyBy(provinces, 'pinyin')
const fetcher = (url) => axios(url).then(data => {
  return data.data.data
})

function New ({ title, summary, sourceUrl, pubDate, pubDateStr }) {
  return (
    <div className="new">
      <div className="new-date">
        <div className="relative">
          {dayjs(pubDate).locale('zh-cn').fromNow()}
        </div>
        {dayjs(pubDate).format('YYYY-MM-DD HH:mm')}
      </div>
      <a className="title" href={sourceUrl}>{ title }</a>
      <div className="summary">{ summary.slice(0, 100) }...</div>
    </div>
  )
}

function News ({ province }) {
  const [len, setLen] = useState(8)
  const [news, setNews] = useState([])

  useEffect(() => {
    fetcher(`https://file1.dxycdn.com/2020/0130/492/3393874921745912795-115.json?t=${46341925 + Math.random()}`).then(news => {
      setNews(news)
    })
  }, [])

  return (
    <div className="card">
      <h2>实时动态</h2>
      {
        news
          .filter(n => province ? province.provinceShortName === (n.provinceName && n.provinceName.slice(0, 2)) : true)
          .slice(0, len)
          .map(n => <New {...n} key={n.id} />)
      }
      <div className="more" onClick={() => { setLen() }}>点击查看全部动态</div>
    </div>
  )
}

function Summary () {
  return (
    <div className="card info">
      <h2>信息汇总</h2>
      <li>
        <a href="https://m.yangshipin.cn/static/2020/c0126.html">疫情24小时 | 与疫情赛跑</a>
      </li>
      <li><a href="http://2019ncov.nosugartech.com/">确诊患者同行查询工具</a></li>
      <li><a href="https://news.qq.com/zt2020/page/feiyan.htm">腾讯新闻新冠疫情实时动态</a></li>
      <li><a href="https://3g.dxy.cn/newh5/view/pneumonia">丁香园新冠疫情实时动态</a></li>
      <li><a href="https://vp.fact.qq.com/home">新型冠状病毒实时辟谣</a></li>
      <li><a href="https://promo.guahao.com/topic/pneumonia">微医抗击疫情实时救助</a></li>
    </div>
  )
}

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

function Area ({ area, onChangeProvince, onChangeCity }) {
  const renderArea = () => {
    return area.map(x => (
      <div className="province" key={x.name || x.cityName || x.areaName} onClick={() => {
        // 表示在省一级
        if (x.name) {
          onChangeProvince(x)
        }else {
          //点击市
          if( x.adcode && x.areas ){
            onChangeCity(x)
          }
        }

      }}>
        <div className={`area ${x.name||(x.adcode && x.areas) ? 'active' : ''}`}>
          { x.name || x.cityName || x.areaName}
        </div>
        <div className="confirmed">{ x.confirmedCount }</div>
        <div className="death">{ x.deadCount }</div>
        <div className="cured">{ x.curedCount }</div>
      </div>
    ))
  }

  return (
    <>
      <div className="province header">
        <div className="area">地区</div>
        <div className="confirmed">确诊</div>
        <div className="death">死亡</div>
        <div className="cured">治愈</div>
      </div>
      { renderArea() }
    </>
  )
}

function Header ({title,onChange }) {
  return (
    <header>
      <h1>
        <small>新型冠状病毒</small>
        <br />
        疫情实时动态 · { title||'全国' }
        {title&&<small className='toggle' onClick={onChange}>切换城市</small>}
      </h1>
    </header>
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
            console.log('dd',p)
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
        <Area area={area} onChangeProvince={setProvince} onChangeCity={setCity} />
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
