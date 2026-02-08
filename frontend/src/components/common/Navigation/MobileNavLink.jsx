import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const MobileNavLink = ({ to, label, onClick, active, icon }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 text-lg font-bold rounded-xl transition-all duration-300 ${active
            ? 'bg-[#C48B28]/10 text-[#C48B28]'
            : 'text-gray-600 hover:text-[#C48B28] hover:bg-[#FAF3E0]'
            }`}
    >
        {icon && <span>{icon}</span>}
        <span>{label}</span>
    </Link>
);

MobileNavLink.propTypes = {
    to: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    active: PropTypes.bool,
    icon: PropTypes.node,
};

export default MobileNavLink;
