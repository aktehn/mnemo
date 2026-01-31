import React from 'react';
import logo from '../assets/logo.png';

interface MnemoLogoProps {
    className?: string;
}

export const MnemoLogo: React.FC<MnemoLogoProps> = ({ className }) => {
    return (
        <img
            src={logo}
            alt="Mnemo Logo"
            className={className}
        />
    );
};
