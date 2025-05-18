import React from 'react'
import './../Pages/Css/admin.css'
function AdminHeader({ title}) {
  return (
    <div>
      <p className="header-topic">{title}</p>
    </div>
  )
}

export default AdminHeader