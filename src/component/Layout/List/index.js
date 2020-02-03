import React from 'react'

export default function Area ({ area, onChangeProvince, onChangeCity }) {
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