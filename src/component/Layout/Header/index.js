import React from 'react'

export default function Header ({title,onChange }) {
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