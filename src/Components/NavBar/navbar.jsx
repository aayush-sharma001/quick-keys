import React from 'react';
import Logo from "../../assets/logo.png"
import './nav.css'
const NavBar = () => {
    return (
        <div className='navMain'>
            <div className='navDiv'>
                <div className='logoImage'>
                    <img src={Logo} alt="LogoImage" /> Quick Keys
                </div>
            </div>
        </div>
    )
}

export default NavBar