import React from 'react';
import Logo from "../../assets/logo.png";
import './nav.css';

const NavBar = ({ onReset }) => {
  return (
    <div className='navMain'>
      <div className='navDiv'>
        <div className='logoImage' onClick={onReset}>
          <img src={Logo} alt="LogoImage" /> Quick Keys
        </div>
      </div>
    </div>
  );
};

export default NavBar;